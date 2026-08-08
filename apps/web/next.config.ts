import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @kousek/db ships raw TypeScript (no build step of its own — see
  // packages/db/package.json) — this tells Next's bundler to transpile it
  // like first-party source instead of expecting pre-built JS.
  transpilePackages: ['@kousek/db'],
  images: {
    remotePatterns: [
      // Real shop photos/logotypes, uploaded through the admin panel.
      { protocol: 'https', hostname: 'ripoknqpntnpqvofqrkz.supabase.co', pathname: '/storage/v1/object/public/**' },
      // Seed placeholder photos — admin's hasRealPhotos() check
      // (lib/data.ts) is how it tells these apart from real uploads.
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
