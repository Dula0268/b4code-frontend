"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth/auth.store";

export default function UserAvatarDropdown() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isRestoring, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [accountMenuOpen]);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    router.push(`/auth/logout?redirect=${encodeURIComponent(pathname)}`);
  };

  const getInitials = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getProfileHref = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case "admin": return "/admin/profile";
      case "owner": return "/owner/setting/accountSetting";
      case "staff": return "/staff/profile";
      case "guest": return "/guest/profile";
      default: return "/auth/login";
    }
  };

  if (!mounted || isRestoring || !user) {
    return <div className="w-9 h-9 bg-neutral-100 animate-pulse rounded-full" />;
  }

  return (
    <div className="relative" ref={accountMenuRef}>
      <button
        onClick={() => setAccountMenuOpen((prev) => !prev)}
        className="relative w-[42px] h-[42px] rounded-full bg-[#953002] flex items-center justify-center text-white text-[13px] font-bold ring-1 ring-neutral-200 cursor-pointer hover:ring-2 hover:ring-[#953002]/30 transition-all overflow-hidden shadow-sm"
        aria-label="Account menu"
      >
        {user?.profile?.avatarUrl ? (
          <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover absolute inset-0" />
        ) : (
          getInitials()
        )}
        {/* Online dot */}
        <span className="absolute bottom-[1px] right-[1px] w-2.5 h-2.5 rounded-full bg-[#27AE60] border-2 border-white z-10" />
      </button>

      {/* Account dropdown */}
      {accountMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e8e8e8] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* User info */}
          <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
            <p className="text-[13px] font-semibold text-[#1d1d1d] truncate">
              {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
            </p>
            <p className="text-[11px] text-[#828282] truncate">{user.email}</p>
          </div>

          <Link
            href={getProfileHref()}
            onClick={() => setAccountMenuOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-[#4f4f4f] hover:bg-[#f8f8f8] hover:text-[#953002] transition-colors no-underline"
          >
            <Settings size={15} /> Profile Settings
          </Link>

          <div className="border-t border-[#f0f0f0] mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
