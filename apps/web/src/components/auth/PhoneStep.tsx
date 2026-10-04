'use client';

import React, { useState } from 'react';
import { detectOperator } from '@e-hetsena/shared';
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react';

interface PhoneStepProps {
  onSuccess: (phone: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function PhoneStep({ onSuccess, isLoading, error }: PhoneStepProps) {
  const [phone, setPhone] = useState('');
  const operator = detectOperator(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length >= 9) {
      onSuccess(phone.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Phone className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Tongasoa eto amin'ny e-hetsena
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Ampidiro ny laharana findainao handraisana kaody SMS (Connectez-vous par téléphone)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Téléphone avec détection d'opérateur */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-2">
            Laharana finday (Numéro de téléphone)
          </label>
          <div className="relative flex items-center">
            {/* Drapeau / Indicatif */}
            <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none text-stone-500 font-medium text-sm">
              <span className="text-base">🇲🇬</span>
              <span>+261</span>
            </div>

            <input
              type="tel"
              inputMode="numeric"
              placeholder="034 12 345 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-24 pr-24 py-3.5 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono text-base transition-all"
              autoFocus
              required
            />

            {/* Badge Opérateur dynamique */}
            <div className="absolute right-3">
              {operator === 'TELMA' && (
                <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg">
                  TELMA
                </span>
              )}
              {operator === 'ORANGE' && (
                <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-800 rounded-lg">
                  ORANGE
                </span>
              )}
              {operator === 'AIRTEL' && (
                <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-800 rounded-lg">
                  AIRTEL
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-1.5 pl-1">
            Mety avokoa na misy 0 na tsia (Ex: 034... na 34...)
          </p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Bouton d'action en Terre Rouge */}
        <button
          type="submit"
          disabled={isLoading || phone.length < 8}
          className="w-full py-3.5 px-4 bg-[#D35400] hover:bg-[#B94600] active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-900/10 transition-all cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Handefa kaody (Recevoir le code)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Note de réassurance */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kaody maimaimpoana, tsy misy sarany (SMS 100% gratuit)</span>
        </div>
      </form>
    </div>
  );
}
