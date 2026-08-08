import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @kousek/db ships raw TypeScript (no build step of its own — see
  // packages/db/package.json) — this tells Next's bundler to transpile it
  // like first-party source instead of expecting pre-built JS.
  transpilePackages: ['@kousek/db'],
};

export default nextConfig;
