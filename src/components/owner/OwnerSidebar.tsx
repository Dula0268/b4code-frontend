"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import {
    LayoutDashboard,
    Building2,
    Settings,
    Star,
    Users,
    MessageSquare,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard",  icon: LayoutDashboard, href: "/owner" },
    { label: "Properties", icon: Building2,       href: "/owner/properties" },
    { label: "Staff",      icon: Users,           href: "/owner/staff" },
    { label: "Reviews",    icon: Star,            href: "/owner/reviews" },
    { label: "Messages",   icon: MessageSquare,   href: "/owner/message" },
    { label: "Settings",   icon: Settings,        href: "/owner/setting/accountSetting" },
];

const BOTTOM_ITEMS: typeof NAV_ITEMS = [];

export default function OwnerSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/owner") return pathname === "/owner";
        return pathname.startsWith(href);
    };

    const navLink = (item: { label: string; icon: React.ElementType; href: string }) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
            <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 py-2.5 px-4 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
                    active
                        ? "bg-[rgba(149,48,2,0.08)] text-[#953002] font-bold border-[#953002]"
                        : "bg-transparent text-[#4f4f4f] font-medium border-transparent hover:bg-[#f5f5f5]"
                }`}
            >
                <Icon size={18} />
                <span>{item.label}</span>
            </a>
        );
    };

    return (
        <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
            <div className="px-4 pb-5">
                <Logo width={120} height={36} />
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
                {NAV_ITEMS.map(navLink)}
            </div>
            <div className="flex flex-col gap-0.5 border-t border-[#e8e8e8] pt-2">
                {BOTTOM_ITEMS.map(navLink)}
            </div>
        </nav>
    );
}
