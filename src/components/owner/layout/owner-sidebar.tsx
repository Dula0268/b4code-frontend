"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/shared/branding/logo";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  CalendarCheck,
  DollarSign,
  ClipboardList,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth/auth.store";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard, permKey: null },
  { label: "Properties", href: "/owner/properties", icon: Building2, permKey: null },
  { label: "Rooms", href: "/owner/roomManagement", icon: DoorOpen, permKey: null },
  { label: "Availability", href: "/owner/availability/weeklyCalendar", icon: CalendarCheck, permKey: null },
  { label: "Rate", href: "/owner/rate", icon: DollarSign, permKey: null },
  { label: "Reservations", href: "/owner/reservation", icon: ClipboardList, permKey: null },
  { label: "Staff Approvals", href: "/owner/staff", icon: Users, permKey: null },
  { label: "Settings", href: "/owner/setting/propertySetting", icon: Settings, permKey: null },
];

export function NavItem({ item, isActive }: {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
}) {
  const Icon = item.icon;

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
      </Link>
    </li>
  );
}

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
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

  const fullName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ""}`.trim()
    : user?.email?.split("@")[0] || "Property Owner";
  const names = fullName.split(" ");
  const initials = names.length > 1 ? names[0][0] + names[names.length - 1][0] : names[0][0];

  if (!mounted) {
    return <aside className="w-full h-full bg-[var(--white)] flex flex-col" />;
  }

  return (
    <aside className="w-full h-full bg-[var(--white)] flex flex-col py-6">
      {/* Logo + Role Label */}
      <div className="px-5 pb-6">
        <Logo href="/owner" variant="default" width={140} height={48} />
        <div className="mt-5 flex flex-col justify-center items-center text-center px-3 py-2.5 rounded-lg bg-[rgba(149,48,2,0.04)] border border-[rgba(149,48,2,0.12)] shadow-sm">
          {propertyName && (
            <span className="text-[12px] uppercase font-bold text-[var(--brand-primary)] whitespace-normal break-words leading-tight mb-1">
              {propertyName}
            </span>
          )}
          <span className="text-[12px] uppercase tracking-widest font-semibold text-[rgba(149,48,2,0.7)] leading-none">
            Property Owner
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
              (item.href !== "/owner" && pathname.startsWith(item.href));

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

      {/* Bottom Info & Logout */}
      <div className="mt-8 md:mt-auto px-3 flex flex-col gap-4">
        <div className="bg-[rgba(149,48,2,0.05)] rounded-lg p-3 border border-[rgba(149,48,2,0.1)] text-center">
          <p className="text-xs text-[rgba(149,48,2,0.7)] font-semibold leading-relaxed">
            🏢 Partner Account
          </p>
          <p className="text-[11px] text-[#78716c] mt-1">
            Manage your properties efficiently
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all rounded-xl h-10 text-xs"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('trigger-owner-logout'));
          }}
        >
          <LogOut size={15} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
