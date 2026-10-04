import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Readable } from 'stream';
import { Storage } from '@google-cloud/storage';

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localUploadDir = path.resolve(process.cwd(), 'uploads');
  private readonly storage = new Storage();

  constructor() {
    // Création automatique du dossier local s'il n'existe pas
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Sauvegarde une photo compressée et renvoie son URL publique (/uploads/<fichier>).
   * En local / dev : écrit sur le disque local dans /uploads
   * En production : envoie sur Google Cloud Storage (GCS_BUCKET_NAME). Le bucket reste privé
   * (partage public interdit par l'organisation) : la photo est relayée par GET /api/uploads/:fileName
   */
  async uploadPhoto(
    fileBuffer: Buffer,
    originalName: string,
    mimeType = 'image/webp'
  ): Promise<string> {
    const extension = mimeType === 'image/webp' ? '.webp' : path.extname(originalName) || '.jpg';
    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;

    // Si un bucket Google Cloud Storage est configuré (Cloud Run : identifiants automatiques)
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (bucketName) {
      const objectName = `articles/${uniqueFileName}`;
      await this.storage.bucket(bucketName).file(objectName).save(fileBuffer, {
        contentType: mimeType,
        resumable: false,
      });

      this.logger.log(`Photo envoyée sur GCS : ${objectName} (${fileBuffer.length} octets)`);
      return `/uploads/${uniqueFileName}`;
    }

    // Mode développement local automatique (zéro configuration requise)
    const filePath = path.join(this.localUploadDir, uniqueFileName);
    await fs.promises.writeFile(filePath, fileBuffer);

    this.logger.log(`Photo enregistrée en local : ${filePath} (${fileBuffer.length} octets)`);
    return `/uploads/${uniqueFileName}`;
  }

  /**
   * Ouvre une photo en lecture (GCS ou disque local). Renvoie null si elle n'existe pas.
   */
  async openPhoto(fileName: string): Promise<{ stream: Readable; contentType: string } | null> {
    // Noms générés par uploadPhoto uniquement : bloque toute traversée de répertoire
    if (!/^[\w-]+\.(webp|jpe?g|png)$/i.test(fileName)) return null;

    const contentType = MIME_TYPES[path.extname(fileName).toLowerCase()] || 'application/octet-stream';
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (bucketName) {
      const file = this.storage.bucket(bucketName).file(`articles/${fileName}`);
      const [exists] = await file.exists();
      return exists ? { stream: file.createReadStream(), contentType } : null;
    }

    const filePath = path.join(this.localUploadDir, fileName);
    if (!fs.existsSync(filePath)) return null;
    return { stream: fs.createReadStream(filePath), contentType };
  }
}
