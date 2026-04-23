"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLogoutModal from "./admin-logout-modal";
import { useAuthStore } from "@/store/auth/auth.store";
import UserIcon from "@/components/features/admin/user-icon";

interface AdminProfileLayoutProps {
  children: React.ReactNode;
}

const ADMIN_PROFILE_NAV_ITEMS = [
  { label: "Profile", href: "/admin/profile", icon: User },
  { label: "Login & Security", href: "/admin/profile/security", icon: Lock },
];

export default function AdminProfileLayout({ children }: AdminProfileLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const displayName = user?.email?.split("@")[0] || "Admin User";

  const names = displayName.split(" ");
  const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];

  return (
    <div className="w-full mx-auto flex flex-col bg-white rounded-2xl shadow-sm border border-[#f3f4f6] overflow-hidden min-h-[700px]">
      <div className="flex flex-1 relative flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-[280px] bg-[#fdfaf8] border-r border-[#f3f4f6] flex flex-col py-8 px-6 relative z-10">
          {/* User Info */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-[#953002] text-2xl font-bold mb-3 shadow-sm overflow-hidden uppercase">
              <UserIcon size={80} />
            </div>
            <h2 className="text-xl font-bold text-[#1c1917] mb-1 truncate w-full text-center">{displayName}</h2>
            <div className="bg-[#953002]/10 text-[#953002] text-xs font-semibold px-3 py-1 rounded-full">
              Administrator
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 relative z-10">
            {ADMIN_PROFILE_NAV_ITEMS.map((item) => {
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
                Review your profile settings to keep your admin account secure.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center gap-2 border-[#fca5a5] text-[#ef4444] hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-admin-logout'));
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

      <AdminLogoutModal />
    </div>
  );
}
