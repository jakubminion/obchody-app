import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default is 1mb — too small for real photo uploads. Photos are also
    // downscaled client-side before upload (see ShopEditor.tsx), so this
    // is mostly headroom for logo/logotype uploads and local dev.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;
