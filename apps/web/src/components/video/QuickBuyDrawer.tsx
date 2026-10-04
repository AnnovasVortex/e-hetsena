'use client';

import React, { useState } from 'react';
import { X, Check, MessageCircle, Truck, MapPin } from 'lucide-react';

interface QuickBuyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id: string;
    title: string;
    price: number;
    city: string;
    imageUrl: string;
    sellerName: string;
    sellerPhone: string;
  };
}

export function QuickBuyDrawer({ isOpen, onClose, article }: QuickBuyDrawerProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'HAND_DELIVERY' | 'TAXI_BROUSSE'>(
    'HAND_DELIVERY'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleOrder = async () => {
    setIsSubmitting(true);
    // Simulation commande rapide
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Salama ${article.sellerName}, mahaliana ahy ity "${article.title}" amin'ny vidiny ${article.price.toLocaleString(
      'fr-FR'
    )} Ar ao amin'ny e-hetsena ity.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-t-3xl p-5 border-t border-stone-200 dark:border-stone-800 animate-slide-up space-y-4">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            Hividy avy hatrany (Acheter l'article)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Récapitulatif Produit */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
              {article.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>{article.city}</span>
            </div>
            <p className="text-sm font-extrabold text-[#D35400] mt-1">
              {article.price.toLocaleString('fr-FR')} Ar
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-6 vo rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Voaray ny kaomandy ! (Commande enregistrée)
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Hampandrenesina amin'ny SMS ny mpivarotra mba hifandraisana aminao.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold rounded-2xl text-xs"
            >
              Hiverina amin'ny horonantsary (Fermer)
            </button>
          </div>
        ) : (
          <>
            {/* Choix du mode de livraison */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                Safidio ny fomba fanaterana (Mode de livraison) :
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('HAND_DELIVERY')}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                    deliveryMethod === 'HAND_DELIVERY'
                      ? 'border-[#D35400] bg-orange-50/50 dark:bg-orange-950/30 text-[#D35400] font-bold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-700'
                  }`}
                >
                  <p className="font-bold">An-tanana (Main propre)</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Fihaonana an-toerana</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('TAXI_BROUSSE')}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                    deliveryMethod === 'TAXI_BROUSSE'
                      ? 'border-[#D35400] bg-orange-50/50 dark:bg-orange-950/30 text-[#D35400] font-bold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-700'
                  }`}
                >
                  <p className="font-bold">Taxi-brousse</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Colis coopérative</p>
                </button>
              </div>
            </div>

            {/* Actions principales */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleOrder}
                className="w-full py-3.5 bg-[#D35400] hover:bg-[#B94600] active:scale-[0.99] text-white font-bold rounded-2xl text-sm shadow-md shadow-orange-900/10 cursor-pointer"
              >
                {isSubmitting ? 'Eo am-pandefasana...' : 'Hanafatra izao (Commander)'}
              </button>

              <a
                href={`https://wa.me/${article.sellerPhone.replace(/\+/g, '')}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hifampiraharaha amin'ny WhatsApp (Discuter du prix)</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
