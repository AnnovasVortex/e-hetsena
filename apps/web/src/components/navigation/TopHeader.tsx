'use client';

import React from 'react';
import Link from 'next/link';
import { useEcoData } from '@/context/EcoDataContext';
import { Zap, Search, Globe } from 'lucide-react';

interface TopHeaderProps {
  currentLocale?: string;
  onSearchClick?: () => void;
}

export function TopHeader({ currentLocale = 'mg', onSearchClick }: TopHeaderProps) {
  const { isEcoData, toggleEcoData } = useEcoData();

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 dark:bg-[#12181B]/90 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800 px-4 py-2.5 flex items-center justify-between">
      {/* Logo e-hetsena original */}
      <Link href="/" className="flex items-center gap-1.5 group">
        <span className="text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
          e<span className="text-[#D35400]">-hetsena</span>
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </Link>

      {/* Actions rapides */}
      <div className="flex items-center gap-2">
        {/* Interrupteur Mitsitsy Data (Éco-Data) */}
        <button
          type="button"
          onClick={toggleEcoData}
          className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            isEcoData
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-900/20'
              : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300/70'
          }`}
          title="Basculez entre le mode vidéo normal et le mode photos seules"
        >
          <Zap className={`w-3.5 h-3.5 ${isEcoData ? 'fill-white text-white' : ''}`} />
          <span className="text-[11px]">{isEcoData ? 'Mitsitsy ON' : 'Mitsitsy Data'}</span>
        </button>

        {/* Sélecteur de langue rapide */}
        <Link
          href={currentLocale === 'mg' ? '/fr' : '/mg'}
          className="p-1.5 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 flex items-center gap-1 px-2"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{currentLocale === 'mg' ? 'FR' : 'MG'}</span>
        </Link>

        {/* Raccourci Recherche */}
        {onSearchClick && (
          <button
            type="button"
            onClick={onSearchClick}
            className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
