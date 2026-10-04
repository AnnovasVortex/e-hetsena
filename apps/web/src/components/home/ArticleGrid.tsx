'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Play, Star, MapPin } from 'lucide-react';

export interface ArticleCardItem {
  id: string;
  title: string;
  price: number;
  city: string;
  size?: string | null;
  condition: string;
  imageUrl: string;
  hasVideo?: boolean;
  seller: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    trustScore: number;
  };
}

interface ArticleGridProps {
  articles: ArticleCardItem[];
  isLoading?: boolean;
}

export function ArticleGrid({ articles, isLoading }: ArticleGridProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-stone-200 dark:bg-stone-800 rounded-2xl aspect-[3/4] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-16 text-center px-4">
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Mbola tsy misy entana amin'ity sokajy ity (Aucun article trouvé dans cette catégorie)
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      {articles.map((item) => {
        const isFav = favorites[item.id];

        return (
          <Link
            key={item.id}
            href={`/article/${item.id}`}
            className="group flex flex-col bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/70 dark:border-stone-800 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
          >
            {/* Image principale (Aspect 3:4) */}
            <div className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-800 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />

              {/* Badge Vidéo disponible */}
              {item.hasVideo && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>Vidéo</span>
                </div>
              )}

              {/* Bouton Favori (Cœur) */}
              <button
                type="button"
                onClick={(e) => toggleFavorite(e, item.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-red-600 transition-colors shadow-xs"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFav ? 'fill-red-600 text-red-600' : 'stroke-[1.8]'
                  }`}
                />
              </button>

              {/* Prix en Ariary sur fond semi-transparent */}
              <div className="absolute bottom-2 left-2 bg-stone-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-xs font-bold tracking-tight">
                {item.price.toLocaleString('fr-FR')} Ar
              </div>
            </div>

            {/* Détails de l'article */}
            <div className="p-2.5 flex flex-col flex-1 justify-between gap-1.5">
              <div>
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                  {item.size && <span className="font-semibold text-stone-700 dark:text-stone-300">{item.size}</span>}
                  {item.size && <span>•</span>}
                  <span className="truncate">{item.city}</span>
                </div>
              </div>

              {/* Vendeur & Confiance */}
              <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500">
                <span className="truncate max-w-[80px]">{item.seller.fullName}</span>
                <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star className="w-2.5 h-2.5 fill-amber-500" />
                  <span>{item.seller.trustScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
