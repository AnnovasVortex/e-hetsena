'use client';

import React from 'react';
import { CATEGORIES } from '@e-hetsena/shared';

interface CategoryChipsProps {
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryChips({ selectedCategory, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 px-4 bg-[#FDFBF7] dark:bg-[#12181B]">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
          selectedCategory === null
            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
            : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300/60'
        }`}
      >
        Rehetra (Tous)
      </button>

      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[#D35400] text-white shadow-xs'
                : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300/60'
            }`}
          >
            {cat.mg}
          </button>
        );
      })}
    </div>
  );
}
