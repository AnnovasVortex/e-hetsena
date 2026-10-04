import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoUploadDto } from './dto/videos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  /**
   * 1. Fil vidéo « Pour toi » classé par l'algorithme
   * GET /api/videos/feed
   */
  @Get('feed')
  async getFeed(
    @Query('city') city?: string,
    @Query('limit') limit?: string,
    @Request() req?: any
  ) {
    const userId = req?.user?.id;
    return this.videosService.getFeed(userId, city, limit ? parseInt(limit, 10) : 10);
  }

  /**
   * 2. Réservation d'upload
   * POST /api/videos/create-upload
   */
  @Post('create-upload')
  @UseGuards(JwtAuthGuard)
  async createUpload(@Request() req: any, @Body() dto: CreateVideoUploadDto) {
    const result = await this.videosService.createUpload(req.user.id, dto);

    if (result.bunnyVideoId.startsWith('mock_bunny_')) {
      this.videosService.simulateLocalProcessing(result.videoId);
    }

    return result;
  }

  /**
   * 3. Liker / Déliker une vidéo (Double-tap)
   * POST /api/videos/:id/like
   */
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleLike(@Request() req: any, @Param('id') videoId: string) {
    return this.videosService.toggleLike(req.user.id, videoId);
  }

  /**
   * 4. Enregistrement d'une vue dédoublonnée
   * POST /api/videos/:id/view
   */
  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async recordView(
    @Param('id') videoId: string,
    @Ip() ipAddress: string,
    @Request() req?: any
  ) {
    return this.videosService.recordView(videoId, ipAddress || '127.0.0.1', req?.user?.id);
  }

  /**
   * 5. Webhook Bunny Stream
   * POST /api/videos/webhook/bunny
   */
  @Post('webhook/bunny')
  @HttpCode(HttpStatus.OK)
  async handleBunnyWebhook(@Body() body: any) {
    return this.videosService.handleBunnyWebhook(body);
  }
}
