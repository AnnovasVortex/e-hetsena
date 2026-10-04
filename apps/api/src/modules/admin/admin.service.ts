import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleStatus, ReportStatus, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Statistiques clés de la marketplace
   */
  async getDashboardStats() {
    const [totalUsers, totalArticles, pendingReports, activeLives, ordersAgg] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.article.count({ where: { status: ArticleStatus.AVAILABLE } }),
        this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
        this.prisma.liveSession.count({ where: { status: 'LIVE' } }),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: 'DELIVERED' },
        }),
      ]);

    return {
      totalUsers,
      totalArticles,
      pendingReports,
      activeLives,
      totalVolumeSoldMGA: ordersAgg._sum.totalAmount || 0,
    };
  }

  /**
   * 2. Liste des annonces en attente de validation
   */
  async getPendingArticles() {
    return this.prisma.article.findMany({
      where: {
        status: { in: [ArticleStatus.PENDING_VALIDATION, ArticleStatus.AVAILABLE] },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            city: true,
            trustScore: true,
            isBanned: true,
          },
        },
      },
    });
  }

  /**
   * 3. Valider une annonce
   */
  async approveArticle(articleId: string) {
    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.AVAILABLE },
    });
    return article;
  }

  /**
   * 4. Supprimer / Rejeter une annonce frauduleuse
   */
  async rejectArticle(articleId: string, reason?: string) {
    return this.prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.REMOVED },
    });
  }

  /**
   * 5. Récupération des signalements
   */
  async getReports() {
    return this.prisma.report.findMany({
      where: { status: ReportStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        reportedUser: {
          select: { id: true, fullName: true, phoneNumber: true, isBanned: true },
        },
      },
    });
  }

  /**
   * 6. Résolution d'un signalement
   */
  async resolveReport(
    reportId: string,
    action: 'DISMISS' | 'REMOVE_ITEM' | 'BAN_USER'
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Signalement introuvable');
    }

    if (action === 'BAN_USER' && report.reportedUserId) {
      await this.toggleBanUser(report.reportedUserId, true, `Banni suite au signalement ${report.reason}`);
    } else if (action === 'REMOVE_ITEM' && report.targetType === 'ARTICLE') {
      await this.rejectArticle(report.targetId, 'Supprimé suite à un signalement');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'DISMISS' ? ReportStatus.DISMISSED : ReportStatus.ACTION_TAKEN,
      },
    });
  }

  /**
   * 7. Bloquer / Débloquer un utilisateur fraudeur
   */
  async toggleBanUser(userId: string, isBanned: boolean, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le statut du compte
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          isBanned,
          banReason: isBanned ? reason || 'Non-respect des règles de la communauté' : null,
        },
      });

      // 2. Si banni : Révoquer immédiatement tous ses refresh tokens pour le déconnecter
      if (isBanned) {
        await tx.refreshToken.deleteMany({
          where: { userId },
        });

        // 3. Masquer tous ses articles actifs
        await tx.article.updateMany({
          where: { sellerId: userId, status: ArticleStatus.AVAILABLE },
          data: { status: ArticleStatus.REMOVED },
        });
      }

      return user;
    });
  }
}
