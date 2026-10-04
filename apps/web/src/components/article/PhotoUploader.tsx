'use client';

import React, { useRef, useState } from 'react';
import { Camera, Trash2, CheckCircle2, Zap } from 'lucide-react';
import { compressImage, formatFileSize, CompressionResult } from '@/lib/image-compressor';

interface PhotoUploaderProps {
  onImagesReady: (compressedFiles: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ onImagesReady, maxPhotos = 5 }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<CompressionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    const newPhotos: CompressionResult[] = [...photos];

    for (let i = 0; i < fileList.length; i++) {
      if (newPhotos.length >= maxPhotos) break;
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImage(file);
          newPhotos.push(compressed);
        } catch (err) {
          console.error('Erreur compression image:', err);
        }
      }
    }

    setPhotos(newPhotos);
    setIsProcessing(false);
    onImagesReady(newPhotos.map((p) => p.file));
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onImagesReady(updated.map((p) => p.file));
  };

  // Calcul du gain de données total
  const totalOriginal = photos.reduce((acc, p) => acc + p.originalSize, 0);
  const totalCompressed = photos.reduce((acc, p) => acc + p.compressedSize, 0);
  const totalSavedMb = ((totalOriginal - totalCompressed) / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Bannière d'économie de Data */}
      {photos.length > 0 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>
              <strong>Mitsitsy Data :</strong> {totalSavedMb} Mo de forfait économisés !
            </span>
          </div>
          <span className="font-mono text-emerald-700 font-bold">
            {formatFileSize(totalCompressed)} au lieu de {formatFileSize(totalOriginal)}
          </span>
        </div>
      )}

      {/* Grille de prévisualisation des photos */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Badge Première photo (Couverture) */}
            {index === 0 && (
              <span className="absolute top-2 left-2 bg-[#D35400] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                Sary voalohany (Principale)
              </span>
            )}

            {/* Bouton supprimer */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Poids compressé en bas */}
            <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded-md">
              {formatFileSize(item.compressedSize)} (-{item.savedPercentage}%)
            </div>
          </div>
        ))}

        {/* Bouton Ajouter une photo */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#D35400] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:text-[#D35400] bg-stone-50/50 dark:bg-stone-800/40 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-[#D35400] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-stone-400 group-hover:text-[#D35400]" />
                <span className="text-[11px] font-medium text-center px-1">
                  {photos.length === 0 ? 'Sary (Photos)' : 'Manampy (+)'}
                </span>
                <span className="text-[9px] text-stone-400">
                  {photos.length}/{maxPhotos}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
