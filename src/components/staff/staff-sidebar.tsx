"use client";

import Link from "next/link";
import Logo from "@/components/shared/branding/logo";
import { usePathname, useRouter } from "next/navigation";
import { useStaffOrdersStore } from "@/store/staff/orders/staff-orders.store";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  QrCode,
  UtensilsCrossed,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard Overview",
    href: "/staff",
    icon: LayoutDashboard,
  },
  {
    label: "Order Management",
    href: "/staff/orders",
    icon: ClipboardList,
  },
  {
    label: "Menu Management",
    href: "/staff/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "QR Code Management",
    href: "/staff/qr",
    icon: QrCode,
  },
  {
    label: "Guest Messages",
    href: "/staff/messages",
    icon: MessageSquare,
  },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const orders = useStaffOrdersStore((s) => s.orders);
  const placedCount = Array.isArray(orders) 
    ? orders.filter((o) => o.status === "placed").length 
    : Object.values(orders).filter((o) => o.status === "placed").length;

  return (
    <aside className="w-65 min-h-screen bg-white border-r border-[#e0e0e0] flex flex-col py-6 fixed top-0 left-0 bottom-0 z-50">
      <div className="px-5 pb-6">
        <Logo href="/staff" variant="default" width={140} height={48} />
        <p className="mt-1.5 text-[15px] font-normal text-[rgba(149,48,2,0.7)] tracking-[0.01em]">
          Staff Portal
        </p>
      </div>

      <div className="h-px bg-[#e0e0e0] mx-5 mb-4" />

      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/staff" && pathname.startsWith(item.href + "/"));

            const showBadge = item.href === "/staff/orders" && placedCount > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[10px] no-underline text-sm transition-colors ${isActive
                      ? "font-semibold text-[#953002] bg-[rgba(149,48,2,0.08)]"
                      : "font-normal text-[#282828] bg-transparent hover:bg-[rgba(109,34,0,0.1)] hover:text-[#7a2600]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`shrink-0 ${isActive ? "text-[#953002]" : "text-[#282828]"
                        }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {showBadge && (
                    <span className="bg-[#C05621] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {placedCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        <div className="h-px bg-[#e0e0e0] mx-5 my-4" />

        <div className="px-3 flex flex-col gap-1">
          <Link
            href="/staff/settings"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] no-underline text-sm transition-colors ${pathname === "/staff/settings"
                ? "font-semibold text-[#953002] bg-[rgba(149,48,2,0.08)]"
                : "font-normal text-[#282828] bg-transparent hover:bg-[rgba(109,34,0,0.1)] hover:text-[#7a2600]"
              }`}
          >
            <Settings size={18} className="text-[#282828] shrink-0" />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => {
              router.push("/auth/logout");
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] border-none bg-transparent cursor-pointer text-sm font-normal text-[#282828] w-full text-left transition-colors hover:bg-[rgba(235,87,87,0.08)] hover:text-[#d32f2f]"
          >
            <LogOut size={18} className="text-[#282828] shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
