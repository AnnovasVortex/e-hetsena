'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { LiveStoriesBar, ActiveLiveItem } from '@/components/home/LiveStoriesBar';
import { CategoryChips } from '@/components/home/CategoryChips';
import { ArticleGrid, ArticleCardItem } from '@/components/home/ArticleGrid';
import { useEcoData } from '@/context/EcoDataContext';
import { Flame, Compass, Play } from 'lucide-react';
import Link from 'next/link';

type HomeTab = 'FOR_YOU' | 'EXPLORE';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>('FOR_YOU');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<ArticleCardItem[]>([]);
  const [lives, setLives] = useState<ActiveLiveItem[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const { isEcoData } = useEcoData();

  // Chargement des lives actifs et articles démo / API
  useEffect(() => {
    // 1. Récupération des lives actifs
    fetch('/api/lives/active')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLives(data))
      .catch(() => {
        // Fallback démo pour tester sans base
        setLives([
          {
            id: 'live-1',
            title: 'Arrivage Friperie Suisse Crème',
            hostName: 'Soa Fripe Tana',
            hostCity: 'Antananarivo',
            viewersCount: 42,
          },
          {
            id: 'live-2',
            title: 'Artisanat & Vannerie Raphia',
            hostName: 'Malagasy Deco',
            hostCity: 'Tamatave',
            viewersCount: 19,
          },
        ]);
      });

    // 2. Récupération des articles de la grille
    setIsLoadingArticles(true);
    const catQuery = selectedCategory ? `?category=${selectedCategory}` : '';
    fetch(`/api/articles${catQuery}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const mapped: ArticleCardItem[] = data.items.map((art: any) => ({
            id: art.id,
            title: art.title,
            price: art.price,
            city: art.city,
            size: art.size,
            condition: art.condition,
            imageUrl: art.images?.[0]?.url || 'https://picsum.photos/400/500',
            hasVideo: !!art.video,
            seller: {
              id: art.seller.id,
              fullName: art.seller.fullName,
              avatarUrl: art.seller.avatarUrl,
              trustScore: art.seller.trustScore,
            },
          }));
          setArticles(mapped);
        } else {
          // Articles démo pour l'affichage initial
          setArticles([
            {
              id: 'art-1',
              title: 'Veste Jean Vintage oversize',
              price: 35000,
              city: 'Antananarivo (Analakely)',
              size: 'L',
              condition: 'VERY_GOOD_STATE',
              imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
              hasVideo: true,
              seller: { id: 's1', fullName: 'Fanja Mode', trustScore: 4.9 },
            },
            {
              id: 'art-2',
              title: 'Sac artisanal en Raphia tressé main',
              price: 20000,
              city: 'Toamasina',
              size: null,
              condition: 'NEW_WITH_TAG',
              imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80',
              hasVideo: false,
              seller: { id: 's2', fullName: 'Kanto Craft', trustScore: 5.0 },
            },
            {
              id: 'art-3',
              title: 'Baskets Nike Air Max 90 originales',
              price: 120000,
              city: 'Antsirabe',
              size: '42',
              condition: 'GOOD_STATE',
              imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&q=80',
              hasVideo: true,
              seller: { id: 's3', fullName: 'Kicks MG', trustScore: 4.8 },
            },
            {
              id: 'art-4',
              title: 'Robe d été fleurie légère',
              price: 18000,
              city: 'Mahajanga',
              size: 'M',
              condition: 'VERY_GOOD_STATE',
              imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80',
              hasVideo: false,
              seller: { id: 's4', fullName: 'Aina Shop', trustScore: 4.7 },
            },
          ]);
        }
      })
      .finally(() => setIsLoadingArticles(false));
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-20 max-w-lg mx-auto shadow-2xl">
      {/* 1. En-tête supérieur */}
      <TopHeader />

      {/* 2. Bandeau Pastilles Lives */}
      <LiveStoriesBar lives={lives} />

      {/* 3. Onglets de sélection (Ho anao / Hitady) */}
      <div className="sticky top-[52px] z-30 bg-[#FDFBF7]/95 dark:bg-[#12181B]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="flex text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('FOR_YOU')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'FOR_YOU'
                ? 'text-[#D35400]'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Ho anao (Pour toi)</span>
            {activeTab === 'FOR_YOU' && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#D35400] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXPLORE')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'EXPLORE'
                ? 'text-[#D35400]'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Hitady (Explorer)</span>
            {activeTab === 'EXPLORE' && (
              <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#D35400] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Contenu selon l'onglet actif */}
      {activeTab === 'FOR_YOU' ? (
        <div className="relative">
          {/* Si mode Eco-Data activé */}
          {isEcoData && (
            <div className="m-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>Mode Mitsitsy Data : Vidéos désactivées pour préserver votre crédit</span>
            </div>
          )}

          {/* Invitation vers le fil vertical plein écran */}
          <div className="p-4">
            <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-lg bg-stone-900 flex flex-col justify-end p-5 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80"
                alt="Aperçu vidéo"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="px-2.5 py-1 bg-[#D35400] text-white text-[11px] font-bold rounded-lg inline-block">
                  Fil Vidéo Interactif
                </span>
                <h3 className="text-xl font-bold leading-tight">
                  Veste Jean Vintage oversize
                </h3>
                <p className="text-sm text-stone-200">
                  35 000 Ar • Antananarivo (Analakely)
                </p>

                <Link
                  href="/feed"
                  className="w-full py-3 bg-white text-stone-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors shadow-md"
                >
                  <Play className="w-4 h-4 fill-stone-900" />
                  <span>Hijery ny horonantsary (Ouvrir le fil plein écran)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Puces de catégories */}
          <CategoryChips
            selectedCategory={selectedCategory}
            onSelect={(id) => setSelectedCategory(id)}
          />

          {/* Grille Vinted-style */}
          <ArticleGrid articles={articles} isLoading={isLoadingArticles} />
        </div>
      )}

      {/* 5. Barre de navigation basse */}
      <BottomNav />
    </div>
  );
}
