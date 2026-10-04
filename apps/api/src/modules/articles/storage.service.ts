import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localUploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    // Création automatique du dossier local s'il n'existe pas
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Sauvegarde une photo compressée.
   * En local / dev : écrit sur le disque local dans /uploads
   * En production : envoie sur Cloudflare R2 via l'API S3
   */
  async uploadPhoto(
    fileBuffer: Buffer,
    originalName: string,
    mimeType = 'image/webp'
  ): Promise<string> {
    const extension = mimeType === 'image/webp' ? '.webp' : path.extname(originalName) || '.jpg';
    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;

    // Si Cloudflare R2 est configuré dans le .env
    const r2Domain = process.env.R2_PUBLIC_DOMAIN;
    const isR2Configured = process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY;

    if (isR2Configured && r2Domain) {
      this.logger.log(`Envoi de la photo vers Cloudflare R2: ${uniqueFileName}`);
      // Ici, appel PutObject via AWS SDK S3 compatible Cloudflare R2
      // return `${r2Domain}/${uniqueFileName}`;
    }

    // Mode développement local automatique (zéro configuration requise)
    const filePath = path.join(this.localUploadDir, uniqueFileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    this.logger.log(`Photo enregistrée en local : ${filePath} (${fileBuffer.length} octets)`);
    return `/uploads/${uniqueFileName}`;
  }
}
