"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import UserAvatarDropdown from "@/components/shared/auth/user-avatar-dropdown";

interface StaffHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
}

export default function StaffHeader({
  title,
  subtitle,
  searchPlaceholder = "Search order #, room, or item...",
  onSearch,
  actions,
}: StaffHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="fixed top-0 right-0 left-[260px] h-[72px] z-40 bg-[var(--white)] border-b border-[var(--gray-5)] flex items-center justify-between px-8">
      {/* Left: Title + Subtitle */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold text-[#111827] m-0 leading-8">
          {title}
        </h1>
        <p className="text-sm text-[#6b7280] m-0">{subtitle}</p>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        <div className="relative w-[280px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="pl-9 rounded-full h-10 text-sm border-[#d1d5db]"
          />
        </div>
        {actions}
        <UserAvatarDropdown />
      </div>
    </header>
  );
}
