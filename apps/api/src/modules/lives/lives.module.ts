import { Module } from '@nestjs/common';
import { LivesController } from './lives.controller';
import { LivesService } from './lives.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [LivesController],
  providers: [LivesService, PrismaService],
  exports: [LivesService],
})
export class LivesModule {}
