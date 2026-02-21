"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldAlert,
  BarChart3,
  ScrollText,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

// ─── Navigation Items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Properties",
    href: "/admin/properties",
    icon: Building2,
  },
  {
    label: "Moderation Dashboard",
    href: "/admin/moderation",
    icon: ShieldAlert,
  },
  {
    label: "Platform Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
  },
  {
    label: "Finance",
    href: "/admin/finance",
    icon: Wallet,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] min-h-screen bg-[var(--white)] border-r border-[var(--gray-5)] flex flex-col py-6 fixed top-0 left-0 bottom-0 z-50">
      {/* ── Logo + Role Label ── */}
      <div className="px-5 pb-6">
        <Link href="/admin" className="no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/prime-stay-logo.svg"
            alt="Prime Stay Logo"
            className="w-[140px] h-14 object-contain"
          />
        </Link>
        {/* Admin Console plain text under the logo */}
        <p className="mt-1.5 text-[15px] font-normal text-[rgba(149,48,2,0.7)] tracking-[0.01em]">
          Admin Console
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-[var(--gray-5)] mx-5 mb-4" />

      {/* ── Main Navigation ── */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href + "/"));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-[14px] py-[10px] rounded-[10px] no-underline text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.08)]"
                      : "font-normal text-[var(--black-1)] bg-transparent hover:bg-[rgba(109,34,0,0.1)] hover:text-[var(--primary-hover)]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${
                      isActive
                        ? "text-[var(--brand-primary)]"
                        : "text-[var(--black-1)]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom Section: Settings & Logout ── */}
      <div>
        {/* Divider */}
        <div className="h-px bg-[var(--gray-5)] mx-5 my-4" />

        <div className="px-3 flex flex-col gap-1">
          {/* Settings */}
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-[14px] py-[10px] rounded-[10px] no-underline text-sm transition-colors ${
              pathname === "/admin/settings"
                ? "font-semibold text-[var(--brand-primary)] bg-[rgba(149,48,2,0.08)]"
                : "font-normal text-[var(--black-1)] bg-transparent hover:bg-[rgba(109,34,0,0.1)] hover:text-[var(--primary-hover)]"
            }`}
          >
            <Settings
              size={18}
              className="text-[var(--black-1)] flex-shrink-0"
            />
            <span>Settings</span>
          </Link>

          {/* Log Out */}
          <button
            onClick={() => {
              // TODO: wire up your auth logout logic here
              console.log("Logout clicked");
            }}
            className="flex items-center gap-3 px-[14px] py-[10px] rounded-[10px] border-none bg-transparent cursor-pointer text-sm font-normal text-[var(--black-1)] w-full text-left transition-colors hover:bg-[rgba(235,87,87,0.08)] hover:text-[var(--state-error)]"
          >
            <LogOut size={18} className="text-[var(--black-1)] flex-shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
