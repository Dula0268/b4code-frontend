"use client";

import Link from "next/link";

type WelcomeModalProps = {
  propertyName: string;
  locationLabel: string;
};

export default function WelcomeModal({
  propertyName,
  locationLabel,
}: WelcomeModalProps) {
  return (
    /* Full-screen backdrop with blur */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Card */}
      <div className="w-[448px] max-w-[calc(100vw-48px)] rounded-3xl bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col items-center px-6 pt-8 pb-6">
        {/* ── Green checkmark ── */}
        <div className="flex items-center justify-center rounded-full bg-green-50 size-[72px] mb-6 shadow-inner border border-green-100/50">
          {/* Checkmark circle icon */}
          <svg
            width="34"
            height="34"
            viewBox="0 0 40 40"
            fill="none"
          >
            <circle cx="20" cy="20" r="18" fill="#10B981" />
            <path
              d="M12 20.5L17.5 26L28 15"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ── Heading ── */}
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center leading-[1.3] mb-3">
          Welcome to
          <br />
          {propertyName}
        </h2>

        {/* ── Description ── */}
        <p className="text-base text-gray-500 text-center leading-relaxed mb-8 max-w-[350px]">
          Your session has been successfully validated. You can now order
          directly to your room.
        </p>

        {/* ── Room info card ── */}
        <div className="w-full rounded-2xl bg-orange-50/60 border border-orange-100/50 p-4 flex items-center gap-3 mb-6">
          {/* Bed icon */}
          <div className="flex items-center justify-center shrink-0 size-10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <path
                d="M3.5 21V11.667C3.5 10.747 4.247 10 5.167 10H22.833C23.753 10 24.5 10.747 24.5 11.667V21"
                stroke="var(--brand-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.25 10V7.583C5.25 6.663 5.997 5.917 6.917 5.917H21.083C22.003 5.917 22.75 6.663 22.75 7.583V10"
                stroke="var(--brand-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.333 21H25.667"
                stroke="var(--brand-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3.5 21V23.333M24.5 21V23.333"
                stroke="var(--brand-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]/80 leading-4">
              Location
            </span>
            <span className="text-lg font-bold text-gray-900 leading-7">
              {locationLabel}
            </span>
          </div>
        </div>

        {/* ── CTA Button ── */}
        <Link
          href="/guest/order/menu"
          className="w-full flex items-center justify-center gap-2 bg-[var(--brand-primary)] rounded-2xl px-6 py-4 shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          <span className="text-base font-bold text-white">View Menu</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10H16M16 10L11 5M16 10L11 15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
