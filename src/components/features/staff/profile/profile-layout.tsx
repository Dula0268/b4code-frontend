"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth/auth.store";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const PROFILE_NAV_ITEMS = [
  { label: "Profile", href: "/staff/profile", icon: User },
  { label: "Login & Security", href: "/staff/profile/security", icon: Lock },
];

import LogoutSuccessModal from "./logout-success-modal";

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const displayName = user?.email?.split("@")[0] || "Alex Moore"

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col bg-white rounded-2xl shadow-sm border border-[#f3f4f6] overflow-hidden min-h-[700px]">
      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <aside className="w-[280px] bg-[#fdfaf8] border-r border-[#f3f4f6] flex flex-col py-8 px-6 relative z-10">
          {/* User Info */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center text-[var(--brand-primary)] text-2xl font-bold mb-3 border-[3px] border-white shadow-sm overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-[#1c1917] mb-1">{displayName}</h2>
            <div className="bg-[rgba(149,48,2,0.1)] text-[var(--brand-primary)] text-xs font-semibold px-3 py-1 rounded-full">
              Staff
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 relative z-10">
            {PROFILE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${isActive
                      ? "bg-[rgba(149,48,2,0.1)] text-[var(--brand-primary)]"
                      : "text-[#78716c] hover:bg-gray-100 hover:text-[#1c1917]"
                    }`}
                >
                  <Icon size={18} className={isActive ? "text-[var(--brand-primary)]" : "text-[#a8a29e]"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-4 relative z-10">
            <div className="bg-[rgba(149,48,2,0.05)] rounded-xl p-4 border border-[rgba(149,48,2,0.1)]">
              <p className="text-xs text-[var(--brand-primary)]/80 leading-relaxed text-center">
                Please remember to log out of the portal when you finish your work.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center gap-2 border-[#fca5a5] text-[#ef4444] hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('trigger-staff-logout'));
              }}
            >
              <LogOut size={16} />
              Log Out
            </Button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 relative z-10">
          {children}
        </main>
      </div>

      <LogoutSuccessModal />
    </div>
  );
}
