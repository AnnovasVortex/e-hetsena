'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploader } from '@/components/article/PhotoUploader';
import {
  CATEGORIES,
  ITEM_CONDITIONS,
  MADAGASCAR_CITIES,
} from '@e-hetsena/shared';
import { ArrowLeft, Tag, Truck, MessageCircle, AlertCircle } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();

  // Form states
  const [photos, setPhotos] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [condition, setCondition] = useState<string>(ITEM_CONDITIONS[1].id);
  const [size, setSize] = useState('');
  const [city, setCity] = useState<string>(MADAGASCAR_CITIES[0]);
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([
    'HAND_DELIVERY',
    'TAXI_BROUSSE_PARCEL',
  ]);
  const [isWhatsAppContactEnabled, setIsWhatsAppContactEnabled] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bascule pour les options de livraison
  const toggleDelivery = (method: string) => {
    if (deliveryOptions.includes(method)) {
      if (deliveryOptions.length > 1) {
        setDeliveryOptions(deliveryOptions.filter((m) => m !== method));
      }
    } else {
      setDeliveryOptions([...deliveryOptions, method]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      setError('Mila sary farafahakeliny 1 (Veuillez ajouter au moins une photo)');
      return;
    }

    if (!price || Number(price) < 500) {
      setError('Vidiny ambany loatra (Le prix minimum est de 500 Ar)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('ehetsena_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // 1. Upload des photos compressées (WebP) une à une
      const uploadedUrls: string[] = [];
      for (const file of photos) {
        const formData = new FormData();
        formData.append('photo', file);

        const uploadRes = await fetch('/api/articles/upload-photo', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Tsy tafakatra ny sary (Échec de l'envoi de la photo)");
        }

        const uploadData = await uploadRes.json();
        uploadedUrls.push(uploadData.url);
      }

      // 2. Création de l'annonce dans la base de données
      const createRes = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          size: size.trim() || undefined,
          condition,
          city,
          deliveryOptions,
          isWhatsAppContactEnabled,
          imageUrls: uploadedUrls,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.message || 'Tsy vita ny famoahana (Erreur de publication)');
      }

      const createdArticle = await createRes.json();
      router.push(`/article/${createdArticle.id}`);
    } catch (err: any) {
      setError(err.message || 'Nisy olana (Une erreur est survenue)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-24">
      {/* En-tête mobile */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base text-stone-900 dark:text-stone-100">
          Hivarotra entana (Déposer une annonce)
        </h1>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-6">
        {/* Section 1 : Photos avec compresseur WebP */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/70 dark:border-stone-800 shadow-xs space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            1. Sary (1 hatramin'ny 5 sary)
          </label>
          <PhotoUploader onImagesReady={(compressed) => setPhotos(compressed)} maxPhotos={5} />
        </div>

        {/* Section 2 : Détails de l'article */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/70 dark:border-stone-800 shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            2. Mombamomba ny entana (Détails de l'article)
          </label>

          <div>
            <span className="text-xs text-stone-500 font-medium">Lohateny (Titre)</span>
            <input
              type="text"
              placeholder="Ohatra: Robe d'été fleurie, Chaussures Nike pointure 42..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              required
            />
          </div>

          <div>
            <span className="text-xs text-stone-500 font-medium">Sokajy (Catégorie)</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.mg} ({cat.fr})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-stone-500 font-medium">Size / Habeny (Facultatif)</span>
              <input
                type="text"
                placeholder="M, L, XL, 38, 42..."
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-medium">Toetrany (État)</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              >
                {ITEM_CONDITIONS.map((cond) => (
                  <option key={cond.id} value={cond.id}>
                    {cond.mg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="text-xs text-stone-500 font-medium">Famaritana (Description)</span>
            <textarea
              rows={3}
              placeholder="Hazavao ny lokony, ny lesoka raha misy, ny fomba fikarakarana..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
              required
            />
          </div>
        </div>

        {/* Section 3 : Prix & Localisation */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/70 dark:border-stone-800 shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            3. Vidiny sy Tanàna (Prix & Localisation)
          </label>

          <div>
            <span className="text-xs text-stone-500 font-medium">Vidiny (Prix en Ariary)</span>
            <div className="relative mt-1">
              <input
                type="number"
                inputMode="numeric"
                step="500"
                placeholder="25000"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-4 pr-16 py-3.5 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-lg font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-stone-500">
                Ar
              </span>
            </div>
            {price && (
              <p className="text-xs text-stone-400 mt-1 pl-1">
                {Number(price).toLocaleString('fr-FR')} Ariary
              </p>
            )}
          </div>

          <div>
            <span className="text-xs text-stone-500 font-medium">Tanàna misy ny entana (Ville)</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full mt-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
            >
              {MADAGASCAR_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 4 : Options de livraison & WhatsApp */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/70 dark:border-stone-800 shadow-xs space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            4. Fandefasana (Modes de livraison acceptés)
          </label>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryOptions.includes('HAND_DELIVERY')}
                onChange={() => toggleDelivery('HAND_DELIVERY')}
                className="w-4 h-4 accent-[#D35400] rounded"
              />
              <div className="text-xs">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  Handraisana an-tanana (Remise en main propre)
                </p>
                <p className="text-stone-400">Fihaonana mivantana amin'ny toerana ifanarahana</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryOptions.includes('TAXI_BROUSSE_PARCEL')}
                onChange={() => toggleDelivery('TAXI_BROUSSE_PARCEL')}
                className="w-4 h-4 accent-[#D35400] rounded"
              />
              <div className="text-xs">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  Taxi-brousse / Coopérative
                </p>
                <p className="text-stone-400">Fandefasana colis any amin'ny faritra na tanàna hafa</p>
              </div>
            </label>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={isWhatsAppContactEnabled}
                onChange={(e) => setIsWhatsAppContactEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <div className="text-xs">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Bouton WhatsApp mivantana
                </p>
                <p className="text-emerald-600/70">
                  Avelao ny mpanjifa hanoratra mivantana amin'ny WhatsApp anao
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-4 bg-[#D35400] hover:bg-[#B94600] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-900/10 transition-all cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Mandefa sary sy mamorona... (Envoi en cours...)</span>
            </div>
          ) : (
            <span>Hamoaka ny entana (Publier l'annonce)</span>
          )}
        </button>
      </form>
    </div>
  );
}
