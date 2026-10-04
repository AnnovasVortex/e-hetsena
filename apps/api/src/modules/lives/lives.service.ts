import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLiveDto, PinProductDto, FlashOrderDto } from './dto/lives.dto';
import { LiveStatus, FlashOrderStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivesService {
  private readonly logger = new Logger(LivesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Récupère les lives en cours pour les bulles d'accueil
   */
  async getActiveLives() {
    const lives = await this.prisma.liveSession.findMany({
      where: { status: LiveStatus.LIVE },
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            city: true,
          },
        },
      },
    });

    return lives.map((live) => ({
      id: live.id,
      title: live.title,
      hostName: live.host.fullName,
      hostAvatar: live.host.avatarUrl,
      hostCity: live.host.city,
      viewersCount: live.peakViewers || 1,
    }));
  }

  /**
   * 2. Création d'un nouveau Live par un vendeur
   */
  async createLive(hostId: string, dto: CreateLiveDto) {
    const roomName = `room_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return this.prisma.$transaction(async (tx) => {
      const live = await tx.liveSession.create({
        data: {
          hostId,
          title: dto.title,
          livekitRoom: roomName,
          status: LiveStatus.LIVE, // Démarre immédiatement
          startedAt: new Date(),
        },
      });

      if (dto.articleIds && dto.articleIds.length > 0) {
        await tx.liveProduct.createMany({
          data: dto.articleIds.map((articleId, index) => ({
            liveSessionId: live.id,
            articleId,
            sortOrder: index,
            isPinned: index === 0, // Le premier produit est épinglé par défaut
          })),
        });
      }

      return live;
    });
  }

  /**
   * 3. Génération du Token LiveKit WebRTC (Vendeur vs Spectateur)
   */
  async generateToken(liveId: string, userId: string) {
    const live = await this.prisma.liveSession.findUnique({
      where: { id: liveId },
      include: { host: true },
    });

    if (!live) {
      throw new NotFoundException('Session Live introuvable');
    }

    const isHost = live.hostId === userId;
    const livekitApiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
    const livekitUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';

    // Génération du token JWT WebRTC signé (le vendeur publie, les spectateurs regardent)
    const accessToken = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: userId,
      ttl: '4h',
    });
    accessToken.addGrant({
      roomJoin: true,
      room: live.livekitRoom,
      canPublish: isHost,
      canSubscribe: true,
      canPublishData: true,
    });
    const token = await accessToken.toJwt();

    return {
      token,
      serverUrl: livekitUrl,
      roomName: live.livekitRoom,
      isHost,
    };
  }

  /**
   * 4. Épingler un produit à l'écran (Action Vendeur)
   */
  async pinProduct(hostId: string, liveId: string, liveProductId: string) {
    const live = await this.prisma.liveSession.findUnique({
      where: { id: liveId },
    });

    if (!live || live.hostId !== hostId) {
      throw new ForbiddenException('Seul le vendeur peut épingler un produit');
    }

    // Réinitialise les autres produits et épingle le nouveau
    await this.prisma.$transaction([
      this.prisma.liveProduct.updateMany({
        where: { liveSessionId: liveId },
        data: { isPinned: false },
      }),
      this.prisma.liveProduct.update({
        where: { id: liveProductId },
        data: { isPinned: true, pinnedAt: new Date() },
      }),
    ]);

    // Récupération des données du produit épinglé
    const pinned = await this.prisma.liveProduct.findUnique({
      where: { id: liveProductId },
      include: {
        article: {
          include: { images: { take: 1 } },
        },
      },
    });

    return pinned;
  }

  /**
   * 5. Moteur Commande Flash « RAISIKO ! / JE PRENDS ! » (File d'attente FIFO anti-doublon)
   */
  async handleFlashOrder(buyerId: string, liveId: string, dto: FlashOrderDto) {
    const liveProduct = await this.prisma.liveProduct.findUnique({
      where: { id: dto.liveProductId },
      include: { article: true },
    });

    if (!liveProduct) {
      throw new NotFoundException('Produit en live introuvable');
    }

    // Vérifier si l'utilisateur a déjà cliqué pour ce produit (anti-spam)
    const existingOrder = await this.prisma.liveOrder.findFirst({
      where: {
        liveSessionId: liveId,
        liveProductId: dto.liveProductId,
        buyerId,
      },
    });

    if (existingOrder) {
      return {
        alreadyClicked: true,
        queuePosition: existingOrder.queuePosition,
        isWinner: existingOrder.queuePosition === 1,
        orderId: existingOrder.id,
      };
    }

    // Calcul atomique de la position dans la file d'attente (FIFO)
    const currentOrdersCount = await this.prisma.liveOrder.count({
      where: {
        liveSessionId: liveId,
        liveProductId: dto.liveProductId,
      },
    });

    const queuePosition = currentOrdersCount + 1; // 1 = Premier arrivé (Gagnant !)

    const order = await this.prisma.liveOrder.create({
      data: {
        liveSessionId: liveId,
        liveProductId: dto.liveProductId,
        buyerId,
        queuePosition,
        priceSnapshot: liveProduct.article.price,
        status: FlashOrderStatus.WAITING_HOST_CONFIRMATION,
      },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            city: true,
          },
        },
      },
    });

    this.logger.log(
      `⚡ [COMMANDE FLASH LIVE] Produit #${liveProduct.article.title} -> ` +
        `${order.buyer.fullName} (${queuePosition === 1 ? 'GAGNANT N°1' : 'Attente #' + queuePosition})`
    );

    return {
      orderId: order.id,
      queuePosition,
      isWinner: queuePosition === 1,
      buyer: order.buyer,
      priceSnapshot: order.priceSnapshot,
    };
  }

  /**
   * 6. Fiche complète de la salle Live
   */
  async getLiveDetails(liveId: string) {
    const live = await this.prisma.liveSession.findUnique({
      where: { id: liveId },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            city: true,
            phoneNumber: true,
            avatarUrl: true,
            trustScore: true,
          },
        },
        products: {
          include: {
            article: {
              include: { images: { take: 1 } },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!live) {
      throw new NotFoundException('Session Live introuvable');
    }

    return live;
  }
}
