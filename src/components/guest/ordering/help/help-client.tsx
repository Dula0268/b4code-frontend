"use client";

import Link from "next/link";

/* ─── Common issue data ─── */

const COMMON_ISSUES = [
  {
    id: "missing",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-500">
        <path d="M3 7l1.7 11.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 7M1 7h22M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Missing Item",
  },
  {
    id: "special",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Special Requests",
  },
  {
    id: "cutlery",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-500">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Extra Cutlery",
  },
  {
    id: "delay",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-500">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Order Delay",
  },
];

/* ─── Help Client ─── */

export default function HelpClient() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8 bg-gray-50/50">
      <div className="w-full max-w-[560px] space-y-6">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/10 to-transparent pointer-events-none" />

          {/* ── Hero section ── */}
          <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 text-center space-y-4 relative z-10">
            {/* Kitchen icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center shadow-inner border border-orange-100/50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--brand-primary)]">
                  <path d="M3 7l1.7 11.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Staff Assistance
            </h2>
            <p className="text-[15px] text-gray-500 max-w-[400px] mx-auto leading-relaxed">
              Need help with your order? Our staff is ready to assist you with any concern.
            </p>
          </div>

          {/* ── Action buttons ── */}
          <div className="px-6 md:px-8 py-4 space-y-3 relative z-10">
            {/* Quick Call to Staff - Primary (disabled: no live call channel wired up yet) */}
            <button
              disabled
              title="Coming soon — please contact the front desk directly"
              className="w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-gray-200 rounded-2xl px-6 py-4 cursor-not-allowed opacity-70"
            >
              <span className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500 shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72c.13.81.37 1.61.7 2.36a2 2 0 0 1-.45 2.11L8.09 11.5a16 16 0 0 0 6.41 6.41l2.31-2.31a2 2 0 0 1 2.11-.45c.75.33 1.55.57 2.36.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-base font-semibold text-gray-500 whitespace-nowrap">
                  Quick Call to Staff
                </span>
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide sm:ml-1 whitespace-nowrap">
                (Coming soon)
              </span>
            </button>

            {/* Chat with Staff - Outlined */}
            <Link
              href="/guest/order/messages"
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200/80 rounded-2xl px-6 py-4 hover:bg-orange-50/60 hover:border-[var(--brand-primary)]/30 transition-all shadow-sm group no-underline"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500 group-hover:text-[var(--brand-primary)] transition-colors">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-base font-semibold text-gray-800 group-hover:text-[var(--brand-primary)] transition-colors">
                Chat with Staff
              </span>
            </Link>
            <p className="text-center text-xs text-gray-400 font-medium px-2">
              Message the kitchen about your current order, or contact the front desk directly for urgent issues.
            </p>
          </div>

          {/* ── Divider with label ── */}
          <div className="px-6 md:px-8 py-2 flex items-center gap-4 relative z-10">
            <div className="flex-1 h-px bg-gray-200/80" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
              Common Issues
            </span>
            <div className="flex-1 h-px bg-gray-200/80" />
          </div>

          {/* ── 2×2 Grid of common issues (disabled: no live staff channel wired up yet) ── */}
          <div className="px-6 md:px-8 py-4 grid grid-cols-2 gap-4 relative z-10">
            {COMMON_ISSUES.map((issue) => (
              <button
                key={issue.id}
                disabled
                title="Coming soon — please contact the front desk directly"
                className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-gray-50/60 border border-gray-100/80 rounded-2xl cursor-not-allowed opacity-60"
              >
                <div className="p-2 bg-gray-100 rounded-xl">
                  {issue.icon}
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {issue.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="bg-gray-50/80 border-t border-gray-100/80 px-6 md:px-8 py-4 text-center mt-2 relative z-10">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Service available 24/7. Wait time:{" "}
              <span className="font-semibold text-[var(--brand-primary)]">2 mins</span>
            </p>
          </div>
        </div>

        {/* ── Back link ── */}
        <div className="text-center">
          <Link
            href="/guest/order/menu"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-[var(--brand-primary)] transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
