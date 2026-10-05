import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { StorageService } from './storage.service';
import { CreateArticleDto, QueryArticlesDto } from './dto/articles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * 1. Upload d'une photo compressée (WebP)
   * POST /api/articles/upload-photo
   */
  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 5 * 1024 * 1024 }, // Max 5 Mo au cas où
    })
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fichier photo manquant');
    }

    const publicUrl = await this.storageService.uploadPhoto(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    return {
      url: publicUrl,
      sizeBytes: file.size,
    };
  }

  /**
   * 2. Création de l'annonce
   * POST /api/articles
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() dto: CreateArticleDto) {
    return this.articlesService.create(req.user.id, dto);
  }

  /**
   * 3. Liste des articles avec filtres (Grille Explore)
   * GET /api/articles
   */
  @Get()
  async findAll(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAll(query);
  }

  /**
   * Annonces du vendeur connecté (déclarée avant :id pour ne pas être capturée)
   * GET /api/articles/mine
   */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMine(@Request() req: any) {
    return this.articlesService.findBySeller(req.user.id);
  }

  /**
   * 4. Fiche détaillée d'un article
   * GET /api/articles/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }
}
