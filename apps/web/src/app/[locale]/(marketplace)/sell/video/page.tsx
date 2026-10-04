'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoRecorderModal } from '@/components/video/VideoRecorderModal';
import { ResilientVideoUploader, UploadProgress } from '@/lib/tus-uploader';
import { Video, ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CreateVideoPage() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(15);

  const [articleTitle, setArticleTitle] = useState('');
  const [articlePrice, setArticlePrice] = useState('25000');
  const [articleCity, setArticleCity] = useState('Antananarivo');

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderInstance, setUploaderInstance] = useState<ResilientVideoUploader | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVideoReady = (data: { file: File; thumbnailUrl: string; duration: number }) => {
    setVideoFile(data.file);
    setThumbnailUrl(data.thumbnailUrl);
    setDuration(data.duration);
  };

  const handleStartUpload = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('ehetsena_token');
      // 1. Demande de réservation d'upload côté NestJS
      const initRes = await fetch('/api/videos/create-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          durationSeconds: duration,
          thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
        }),
      });

      if (!initRes.ok) {
        throw new Error("Impossible d'initialiser l'upload vidéo");
      }

      const uploadData = await initRes.json();

      // 2. Lancement de l'upload résilient par blocs (Tus)
      const uploader = new ResilientVideoUploader({
        file: videoFile,
        endpoint: uploadData.uploadUrl,
        onProgress: (p) => setUploadProgress(p),
        onError: (err) => {
          setErrorMessage('Coupure réseau détectée. Vous pouvez reprendre à tout moment.');
        },
        onSuccess: () => {
          setIsUploading(false);
          setIsSuccess(true);
          setTimeout(() => {
            router.push('/');
          }, 2000);
        },
      });

      setUploaderInstance(uploader);
      uploader.start();
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Erreur lors de la préparation');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-20 max-w-lg mx-auto">
      {/* En-tête */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base">Hamoaka Horonantsary (Vidéo Produit)</h1>
        <div className="w-6" />
      </div>

      <div className="p-4 space-y-6">
        {/* Cadre vidéo ou sélecteur */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 text-center space-y-4">
          {thumbnailUrl ? (
            <div className="relative aspect-[9/16] max-h-96 mx-auto rounded-2xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnailUrl} alt="Aperçu vidéo" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Hanova (Changer)</span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsModalOpen(true)}
              className="aspect-[9/16] max-h-80 mx-auto border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#D35400] rounded-3xl flex flex-col items-center justify-center gap-2 bg-stone-50/50 dark:bg-stone-800/30 cursor-pointer p-6"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#D35400] flex items-center justify-center shadow-xs">
                <Video className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm text-stone-800 dark:text-stone-200">
                Handray na hanafatra horonantsary
              </p>
              <p className="text-xs text-stone-400">
                Filmer en direct (15s, 30s, 60s) na maka amin'ny galerie
              </p>
            </div>
          )}
        </div>

        {/* Détails du produit relié */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 text-xs">
          <label className="block font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            Fampahalalana hiseho eo amin'ny horonantsary (Bandeau incrusté)
          </label>

          <div>
            <span className="text-stone-500 font-medium">Titre de l'article</span>
            <input
              type="text"
              placeholder="Ex: Robe d'été fleurie"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-stone-500 font-medium">Prix (Ariary)</span>
              <input
                type="text"
                value={articlePrice}
                onChange={(e) => setArticlePrice(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              />
            </div>
            <div>
              <span className="text-stone-500 font-medium">Ville</span>
              <input
                type="text"
                value={articleCity}
                onChange={(e) => setArticleCity(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              />
            </div>
          </div>
        </div>

        {/* Jauge de progression Tus en cas d'upload */}
        {isUploading && uploadProgress && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
              <span>Mandefa amin'ny ampahany (Upload par morceaux)...</span>
              <span>{uploadProgress.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D35400] transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {(uploadProgress.bytesUploaded / (1024 * 1024)).toFixed(1)} Mo /{' '}
              {(uploadProgress.totalBytes / (1024 * 1024)).toFixed(1)} Mo envoyés
            </p>
          </div>
        )}

        {/* Message d'erreur avec bouton reprendre */}
        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => uploaderInstance?.resume()}
              className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg"
            >
              Tohizana (Reprendre)
            </button>
          </div>
        )}

        {/* Message de succès */}
        {isSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">
              Tafakatra soa aman-tsara ! Voatahiry ny horonantsary (Vidéo envoyée avec succès !)
            </span>
          </div>
        )}

        {/* Bouton d'action */}
        <button
          type="button"
          disabled={!videoFile || isUploading || isSuccess}
          onClick={handleStartUpload}
          className="w-full py-4 bg-[#D35400] hover:bg-[#B94600] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-orange-900/10 cursor-pointer"
        >
          {isUploading
            ? 'Eo am-pandefasana... (Envoi en cours)'
            : 'Handefa ny horonantsary (Publier la vidéo)'}
        </button>
      </div>

      {/* Modal d'enregistrement vidéo */}
      <VideoRecorderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVideoReady={handleVideoReady}
      />
    </div>
  );
}
