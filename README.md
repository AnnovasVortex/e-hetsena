# 🇲🇬 e-hetsena — Marketplace Vidéo & Live Shopping pour Madagascar

**e-hetsena** est une plateforme mobile-first de vente d'articles de seconde main et de produits locaux pour Madagascar, combinant la découverte vidéo fluide façon **TikTok** et la confiance d'une marketplace façon **Vinted**, entièrement calibrée pour les connexions mobiles lentes et l'économie de data.

---

## 🚀 Fonctionnalités Clés

1. **Mode Mitsitsy Data (Éco-Data)** : Interrupteur en un clic réduisant la consommation de forfait jusqu'à 85% (remplacement des vidéos par des photos WebP légères).
2. **Authentification par SMS (OTP)** : Détection automatique des opérateurs malgaches (Telma, Orange, Airtel) et connexion sans mot de passe.
3. **Compression Image Côté Mobile** : Conversion automatique WebP directe dans le navigateur (8 Mo réduits à 65 Ko avant envoi).
4. **Fil Vertical « Ho anao » (façon TikTok)** : Défilement vertical fluide (*scroll-snap*), lecteur HLS adaptatif (240p/360p), double-tap like avec retour haptique, contact WhatsApp et tiroir d'achat instantané.
5. **Live Shopping Intégré** : Diffusion en direct WebRTC ultra-faible latence (< 500 ms via LiveKit), produit épinglé, et bouton **« Raisiko ! / Je prends ! »** avec file d'attente FIFO anti-doublon.
6. **Panneau d'Administration & Modération** : Validation des annonces, traitement des signalements d'arnaques et bannissement sécurisé par numéro de téléphone.

---

## 🛠️ Stack Technique

* **Frontend** : Next.js 15 (App Router), TypeScript, Tailwind CSS, PWA, Lucide Icons.
* **Backend** : NestJS, TypeScript, WebSockets (Socket.IO & LiveKit WebRTC DataPackets).
* **Base de données & Cache** : PostgreSQL avec Prisma ORM, Redis (Lock atomique FIFO).
* **Médias & Vidéo** : Bunny Stream (VOD HLS adaptatif), Cloudflare R2 (Stockage photos à 0$ d'egress), LiveKit (Live WebRTC).
* **Monorepo** : Turborepo avec pnpm workspaces.

---

## 📂 Structure du Monorepo

```text
e-hetsena/
├── apps/
│   ├── web/                         # Application Frontend Next.js PWA
│   └── api/                         # Backend NestJS (Auth, Articles, Videos, Lives, Admin)
├── packages/
│   ├── shared/                      # Schémas Zod, constantes Madagascar, types universels
│   └── database/                    # Schéma Prisma PostgreSQL exhaustif
├── .env.example
├── package.json
└── turbo.json
```

---

## 💻 Installation & Démarrage en local

1. **Installer les dépendances** :
   ```bash
   pnpm install
   ```

2. **Configurer l'environnement** :
   Copier `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

3. **Générer le client Prisma** :
   ```bash
   pnpm db:push
   ```

4. **Lancer le projet en développement** :
   ```bash
   pnpm dev
   ```

Le frontend sera disponible sur `http://localhost:3000` et l'API sur `http://localhost:4000/api`.
