"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import UserIcon from "@/components/features/admin/user-icon";
import Link from "next/link";

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
  adminName: adminNameProp,
  avatarSrc,
  onSearch,
  fullWidth = false,
}: AdminHeaderProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const adminName = adminNameProp || 
    (user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Admin");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };



  return (
    <header
      className={`fixed top-0 right-0 h-[68px] z-40 bg-[var(--white)] border-b border-[var(--gray-5)] flex items-center justify-end px-7 gap-4 ${fullWidth ? "left-0" : "left-[260px]"
        }`}
    >
      {/* ── Search Bar ── */}
      <div className="flex items-center gap-2 bg-[#f0ebe7] rounded-xl py-[9px] px-[16px] w-[280px] transition-shadow duration-150 focus-within:shadow-[0_0_0_2px_rgba(149,48,2,0.18)]">
        <Search
          size={15}
          className="flex-shrink-0"
          style={{ color: "#b07a6e" }}
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#b07a6e] text-[#6b3a2a]"
        />
      </div>

      {/* ── User Avatar ── */}
      <Link
        href="/admin/profile"
        title={adminName}
        className="relative w-[42px] h-[42px] flex-shrink-0 cursor-pointer"
      >
        {/* Avatar circle — overflow-hidden so SVG clips cleanly */}
        <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-[#953002]/10 border-2 border-white shadow-sm ring-1 ring-neutral-100 flex items-center justify-center relative">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={adminName}
              fill
              className="object-cover"
            />
          ) : user?.profile?.avatarUrl ? (
            <img 
              src={user.profile.avatarUrl} 
              alt={adminName} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-extrabold uppercase">
              {user?.profile ? (
                `${user.profile.firstName[0]}${user.profile.lastName[0]}`
              ) : (
                user?.email?.[0] || "A"
              )}
            </div>
          )}
        </div>

        {/* Green online indicator dot */}
        <span className="absolute bottom-[1px] right-[1px] w-[11px] h-[11px] rounded-full bg-[var(--state-success)] border-2 border-[var(--white)]" />
      </Link>
    </header>
  );
}
