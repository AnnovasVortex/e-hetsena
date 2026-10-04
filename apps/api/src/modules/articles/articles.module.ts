import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { UploadsController } from './uploads.controller';
import { ArticlesService } from './articles.service';
import { StorageService } from './storage.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ArticlesController, UploadsController],
  providers: [ArticlesService, StorageService, PrismaService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
