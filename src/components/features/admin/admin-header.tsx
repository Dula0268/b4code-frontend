"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AdminHeaderProps {
  /** The admin user's display name shown on hover of avatar */
  adminName?: string;
  /** Path to admin avatar image. Falls back to initials if not provided. */
  avatarSrc?: string;
  /** Called when the user types in the search box */
  onSearch?: (query: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminHeader({
  adminName = "Admin",
  avatarSrc,
  onSearch,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  // First letter of name for fallback initials avatar
  const initial = adminName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-[260px] right-0 h-[68px] z-40 bg-[var(--white)] border-b border-[var(--gray-5)] flex items-center justify-end px-7 gap-4">
      {/* ── Search Bar ── */}
      <div className="flex items-center gap-2 bg-[#f5efec] border-none rounded-full py-[10px] px-[18px] w-[300px] transition-shadow duration-150 focus-within:shadow-[0_0_0_2px_rgba(149,48,2,0.25)]">
        <Search
          size={16}
          className="text-[var(--brand-primary)] flex-shrink-0 opacity-70"
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border-none outline-none bg-transparent text-sm text-[var(--brand-primary)] w-full placeholder:text-[var(--brand-primary)]/60"
        />
      </div>

      {/* ── User Avatar ── */}
      <div
        title={adminName}
        className="relative w-[42px] h-[42px] rounded-full flex-shrink-0 cursor-pointer"
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={adminName}
            fill
            className="rounded-full object-cover"
          />
        ) : (
          /* Fallback: coloured circle with initial */
          <div className="w-[42px] h-[42px] rounded-full bg-[var(--brand-primary)] text-[var(--white)] flex items-center justify-center font-bold text-base select-none">
            {initial}
          </div>
        )}

        {/* Green online indicator dot */}
        <span className="absolute bottom-[1px] right-[1px] w-[11px] h-[11px] rounded-full bg-[var(--state-success)] border-2 border-[var(--white)]" />
      </div>
    </header>
  );
}
