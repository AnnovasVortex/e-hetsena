import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { VideosModule } from './modules/videos/videos.module';
import { LivesModule } from './modules/lives/lives.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [AuthModule, UsersModule, ArticlesModule, VideosModule, LivesModule, AdminModule],
  controllers: [HealthController],
})
export class AppModule {}
