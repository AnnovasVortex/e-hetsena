'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '@e-hetsena/shared';
import { ArrowLeft, MapPin, Star, Truck, MessageCircle, Eye, Tag } from 'lucide-react';
import { DELIVERY_LABELS, conditionLabel, formatPrice } from '@/lib/articles';

interface ArticleDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  size?: string | null;
  condition: string;
  city: string;
  status: string;
  deliveryOptions: string[];
  isWhatsAppContactEnabled: boolean;
  viewsCount: number;
  images: { id: string; url: string }[];
  seller: {
    id: string;
    fullName: string;
    city: string;
    avatarUrl?: string | null;
    trustScore: number;
    phoneNumber: string;
    totalSalesCount: number;
  };
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params?.id as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/articles/${articleId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setArticle)
      .catch(() => setNotFound(true));
  }, [articleId]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Tsy hita ity entana ity (Cet article n&apos;existe pas ou a été retiré)
        </p>
        <Link href="/explore" className="px-5 py-2.5 rounded-2xl bg-[#D35400] text-white text-sm font-bold">
          Hitady entana hafa (Explorer)
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] max-w-lg mx-auto">
        <div className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-2/3 rounded bg-stone-200 dark:bg-stone-800 animate-pulse" />
          <div className="h-5 w-1/3 rounded bg-stone-200 dark:bg-stone-800 animate-pulse" />
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === article.category);
  const whatsappNumber = article.seller.phoneNumber.replace(/\+/g, '');
  const whatsappText = encodeURIComponent(
    `Salama ! Liana amin'ny "${article.title}" (${formatPrice(article.price)}) hitako tao amin'ny e-hetsena aho.`
  );
  const isAvailable = article.status === 'AVAILABLE';

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-28 max-w-lg mx-auto shadow-2xl">
      {/* Galerie photos */}
      <div className="relative bg-stone-900">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md text-white"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {article.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.images[activeImage]?.url}
            alt={article.title}
            className="w-full aspect-[3/4] object-cover"
          />
        ) : (
          <div className="w-full aspect-[3/4] flex items-center justify-center text-stone-500 text-xs">
            Tsy misy sary (Pas de photo)
          </div>
        )}

        {!isAvailable && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-stone-900/80 text-white text-xs font-bold">
            Tsy azo intsony (Plus disponible)
          </span>
        )}
      </div>

      {article.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 py-2">
          {article.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveImage(i)}
              className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 ${
                i === activeImage ? 'border-[#D35400]' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Infos principales */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-2xl font-extrabold text-[#D35400]">{formatPrice(article.price)}</p>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
            {article.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {category && (
            <span className="px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {category.mg}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {conditionLabel(article.condition)}
          </span>
          {article.size && (
            <span className="px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              Habe (Taille) : {article.size}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {article.city}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
            <Eye className="w-3 h-3" /> {article.viewsCount}
          </span>
        </div>

        <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
          {article.description}
        </p>

        {/* Livraison */}
        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
            <Truck className="w-4 h-4 text-[#D35400]" /> Fomba fanaterana (Livraison)
          </p>
          <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-0.5">
            {article.deliveryOptions.map((d) => (
              <li key={d}>• {DELIVERY_LABELS[d] || d}</li>
            ))}
          </ul>
        </div>

        {/* Vendeur */}
        <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#D35400]/15 text-[#D35400] font-bold flex items-center justify-center overflow-hidden">
            {article.seller.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              article.seller.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
              {article.seller.fullName}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {article.seller.trustScore.toFixed(1)}
              </span>
              <span>{article.seller.totalSalesCount} varotra (ventes)</span>
              <span>{article.seller.city}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      {isAvailable && article.isWhatsAppContactEnabled && (
        <div className="fixed bottom-0 inset-x-0 max-w-lg mx-auto p-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Hiresaka amin&apos;ny mpivarotra (Contacter sur WhatsApp)
          </a>
        </div>
      )}
    </div>
  );
}
