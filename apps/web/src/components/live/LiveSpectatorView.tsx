'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, X, Send, CheckCircle2, AlertCircle, ShoppingBag, Volume2 } from 'lucide-react';

export interface PinnedProductData {
  id: string;
  article: {
    id: string;
    title: string;
    price: number;
    images: { url: string }[];
  };
}

interface LiveSpectatorViewProps {
  liveId: string;
  host: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    city: string;
    trustScore: number;
  };
  initialPinnedProduct?: PinnedProductData | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
}

export function LiveSpectatorView({
  liveId,
  host,
  initialPinnedProduct,
}: LiveSpectatorViewProps) {
  const router = useRouter();

  const [pinnedProduct, setPinnedProduct] = useState<PinnedProductData | null>(
    initialPinnedProduct || null
  );
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Fanja', text: 'Manao ahoana tompoko !' },
    { id: '2', sender: 'Hery', text: 'Firy ny habeny azafady ?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    queuePosition: number;
    isWinner: boolean;
  } | null>(null);

  // Clic sur le bouton « RAISIKO ! / JE PRENDS ! »
  const handleFlashOrder = async () => {
    if (!pinnedProduct) return;
    setIsOrdering(true);

    try {
      const token = localStorage.getItem('ehetsena_token');
      const res = await fetch(`/api/lives/${liveId}/flash-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ liveProductId: pinnedProduct.id }),
      });

      const data = await res.json();
      setOrderResult({
        queuePosition: data.queuePosition || 1,
        isWinner: data.isWinner ?? true,
      });

      // Vibration haptique immédiate
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([80]);
      }
    } catch (err) {
      // Simulation pour tester en local
      setOrderResult({
        queuePosition: 1,
        isWinner: true,
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'Izaho (Moi)',
        text: inputMessage.trim(),
      },
    ]);
    setInputMessage('');
  };

  return (
    <div className="relative h-screen w-full bg-black max-w-lg mx-auto overflow-hidden select-none">
      {/* 1. Flux Vidéo WebRTC (ou Diaporama Audio + Photo si réseau faible) */}
      {isAudioOnly ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 p-6 text-center text-white space-y-4">
          <div className="relative w-48 h-48 rounded-3xl overflow-hidden border-2 border-[#D35400] shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                pinnedProduct?.article.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'
              }
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-[10px] py-1 rounded-lg">
              Mode Mitsitsy (Audio + Photo)
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Feo mivantana mandeha (Audio en direct)</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80"
            alt="Flux live"
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      {/* Dégradés d'ombrage */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

      {/* 2. Barre supérieure Spectateur */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between text-white">
        {/* Infos du vendeur */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/10">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                host.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${host.fullName}`
              }
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none">{host.fullName}</p>
            <span className="text-[10px] text-stone-300">{host.city}</span>
          </div>
        </div>

        {/* Contrôles droits */}
        <div className="flex items-center gap-2">
          {/* Bascule Mode Audio Économique */}
          <button
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
              isAudioOnly
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-black/40 border-white/20 text-stone-300'
            }`}
          >
            {isAudioOnly ? 'Audio Only' : 'HD Vidéo'}
          </button>

          <div className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full flex items-center gap-1 text-xs font-bold border border-white/10">
            <Users className="w-3.5 h-3.5" />
            <span>38</span>
          </div>

          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Fil de discussion en direct (Chat) */}
      <div className="absolute left-4 bottom-32 w-64 max-h-48 z-20 overflow-y-auto no-scrollbar space-y-1.5 pointer-events-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-black/50 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 inline-block max-w-full"
          >
            <span className="font-bold text-amber-400 mr-1.5">{m.sender} :</span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>

      {/* 4. Produit Épinglé & Bouton « RAISIKO ! » */}
      {pinnedProduct && (
        <div className="absolute left-4 right-4 bottom-16 z-20 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pinnedProduct.article.images?.[0]?.url || 'https://picsum.photos/100'}
              alt=""
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-[#D35400] uppercase tracking-wider block">
                Entana amidy izao (En vente)
              </span>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                {pinnedProduct.article.title}
              </p>
              <p className="text-xs font-extrabold text-[#D35400]">
                {pinnedProduct.article.price.toLocaleString('fr-FR')} Ar
              </p>
            </div>
          </div>

          {/* GROS BOUTON RAISIKO ! */}
          <button
            type="button"
            disabled={isOrdering}
            onClick={handleFlashOrder}
            className="px-4 py-3 bg-[#D35400] hover:bg-[#B94600] active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/40 flex items-center gap-1.5 shrink-0 animate-pulse cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>Raisiko !</span>
          </button>
        </div>
      )}

      {/* 5. Champ de saisie du chat en bas */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-3 inset-x-4 z-20 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Manorata hafatra... (Commenter)"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/20 text-white rounded-full text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#D35400]"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-[#D35400] text-white flex items-center justify-center shrink-0 shadow-md"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* 6. Modale Résultat « Raisiko ! » */}
      {orderResult && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="w-full bg-white dark:bg-stone-900 rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            {orderResult.isWinner ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  Tafiditra voalohany ianao ! 🎉
                </h3>
                <p className="text-xs text-stone-500">
                  (Félicitations, vous êtes le premier arrivé sur cet article !)
                </p>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Hampandrenesina mivantana amin'ny WhatsApp anao ny mpivarotra mba hanaterana ny entana.
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <AlertCircle className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Ao anaty lisitra miandry N°{orderResult.queuePosition}
                </h3>
                <p className="text-xs text-stone-500">
                  Efa nisy olona nandray talohanao. Raha mihemotra izy dia anao avy hatrany ny entana !
                </p>
              </>
            )}

            <button
              onClick={() => setOrderResult(null)}
              className="w-full py-3 bg-[#D35400] text-white font-bold text-xs rounded-2xl"
            >
              Hiverina hijery ny Live (Continuer)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
