"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/branding/logo";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  CalendarCheck,
  MessageCircle,
  Settings,
  Star,
  Users,
  DollarSign,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth/auth.store";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { label: "My Properties", href: "/owner/properties", icon: Building },
  { label: "Bookings", href: "/owner/bookings", icon: CalendarCheck },
  { label: "Rates & Pricing", href: "/owner/rate", icon: DollarSign },
  { label: "Messages", href: "/owner/messages", icon: MessageCircle },
  { label: "Staff", href: "/owner/staff", icon: Users },
  { label: "Reviews", href: "/owner/reviews", icon: Star },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

export function NavItem({ item, isActive, badge, onClick }: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  badge?: number | null;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline text-[14px] font-medium transition-all duration-300 ease-out ${isActive
          ? "text-[var(--brand-primary)] bg-[rgba(149,48,2,0.08)] shadow-[0_1px_2px_rgba(149,48,2,0.05)] border border-[rgba(149,48,2,0.1)]"
          : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-900 border border-transparent"
          }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--brand-primary)] rounded-r-full shadow-[0_0_8px_rgba(149,48,2,0.4)]" />
        )}
        <Icon
          size={18}
          className={`flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 ${isActive ? "text-[var(--brand-primary)]" : "text-slate-400 group-hover:text-slate-600"
            }`}
        />
        <span className="flex-1 tracking-tight">{item.label}</span>
        {badge ? (
          <div className="bg-[var(--brand-primary)] shadow-sm text-white rounded-full text-[11px] font-bold min-w-[20px] h-[20px] px-1.5 flex items-center justify-center ml-auto">
            {badge}
          </div>
        ) : null}
      </Link>
    </li>
  );
}

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "Property Owner";

  if (!mounted) {
    return <aside className="w-[260px] h-screen bg-white border-r border-slate-200/60 hidden lg:block fixed top-0 left-0 bottom-0 z-50" />;
  }

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex flex-col py-6 fixed top-0 left-0 bottom-0 z-50 transition-all duration-300">
      {/* Logo + Role Label */}
      <div className="px-6 pb-6">
        <Logo href="/owner" variant="default" width={140} height={48} />
        
        <div className="mt-6 flex flex-col justify-center items-center text-center px-4 py-3 rounded-xl bg-gradient-to-b from-[rgba(149,48,2,0.03)] to-[rgba(149,48,2,0.06)] border border-[rgba(149,48,2,0.08)] shadow-sm group hover:shadow-md transition-all duration-300 cursor-default">
          <span className="text-[13px] font-bold text-[var(--brand-primary)] whitespace-normal break-words leading-tight mb-1 group-hover:scale-105 transition-transform duration-300">
            {fullName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[rgba(149,48,2,0.6)] leading-none">
              Owner Panel
            </span>
          </div>
        </div>
      </div>

      <Separator className="mx-6 mb-4 opacity-50" />

      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/owner" && pathname.startsWith(item.href + "/"));
            
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
              />
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
