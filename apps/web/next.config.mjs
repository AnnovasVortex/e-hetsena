import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// URL de l'API NestJS (lue au moment du build : les rewrites sont figés dans l'image)
const apiUrl = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serveur autonome pour l'image Docker (les symlinks pnpm échouent sous Windows sans mode développeur)
  output: process.platform === 'win32' ? undefined : 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@e-hetsena/shared'],
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiUrl}/api/uploads/:path*` },
    ];
  },
};

export default nextConfig;
