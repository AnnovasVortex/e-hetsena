'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Radio, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Fandraisana', subLabel: 'Accueil', href: '/', icon: Home },
    { label: 'Hitady', subLabel: 'Explorer', href: '/explore', icon: Compass },
    { label: 'Hivarotra', subLabel: 'Vendre', href: '/sell', icon: Plus, isSpecial: true },
    { label: 'Mivantana', subLabel: 'Live', href: '/live', icon: Radio, isLive: true },
    { label: 'Mombako', subLabel: 'Profil', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 pb-[env(safe-area-inset-bottom)] max-w-lg mx-auto">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          // Bouton central surélevé « Vendre » (+)
          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-13 h-13 rounded-full bg-[#D35400] group-hover:bg-[#B94600] group-active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-900/25 transition-all">
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#D35400] mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-[#D35400] font-bold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.isLive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
