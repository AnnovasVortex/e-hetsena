import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Derrière le proxy Cloud Run : récupère la vraie IP client (anti-triche des vues)
  app.set('trust proxy', true);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Origines autorisées (séparées par des virgules), toutes en dev
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim());
  app.enableCors({ origin: corsOrigins?.length ? corsOrigins : true, credentials: true });

  app.enableShutdownHooks();

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API e-hetsena démarrée sur http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
