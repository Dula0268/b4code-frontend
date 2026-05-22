"use client";

import { useAuthStore } from "@/store/auth/auth.store";
import { Search, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface StaffHeaderProps {
  staffName?: string;
  avatarSrc?: string;
  onSearch?: (query: string) => void;
}

export default function StaffHeader({
  staffName: staffNameProp,
  avatarSrc,
  onSearch,
}: StaffHeaderProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const staffName = staffNameProp || 
    (user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Staff Member");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="fixed top-0 right-0 h-17 z-40 bg-white border-b border-[#e0e0e0] flex items-center justify-end px-7 gap-4 left-65">
      <div className="flex items-center gap-2 bg-[#f0ebe7] rounded-xl py-2 px-4 w-70 transition-shadow duration-150 focus-within:shadow-[0_0_0_2px_rgba(149,48,2,0.18)]">
        <Search size={15} className="shrink-0" style={{ color: "#b07a6e" }} />
        <input
          type="text"
          placeholder="Search orders or menus..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#b07a6e] text-[#6b3a2a]"
        />
      </div>

      <div
        title={staffName}
        className="relative w-10 h-10 shrink-0 cursor-pointer bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={staffName}
              fill
              className="object-cover"
            />
          ) : user?.profile?.avatarUrl ? (
            <Image
              src={user.profile.avatarUrl}
              alt={staffName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : user?.profile ? (
            <div className="w-full h-full bg-[#953002] flex items-center justify-center text-white text-sm font-bold">
              {user.profile.firstName[0].toUpperCase()}{user.profile.lastName[0].toUpperCase()}
            </div>
          ) : (
            <User size={20} className="text-neutral-500" />
          )}
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
      </div>
    </header>
  );
}