'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LiveSpectatorView, PinnedProductData } from '@/components/live/LiveSpectatorView';

export default function LiveRoomPage() {
  const params = useParams();
  const liveId = params?.id as string;
  const [error, setError] = useState<string | null>(null);

  const [liveData, setLiveData] = useState<{
    host: any;
    pinnedProduct: PinnedProductData | null;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/lives/${liveId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setError('Tsy hita ny Live (Live introuvable)');
          return;
        }
        if (data.status !== 'LIVE') {
          setError('Efa nifarana ity Live ity (Ce live est terminé)');
          return;
        }
        const pinned = data.products?.find((p: any) => p.isPinned) || data.products?.[0];
        setLiveData({
          host: data.host,
          pinnedProduct: pinned || null,
        });
      })
      .catch(() => setError('Tsy hita ny Live (Live introuvable)'));
  }, [liveId]);

  if (error) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm">{error}</p>
        <Link href="/live" className="px-5 py-2.5 rounded-2xl bg-[#D35400] text-white text-sm font-bold">
          Hijery Live hafa (Voir les autres lives)
        </Link>
      </div>
    );
  }

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
