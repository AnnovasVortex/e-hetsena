'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowLeft,
  Search,
} from 'lucide-react';
import Link from 'next/link';

type AdminTab = 'STATS' | 'ARTICLES' | 'REPORTS' | 'USERS';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('STATS');
  const [stats, setStats] = useState({
    totalUsers: 1420,
    totalArticles: 3890,
    pendingReports: 4,
    activeLives: 3,
    totalVolumeSoldMGA: 48500000,
  });

  const [articles, setArticles] = useState([
    {
      id: 'art-demo-1',
      title: 'iPhone 13 Pro 128Go (Prix trop bas suspect)',
      price: 250000, // 250 000 Ar pour un iPhone 13 Pro = arnaque évidente !
      city: 'Antananarivo',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      sellerName: 'Vendeur Anonyme',
      sellerPhone: '+261349988776',
      trustScore: 2.1,
    },
    {
      id: 'art-demo-2',
      title: 'Robe de mariée traditionnelle malgache',
      price: 180000,
      city: 'Antsirabe',
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
      sellerName: 'Kanto Couture',
      sellerPhone: '+261321122334',
      trustScore: 4.9,
    },
  ]);

  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      reporterName: 'Faly R.',
      reportedName: 'Boutique Express',
      reportedPhone: '+261334455667',
      reason: 'SCAM_OR_FRAUD',
      description: 'Nandefa vola tamin ny Mvola aho fa tsy nandefa ny entana izy (Argent envoyé par Mvola mais aucun colis reçu)',
      targetType: 'ARTICLE',
      targetTitle: 'Montre connectée étanche',
    },
    {
      id: 'rep-2',
      reporterName: 'Haja M.',
      reportedName: 'Fripe Chic',
      reportedPhone: '+261347788990',
      reason: 'COUNTERFEIT',
      description: 'Kiraro sandoka fa tsy original (Chaussure contrefaite)',
      targetType: 'ARTICLE',
      targetTitle: 'Baskets Nike Jordan',
    },
  ]);

  // Validation d'une annonce
  const handleApprove = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Rejet d'une annonce
  const handleReject = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Bannissement d'un utilisateur fraudeur
  const handleBanUser = (phone: string) => {
    if (confirm(`Hohidianina ve ity mpampiasa ity ${phone} ? (Bannir définitivement ?)`)) {
      setReports((prev) => prev.filter((r) => r.reportedPhone !== phone));
      alert(`Utilisateur ${phone} banni avec succès. Ses annonces ont été retirées.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12181B] pb-16 max-w-2xl mx-auto text-stone-900 dark:text-stone-100">
      {/* En-tête Admin */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-extrabold text-sm tracking-tight">Panneau d'Administration</h1>
          <span className="text-[10px] text-emerald-600 font-bold uppercase">e-hetsena Sécurité</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Barre d'onglets */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-bold">
        <button
          onClick={() => setActiveTab('STATS')}
          className={`flex-1 py-3 text-center transition-colors ${
            activeTab === 'STATS' ? 'text-[#D35400] border-b-2 border-[#D35400]' : 'text-stone-500'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('ARTICLES')}
          className={`flex-1 py-3 text-center transition-colors relative ${
            activeTab === 'ARTICLES' ? 'text-[#D35400] border-b-2 border-[#D35400]' : 'text-stone-500'
          }`}
        >
          Validation ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`flex-1 py-3 text-center transition-colors relative ${
            activeTab === 'REPORTS' ? 'text-[#D35400] border-b-2 border-[#D35400]' : 'text-stone-500'
          }`}
        >
          Signalements
          {reports.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px]">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* ONGLET 1 : STATISTIQUES GLOBALES */}
        {activeTab === 'STATS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Utilisateurs</span>
                </div>
                <p className="text-2xl font-black">{stats.totalUsers.toLocaleString('fr-FR')}</p>
                <p className="text-[10px] text-stone-400 mt-1">Numéros vérifiés par SMS</p>
              </div>

              <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-center gap-2 text-stone-500 text-xs mb-1">
                  <ShoppingBag className="w-4 h-4 text-[#D35400]" />
                  <span>Articles Actifs</span>
                </div>
                <p className="text-2xl font-black">{stats.totalArticles.toLocaleString('fr-FR')}</p>
                <p className="text-[10px] text-stone-400 mt-1">En vente sur Madagascar</p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between mb-1 text-stone-500 text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Volume d'affaires estimé (Transactions)</span>
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600">
                {stats.totalVolumeSoldMGA.toLocaleString('fr-FR')} Ar
              </p>
              <p className="text-[10px] text-stone-400 mt-1">
                Via Mobile Money (Mvola, Orange Money) et remise en main propre
              </p>
            </div>
          </div>
        )}

        {/* ONGLET 2 : VALIDATION DES ANNONCES */}
        {activeTab === 'ARTICLES' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Annonces récentes à vérifier
            </h2>

            {articles.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">
                Tsy misy entana miandry validation (Aucune annonce en attente)
              </p>
            ) : (
              articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{art.title}</p>
                      <p className="text-xs font-black text-[#D35400]">
                        {art.price.toLocaleString('fr-FR')} Ar
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Par {art.sellerName} ({art.city}) • Note: ★ {art.trustScore}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(art.id)}
                      className="p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
                      title="Valider l'annonce"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(art.id)}
                      className="p-2 bg-red-50 text-red-700 dark:bg-red-950/40 rounded-xl hover:bg-red-100 transition-colors"
                      title="Rejeter l'annonce"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET 3 : TRAITEMENT DES SIGNALEMENTS */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Fitarainana sy fampandrenesana (Signalements utilisateurs)
            </h2>

            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-red-200/70 dark:border-red-950 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-md">
                    {rep.reason === 'SCAM_OR_FRAUD' ? 'Fiahiahiana Halatra (Arnaque)' : 'Contrefaçon'}
                  </span>
                  <span className="text-stone-400 text-[10px]">Signalé par {rep.reporterName}</span>
                </div>

                <div className="text-xs">
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Cible : {rep.targetTitle} (Vendeur : {rep.reportedName} - {rep.reportedPhone})
                  </p>
                  <p className="text-stone-500 mt-1 italic">"{rep.description}"</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => handleBanUser(rep.reportedPhone)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Hohidiana (Bannir le vendeur)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
