import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { CreateLiveDto, PinProductDto, FlashOrderDto } from './dto/lives.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  /**
   * 1. Liste des lives en cours
   * GET /api/lives/active
   */
  @Get('active')
  async getActiveLives() {
    return this.livesService.getActiveLives();
  }

  /**
   * 2. Création d'un nouveau Live
   * POST /api/lives
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createLive(@Request() req: any, @Body() dto: CreateLiveDto) {
    return this.livesService.createLive(req.user.id, dto);
  }

  /**
   * 3. Récupération des informations d'un Live
   * GET /api/lives/:id
   */
  @Get(':id')
  async getLiveDetails(@Param('id') id: string) {
    return this.livesService.getLiveDetails(id);
  }

  /**
   * 4. Obtention du token WebRTC LiveKit
   * POST /api/lives/:id/token
   */
  @Post(':id/token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateToken(@Request() req: any, @Param('id') id: string) {
    return this.livesService.generateToken(id, req.user.id);
  }

  /**
   * 5. Épingler un produit à l'écran (Vendeur uniquement)
   * POST /api/lives/:id/pin-product
   */
  @Post(':id/pin-product')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async pinProduct(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: PinProductDto
  ) {
    return this.livesService.pinProduct(req.user.id, id, dto.liveProductId);
  }

  /**
   * Terminer le live (Vendeur uniquement)
   * POST /api/lives/:id/end
   */
  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async endLive(@Request() req: any, @Param('id') id: string) {
    return this.livesService.endLive(req.user.id, id);
  }

  /**
   * 6. Commande Flash : « Raisiko ! / Je prends ! »
   * POST /api/lives/:id/flash-order
   */
  @Post(':id/flash-order')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleFlashOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: FlashOrderDto
  ) {
    return this.livesService.handleFlashOrder(req.user.id, id, dto);
  }
}
