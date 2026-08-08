import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // @kousek/db ships raw TypeScript (no build step of its own — see
  // packages/db/package.json) — this tells Next's bundler to transpile it
  // like first-party source instead of expecting pre-built JS.
  transpilePackages: ['@kousek/db'],
  experimental: {
    // Default is 1mb — too small for real photo uploads. Photos are also
    // downscaled client-side before upload (see ShopEditor.tsx), so this
    // is mostly headroom for logo/logotype uploads and local dev.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

// Source map upload only actually runs when SENTRY_AUTH_TOKEN is set
// (Vercel env var, not yet configured) — without it this just wraps the
// config as a no-op, same "works without the key" posture as the rest of
// this pass.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});
