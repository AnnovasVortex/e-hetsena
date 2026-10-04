'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LiveSpectatorView, PinnedProductData } from '@/components/live/LiveSpectatorView';

export default function LiveRoomPage() {
  const params = useParams();
  const liveId = (params?.id as string) || 'demo-live';

  const [liveData, setLiveData] = useState<{
    host: any;
    pinnedProduct: PinnedProductData | null;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/lives/${liveId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const pinned = data.products?.find((p: any) => p.isPinned) || data.products?.[0];
          setLiveData({
            host: data.host,
            pinnedProduct: pinned || null,
          });
        } else {
          // Démo fallback
          setLiveData({
            host: {
              id: 'host-1',
              fullName: 'Soa Fripe Madagascar',
              city: 'Antananarivo (Analakely)',
              avatarUrl: null,
              trustScore: 4.9,
            },
            pinnedProduct: {
              id: 'lp-1',
              article: {
                id: 'art-1',
                title: 'Robe Vintage motif fleurs soie',
                price: 25000,
                images: [
                  { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500' },
                ],
              },
            },
          });
        }
      })
      .catch(() => {
        // Démo fallback
        setLiveData({
          host: {
            id: 'host-1',
            fullName: 'Soa Fripe Madagascar',
            city: 'Antananarivo (Analakely)',
            avatarUrl: null,
            trustScore: 4.9,
          },
          pinnedProduct: {
            id: 'lp-1',
            article: {
              id: 'art-1',
              title: 'Robe Vintage motif fleurs soie',
              price: 25000,
              images: [
                { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500' },
              ],
            },
          },
        });
      });
  }, [liveId]);

  if (!liveData) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center text-white text-xs">
        <div className="w-6 h-6 border-2 border-[#D35400] border-t-transparent rounded-full animate-spin mr-2" />
        <span>Miditra amin'ny Live... (Connexion à la salle...)</span>
      </div>
    );
  }

  return (
    <LiveSpectatorView
      liveId={liveId}
      host={liveData.host}
      initialPinnedProduct={liveData.pinnedProduct}
    />
  );
}
