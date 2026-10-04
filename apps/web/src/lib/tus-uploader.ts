/**
 * Gestionnaire d'upload vidéo résilient basé sur les principes du protocole Tus.
 * Permet l'envoi par blocs (chunks) avec reprise automatique en cas de coupure réseau (3G/4G).
 */

export interface UploadProgress {
  percentage: number;
  bytesUploaded: number;
  totalBytes: number;
  isPaused: boolean;
}

export interface TusUploadOptions {
  file: File;
  endpoint: string;
  headers?: Record<string, string>;
  chunkSize?: number; // Par défaut 512 Ko pour éviter de saturer les connexions lentes
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export class ResilientVideoUploader {
  private file: File;
  private endpoint: string;
  private headers: Record<string, string>;
  private chunkSize: number;
  private offset = 0;
  private isCancelled = false;
  private isPaused = false;
  private onProgress?: (progress: UploadProgress) => void;
  private onError?: (error: Error) => void;
  private onSuccess?: () => void;

  constructor(options: TusUploadOptions) {
    this.file = options.file;
    this.endpoint = options.endpoint;
    this.headers = options.headers || {};
    this.chunkSize = options.chunkSize || 512 * 1024; // Blocs de 512 Ko
    this.onProgress = options.onProgress;
    this.onError = options.onError;
    this.onSuccess = options.onSuccess;
  }

  /**
   * Démarre ou reprend l'upload par blocs
   */
  async start() {
    this.isCancelled = false;
    this.isPaused = false;

    // Mode simulation locale pour le développement sans configuration Bunny CDN
    if (this.endpoint.includes('mock-upload')) {
      return this.simulateDevUpload();
    }

    try {
      while (this.offset < this.file.size && !this.isCancelled && !this.isPaused) {
        const chunk = this.file.slice(this.offset, this.offset + this.chunkSize);
        await this.uploadChunk(chunk, this.offset);

        this.offset += chunk.size;
        const percentage = Math.min(100, Math.round((this.offset / this.file.size) * 100));

        this.onProgress?.({
          percentage,
          bytesUploaded: this.offset,
          totalBytes: this.file.size,
          isPaused: this.isPaused,
        });
      }

      if (this.offset >= this.file.size && !this.isCancelled) {
        this.onSuccess?.();
      }
    } catch (err: any) {
      // Si coupure réseau, on signale et on permet de reprendre
      this.onError?.(err);
    }
  }

  private async uploadChunk(chunk: Blob, currentOffset: number, retries = 3): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/offset+octet-stream',
          'Upload-Offset': currentOffset.toString(),
          ...this.headers,
        },
        body: chunk,
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
    } catch (error) {
      if (retries > 0) {
        // Attente exponentielle avant nouvel essai (utile lors des chutes de réseau)
        await new Promise((r) => setTimeout(r, 1500));
        return this.uploadChunk(chunk, currentOffset, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Simulation fluide pour tester en local
   */
  private async simulateDevUpload() {
    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
      if (this.isCancelled || this.isPaused) break;
      await new Promise((r) => setTimeout(r, 250));
      const percentage = i * 10;
      this.offset = Math.round((this.file.size * percentage) / 100);

      this.onProgress?.({
        percentage,
        bytesUploaded: this.offset,
        totalBytes: this.file.size,
        isPaused: this.isPaused,
      });
    }

    if (!this.isCancelled) {
      this.onSuccess?.();
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.start();
    }
  }

  cancel() {
    this.isCancelled = true;
  }
}
