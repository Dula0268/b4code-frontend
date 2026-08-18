"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, LogOut, Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OwnerLogoutModal from "./owner-logout-modal";
import { useAuthStore } from "@/store/auth/auth.store";
import { imageApi } from "@/api/image/image.api";
import { formatApiError } from "@/lib/error-formatter";
import { useState, useEffect } from "react";

import { toast } from "sonner";
import { validateUploadFile } from "@/lib/file-validator";

import AvatarModal from "@/components/shared/profile/avatar-modal";

interface OwnerProfileLayoutProps {
  children: React.ReactNode;
}

const OWNER_PROFILE_NAV_ITEMS = [
  { label: "Profile", href: "/owner/profile", icon: User },
  { label: "Login & Security", href: "/owner/profile/security", icon: Lock },
];

export default function OwnerProfileLayout({ children }: OwnerProfileLayoutProps) {
  const pathname = usePathname();
  const { user, updateProfile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ownerEmail = mounted && user?.email ? user.email : "";
  const ownerName = mounted
    ? (user?.profile?.firstName || user?.profile?.lastName
        ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
        : (user?.email ? user.email.split("@")[0] : "Owner"))
    : "Owner";

  const hasCustomAvatar = Boolean(previewUrl || (mounted && user?.profile?.avatarUrl));
  const displayAvatar = previewUrl || (mounted && user?.profile?.avatarUrl
    ? user.profile.avatarUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName || "Owner")}&background=953002&color=fff`);

  const handleAvatarDelete = async () => {
    if (!user?.email) return;
    setIsUploading(true);
    try {
      await updateProfile(user.email, { avatarUrl: "" });
      setPreviewUrl(null);
      toast.success("Profile photo removed successfully!");
    } catch (err: unknown) {
      console.error("Failed to remove avatar:", err);
      toast.error(formatApiError(err, "Failed to remove profile photo."));
    } finally {
      setIsUploading(false);
    }
  };

  const processAvatarFile = async (file: File) => {
    if (!user?.email) return;

    const validation = validateUploadFile(file, { maxSizeMB: 5, allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"] });
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    try {
      const result = await imageApi.upload(file, "avatars");
      await updateProfile(user.email, { avatarUrl: result.url });
      toast.success("Profile photo updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to upload avatar:", err);
      setPreviewUrl(null);
      toast.error(formatApiError(err, "Failed to upload profile photo. Please try a different image."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processAvatarFile(file);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col bg-white rounded-2xl shadow-lg border border-[#e8ddcf]/60 overflow-hidden my-2">
      {/* Sleek Top Banner Accent */}
      <div className="h-10 w-full bg-gradient-to-r from-[#7a2600] via-[#953002] to-[#c2410c] relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="flex flex-1 relative flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-[260px] bg-[#fcfaf8] border-r border-[#f3eee8] flex flex-col py-6 px-5 relative z-10">
          {/* User Info Card */}
          <div className="flex flex-col items-center justify-center mb-6 -mt-8">
            <div 
              className={`relative group cursor-pointer transition-transform duration-300 ${isDragging ? "scale-105" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => setIsModalOpen(true)}
              title="Click to view or update photo"
            >
              <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#953002] text-2xl font-bold mb-2 border-3 shadow-md overflow-hidden transition-all duration-300 ${
                isDragging ? "border-[#953002] ring-4 ring-[#953002]/20" : "border-white ring-2 ring-[#953002]/10 group-hover:ring-[#953002]/30"
              }`}>
                <img src={displayAvatar} alt="Owner Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" suppressHydrationWarning />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20">
                    <Loader2 size={22} className="text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="absolute bottom-2 right-0 w-7 h-7 bg-[#953002] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7a2600] transition-colors shadow-md border-2 border-white z-30 group-hover:scale-110 duration-200" title="Manage photo">
                <Camera size={13} />
              </div>
            </div>
            
            <h2 className="text-base font-black text-[#1c1917] mb-1 truncate w-full text-center tracking-tight" suppressHydrationWarning>{ownerName}</h2>
            <div className="inline-flex items-center gap-1.5 bg-[#953002]/10 text-[#953002] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#953002]/15 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#953002]" />
              Property Owner
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 relative z-10">
            {OWNER_PROFILE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive
                      ? "bg-gradient-to-r from-[#953002]/15 to-[#953002]/5 text-[#953002] shadow-xs border-l-4 border-[#953002]"
                      : "text-[#78716c] hover:bg-gray-100/80 hover:text-[#1c1917]"
                    }`}
                >
                  <Icon size={19} className={isActive ? "text-[#953002]" : "text-[#a8a29e]"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Security Info & Logout Button */}
          <div className="mt-8 md:mt-auto flex flex-col gap-4 relative z-10">
            <div className="bg-[#953002]/5 rounded-2xl p-4 border border-[#953002]/10 text-center">
              <p className="text-xs text-[#953002] font-semibold leading-relaxed">
                🏢 Partner Account Secured
              </p>
              <p className="text-[11px] text-[#78716c] mt-1">
                Keep business details up to date for guest trust.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all rounded-xl h-11"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-owner-logout'));
              }}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 relative z-10 bg-white">
          {children}
        </main>
      </div>

      <OwnerLogoutModal />
      <AvatarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        avatarUrl={displayAvatar}
        userName={ownerName}
        hasCustomAvatar={hasCustomAvatar}
        onUpload={processAvatarFile}
        onDelete={handleAvatarDelete}
      />
    </div>
  );
}
