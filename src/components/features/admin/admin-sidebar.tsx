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
        href: "/admin/dashboard",
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
        <aside
            style={{
                width: "260px",
                minHeight: "100vh",
                backgroundColor: "var(--white)",
                borderRight: "1px solid var(--gray-5)",
                display: "flex",
                flexDirection: "column",
                padding: "24px 0",
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
            }}
        >
            {/* ── Logo + Role Label ── */}
            <div style={{ padding: "0 20px 24px 20px" }}>
                <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/prime-stay-logo.svg"
                        alt="Prime Stay Logo"
                        style={{ width: "140px", height: "56px", objectFit: "contain" }}
                    />
                </Link>

                {/* Admin Console plain text under the logo */}
                <p
                    style={{
                        marginTop: "6px",
                        fontSize: "15px",
                        fontWeight: 400,
                        color: "rgba(149, 48, 2, 0.7)",
                        letterSpacing: "0.01em",
                    }}
                >
                    Admin Console
                </p>            </div>

            {/* ── Divider ── */}
            <div
                style={{
                    height: "1px",
                    backgroundColor: "var(--gray-5)",
                    margin: "0 20px 16px 20px",
                }}
            />

            {/* ── Main Navigation ── */}
            <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "10px 14px",
                                        borderRadius: "10px",
                                        textDecoration: "none",
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: "14px",
                                        color: isActive ? "var(--brand-primary)" : "var(--black-1)",
                                        backgroundColor: isActive ? "rgba(149, 48, 2, 0.08)" : "transparent",
                                        transition: "background-color 0.15s ease, color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(109, 34, 0, 0.1)";
                                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary-hover)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                            (e.currentTarget as HTMLAnchorElement).style.color = "var(--black-1)";
                                        }
                                    }}
                                >
                                    <Icon
                                        size={18}
                                        style={{
                                            color: isActive ? "var(--brand-primary)" : "var(--black-1)",
                                            flexShrink: 0,
                                        }}
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
                <div
                    style={{
                        height: "1px",
                        backgroundColor: "var(--gray-5)",
                        margin: "16px 20px",
                    }}
                />

                <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {/* Settings */}
                    <Link
                        href="/admin/settings"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: pathname === "/admin/settings" ? 600 : 400,
                            color: pathname === "/admin/settings" ? "var(--brand-primary)" : "var(--black-1)",
                            backgroundColor: pathname === "/admin/settings" ? "rgba(149, 48, 2, 0.08)" : "transparent",
                            transition: "background-color 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (pathname !== "/admin/settings") {
                                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(109, 34, 0, 0.1)";
                                (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary-hover)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (pathname !== "/admin/settings") {
                                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLAnchorElement).style.color = "var(--black-1)";
                            }
                        }}
                    >
                        <Settings size={18} style={{ color: "var(--black-1)", flexShrink: 0 }} />
                        <span>Settings</span>
                    </Link>

                    {/* Log Out */}
                    <button
                        onClick={() => {
                            // TODO: wire up your auth logout logic here
                            console.log("Logout clicked");
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: 400,
                            color: "var(--black-1)",
                            width: "100%",
                            textAlign: "left",
                            transition: "background-color 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(235, 87, 87, 0.08)";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--state-error)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--black-1)";
                        }}
                    >
                        <LogOut size={18} style={{ color: "var(--black-1)", flexShrink: 0 }} />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
