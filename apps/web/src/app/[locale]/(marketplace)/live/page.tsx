'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Radio, Users, MapPin, Plus, Check, X } from 'lucide-react';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import type { ActiveLiveItem } from '@/components/home/LiveStoriesBar';
import { authFetch, isLoggedIn, loginUrl } from '@/lib/session';
import { formatPrice } from '@/lib/articles';

interface MyArticle {
  id: string;
  title: string;
  price: number;
  status: string;
  images: { url: string }[];
}

export default function LivesPage() {
  const router = useRouter();
  const [lives, setLives] = useState<ActiveLiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire « Lancer un live »
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [myArticles, setMyArticles] = useState<MyArticle[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/lives/active')
      .then((res) => (res.ok ? res.json() : []))
      .then(setLives)
      .catch(() => setLives([]))
      .finally(() => setIsLoading(false));
  }, []);

  const openCreate = async () => {
    if (!isLoggedIn()) {
      router.push(loginUrl('/live'));
      return;
    }
    setIsCreating(true);
    setError(null);

    const res = await authFetch('/api/articles/mine');
    if (res.status === 401) {
      router.push(loginUrl('/live'));
      return;
    }
    const items: MyArticle[] = res.ok ? await res.json() : [];
    const available = items.filter((a) => a.status === 'AVAILABLE');
    setMyArticles(available);
    setSelectedIds(available.map((a) => a.id));
  };

  const toggleArticle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const startLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setError('Lohateny fohy loatra (Titre trop court)');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Safidio entana 1 farafahakeliny (Choisissez au moins un article)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await authFetch('/api/lives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), articleIds: selectedIds }),
      });
      if (res.status === 401) {
        router.push(loginUrl('/live'));
        return;
      }
      if (!res.ok) throw new Error();
      const live = await res.json();
      router.push(`/live/host/${live.id}`);
    } catch {
      setError('Tsy nety ny Live (Impossible de lancer le live)');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-24 max-w-lg mx-auto shadow-2xl">
      <TopHeader />

      <div className="p-4 space-y-4">
        {/* Appel à l'action vendeur */}
        {!isCreating && (
          <button
            type="button"
            onClick={openCreate}
            className="w-full p-4 rounded-3xl bg-gradient-to-r from-[#D35400] to-red-600 text-white text-left shadow-lg flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Hanomboka Live (Lancer un live)</p>
              <p className="text-xs text-white/85">Asehoy mivantana ny entanao (Vendez en direct)</p>
            </div>
          </button>
        )}

        {isCreating && (
          <form
            onSubmit={startLive}
            className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-stone-900 dark:text-stone-100">Live vaovao (Nouveau live)</p>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Arrivage friperie du jour"
              maxLength={80}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
            />

            <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              Entana haseho (Articles présentés)
            </p>

            {myArticles === null && (
              <div className="h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
            )}

            {myArticles?.length === 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300">
                Mbola tsy manana entana ianao. (Publiez d&apos;abord un article.){' '}
                <Link href="/sell" className="font-bold underline">
                  Hivarotra (Vendre)
                </Link>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {myArticles?.map((a) => {
                const selected = selectedIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleArticle(a.id)}
                    className={`w-full p-2 rounded-2xl border flex items-center gap-3 text-left ${
                      selected
                        ? 'border-[#D35400] bg-orange-50 dark:bg-orange-950/20'
                        : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.images[0]?.url}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-stone-200 dark:bg-stone-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-stone-900 dark:text-stone-100">
                        {a.title}
                      </p>
                      <p className="text-xs text-[#D35400] font-bold">{formatPrice(a.price)}</p>
                    </div>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selected ? 'bg-[#D35400] text-white' : 'border border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {selected && <Check className="w-4 h-4" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !myArticles?.length}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Radio className="w-4 h-4" />
              {isSubmitting ? 'Miandry... (Lancement)' : 'Hanomboka izao (Démarrer le live)'}
            </button>
          </form>
        )}

        {/* Lives en cours */}
        <div className="flex items-center gap-1.5 pt-1">
          <Radio className="w-4 h-4 text-red-600 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Mivantana izao (En direct)
          </h2>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && lives.length === 0 && (
          <div className="py-10 text-center text-sm text-stone-500 dark:text-stone-400">
            Tsy misy Live amin&apos;izao fotoana izao (Aucun live en cours)
          </div>
        )}

        <div className="space-y-3">
          {lives.map((live) => (
            <Link
              key={live.id}
              href={`/live/${live.id}`}
              className="p-3 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3 hover:border-red-400 transition-colors"
            >
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-[#D35400]">
                <div className="w-full h-full rounded-full bg-white dark:bg-stone-900 flex items-center justify-center font-bold text-[#D35400] overflow-hidden">
                  {live.hostAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={live.hostAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    live.hostName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 rounded bg-red-600 text-white text-[9px] font-bold">
                  LIVE
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{live.title}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{live.hostName}</p>
                <p className="text-[11px] text-stone-400 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {live.hostCity}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users className="w-3 h-3" /> {live.viewersCount}
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
