"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/branding/logo";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  QrCode,
  MessageCircle,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth/auth.store";
import { useStaffChatStore } from "@/store/staff/messages/staff-chat.store";
import { usePermission } from "@/hooks/use-permission";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard, permKey: null },
  { label: "Analytics", href: "/staff/analytics", icon: BarChart3, permKey: "analytics" },
  { label: "Order Management", href: "/staff/orders", icon: ClipboardList, permKey: "order_management" },
  { label: "Menu Management", href: "/staff/menu", icon: Package, permKey: "menu_management" },
  { label: "QR Management", href: "/staff/qr", icon: QrCode, permKey: "qr_management" },
  { label: "Guest Messages", href: "/staff/messages", icon: MessageCircle, isChat: true, permKey: "guest_messages" },
];

function NavItem({ item, isActive, badge }: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  badge: number | null;
}) {
  const Icon = item.icon;
  const allowed = usePermission(item.permKey ?? "__always__", true);
  // Dashboard (permKey null) is always visible
  if (item.permKey !== null && !allowed) return null;

  return (
    <li>
      <Link
        href={item.href}
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
          <Badge variant="destructive" className="text-[11px] font-bold min-w-[20px] h-[20px] px-1">
            {badge}
          </Badge>
        ) : null}
      </Link>
    </li>
  );
}

export default function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const unreadMessages = useStaffChatStore((s) => s.conversations.reduce((acc, conv) => acc + conv.unread, 0));
  const [mounted, setMounted] = useState(false);
  const [propertyName, setPropertyName] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const pid = sessionStorage.getItem("selected_property_id") || user?.propertyId;
    if (pid) {
      import("@/api/properties/properties.api").then(({ propertiesApi }) => {
        propertiesApi.getPublicList().then((list) => {
          const prop = list.find((p) => p.id === Number(pid));
          if (prop) setPropertyName(prop.name);
        }).catch(console.error);
      });
    }
  }, [user?.propertyId]);

  const displayName = user?.email?.split("@")[0] || "Alex Moore";
  const names = displayName.split(" ");
  const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];
  const shortName = names.length > 1 ? `${names[0]} ${names[names.length - 1][0]}.` : names[0];

  if (!mounted) {
    // Return a skeleton or null during SSR/initial hydration to avoid mismatch
    return <aside className="w-[260px] h-screen bg-[var(--white)] border-r border-[var(--gray-5)] fixed top-0 left-0 bottom-0 z-50" />;
  }

  return (
    <aside className="w-[260px] h-screen bg-[var(--white)] border-r border-[var(--gray-5)] flex flex-col py-6 fixed top-0 left-0 bottom-0 z-50">
      {/* Logo + Role Label */}
      <div className="px-5 pb-6">
        <Logo href="/staff" variant="default" width={140} height={48} />
        <div className="mt-5 flex flex-col justify-center items-center text-center px-3 py-2.5 rounded-lg bg-[rgba(149,48,2,0.04)] border border-[rgba(149,48,2,0.12)] shadow-sm">
          {propertyName && (
            <span className="text-[12px] uppercase font-bold text-[var(--brand-primary)] whitespace-normal break-words leading-tight mb-1">
              {propertyName}
            </span>
          )}
          <span className="text-[12px] uppercase tracking-widest font-semibold text-[rgba(149,48,2,0.7)] leading-none">
            STAFF DASHBOARD
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
              (item.href !== "/staff" && pathname.startsWith(item.href + "/"));
            const badge = item.isChat ? unreadMessages : null;
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
                badge={badge}
              />
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div>
        <Separator className="mx-5 my-4" />

        <div className="px-3 flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => router.push(`/auth/logout?redirect=${encodeURIComponent(pathname)}`)}
            className="justify-start gap-3 px-[14px] py-[10px] h-auto text-sm font-normal text-[var(--black-1)] hover:bg-[rgba(235,87,87,0.08)] hover:text-[var(--state-error)]"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Log Out</span>
          </Button>
        </div>

        {/* User Profile */}
        <div className="px-3 pt-2 pb-1">
          <Link
            href="/staff/profile"
            className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-[rgba(109,34,0,0.08)] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center text-[var(--brand-primary)] font-semibold text-sm uppercase overflow-hidden">
              {user?.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col flex-1 truncate">
              <span className="text-sm font-medium text-[#1c1917] truncate">{shortName}</span>
              <span className="text-xs text-[#78716c]">Staff</span>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}

