'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MADAGASCAR_CITIES } from '@e-hetsena/shared';
import { Star, MapPin, Phone, LogOut, Pencil, Plus, ShieldCheck } from 'lucide-react';
import { TopHeader } from '@/components/navigation/TopHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { authFetch, clearSession, isLoggedIn, loginUrl, storeUser } from '@/lib/session';
import { formatPrice } from '@/lib/articles';

interface Profile {
  id: string;
  phoneNumber: string;
  fullName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city: string;
  role: string;
  trustScore: number;
  totalSalesCount: number;
  createdAt: string;
  stats: { activeArticles: number; livesCount: number };
}

interface MyArticle {
  id: string;
  title: string;
  price: number;
  status: string;
  images: { url: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'En vente',
  PENDING_VALIDATION: 'En attente',
  RESERVED: 'Réservé',
  SOLD: 'Vendu',
  DRAFT: 'Brouillon',
};

export default function ProfilePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<MyArticle[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoggedIn(false);
      return;
    }
    setLoggedIn(true);

    (async () => {
      const [meRes, articlesRes] = await Promise.all([
        authFetch('/api/users/me'),
        authFetch('/api/articles/mine'),
      ]);
      if (meRes.status === 401) {
        setLoggedIn(false);
        return;
      }
      if (meRes.ok) {
        const me: Profile = await meRes.json();
        setProfile(me);
        setFullName(me.fullName);
        setCity(me.city);
      }
      if (articlesRes.ok) setArticles(await articlesRes.json());
    })();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const res = await authFetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), city }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(data.message) ? data.message[0] : data.message);
      }
      const updated = await res.json();
      storeUser(updated);
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Tsy voatahiry (Enregistrement impossible)');
    } finally {
      setIsSaving(false);
    }
  };

  const logout = async () => {
    clearSession();
    router.push('/');
  };

  // Visiteur non connecté
  if (loggedIn === false) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-24 max-w-lg mx-auto shadow-2xl">
        <TopHeader />
        <div className="px-6 py-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#D35400]/15 flex items-center justify-center">
            <Phone className="w-7 h-7 text-[#D35400]" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            Midira amin&apos;ny kaontinao (Connectez-vous)
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Laharana finday sy kaody SMS fotsiny no ilaina. (Un numéro de téléphone et un code SMS suffisent.)
          </p>
          <Link
            href={loginUrl('/profile')}
            className="inline-block px-6 py-3 rounded-2xl bg-[#D35400] text-white font-bold text-sm"
          >
            Hiditra (Se connecter)
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-24 max-w-lg mx-auto shadow-2xl">
      <TopHeader />

      {!profile ? (
        <div className="p-4 space-y-3">
          <div className="h-28 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          <div className="h-40 rounded-3xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Carte profil */}
          <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#D35400]/15 text-[#D35400] text-2xl font-bold flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate flex items-center gap-1">
                  {profile.fullName}
                  {profile.role !== 'USER' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.city}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {profile.phoneNumber}
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                  aria-label="Modifier le profil"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800">
                <p className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {profile.trustScore.toFixed(1)}
                </p>
                <p className="text-[10px] text-stone-500">Fitokisana (Confiance)</p>
              </div>
              <div className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800">
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {profile.stats.activeArticles}
                </p>
                <p className="text-[10px] text-stone-500">Amidy (En vente)</p>
              </div>
              <div className="p-2 rounded-2xl bg-stone-50 dark:bg-stone-800">
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {profile.totalSalesCount}
                </p>
                <p className="text-[10px] text-stone-500">Lafo (Ventes)</p>
              </div>
            </div>

            {isEditing && (
              <form onSubmit={saveProfile} className="mt-4 space-y-2">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Anarana (Nom)"
                  maxLength={60}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#D35400]"
                >
                  {!MADAGASCAR_CITIES.includes(city as any) && <option value={city}>{city}</option>}
                  {MADAGASCAR_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(profile.fullName);
                      setCity(profile.city);
                      setError(null);
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-sm font-semibold"
                  >
                    Hanafoana (Annuler)
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-2xl bg-[#D35400] text-white text-sm font-bold disabled:opacity-60"
                  >
                    {isSaving ? '...' : 'Hitahiry (Enregistrer)'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Mes annonces */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Ny entako (Mes annonces)
            </h2>
            <Link href="/sell" className="text-xs font-bold text-[#D35400] flex items-center gap-0.5">
              <Plus className="w-3.5 h-3.5" /> Hivarotra (Vendre)
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
              Mbola tsy nanao filazana ianao (Aucune annonce pour le moment)
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {articles.map((a) => (
                <Link key={a.id} href={`/article/${a.id}`} className="relative rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.images[0]?.url} alt={a.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[11px] font-bold text-white">{formatPrice(a.price)}</p>
                  </div>
                  {a.status !== 'AVAILABLE' && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-stone-900/80 text-white text-[9px] font-bold">
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900 text-red-600 text-sm font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Hivoaka (Se déconnecter)
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
