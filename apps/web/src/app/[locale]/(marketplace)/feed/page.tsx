'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoFeedItem, FeedVideoData } from '@/components/video/VideoFeedItem';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';

export default function FeedPage() {
  const [videos, setVideos] = useState<FeedVideoData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Chargement des vidéos du fil « Pour toi »
  useEffect(() => {
    fetch('/api/videos/feed')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          // Vidéos démo pour tester sans serveur connecté
          setVideos([
            {
              id: 'v1',
              hlsPlaylistUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              thumbnailUrl:
                'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
              likesCount: 124,
              commentsCount: 18,
              sharesCount: 32,
              user: {
                id: 'u1',
                fullName: 'Fanja Mode',
                avatarUrl: null,
                city: 'Antananarivo (Analakely)',
                phoneNumber: '+261341234567',
                trustScore: 4.9,
              },
              article: {
                id: 'art-1',
                title: 'Veste Jean Vintage oversize brodée',
                price: 35000,
                city: 'Antananarivo',
                size: 'L',
                condition: 'VERY_GOOD_STATE',
                images: [
                  {
                    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
                  },
                ],
              },
            },
            {
              id: 'v2',
              hlsPlaylistUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
              thumbnailUrl:
                'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80',
              likesCount: 89,
              commentsCount: 7,
              sharesCount: 14,
              user: {
                id: 'u2',
                fullName: 'Kicks Antsirabe',
                avatarUrl: null,
                city: 'Antsirabe',
                phoneNumber: '+261320011223',
                trustScore: 4.8,
              },
              article: {
                id: 'art-3',
                title: 'Baskets Nike Air Max 90 originales',
                price: 120000,
                city: 'Antsirabe',
                size: '42',
                condition: 'GOOD_STATE',
                images: [
                  {
                    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500',
                  },
                ],
              },
            },
          ]);
        }
      })
      .catch((err) => console.error('Erreur chargement feed:', err));
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
    <div className="relative h-screen w-full bg-black max-w-lg mx-auto flex flex-col justify-between overflow-hidden">
      {/* En-tête supérieur */}
      <TopHeader />

      {/* Conteneur défilant plein écran avec Scroll-Snap vertical */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
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
