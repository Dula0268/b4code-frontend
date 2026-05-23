"use client";

import Link from "next/link";

/* ─── Common issue data ─── */

const COMMON_ISSUES = [
  {
    id: "missing",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 7l1.7 11.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 7M1 7h22M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Missing Item",
  },
  {
    id: "special",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Special Requests",
  },
  {
    id: "cutlery",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Extra Cutlery",
  },
  {
    id: "delay",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Order Delay",
  },
];

/* ─── Help Client ─── */

export default function HelpClient() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-6 bg-[#fafaf9]">
      <div className="w-full max-w-[620px]">
        {/* Card */}
        <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* ── Blue hero section ── */}
          <div className="bg-[rgba(47,128,237,0.12)] px-5 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6 text-center space-y-3">
            {/* Kitchen icon */}
            <div className="flex justify-center">
              <div className="w-[56px] h-[56px] rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7l1.7 11.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#2F80ED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 11v4M10 13h4" stroke="#2F80ED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-[22px] font-bold text-[#1D1D1D] leading-[28px]">
              Staff Assistance
            </h2>
            <p className="text-[14px] text-[#6b7280] leading-[20px] max-w-[400px] mx-auto">
              Need help with your order? Our staff is ready to assist you with any concern.
            </p>
          </div>

          {/* ── Action buttons ── */}
          <div className="px-5 md:px-8 py-5 space-y-3">
            {/* Quick Call to Staff - Primary */}
            <button className="w-full flex items-center justify-center gap-2 bg-[#953002] rounded-lg px-6 py-3 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72c.13.81.37 1.61.7 2.36a2 2 0 0 1-.45 2.11L8.09 11.5a16 16 0 0 0 6.41 6.41l2.31-2.31a2 2 0 0 1 2.11-.45c.75.33 1.55.57 2.36.7A2 2 0 0 1 22 16.92Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[15px] font-semibold text-white leading-[22px]">
                Quick Call to Staff
              </span>
            </button>

            {/* Chat with Staff - Outlined */}
            <button className="w-full flex items-center justify-center gap-2 bg-white border border-[#E0E0E0] rounded-lg px-6 py-3 hover:bg-[#f8f6f5] transition cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[15px] font-medium text-[#333333] leading-[22px]">
                Chat with Staff
              </span>
            </button>
          </div>

          {/* ── Divider with label ── */}
          <div className="px-5 md:px-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-[12px] font-medium text-[#9ca3af] uppercase tracking-[0.5px] leading-[16px] shrink-0">
              Common Issues
            </span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          {/* ── 2×2 Grid of common issues ── */}
          <div className="px-5 md:px-8 py-5 grid grid-cols-2 gap-3">
            {COMMON_ISSUES.map((issue) => (
              <button
                key={issue.id}
                className="flex flex-col items-center justify-center gap-2 py-4 px-3 border border-[#f3f4f6] rounded-xl hover:border-[#953002]/30 hover:bg-[rgba(151,49,2,0.03)] transition cursor-pointer"
              >
                {issue.icon}
                <span className="text-[14px] font-medium text-[#4b5563] leading-[20px]">
                  {issue.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="bg-[#f9fafb] border-t border-[#f3f4f6] px-5 md:px-8 py-3 text-center">
            <p className="text-[12px] text-[#9ca3af] leading-[16px]">
              Service available 24/7. Current estimated wait time:{" "}
              <span className="font-bold text-[#953002]">2 mins</span>
            </p>
          </div>
        </div>

        {/* ── Back link ── */}
        <div className="text-center mt-4">
          <Link
            href="/guest/order/menu"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#828282] hover:text-[#973102] transition"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
