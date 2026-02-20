"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AdminHeaderProps {
    /** The admin user's display name shown on hover of avatar */
    adminName?: string;
    /** Path to admin avatar image. Falls back to initials if not provided. */
    avatarSrc?: string;
    /** Called when the user types in the search box */
    onSearch?: (query: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminHeader({
    adminName = "Admin",
    avatarSrc,
    onSearch,
}: AdminHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    // First letter of name for fallback initials avatar
    const initial = adminName.charAt(0).toUpperCase();

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: "260px",               // same as sidebar width
                right: 0,
                height: "68px",
                zIndex: 40,
                backgroundColor: "var(--white)",
                borderBottom: "1px solid var(--gray-5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",  // push items to the right
                padding: "0 28px",
                gap: "16px",
            }}
        >
            {/* ── Search Bar ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#f5efec",
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 18px",
                    width: "300px",
                    transition: "box-shadow 0.15s ease",
                }}
                onFocusCapture={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 0 0 2px rgba(149, 48, 2, 0.25)";
                }}
                onBlurCapture={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
            >
                <Search
                    size={16}
                    style={{ color: "var(--brand-primary)", flexShrink: 0, opacity: 0.7 }}
                />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: "14px",
                        color: "var(--brand-primary)",
                        width: "100%",
                    }}
                />
            </div>

            {/* ── User Avatar ── */}
            <div
                title={adminName}
                style={{
                    position: "relative",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    cursor: "pointer",
                }}
            >
                {avatarSrc ? (
                    <Image
                        src={avatarSrc}
                        alt={adminName}
                        fill
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                ) : (
                    /* Fallback: coloured circle with initial */
                    <div
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            backgroundColor: "var(--brand-primary)",
                            color: "var(--white)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "16px",
                            userSelect: "none",
                        }}
                    >
                        {initial}
                    </div>
                )}

                {/* Green online indicator dot */}
                <span
                    style={{
                        position: "absolute",
                        bottom: "1px",
                        right: "1px",
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        backgroundColor: "var(--state-success)",
                        border: "2px solid var(--white)",
                    }}
                />
            </div>
        </header>
    );
}
