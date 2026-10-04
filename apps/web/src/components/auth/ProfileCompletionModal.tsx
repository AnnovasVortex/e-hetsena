'use client';

import React, { useState } from 'react';
import { UserCheck, MapPin } from 'lucide-react';

interface ProfileCompletionModalProps {
  onSubmit: (fullName: string, city: string) => void;
  isLoading: boolean;
}

const CITIES = [
  'Antananarivo',
  'Toamasina (Tamatave)',
  'Mahajanga (Majunga)',
  'Antsirabe',
  'Fianarantsoa',
  'Toliara (Tuléar)',
  'Antsiranana (Diego-Suarez)',
  'Autre / Hafa',
];

export function ProfileCompletionModal({ onSubmit, isLoading }: ProfileCompletionModalProps) {
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState(CITIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length >= 2) {
      onSubmit(fullName.trim(), city);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/40 text-[#D35400] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <UserCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Farano ny momba anao
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Ampidiro ny anaranao sy ny tanànanao (Complétez votre profil pour inspirer confiance)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom complet / Pseudo */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-2">
            Anarana na Solonanarana (Nom ou Pseudonyme)
          </label>
          <input
            type="text"
            placeholder="Ohatra: Faly Randria, Tsena Fashion..."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#D35400] text-sm"
            required
            autoFocus
          />
        </div>

        {/* Ville de résidence */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-2">
            Tanàna misy anao (Votre Ville à Madagascar)
          </label>
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#D35400] text-sm appearance-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bouton de confirmation */}
        <button
          type="submit"
          disabled={isLoading || fullName.trim().length < 2}
          className="w-full py-3.5 px-4 bg-[#1E824C] hover:bg-[#16683C] active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition-all cursor-pointer mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Hiditra amin'ny e-hetsena (Terminer et Entrer)</span>
          )}
        </button>
      </form>
    </div>
  );
}
