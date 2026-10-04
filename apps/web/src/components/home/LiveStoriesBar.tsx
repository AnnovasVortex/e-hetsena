'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Users } from 'lucide-react';

export interface ActiveLiveItem {
  id: string;
  title: string;
  hostName: string;
  hostAvatar?: string | null;
  hostCity: string;
  viewersCount: number;
}

interface LiveStoriesBarProps {
  lives: ActiveLiveItem[];
}

export function LiveStoriesBar({ lives }: LiveStoriesBarProps) {
  if (!lives || lives.length === 0) {
    return null;
  }

  return (
    <div className="py-2.5 px-3 border-b border-stone-100 dark:border-stone-800/80 bg-white/50 dark:bg-stone-900/50">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Radio className="w-3.5 h-3.5 text-[#D35400] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Mivantana izao (En direct maintenant)
        </span>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {lives.map((live) => (
          <Link
            key={live.id}
            href={`/live/${live.id}`}
            className="flex flex-col items-center shrink-0 w-18 group cursor-pointer"
          >
            {/* Bulle Avatar avec anneau animé */}
            <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#D35400] via-amber-500 to-red-600 animate-gradient-x">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-stone-900 bg-stone-100 dark:bg-stone-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    live.hostAvatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${live.hostName}`
                  }
                  alt={live.hostName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Pastille DIRECT */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#D35400] text-white text-[9px] font-black tracking-tight rounded-full shadow-xs flex items-center gap-0.5">
                <span>LIVE</span>
              </div>
            </div>

            {/* Nom & spectateurs */}
            <span className="text-[11px] font-medium text-stone-800 dark:text-stone-200 truncate w-full text-center mt-2">
              {live.hostName}
            </span>
            <div className="flex items-center gap-0.5 text-[9px] text-stone-400">
              <Users className="w-2.5 h-2.5" />
              <span>{live.viewersCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
