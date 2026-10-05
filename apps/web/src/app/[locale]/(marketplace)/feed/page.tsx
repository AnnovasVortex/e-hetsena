'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { VideoFeedItem, FeedVideoData } from '@/components/video/VideoFeedItem';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';

export default function FeedPage() {
  const [videos, setVideos] = useState<FeedVideoData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Chargement des vidéos du fil « Pour toi »
  useEffect(() => {
    fetch('/api/videos/feed')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setVideos([]))
      .finally(() => setIsLoaded(true));
  }, []);

  // 2. IntersectionObserver : détecte quelle vidéo est à plus de 60% visible à l'écran
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);

            // Enregistrement de la vue au bout de 2 secondes de visionnage
            const currentVideo = videos[index];
            if (currentVideo) {
              fetch(`/api/videos/${currentVideo.id}/view`, { method: 'POST' }).catch(() => {});
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6, // Déclenché quand 60% de la vidéo est visible
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos]);

  return (
    <div className="relative h-[100dvh] w-full bg-black max-w-lg mx-auto flex flex-col overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* En-tête supérieur */}
      <TopHeader />

      {/* Conteneur défilant plein écran avec Scroll-Snap vertical */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {isLoaded && videos.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center text-white">
            <p className="text-sm text-stone-300">
              Mbola tsy misy horonantsary. (Aucune vidéo pour le moment.)
            </p>
            <Link
              href="/sell/video"
              className="px-5 py-2.5 rounded-2xl bg-[#D35400] text-white text-sm font-bold"
            >
              Handefa horonantsary (Publier une vidéo)
            </Link>
          </div>
        )}
        {videos.map((video, index) => (
          <div
            key={video.id}
            data-index={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="w-full h-full snap-start snap-always"
          >
            <VideoFeedItem video={video} isActive={index === activeIndex} />
          </div>
        ))}
      </div>

      {/* Barre de navigation basse */}
      <BottomNav />
    </div>
  );
}
