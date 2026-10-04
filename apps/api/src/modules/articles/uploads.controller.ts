import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Relais des photos d'articles (bucket privé ou disque local)
   * GET /api/uploads/:fileName
   */
  @Get(':fileName')
  async getPhoto(@Param('fileName') fileName: string, @Res() res: Response) {
    const photo = await this.storageService.openPhoto(fileName);
    if (!photo) {
      throw new NotFoundException('Photo introuvable');
    }

    res.setHeader('Content-Type', photo.contentType);
    // Noms de fichiers uniques et jamais réécrits : cache navigateur/CDN d'un an
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    photo.stream.on('error', () => res.destroy());
    photo.stream.pipe(res);
  }
}
