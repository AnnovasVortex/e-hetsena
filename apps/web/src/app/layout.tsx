import type { Metadata, Viewport } from 'next';
import { EcoDataProvider } from '@/context/EcoDataContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'e-hetsena — Marketplace Vidéo & Live Shopping',
  description:
    "Vente d'articles de seconde main et de produits locaux à Madagascar, en vidéo et en direct.",
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <EcoDataProvider>{children}</EcoDataProvider>
      </body>
    </html>
  );
}
