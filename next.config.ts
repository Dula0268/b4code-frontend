import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// ---------------------------------------------------------------------------
// Offline caching for the staff dashboard.
//
// Staff data lives on a DIFFERENT origin (NEXT_PUBLIC_API_URL, e.g.
// https://api.prime-stay.app) than the app itself. next-pwa's default
// runtimeCaching "apis" rule is `sameOrigin && pathname.startsWith("/api/")`,
// so it never matched our API. The only default rule that did match was the
// catch-all cross-origin rule (NetworkFirst, maxEntries: 32, maxAgeSeconds:
// 3600) which is shared with every third-party image/font/script and is far too
// small and short-lived to keep a dashboard usable offline.
//
// We prepend two dedicated rules. With `extendDefaultRuntimeCaching: true`,
// user entries are evaluated before the defaults, and Workbox uses first-match
// routing, so these win.
//   1. NetworkOnly for the reachability probe, so a cached response can never
//      make a dead backend look alive (see src/hooks/use-network-status.ts).
//   2. NetworkFirst for every other API GET, with a realistic budget.
// ---------------------------------------------------------------------------
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
let apiHost = "localhost:8080";
try {
  apiHost = new URL(apiUrl).host;
} catch {
  /* malformed env: fall back to the dev default */
}
const escapedApiHost = apiHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const apiOriginPattern = `^https?://${escapedApiHost}`;

// Keep in sync with NETWORK_PROBE_PATH in src/hooks/use-network-status.ts.
const NETWORK_PROBE_PATH = "/api/guest/search/filters";

const apiRuntimeCaching = [
  {
    // Reachability probe: must ALWAYS hit the network. If this were allowed to
    // fall back to the cache, `fetch` would resolve while the backend is down
    // and the UI would report "Live" while showing stale data.
    urlPattern: new RegExp(`${apiOriginPattern}${NETWORK_PROBE_PATH}(\\?.*)?$`, "i"),
    handler: "NetworkOnly" as const,
    method: "GET" as const,
    options: { cacheName: "primestay-network-probe" },
  },
  {
    urlPattern: new RegExp(`${apiOriginPattern}/api/.*`, "i"),
    handler: "NetworkFirst" as const,
    method: "GET" as const,
    options: {
      cacheName: "primestay-api",
      networkTimeoutSeconds: 10,
      expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 },
      // Only real 200s. Opaque responses (status 0) are deliberately excluded:
      // the app cannot read them and they would poison the cache.
      cacheableResponse: { statuses: [200] },
      // The API sends `Vary: Origin` (and often `Vary: Authorization`) for CORS.
      // Without ignoreVary, offline cache lookups miss and reads fail.
      matchOptions: { ignoreVary: true },
    },
  },
];

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === 'development', // Disable in dev for faster compilation
  register: false, // registered manually by src/components/shared/pwa-registrar.tsx
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  // sw.js is emitted at the public root ("/sw.js"), so its maximum allowed
  // scope is "/" and narrowing to "/staff" needs no Service-Worker-Allowed
  // header. The missing trailing slash is deliberate: scope "/staff/" would NOT
  // control the dashboard root "/staff" itself.
  scope: "/staff",
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: apiRuntimeCaching,
  },
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  output: "standalone",
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
