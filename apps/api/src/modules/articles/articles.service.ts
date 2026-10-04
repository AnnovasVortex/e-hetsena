import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto, QueryArticlesDto } from './dto/articles.dto';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Création d'un article avec 1 à 5 photos
   */
  async create(userId: string, dto: CreateArticleDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Création de l'article principal
      const article = await tx.article.create({
        data: {
          sellerId: userId,
          title: dto.title,
          description: dto.description,
          price: dto.price,
          category: dto.category,
          size: dto.size,
          condition: dto.condition,
          city: dto.city,
          deliveryOptions: dto.deliveryOptions,
          isWhatsAppContactEnabled: dto.isWhatsAppContactEnabled ?? true,
          status: ArticleStatus.AVAILABLE,
        },
      });

      // 2. Enregistrement ordonné des photos
      if (dto.imageUrls && dto.imageUrls.length > 0) {
        await tx.articleImage.createMany({
          data: dto.imageUrls.map((url, index) => ({
            articleId: article.id,
            url,
            sortOrder: index,
          })),
        });
      }

      // 3. Retourne l'article avec ses images et le vendeur
      return tx.article.findUnique({
        where: { id: article.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          seller: {
            select: {
              id: true,
              fullName: true,
              city: true,
              avatarUrl: true,
              trustScore: true,
              phoneNumber: true,
            },
          },
        },
      });
    });
  }

  /**
   * Récupère la liste des articles avec filtres (Catalogue Vinted-style)
   */
  async findAll(query: QueryArticlesDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: ArticleStatus.AVAILABLE,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseInt(query.minPrice, 10);
      if (query.maxPrice) where.price.lte = parseInt(query.maxPrice, 10);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1, // Première photo uniquement pour la légèreté de la grille
          },
          seller: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              trustScore: true,
              city: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un article par son ID (Fiche détaillée)
   */
  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        video: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            city: true,
            avatarUrl: true,
            trustScore: true,
            phoneNumber: true,
            totalSalesCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article introuvable');
    }

    // Incrémente le compteur de vues
    await this.prisma.article.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return article;
  }
}
