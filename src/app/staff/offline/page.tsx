"use client";

import { useRouter } from "next/navigation";
import { CloudOff, RefreshCw } from "lucide-react";

/**
 * Served by next-pwa's `fallbacks.document` (see next.config.ts) for any
 * staff navigation that fails outright — no network AND no entry in the
 * primestay-staff-pages cache. A route the staff member has already opened
 * loads its own last-known content from that cache instead of landing here;
 * this is only the last-resort shell so a failed navigation never surfaces
 * the browser's own offline error page in its place.
 */
export default function StaffOfflineFallback() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-[rgba(151,49,2,0.08)] flex items-center justify-center">
        <CloudOff size={24} className="text-[var(--brand-primary)]" />
      </div>
      <div className="max-w-sm">
        <h1 className="text-sm font-bold text-[var(--black-2)]">This page hasn&apos;t loaded before</h1>
        <p className="text-xs text-[var(--gray-3)] mt-1.5 leading-relaxed">
          You&apos;re offline and this section hasn&apos;t been opened on this device yet, so
          there&apos;s no saved copy to show. Pages you&apos;ve already visited will keep
          showing their last-known data while offline — reconnect to load this one.
        </p>
      </div>
      <button
        onClick={() => router.refresh()}
        className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[var(--brand-primary)] rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
      >
        <RefreshCw size={13} /> Try again
      </button>
    </div>
  );
}
