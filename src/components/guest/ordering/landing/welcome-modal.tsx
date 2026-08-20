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
      <div className="w-[448px] max-w-[calc(100vw-48px)] rounded-2xl bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col items-center px-6 pt-6 pb-2">
        {/* ── Green checkmark ── */}
        <div className="flex items-center justify-center rounded-full bg-[#d9ffd7] size-[85px] mb-6">
          {/* Checkmark circle icon */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
          >
            <circle cx="20" cy="20" r="18" fill="#27AE60" />
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
        <h2 className="text-2xl font-bold text-[#111827] text-center leading-[39px] mb-4">
          Welcome to
          <br />
          {propertyName}
        </h2>

        {/* ── Description ── */}
        <p className="text-base text-[#4b5563] text-center leading-[26px] mb-10 max-w-[350px]">
          Your session has been successfully validated. You can now order
          directly to your room.
        </p>

        {/* ── Room info card ── */}
        <div className="w-full rounded-xl bg-[rgba(149,48,2,0.15)] p-4 flex items-center gap-3 mb-6">
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
                stroke="#8d7f5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.25 10V7.583C5.25 6.663 5.997 5.917 6.917 5.917H21.083C22.003 5.917 22.75 6.663 22.75 7.583V10"
                stroke="#8d7f5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.333 21H25.667"
                stroke="#8d7f5e"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3.5 21V23.333M24.5 21V23.333"
                stroke="#8d7f5e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8d7f5e] leading-4">
              Location
            </span>
            <span className="text-lg font-bold text-[#181610] leading-7">
              {locationLabel}
            </span>
          </div>
        </div>

        {/* ── CTA Button ── */}
        <Link
          href="/guest/order/menu"
          className="w-full h-[76px] rounded-xl bg-[#942f00] hover:bg-[#7c2802] transition flex items-center justify-center gap-2 mb-2"
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
