"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, LogOut, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GuestLogoutModal from "./guest-logout-modal";
import { useAuthStore } from "@/store/auth/auth.store";
import { imageApi } from "@/api/image/image.api";
import { useState } from "react";

interface GuestProfileLayoutProps {
  children: React.ReactNode;
}

const GUEST_PROFILE_NAV_ITEMS = [
  { label: "Profile", href: "/guest/profile", icon: User },
  { label: "Login & Security", href: "/guest/profile/security", icon: Lock },
];

export default function GuestProfileLayout({ children }: GuestProfileLayoutProps) {
  const pathname = usePathname();
  const { user, updateProfile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  
  const guestEmail = user?.email || "guest@primestay.com";
  const guestName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : guestEmail.split("@")[0];
  const avatarUrl = user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=953002&color=fff`;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    setIsUploading(true);
    try {
      const result = await imageApi.upload(file, "avatars");
      await updateProfile(user.email, { avatarUrl: result.url });
    } catch (err: unknown) {
      console.error("Failed to upload avatar:", err);
      const errorMessage = err instanceof Error ? err.message : "Please check your Cloudinary configuration.";
      alert(`Failed to upload image: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col bg-white rounded-2xl shadow-sm border border-[#f3f4f6] overflow-hidden min-h-[700px]">
      <div className="flex flex-1 relative flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-[280px] bg-[#fdfaf8] border-r border-[#f3f4f6] flex flex-col py-8 px-6 relative z-10">
          {/* User Info */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-[#953002]/10 flex items-center justify-center text-[#953002] text-2xl font-bold mb-3 border-[3px] border-white shadow-sm overflow-hidden">
                <img src={avatarUrl} alt="Guest Avatar" className="w-full h-full object-cover" />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-3 right-0 w-7 h-7 bg-[#953002] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7a2600] transition-colors shadow-md border-2 border-white z-30 group-hover:scale-110 duration-200">
                <Camera size={14} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-[#1c1917] mb-1 truncate w-full text-center">{guestName}</h2>
            <div className="bg-[#953002]/10 text-[#953002] text-xs font-semibold px-3 py-1 rounded-full">
              Guest
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 relative z-10">
            {GUEST_PROFILE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${isActive
                      ? "bg-[#953002]/10 text-[#953002]"
                      : "text-[#78716c] hover:bg-gray-100 hover:text-[#1c1917]"
                    }`}
                >
                  <Icon size={18} className={isActive ? "text-[#953002]" : "text-[#a8a29e]"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-8 md:mt-auto flex flex-col gap-4 relative z-10">
            <div className="bg-[#953002]/5 rounded-xl p-4 border border-[#953002]/10">
              <p className="text-xs text-[#953002]/80 leading-relaxed text-center">
                Review your profile settings to keep your account safe and up to date.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center gap-2 border-[#fca5a5] text-[#ef4444] hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-guest-logout'));
              }}
            >
              <LogOut size={16} />
              Log Out
            </Button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 relative z-10 bg-white">
          {children}
        </main>
      </div>

      <GuestLogoutModal />
    </div>
  );
}
