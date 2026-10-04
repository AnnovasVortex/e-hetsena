'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEcoData } from '@/context/EcoDataContext';
import { Play } from 'lucide-react';

interface HlsPlayerProps {
  hlsUrl?: string | null;
  thumbnailUrl: string;
  isActive: boolean;
  onEnded?: () => void;
}

export function HlsPlayer({ hlsUrl, thumbnailUrl, isActive, onEnded }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isEcoData } = useEcoData();
  const [manualPlayOverride, setManualPlayOverride] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialisation et gestion de la lecture / pause selon la visibilité
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // En mode Mitsitsy Data : on ne lance pas automatiquement
    if (isEcoData && !manualPlayOverride) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    if (isActive) {
      // Si le navigateur supporte HLS nativement (ex: Safari iOS)
      if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else if (hlsUrl) {
        // Fallback vidéo MP4 ou HLS via URL directe
        video.src = hlsUrl;
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            // Lecture automatique bloquée par le navigateur : mise en sourdine
            console.warn('Lecture auto bloquée, passage en muet :', err);
            video.muted = true;
            video.play();
            setIsPlaying(true);
          });
      }
    } else {
      video.pause();
      video.currentTime = 0; // Remise à zéro pour libérer la mémoire tampon (RAM mobile)
      setIsPlaying(false);
    }
  }, [isActive, hlsUrl, isEcoData, manualPlayOverride]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Mode Mitsitsy Data (Éco-Data) : Image fixe avec déclencheur manuel */}
      {isEcoData && !manualPlayOverride ? (
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt="Aperçu article"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <button
              type="button"
              onClick={() => setManualPlayOverride(true)}
              className="w-16 h-16 rounded-full bg-[#D35400] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </button>
            <div className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <span className="font-bold text-amber-400">Mitsitsy Data</span> : Hijery video
              (≈ 2.2 Mo)
            </div>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={hlsUrl || ''}
          poster={thumbnailUrl}
          playsInline
          loop
          onEnded={onEnded}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
