'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { LiveHostView, HostLiveProduct } from '@/components/live/LiveHostView';

export default function LiveHostPage() {
  const params = useParams();
  const liveId = (params?.id as string) || 'host-live-1';

  // Liste des produits préparés par le vendeur pour son live
  const [products] = useState<HostLiveProduct[]>([
    {
      id: 'lp-1',
      isPinned: true,
      article: {
        id: 'art-1',
        title: 'Veste Jean Vintage oversize brodée',
        price: 35000,
        images: [
          { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500' },
        ],
      },
    },
    {
      id: 'lp-2',
      isPinned: false,
      article: {
        id: 'art-2',
        title: 'Sac artisanal en Raphia tressé main',
        price: 20000,
        images: [
          { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500' },
        ],
      },
    },
    {
      id: 'lp-3',
      isPinned: false,
      article: {
        id: 'art-3',
        title: 'Baskets Nike Air Max 90 originales',
        price: 120000,
        images: [
          { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500' },
        ],
      },
    },
  ]);

  return (
    <LiveHostView
      liveId={liveId}
      title="Vente Friperie & Artisanat en Direct"
      products={products}
    />
  );
}
