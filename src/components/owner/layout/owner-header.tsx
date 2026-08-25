"use client";

import { Search, Bell } from "lucide-react";
import UserAvatarDropdown from "@/components/shared/auth/user-avatar-dropdown";

export default function OwnerHeader() {
  return (
    <header className="shrink-0 h-[64px] bg-white/80 backdrop-blur-xl border-b border-[#E8EAED] flex items-center justify-end gap-3.5 px-6">
      <div className="flex items-center gap-2 bg-[#F5F6F8] rounded-full h-9 px-3.5 w-[220px]">
        <Search size={14} className="text-[#9ca3af] shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="border-none bg-transparent outline-none text-[13px] text-[#1d1d1d] w-full placeholder:text-[#9ca3af]"
        />
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="p-2 rounded-full flex items-center justify-center hover:bg-[#F5F6F8] transition-colors"
      >
        <Bell size={18} className="text-[#4f4f4f]" />
      </button>
      <UserAvatarDropdown />
    </header>
  );
}
