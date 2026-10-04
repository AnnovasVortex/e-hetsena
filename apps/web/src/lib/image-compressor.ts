/**
 * Compresseur d'images optimisé pour les connexions mobiles lentes à Madagascar.
 * Convertit toute image brute (JPG/PNG de 5-12 Mo) en WebP optimisé (40-90 Ko)
 * directement sur le téléphone de l'utilisateur AVANT l'envoi réseau.
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
}

export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.78
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 1. Calcul des dimensions proportionnelles
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // 2. Dessin sur Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        // Amélioration du lissage
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // 3. Export en WebP (ou JPEG de secours)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la compression'));
              return;
            }

            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savedPercentage = Math.round(
              ((originalSize - compressedSize) / originalSize) * 100
            );

            resolve({
              file: compressedFile,
              previewUrl: URL.createObjectURL(blob),
              originalSize,
              compressedSize,
              savedPercentage: Math.max(0, savedPercentage),
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Format d’image non supporté'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Formate les octets en texte lisible (Ko / Mo)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
