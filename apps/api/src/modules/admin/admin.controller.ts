import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 1. Statistiques du tableau de bord
   * GET /api/admin/stats
   */
  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * 2. Annonces en attente de validation
   * GET /api/admin/articles/pending
   */
  @Get('articles/pending')
  async getPendingArticles() {
    return this.adminService.getPendingArticles();
  }

  /**
   * 3. Approuver une annonce
   * PATCH /api/admin/articles/:id/approve
   */
  @Patch('articles/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveArticle(@Param('id') articleId: string) {
    return this.adminService.approveArticle(articleId);
  }

  /**
   * 4. Rejeter une annonce
   * PATCH /api/admin/articles/:id/reject
   */
  @Patch('articles/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectArticle(
    @Param('id') articleId: string,
    @Body('reason') reason?: string
  ) {
    return this.adminService.rejectArticle(articleId, reason);
  }

  /**
   * 5. Liste des signalements
   * GET /api/admin/reports
   */
  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  /**
   * 6. Résoudre un signalement
   * PATCH /api/admin/reports/:id/resolve
   */
  @Patch('reports/:id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveReport(
    @Param('id') reportId: string,
    @Body('action') action: 'DISMISS' | 'REMOVE_ITEM' | 'BAN_USER'
  ) {
    return this.adminService.resolveReport(reportId, action);
  }

  /**
   * 7. Bannir / Débannir un utilisateur
   * PATCH /api/admin/users/:id/ban
   */
  @Patch('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  async toggleBan(
    @Param('id') userId: string,
    @Body('isBanned') isBanned: boolean,
    @Body('reason') reason?: string
  ) {
    return this.adminService.toggleBanUser(userId, isBanned, reason);
  }
}
