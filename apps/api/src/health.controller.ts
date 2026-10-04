import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  /**
   * Sonde de disponibilité (Cloud Run / load balancer)
   * GET /api/health
   */
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
