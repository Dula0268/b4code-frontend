"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import UserIcon from "@/components/features/admin/user-icon";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AdminHeaderProps {
  /** The admin user's display name shown on hover of avatar */
  adminName?: string;
  /** Path to admin avatar image. Falls back to initials if not provided. */
  avatarSrc?: string;
  /** Called when the user types in the search box */
  onSearch?: (query: string) => void;
  /**
   * When true the header spans the full viewport width (left-0).
   * Use on pages that have NO sidebar.
   */
  fullWidth?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminHeader({
  adminName = "Admin",
  avatarSrc,
  onSearch,
  fullWidth = false,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header
      className={`fixed top-0 right-0 h-17 z-40 bg-(--white) border-b border-(--gray-5) flex items-center justify-end px-7 gap-4 ${
        fullWidth ? "left-0" : "left-65"
      }`}
    >
      {/* ── Search Bar ── */}
      <div className="flex items-center gap-2 bg-[#f0ebe7] rounded-xl py-2.25 px-4 w-70 transition-shadow duration-150 focus-within:shadow-[0_0_0_2px_rgba(149,48,2,0.18)]">
        <Search size={15} className="shrink-0" style={{ color: "#b07a6e" }} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#b07a6e] text-[#6b3a2a]"
        />
      </div>

      {/* ── User Avatar ── */}
      <div
        title={adminName}
        className="relative w-10.5 h-10.5 shrink-0 cursor-pointer"
      >
        {/* Avatar circle — overflow-hidden so SVG clips cleanly */}
        <div className="w-10.5 h-10.5 rounded-full overflow-hidden">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={adminName}
              fill
              className="object-cover"
            />
          ) : (
            <UserIcon size={42} />
          )}
        </div>

        {/* Green online indicator dot */}
        <span className="absolute bottom-px right-px w-2.75 h-2.75 rounded-full bg-(--state-success) border-2 border-(--white)" />
      </div>
    </header>
  );
}
