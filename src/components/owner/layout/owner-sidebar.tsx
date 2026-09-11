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
  { label: "Guest Messages", href: "/owner/messages", icon: MessageCircle },
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
        className={`flex items-center gap-3 px-[14px] py-[10px] rounded-[10px] no-underline text-sm transition-colors ${isActive
          ? "font-semibold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.08)]"
          : "font-normal text-[var(--black-1)] bg-transparent hover:bg-[rgba(109,34,0,0.1)] hover:text-[var(--primary-hover)]"
          }`}
      >
        <Icon
          size={18}
          className={`flex-shrink-0 ${isActive ? "text-[var(--brand-primary)]" : "text-[var(--black-1)]"
            }`}
        />
        <span className="flex-1">{item.label}</span>
        {badge ? (
          <div className="bg-red-500 text-white rounded-full text-[11px] font-bold min-w-[20px] h-[20px] px-1.5 flex items-center justify-center ml-auto">
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
    return <aside className="w-[260px] h-screen bg-[var(--white)] border-r border-[var(--gray-5)] hidden lg:block fixed top-0 left-0 bottom-0 z-50" />;
  }

  return (
    <aside className="w-[260px] h-screen bg-[var(--white)] border-r border-[var(--gray-5)] hidden lg:flex flex-col py-6 fixed top-0 left-0 bottom-0 z-50">
      {/* Logo + Role Label */}
      <div className="px-5 pb-6">
        <Logo href="/owner" variant="default" width={140} height={48} />
        <div className="mt-5 flex flex-col justify-center items-center text-center px-3 py-2.5 rounded-lg bg-[rgba(149,48,2,0.04)] border border-[rgba(149,48,2,0.12)] shadow-sm">
          <span className="text-[12px] uppercase font-bold text-[var(--brand-primary)] whitespace-normal break-words leading-tight mb-1">
            {fullName}
          </span>
          <span className="text-[12px] uppercase tracking-widest font-semibold text-[rgba(149,48,2,0.7)] leading-none">
            Owner
          </span>
        </div>
      </div>

      <Separator className="mx-5 mb-4" />

      {/* Main Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
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
