'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

interface OtpStepProps {
  phoneNumber: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function OtpStep({
  phoneNumber,
  onVerify,
  onResend,
  onBack,
  isLoading,
  error,
}: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Dernier code envoyé : évite de renvoyer le même code (chaque essai compte, 5 max)
  const lastSubmittedRef = useRef<string | null>(null);

  const submit = (code: string) => {
    if (isLoading || code === lastSubmittedRef.current) return;
    lastSubmittedRef.current = code;
    onVerify(code);
  };

  // Code refusé : on vide les cases pour une nouvelle saisie propre
  useEffect(() => {
    if (!error) return;
    setDigits(['', '', '', '', '', '']);
    lastSubmittedRef.current = null;
    inputRefs.current[0]?.focus();
  }, [error]);

  // Compte à rebours de 60s
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Gestion de la frappe dans les 6 cases
  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');

    // Code complet collé ou proposé par le clavier (SMS)
    if (cleanValue.length >= 6) {
      const code = cleanValue.slice(0, 6);
      setDigits(code.split(''));
      inputRefs.current[5]?.focus();
      submit(code);
      return;
    }

    // Case déjà remplie : le nouveau chiffre tapé remplace l'ancien
    const cleanChar = cleanValue.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);

    // Déplacement automatique vers la case suivante
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Soumission automatique dès que les 6 chiffres sont remplis
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submit(fullCode);
    }
  };

  // Gestion de la touche retour arrière (Backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendClick = () => {
    if (timer === 0) {
      setTimer(60);
      onResend();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Hanova laharana (Changer de numéro)</span>
      </button>

      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Kaody fanamarinana
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Nalefa tamin'ny <span className="font-semibold text-stone-800 dark:text-stone-200">{phoneNumber}</span> ny kaody
        </p>
      </div>

      {/* 6 Cases pour le code SMS */}
      <div className="flex justify-between gap-2 mb-6">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={digit}
            onFocus={(e) => e.target.select()}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold font-mono bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl border-2 border-stone-200 dark:border-stone-700 focus:border-[#D35400] focus:ring-0 focus:outline-none transition-all"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Bouton de validation manuel si pas déclenché automatiquement */}
      <button
        type="button"
        disabled={isLoading || digits.join('').length < 6}
        onClick={() => {
          lastSubmittedRef.current = null;
          submit(digits.join(''));
        }}
        className="w-full py-3.5 px-4 bg-[#D35400] hover:bg-[#B94600] active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-900/10 transition-all cursor-pointer mb-4"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>Hanamarina (Valider la connexion)</span>
        )}
      </button>

      {/* Renvoi de code avec timer */}
      <div className="text-center">
        {timer > 0 ? (
          <p className="text-xs text-stone-400">
            Azo averina ny kaody afaka <span className="font-semibold text-stone-600 dark:text-stone-300">{timer} segondra</span>
          </p>
        ) : (
          <button
            onClick={handleResendClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D35400] hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Avereno alefa ny kaody (Renvoyer un nouveau code)</span>
          </button>
        )}
      </div>
    </div>
  );
}
