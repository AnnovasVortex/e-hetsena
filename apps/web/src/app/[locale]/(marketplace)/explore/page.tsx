'use client';

import React, { useEffect, useState } from 'react';
import { MADAGASCAR_CITIES } from '@e-hetsena/shared';
import { Search, MapPin, X } from 'lucide-react';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { CategoryChips } from '@/components/home/CategoryChips';
import { ArticleGrid, ArticleCardItem } from '@/components/home/ArticleGrid';
import { toArticleCard } from '@/lib/articles';

const PAGE_SIZE = 20;

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [articles, setArticles] = useState<ArticleCardItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recherche lancée 400 ms après la dernière frappe (économie de data)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const buildQuery = (p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    return `/api/articles?${params}`;
  };

  // Nouvelle recherche dès qu'un filtre change
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(buildQuery(1))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setArticles(data.items.map(toArticleCard));
        setPage(1);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      })
      .catch(() => !cancelled && setError('Tsy azo ny lisitra (Impossible de charger les articles)'))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, city]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const res = await fetch(buildQuery(page + 1));
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles((prev) => [...prev, ...data.items.map(toArticleCard)]);
      setPage(page + 1);
    } catch {
      setError('Tsy azo ny lisitra (Impossible de charger la suite)');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-24 max-w-lg mx-auto shadow-2xl">
      <TopHeader />

      {/* Recherche + ville */}
      <div className="sticky top-[52px] z-30 bg-[#FDFBF7]/95 dark:bg-[#12181B]/95 backdrop-blur-md px-3 pt-3 pb-1 space-y-2 border-b border-stone-200/80 dark:border-stone-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hitady entana... (Rechercher un article)"
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-700"
              aria-label="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#D35400] shrink-0" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#D35400]"
          >
            <option value="">Madagasikara manontolo (Toutes les villes)</option>
            {MADAGASCAR_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <CategoryChips selectedCategory={category} onSelect={(id) => setCategory(id)} />
      </div>

      {!isLoading && !error && (
        <p className="px-4 pt-3 text-xs text-stone-500 dark:text-stone-400">
          {total} entana hita ({total} article{total > 1 ? 's' : ''})
        </p>
      )}

      {error && (
        <p className="m-3 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <ArticleGrid articles={articles} isLoading={isLoading} />

      {!isLoading && page < totalPages && (
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full py-3 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-bold disabled:opacity-60"
          >
            {isLoadingMore ? 'Miandry... (Chargement)' : 'Hijery bebe kokoa (Voir plus)'}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
