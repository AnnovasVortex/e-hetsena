import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VideoStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateVideoUploadInput {
  articleId?: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Prépare l'upload résilient et réserve l'enregistrement vidéo en base
   */
  async createUpload(userId: string, input: CreateVideoUploadInput) {
    // Vérifier si l'article existe si un articleId est fourni
    if (input.articleId) {
      const article = await this.prisma.article.findUnique({
        where: { id: input.articleId },
      });
      if (!article || article.sellerId !== userId) {
        throw new NotFoundException('Article introuvable ou non autorisé');
      }
    }

    const bunnyLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const bunnyApiKey = process.env.BUNNY_STREAM_API_KEY;
    const isBunnyConfigured = !!(bunnyLibraryId && bunnyApiKey);

    let bunnyVideoId: string;
    let tusUploadEndpoint: string;
    let authorizationSignature: string;

    if (isBunnyConfigured) {
      // Appel à l'API Bunny Stream pour créer l'objet vidéo
      const response = await fetch(
        `https://video.bunnycdn.com/library/${bunnyLibraryId}/videos`,
        {
          method: 'POST',
          headers: {
            AccessKey: bunnyApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `video_${input.articleId || 'standalone'}_${Date.now()}`,
          }),
        }
      );

      const data = await response.json();
      bunnyVideoId = data.guid;
      tusUploadEndpoint = 'https://video.bunnycdn.com/tusupload';

      // Signature d'autorisation pour upload direct sécurisé côté client
      const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 heure
      const toHash = `${bunnyLibraryId}${bunnyApiKey}${expirationTime}${bunnyVideoId}`;
      authorizationSignature = crypto.createHash('sha256').update(toHash).digest('hex');
    } else {
      // Mode simulation local pour tester sur ta machine sans compte Bunny
      bunnyVideoId = `mock_bunny_${Date.now()}`;
      tusUploadEndpoint = '/api/videos/mock-upload';
      authorizationSignature = 'mock_signature_dev';
    }

    // Création de l'enregistrement Video avec statut UPLOADING
    const video = await this.prisma.video.create({
      data: {
        userId,
        articleId: input.articleId,
        bunnyVideoId,
        thumbnailUrl: input.thumbnailUrl,
        durationSeconds: input.durationSeconds,
        status: VideoStatus.UPLOADING,
      },
    });

    return {
      videoId: video.id,
      bunnyVideoId,
      uploadUrl: tusUploadEndpoint,
      authorizationSignature,
      libraryId: bunnyLibraryId || 'dev_library',
    };
  }

  /**
   * 2. Webhook appelé automatiquement par Bunny Stream une fois le transcodage HLS terminé
   */
  async handleBunnyWebhook(body: any) {
    const { VideoGuid, Status } = body;
    this.logger.log(`Webhook Bunny Stream reçu pour la vidéo ${VideoGuid} - Statut: ${Status}`);

    // Statut 3 = Finished (Transcodage terminé avec succès)
    if (Status === 3 || Status === 'finished') {
      const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || 'vz-ehetsena.b-cdn.net';
      const hlsPlaylistUrl = `https://${cdnHostname}/${VideoGuid}/playlist.m3u8`;
      const thumbnailUrl = `https://${cdnHostname}/${VideoGuid}/thumbnail.jpg`;

      await this.prisma.video.updateMany({
        where: { bunnyVideoId: VideoGuid },
        data: {
          status: VideoStatus.READY,
          hlsPlaylistUrl,
          thumbnailUrl,
        },
      });

      this.logger.log(`Vidéo ${VideoGuid} prête pour diffusion en 240p, 360p et 480p !`);
    } else if (Status === 4 || Status === 'failed') {
      await this.prisma.video.updateMany({
        where: { bunnyVideoId: VideoGuid },
        data: { status: VideoStatus.FAILED },
      });
    }

    return { received: true };
  }

  /**
   * 3. Algorithme de classement du fil « Pour toi » :
   * Score = (Récence) + (Likes * 3) + (Vues * 1) + (Bonus Ville Utilisateur)
   */
  async getFeed(currentUserId?: string, userCity?: string, limit = 10) {
    const videos = await this.prisma.video.findMany({
      where: {
        status: VideoStatus.READY,
        article: {
          status: 'AVAILABLE', // Ne montrer que les articles encore en vente
        },
      },
      take: 30, // Échantillon des 30 dernières vidéos pour le scoring
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          include: {
            images: { take: 1 },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            city: true,
            phoneNumber: true,
            trustScore: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    // Calcul du score de pertinence pour chaque vidéo
    const scoredVideos = videos.map((video) => {
      let score = 0;

      // 1. Popularité
      score += video.likesCount * 3;
      score += video.viewsCount * 1;
      score += video.sharesCount * 4;

      // 2. Proximité géographique (Bonus si l'article est dans la même ville que l'acheteur)
      if (userCity && video.article?.city?.toLowerCase() === userCity.toLowerCase()) {
        score += 50; // Fort bonus pour favoriser la remise en main propre
      }

      // 3. Dépréciation temporelle (plus c'est récent, plus c'est favorisé)
      const hoursSinceCreation =
        (Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60 * 60);
      score += Math.max(0, 100 - hoursSinceCreation * 2);

      return {
        ...video,
        isLikedByMe: Array.isArray(video.likes) && video.likes.length > 0,
        rankingScore: score,
      };
    });

    // Tri par score décroissant et renvoi des N premières
    return scoredVideos
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .slice(0, limit);
  }

  /**
   * 4. Double-tap / Bouton Like (Ajout ou retrait avec mise à jour atomique du compteur)
   */
  async toggleLike(userId: string, videoId: string) {
    const existing = await this.prisma.like.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.like.delete({ where: { id: existing.id } }),
        this.prisma.video.update({
          where: { id: videoId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    } else {
      await this.prisma.$transaction([
        this.prisma.like.create({
          data: { userId, videoId },
        }),
        this.prisma.video.update({
          where: { id: videoId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
      return { liked: true };
    }
  }

  /**
   * 5. Enregistrement dédoublonné des vues (anti-triche)
   */
  async recordView(videoId: string, ipAddress: string, userId?: string) {
    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');

    // Vérifier si une vue a déjà été enregistrée dans la dernière heure
    const existingView = await this.prisma.videoView.findFirst({
      where: {
        videoId,
        ipHash,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Moins d'une heure
        },
      },
    });

    if (!existingView) {
      await this.prisma.$transaction([
        this.prisma.videoView.create({
          data: {
            videoId,
            userId,
            ipHash,
          },
        }),
        this.prisma.video.update({
          where: { id: videoId },
          data: { viewsCount: { increment: 1 } },
        }),
      ]);
    }
    return { success: true };
  }

  /**
   * 6. Simulation de fin de transcodage pour le développement local
   */
  async simulateLocalProcessing(videoId: string) {
    setTimeout(async () => {
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: VideoStatus.READY,
          hlsPlaylistUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        },
      });
      this.logger.log(`[SIMULATION] Vidéo ${videoId} prête pour le fil`);
    }, 2000);
  }
}
