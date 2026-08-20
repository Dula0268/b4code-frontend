"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import UserAvatarDropdown from "@/components/shared/auth/user-avatar-dropdown";
import AdminNotificationDropdown from "@/components/admin/notifications/admin-notification-dropdown";

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
  const adminName = adminNameProp || "Admin";
  const [searchQuery, setSearchQuery] = useState("");

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

      {/* ── Notification Dropdown ── */}
      <AdminNotificationDropdown />

      {/* ── User Avatar Dropdown ── */}
      <UserAvatarDropdown />
    </header>
  );
}
