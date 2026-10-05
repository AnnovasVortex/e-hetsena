'use client';

import React, { useState, useRef } from 'react';
import { HlsPlayer } from './HlsPlayer';
import { QuickBuyDrawer } from './QuickBuyDrawer';
import { CommentsDrawer } from './CommentsDrawer';
import { authFetch } from '@/lib/session';
import { Heart, MessageCircle, Share2, Plus, ShoppingBag, MapPin } from 'lucide-react';

export interface FeedVideoData {
  id: string;
  hlsPlaylistUrl?: string | null;
  thumbnailUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByMe?: boolean;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    city: string;
    phoneNumber: string;
    trustScore: number;
  };
  article?: {
    id: string;
    title: string;
    price: number;
    city: string;
    size?: string | null;
    condition: string;
    images: { url: string }[];
  } | null;
}

interface VideoFeedItemProps {
  video: FeedVideoData;
  isActive: boolean;
}

export function VideoFeedItem({ video, isActive }: VideoFeedItemProps) {
  const [isLiked, setIsLiked] = useState(video.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isBuyDrawerOpen, setIsBuyDrawerOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount || 0);
  const lastTapRef = useRef<number>(0);

  // Gestion du double-tap sur l'écran pour liker (façon TikTok)
  const handleScreenTouch = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      triggerLike();
      // Animation pop du cœur
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
      // Vibration haptique sur smartphone
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([40]);
      }
    }
    lastTapRef.current = now;
  };

  const triggerLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await authFetch(`/api/videos/${video.id}/like`, { method: 'POST' });
    } catch (e) {
      // Ignoré en local
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.article?.title || 'e-hetsena',
          text: `Jereo ity "${video.article?.title}" amin'ny e-hetsena !`,
          url: window.location.href,
        });
      } catch (err) {
        // Annulé par l'utilisateur
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
  };

  const defaultArticle = {
    id: video.article?.id || video.id,
    title: video.article?.title || 'Produit sans titre',
    price: video.article?.price || 25000,
    city: video.article?.city || video.user.city,
    imageUrl: video.article?.images?.[0]?.url || video.thumbnailUrl,
    sellerName: video.user.fullName,
    sellerPhone: video.user.phoneNumber,
  };

  return (
    <div
      onClick={handleScreenTouch}
      className="relative w-full h-full snap-start snap-always overflow-hidden bg-black select-none"
    >
      {/* 1. Lecteur Vidéo plein écran */}
      <HlsPlayer
        hlsUrl={video.hlsPlaylistUrl}
        thumbnailUrl={video.thumbnailUrl}
        isActive={isActive}
      />

      {/* 2. Cœur géant animé lors du double-tap */}
      {showHeartPop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-28 h-28 fill-[#D35400] text-[#D35400] animate-ping" />
        </div>
      )}

      {/* 3. Dégradé inférieur sombre pour la lisibilité du texte */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

      {/* 4. Barre latérale droite (Actions sociales) */}
      <div className="absolute right-3 bottom-12 z-20 flex flex-col items-center gap-4 text-white">
        {/* Avatar Vendeur */}
        <div className="relative group">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-stone-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                video.user.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${video.user.fullName}`
              }
              alt={video.user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#D35400] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* Bouton Like (Cœur) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerLike();
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
        >
          <div
            className={`w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center transition-colors ${
              isLiked ? 'text-red-500' : 'text-white'
            }`}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'stroke-[2]'}`}
            />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">{likesCount}</span>
        </button>

        {/* Bouton Commentaires */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCommentsOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <MessageCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">{commentsCount}</span>
        </button>

        {/* Bouton Partage */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex flex-col items-center gap-0.5 group active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <Share2 className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">Hizara</span>
        </button>
      </div>

      {/* 5. Bandeau Produit Inférieur Gauche (Achat instantané & Infos) */}
      <div className="absolute left-4 right-18 bottom-8 z-20 text-white space-y-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-stone-100 drop-shadow-md">
              @{video.user.fullName}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-stone-300">
              <MapPin className="w-3 h-3 text-[#D35400]" />
              <span>{video.article?.city || video.user.city}</span>
            </div>
          </div>
          <h2 className="text-base font-bold leading-snug drop-shadow-md line-clamp-2 mt-0.5">
            {video.article?.title || 'Article e-hetsena'}
          </h2>
        </div>

        {/* Prix et bouton d'action */}
        <div className="flex items-center gap-2">
          {/* Badge Prix en grand */}
          <div className="px-3 py-1.5 bg-[#D35400] text-white font-black text-sm rounded-xl shadow-lg shadow-orange-950/40">
            {(video.article?.price || 25000).toLocaleString('fr-FR')} Ar
          </div>

          {/* Bouton Commander / Faire une offre */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsBuyDrawerOpen(true);
            }}
            className="px-4 py-2 bg-white text-stone-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Hividy (Acheter)</span>
          </button>
        </div>
      </div>

      {/* Tiroir des commentaires */}
      <CommentsDrawer
        videoId={video.id}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={() => setCommentsCount((n) => n + 1)}
      />

      {/* 6. Tiroir d'achat sans quitter la vidéo */}
      <QuickBuyDrawer
        isOpen={isBuyDrawerOpen}
        onClose={() => setIsBuyDrawerOpen(false)}
        article={defaultArticle}
      />
    </div>
  );
}
