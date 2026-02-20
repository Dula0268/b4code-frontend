"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, MoreVertical, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "Owner" | "Staff";
type UserStatus = "Active" | "Suspended";

interface User {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    avatarInitial: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: string;
    lastLoginTime: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ALL_USERS: User[] = [
    { id: "1", name: "Sarah Jenkins", email: "sarah.j@primestay.com", avatarColor: "#f4a261", avatarInitial: "S", role: "Owner", status: "Active", lastLogin: "Oct 24, 2023", lastLoginTime: "09:41 AM" },
    { id: "2", name: "Mike Ross", email: "mike.ross@primestay.com", avatarColor: "#2f80ed", avatarInitial: "M", role: "Staff", status: "Active", lastLogin: "Oct 23, 2023", lastLoginTime: "02:15 PM" },
    { id: "3", name: "John Doe", email: "john.d@gmail.com", avatarColor: "#953002", avatarInitial: "J", role: "Staff", status: "Suspended", lastLogin: "Sep 12, 2023", lastLoginTime: "11:00 AM" },
    { id: "4", name: "Emily Chen", email: "emily.chen@primestay.com", avatarColor: "#27ae60", avatarInitial: "E", role: "Owner", status: "Active", lastLogin: "Oct 24, 2023", lastLoginTime: "08:30 AM" },
    { id: "5", name: "Aisha Kumar", email: "aisha.k@primestay.com", avatarColor: "#e67e22", avatarInitial: "A", role: "Staff", status: "Active", lastLogin: "Oct 21, 2023", lastLoginTime: "03:40 PM" },
    { id: "6", name: "Nina Patel", email: "nina.patel@primestay.com", avatarColor: "#e84393", avatarInitial: "N", role: "Owner", status: "Active", lastLogin: "Oct 24, 2023", lastLoginTime: "07:55 AM" },
    { id: "7", name: "Daniel Osei", email: "daniel.o@primestay.com", avatarColor: "#16a085", avatarInitial: "D", role: "Staff", status: "Active", lastLogin: "Oct 20, 2023", lastLoginTime: "11:30 AM" },
    { id: "8", name: "Priya Sharma", email: "priya.s@primestay.com", avatarColor: "#8e44ad", avatarInitial: "P", role: "Owner", status: "Suspended", lastLogin: "Oct 19, 2023", lastLoginTime: "02:00 PM" },
];

const PAGE_SIZE = 6;

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
    const cfg: Record<UserRole, { bg: string; color: string }> = {
        Owner: { bg: "rgba(155,89,182,0.12)", color: "#7d3c98" },
        Staff: { bg: "rgba(47,128,237,0.12)", color: "#1a5fa8" },

    };
    const { bg, color } = cfg[role];
    return (
        <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: "999px", backgroundColor: bg, color, fontSize: "12px", fontWeight: 600 }}>
            {role}
        </span>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserStatus }) {
    const cfg: Record<UserStatus, { bg: string; dot: string; color: string }> = {
        Active: { bg: "rgba(39,174,96,0.12)", dot: "#27ae60", color: "#1a7a45" },
        Suspended: { bg: "rgba(235,87,87,0.12)", dot: "#eb5757", color: "#b83030" },
    };
    const { bg, dot, color } = cfg[status];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 12px", borderRadius: "999px", backgroundColor: bg, color, fontSize: "12px", fontWeight: 600 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }} />
            {status}
        </span>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function UserAvatar({ user }: { user: User }) {
    return (
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: user.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontWeight: 700, fontSize: "14px" }}>
            {user.avatarInitial}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersManagementPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
    const [roleOpen, setRoleOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    // ── Filter ──
    const filtered = ALL_USERS.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "All" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const roles: ("All" | UserRole)[] = ["All", "Owner", "Staff"];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* ── Page Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--black-2)" }}>User Management</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--gray-3)" }}>Manage platform access, roles, and account statuses.</p>
                </div>
                <button
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 20px", borderRadius: "10px",
                        backgroundColor: "var(--brand-primary)", color: "#fff",
                        border: "none", cursor: "pointer",
                        fontSize: "14px", fontWeight: 600,
                        boxShadow: "0 2px 8px rgba(149,48,2,0.25)",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-primary)")}
                >
                    <UserPlus size={16} />
                    Add New User
                </button>
            </div>

            {/* ── Table Card ── */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                {/* ── Toolbar ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid var(--gray-5)" }}>
                    {/* Search */}
                    <div style={{ position: "relative", flex: 1, maxWidth: "340px" }}>
                        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-4)", pointerEvents: "none" }} />
                        <input
                            placeholder="Search by name, email, or role..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            style={{
                                width: "100%", padding: "9px 12px 9px 36px",
                                borderRadius: "8px", border: "1px solid var(--gray-5)",
                                fontSize: "13px", color: "var(--black-2)",
                                backgroundColor: "#fff", outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Filter by Role */}
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setRoleOpen(!roleOpen)}
                            style={{
                                display: "flex", alignItems: "center", gap: "7px",
                                padding: "8px 14px", borderRadius: "8px",
                                border: "1px solid var(--gray-5)", backgroundColor: "#fff",
                                fontSize: "13px", color: "var(--gray-2)", cursor: "pointer",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {roleFilter === "All" ? "Filter by Role" : roleFilter}
                            <ChevronDown size={13} />
                        </button>
                        {roleOpen && (
                            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, backgroundColor: "#fff", border: "1px solid var(--gray-5)", borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 100, minWidth: "140px", overflow: "hidden" }}>
                                {roles.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => { setRoleFilter(r); setRoleOpen(false); setCurrentPage(1); }}
                                        style={{
                                            display: "block", width: "100%", textAlign: "left",
                                            padding: "9px 16px", border: "none",
                                            backgroundColor: roleFilter === r ? "rgba(149,48,2,0.07)" : "#fff",
                                            color: roleFilter === r ? "var(--brand-primary)" : "var(--gray-2)",
                                            fontSize: "13px", cursor: "pointer", fontWeight: roleFilter === r ? 600 : 400,
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Table ── */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#F6F8F7" }}>
                                {["USER", "ROLE", "STATUS", "LAST LOGIN", ""].map((h) => (
                                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11.5px", fontWeight: 700, color: "var(--gray-3)", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paged.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--gray-3)", fontSize: "14px" }}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : paged.map((user, idx) => (
                                <tr
                                    key={user.id}
                                    onClick={() => router.push(`/admin/users/${user.id}`)}
                                    style={{
                                        borderTop: "1px solid var(--gray-5)",
                                        backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                                        transition: "background 0.12s",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f5efec"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? "#fff" : "#fafafa"; }}
                                >
                                    {/* User */}
                                    <td style={{ padding: "14px 16px", minWidth: "220px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <UserAvatar user={user} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--black-2)" }}>{user.name}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "var(--gray-3)" }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Role */}
                                    <td style={{ padding: "14px 16px" }}><RoleBadge role={user.role} /></td>
                                    {/* Status */}
                                    <td style={{ padding: "14px 16px" }}><StatusBadge status={user.status} /></td>
                                    {/* Last Login */}
                                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                                        <span style={{ color: "var(--black-2)", fontWeight: 500 }}>{user.lastLogin}</span>
                                        <span style={{ color: "var(--gray-3)", marginLeft: "8px", fontSize: "13px" }}>{user.lastLoginTime}</span>
                                    </td>
                                    {/* Actions */}
                                    <td style={{ padding: "14px 16px", width: "40px" }}>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", borderRadius: "6px" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--gray-5)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--gray-2)"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--gray-4)"; }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--gray-5)" }}>
                    <span style={{ fontSize: "13px", color: "var(--gray-3)" }}>
                        Showing <strong style={{ color: "var(--black-2)" }}>{filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}</strong> to{" "}
                        <strong style={{ color: "var(--black-2)" }}>{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of{" "}
                        <strong style={{ color: "var(--black-2)" }}>{filtered.length}</strong> results
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {/* Prev */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--gray-5)", backgroundColor: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: currentPage === 1 ? "var(--gray-4)" : "var(--gray-2)" }}
                        >
                            <ChevronLeft size={15} />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                style={{
                                    width: "32px", height: "32px", borderRadius: "8px",
                                    border: "1px solid", borderColor: currentPage === p ? "var(--brand-secondary)" : "var(--gray-5)",
                                    backgroundColor: currentPage === p ? "var(--brand-secondary)" : "#fff",
                                    color: currentPage === p ? "#fff" : "var(--gray-2)",
                                    cursor: "pointer", fontSize: "13px", fontWeight: currentPage === p ? 700 : 400,
                                }}
                            >
                                {p}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--gray-5)", backgroundColor: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: currentPage === totalPages ? "var(--gray-4)" : "var(--gray-2)" }}
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
