'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/session';
import {
  Radio,
  Users,
  Camera,
  X,
  Pin,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';

export interface HostLiveProduct {
  id: string;
  isPinned: boolean;
  article: {
    id: string;
    title: string;
    price: number;
    images: { url: string }[];
  };
}

interface FlashNotification {
  id: string;
  buyerName: string;
  buyerPhone: string;
  queuePosition: number;
  productTitle: string;
  price: number;
}

interface LiveHostViewProps {
  liveId: string;
  title: string;
  products: HostLiveProduct[];
}

export function LiveHostView({ liveId, title, products: initialProducts }: LiveHostViewProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [products, setProducts] = useState(initialProducts);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [viewersCount, setViewersCount] = useState(1);
  const [isProductsDrawerOpen, setIsProductsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<FlashNotification[]>([]);

  // Démarrage de la caméra du vendeur
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Erreur accès caméra:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Épingler un produit pendant le live
  const handlePinProduct = async (liveProductId: string) => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        isPinned: p.id === liveProductId,
      }))
    );

    try {
      await authFetch(`/api/lives/${liveId}/pin-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveProductId }),
      });
    } catch (e) {
      // Ignoré en simulation
    }
  };

  // Simulation d'une commande flash reçue pour test
  const simulateIncomingFlashOrder = () => {
    const pinned = products.find((p) => p.isPinned) || products[0];
    const newNotif: FlashNotification = {
      id: Date.now().toString(),
      buyerName: 'Rivo Rakoto',
      buyerPhone: '+261341234567',
      queuePosition: 1,
      productTitle: pinned?.article.title || 'Article en direct',
      price: pinned?.article.price || 30000,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Vibration haptique du téléphone du vendeur pour l'alerter
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([100, 50, 100]);
    }
  };

  const pinnedProduct = products.find((p) => p.isPinned);

  return (
    <div className="relative h-screen w-full bg-black max-w-lg mx-auto overflow-hidden select-none">
      {/* 1. Flux Caméra du Vendeur en plein écran */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Mute local pour éviter l'écho Larsen
        className="w-full h-full object-cover"
      />

      {/* Dégradé supérieur pour lisibilité */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

      {/* 2. Barre supérieure de contrôle */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          {/* Badge MIVANTANA */}
          <div className="px-2.5 py-1 bg-red-600 rounded-full flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="text-[11px] font-black tracking-wider uppercase">MIVANTANA</span>
          </div>

          {/* Compteur de spectateurs */}
          <div className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full flex items-center gap-1.5 text-xs font-bold border border-white/10">
            <Users className="w-3.5 h-3.5 text-stone-300" />
            <span>{viewersCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Inverser caméra */}
          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 active:scale-90 transition-transform"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Quitter / Terminer le live */}
          <button
            onClick={() => {
              if (confirm('Hofaranana ve ny Live ? (Terminer le live ?)')) {
                stopCamera();
                authFetch(`/api/lives/${liveId}/end`, { method: 'POST' })
                  .catch(() => {})
                  .finally(() => router.push('/live'));
              }
            }}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Notifications Flash « RAISIKO » reçues par le vendeur */}
      <div className="absolute top-16 inset-x-4 z-30 space-y-2 pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="pointer-events-auto p-3.5 bg-emerald-600/95 backdrop-blur-md text-white rounded-2xl shadow-xl flex items-center justify-between animate-bounce-short"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-black">
                  RAISIKO ! N°{notif.queuePosition} par {notif.buyerName}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5 truncate max-w-xs">
                {notif.productTitle} • {notif.price.toLocaleString('fr-FR')} Ar
              </p>
            </div>

            {/* Bouton WhatsApp direct pour conclure la vente */}
            <a
              href={`https://wa.me/${notif.buyerPhone.replace(/\+/g, '')}?text=${encodeURIComponent(
                `Salama ${notif.buyerName}, azonao tamin'ny Live e-hetsena teo ilay "${notif.productTitle}". Aiza ny toerana hanaterana azy ?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs shrink-0 hover:bg-emerald-50"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        ))}
      </div>

      {/* 4. Produit actuellement épinglé à l'écran */}
      {pinnedProduct && (
        <div className="absolute bottom-20 left-4 z-20 bg-black/75 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl flex items-center gap-2.5 max-w-[280px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pinnedProduct.article.images?.[0]?.url || 'https://picsum.photos/100'}
            alt=""
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0 text-white">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
              Entana aseho izao (En cours)
            </span>
            <p className="text-xs font-bold truncate">{pinnedProduct.article.title}</p>
            <p className="text-xs font-extrabold text-[#D35400]">
              {pinnedProduct.article.price.toLocaleString('fr-FR')} Ar
            </p>
          </div>
        </div>
      )}

      {/* 5. Barre d'action inférieure du vendeur */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center gap-3">
        {/* Bouton Ouvrir le catalogue des produits du live */}
        <button
          onClick={() => setIsProductsDrawerOpen(true)}
          className="flex-1 py-3 px-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-stone-900 dark:text-stone-100 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg text-xs cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-[#D35400]" />
          <span>Ireo entana amin'ny Live ({products.length})</span>
        </button>

        {/* Bouton de test pour simuler une commande flash */}
        <button
          onClick={simulateIncomingFlashOrder}
          className="py-3 px-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1 shadow-lg cursor-pointer"
          title="Simuler un clic 'Je prends' d'un acheteur"
        >
          <span>Test « Raisiko »</span>
        </button>
      </div>

      {/* 6. Tiroir de gestion des produits à épingler */}
      {isProductsDrawerOpen && (
        <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-xs flex items-end">
          <div className="w-full bg-white dark:bg-stone-900 rounded-t-3xl p-5 border-t border-stone-200 dark:border-stone-800 max-h-[70vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Safidio ny entana haseho (Épingler un produit)
              </h3>
              <button
                onClick={() => setIsProductsDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {products.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    item.isPinned
                      ? 'border-[#D35400] bg-orange-50/50 dark:bg-orange-950/20'
                      : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.article.images?.[0]?.url || 'https://picsum.photos/100'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {item.article.title}
                      </p>
                      <p className="text-xs font-extrabold text-[#D35400]">
                        {item.article.price.toLocaleString('fr-FR')} Ar
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePinProduct(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      item.isPinned
                        ? 'bg-[#D35400] text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    <span>{item.isPinned ? 'Efa miseho' : 'Asehoy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
