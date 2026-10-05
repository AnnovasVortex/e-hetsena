import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/users.dto';

const PROFILE_SELECT = {
  id: true,
  phoneNumber: true,
  fullName: true,
  avatarUrl: true,
  bio: true,
  city: true,
  role: true,
  trustScore: true,
  totalSalesCount: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Profil complet de l'utilisateur connecté avec ses compteurs
   */
  async getMe(userId: string) {
    const [user, activeArticles, livesCount] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: PROFILE_SELECT }),
      this.prisma.article.count({
        where: { sellerId: userId, status: ArticleStatus.AVAILABLE },
      }),
      this.prisma.liveSession.count({ where: { hostId: userId } }),
    ]);

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return { ...user, stats: { activeArticles, livesCount } };
  }

  /**
   * Mise à jour du profil (nom, ville, bio)
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName?.trim(),
        city: dto.city?.trim(),
        bio: dto.bio?.trim(),
      },
      select: PROFILE_SELECT,
    });
  }
}
