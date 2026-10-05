'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LiveHostView, HostLiveProduct } from '@/components/live/LiveHostView';
import { getStoredUser } from '@/lib/session';

export default function LiveHostPage() {
  const params = useParams();
  const liveId = params?.id as string;

  const [live, setLive] = useState<{ title: string; products: HostLiveProduct[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Produits réellement associés au live (créé depuis /live)
  useEffect(() => {
    fetch(`/api/lives/${liveId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.host?.id !== getStoredUser()?.id) {
          setError('Ny mpivarotra ihany no afaka mitantana ity Live ity (Réservé au vendeur de ce live)');
          return;
        }
        if (data.status !== 'LIVE') {
          setError('Efa nifarana ity Live ity (Ce live est terminé)');
          return;
        }
        setLive({
          title: data.title,
          products: data.products.map((p: any) => ({
            id: p.id,
            isPinned: p.isPinned,
            article: p.article,
          })),
        });
      })
      .catch(() => setError('Tsy hita ny Live (Live introuvable)'));
  }, [liveId]);

  if (error) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm">{error}</p>
        <Link href="/live" className="px-5 py-2.5 rounded-2xl bg-[#D35400] text-white text-sm font-bold">
          Hiverina (Retour aux lives)
        </Link>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center text-white text-xs">
        <div className="w-6 h-6 border-2 border-[#D35400] border-t-transparent rounded-full animate-spin mr-2" />
        <span>Manomana ny Live... (Préparation du live...)</span>
      </div>
    );
  }

  return <LiveHostView liveId={liveId} title={live.title} products={live.products} />;
}
