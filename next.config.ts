import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Force enable in development for testing
  register: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));
