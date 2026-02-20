"use client";

import { useState } from "react";
import { Search, ChevronDown, Download, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "Admin" | "Staff" | "Owner";
type ActionType = "Updated" | "Deleted" | "Login Success" | "Created" | "Config Change" | "Login Failed";

interface LogEntry {
    id: string;
    userName: string;
    userRole: UserRole;
    avatarColor: string;
    avatarInitial: string;
    ip: string;
    action: ActionType;
    entity: string;
    entityDetail: string;
    timestamp: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const ALL_LOGS: LogEntry[] = [
    { id: "1", userName: "Sarah Jenkins", userRole: "Admin", avatarColor: "#f4a261", avatarInitial: "S", ip: "192.168.1.45", action: "Updated", entity: "Rate Plan: Summer Special 2024", entityDetail: "ID: RP-2024-SUM", timestamp: "Oct 24, 2023 09:45 AM" },
    { id: "2", userName: "System Bot", userRole: "Admin", avatarColor: "#8e44ad", avatarInitial: "S", ip: "127.0.0.1", action: "Deleted", entity: "Room Type: Deluxe King", entityDetail: "ID: RT-DLX-KG-404", timestamp: "Oct 24, 2023 09:31 AM" },
    { id: "3", userName: "Mike Ross", userRole: "Staff", avatarColor: "#2f80ed", avatarInitial: "M", ip: "203.112.88.10", action: "Login Success", entity: "Web Portal Access", entityDetail: "Session: 8f92-a1b2", timestamp: "Oct 24, 2023 08:58 AM" },
    { id: "4", userName: "Alice Liu", userRole: "Staff", avatarColor: "#27ae60", avatarInitial: "A", ip: "192.168.1.102", action: "Created", entity: "New Booking: #99283", entityDetail: "Guest: John Doe", timestamp: "Oct 23, 2023 05:12 PM" },
    { id: "5", userName: "David Kim", userRole: "Admin", avatarColor: "#16a085", avatarInitial: "D", ip: "10.0.5.22", action: "Config Change", entity: "Firewall Rules Update", entityDetail: "Policy: Default-Deny", timestamp: "Oct 23, 2023 03:40 PM" },
    { id: "6", userName: "Sarah Jenkins", userRole: "Admin", avatarColor: "#f4a261", avatarInitial: "S", ip: "192.168.1.45", action: "Login Failed", entity: "Invalid Password Attempt", entityDetail: "Source: External", timestamp: "Oct 23, 2023 02:20 PM" },
    { id: "7", userName: "Nina Patel", userRole: "Owner", avatarColor: "#e84393", avatarInitial: "N", ip: "192.168.2.10", action: "Updated", entity: "Property: Sunset Villa", entityDetail: "ID: PROP-4092", timestamp: "Oct 22, 2023 11:05 AM" },
    { id: "8", userName: "Priya Sharma", userRole: "Owner", avatarColor: "#8e44ad", avatarInitial: "P", ip: "192.168.3.55", action: "Created", entity: "New Listing: Oceanview Apt", entityDetail: "ID: PROP-4095", timestamp: "Oct 22, 2023 10:30 AM" },
    { id: "9", userName: "Mike Ross", userRole: "Staff", avatarColor: "#2f80ed", avatarInitial: "M", ip: "203.112.88.10", action: "Deleted", entity: "Old Cabin Listing", entityDetail: "ID: PROP-3021", timestamp: "Oct 21, 2023 04:15 PM" },
    { id: "10", userName: "Daniel Osei", userRole: "Staff", avatarColor: "#16a085", avatarInitial: "D", ip: "192.168.1.78", action: "Login Success", entity: "Web Portal Access", entityDetail: "Session: c3d4-e5f6", timestamp: "Oct 20, 2023 08:02 AM" },
    { id: "11", userName: "Emily Chen", userRole: "Owner", avatarColor: "#27ae60", avatarInitial: "E", ip: "192.168.4.12", action: "Config Change", entity: "Pricing Rule Update", entityDetail: "Rule: Weekday-Standard", timestamp: "Oct 19, 2023 03:30 PM" },
    { id: "12", userName: "Alice Liu", userRole: "Staff", avatarColor: "#27ae60", avatarInitial: "A", ip: "192.168.1.102", action: "Login Failed", entity: "Invalid OTP Attempt", entityDetail: "Source: Mobile App", timestamp: "Oct 18, 2023 01:45 PM" },
];

const PAGE_SIZE = 10;

// ─── Action Badge ──────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: ActionType }) {
    const cfg: Record<ActionType, { bg: string; color: string }> = {
        "Updated": { bg: "rgba(226,185,59,0.18)", color: "#a0780a" },
        "Deleted": { bg: "rgba(235,87,87,0.14)", color: "#b83030" },
        "Login Success": { bg: "rgba(39,174,96,0.14)", color: "#1a7a45" },
        "Created": { bg: "rgba(39,174,96,0.14)", color: "#1a7a45" },
        "Config Change": { bg: "rgba(100,100,100,0.12)", color: "#444" },
        "Login Failed": { bg: "rgba(235,87,87,0.14)", color: "#b83030" },
    };
    const { bg, color } = cfg[action];
    return (
        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "999px", backgroundColor: bg, color, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
            {action}
        </span>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ entry }: { entry: LogEntry }) {
    return (
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: entry.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
            {entry.avatarInitial}
        </div>
    );
}

// ─── Role Pill (for filter active) ────────────────────────────────────────────
function roleCfg(role: "All" | UserRole) {
    const map: Record<string, { bg: string; color: string }> = {
        All: { bg: "rgba(149,48,2,0.08)", color: "#953002" },
        Admin: { bg: "rgba(47,128,237,0.12)", color: "#1a5fa8" },
        Staff: { bg: "rgba(39,174,96,0.12)", color: "#1a7a45" },
        Owner: { bg: "rgba(155,89,182,0.12)", color: "#7d3c98" },
    };
    return map[role] ?? map.All;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
    const [roleOpen, setRoleOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter
    const filtered = ALL_LOGS.filter((log) => {
        const q = search.toLowerCase();
        const matchSearch = !q || log.userName.toLowerCase().includes(q) ||
            log.ip.includes(q) || log.entity.toLowerCase().includes(q) ||
            log.entityDetail.toLowerCase().includes(q);
        const matchRole = roleFilter === "All" || log.userRole === roleFilter;
        return matchSearch && matchRole;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const roles: ("All" | UserRole)[] = ["All", "Admin", "Staff", "Owner"];

    const goPage = (p: number) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* ── Page Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--black-2)" }}>Audit Logs</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--gray-3)" }}>Track system-wide activities, user actions, and security events.</p>
                </div>
                {/* Export CSV */}
                <button
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 18px", borderRadius: "10px",
                        border: "1.5px solid var(--gray-5)", backgroundColor: "#fff",
                        fontSize: "13.5px", fontWeight: 600, color: "var(--black-2)", cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.color = "var(--brand-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--gray-5)"; e.currentTarget.style.color = "var(--black-2)"; }}
                >
                    <Download size={15} />
                    Export CSV
                </button>
            </div>

            {/* ── Filters Bar ── */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                    <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-4)", pointerEvents: "none" }} />
                    <input
                        placeholder="Search by User, IP, or Entity ID"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: "100%", padding: "9px 12px 9px 36px",
                            borderRadius: "10px", border: "1.5px solid var(--gray-5)",
                            fontSize: "13px", color: "var(--black-2)", backgroundColor: "#fff",
                            outline: "none", boxSizing: "border-box",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--gray-5)"; }}
                    />
                </div>

                {/* Role Filter */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setRoleOpen(!roleOpen)}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "9px 16px", borderRadius: "10px",
                            border: "1.5px solid var(--gray-5)", backgroundColor: "#fff",
                            fontSize: "13px", color: "var(--gray-2)", cursor: "pointer",
                            minWidth: "150px", justifyContent: "space-between",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            {roleFilter !== "All" && (
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: roleCfg(roleFilter).color, flexShrink: 0 }} />
                            )}
                            {roleFilter === "All" ? "All Roles" : roleFilter}
                        </span>
                        <ChevronDown size={13} />
                    </button>
                    {roleOpen && (
                        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, backgroundColor: "#fff", border: "1.5px solid var(--gray-5)", borderRadius: "10px", boxShadow: "0 6px 20px rgba(0,0,0,0.10)", zIndex: 100, minWidth: "150px", overflow: "hidden" }}>
                            {roles.map((r) => {
                                const { color } = roleCfg(r);
                                return (
                                    <button
                                        key={r}
                                        onClick={() => { setRoleFilter(r); setRoleOpen(false); setCurrentPage(1); }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "8px",
                                            width: "100%", textAlign: "left",
                                            padding: "9px 14px", border: "none",
                                            backgroundColor: roleFilter === r ? "rgba(149,48,2,0.06)" : "#fff",
                                            color: roleFilter === r ? "var(--brand-primary)" : "var(--gray-2)",
                                            fontSize: "13px", cursor: "pointer", fontWeight: roleFilter === r ? 600 : 400,
                                        }}
                                    >
                                        {r !== "All" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />}
                                        {r === "All" ? "All Roles" : r}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Date Range (static display) */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "10px", border: "1.5px solid var(--gray-5)", backgroundColor: "#fff", fontSize: "13px", color: "var(--gray-2)", cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="var(--gray-3)" strokeWidth="1.2" />
                        <path d="M4 1v2M10 1v2M1 5h12" stroke="var(--gray-3)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    Oct 01 – Oct 24, 2023
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#F6F8F7" }}>
                                {["USER / ROLE", "IP ADDRESS", "ACTION", "ENTITY / DETAILS", "TIMESTAMP"].map((h) => (
                                    <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--gray-3)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paged.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "var(--gray-3)", fontSize: "14px" }}>
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : paged.map((log, idx) => (
                                <tr
                                    key={log.id}
                                    style={{ borderTop: "1px solid var(--gray-5)", backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa", transition: "background 0.12s" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f5efec"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? "#fff" : "#fafafa"; }}
                                >
                                    {/* User / Role */}
                                    <td style={{ padding: "14px 20px", minWidth: "180px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <Avatar entry={log} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "var(--black-2)" }}>{log.userName}</p>
                                                <p style={{ margin: 0, fontSize: "12px", color: "var(--gray-3)" }}>{log.userRole}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* IP */}
                                    <td style={{ padding: "14px 20px", color: "var(--gray-2)", fontFamily: "monospace", fontSize: "13px", whiteSpace: "nowrap" }}>
                                        {log.ip}
                                    </td>
                                    {/* Action */}
                                    <td style={{ padding: "14px 20px" }}>
                                        <ActionBadge action={log.action} />
                                    </td>
                                    {/* Entity */}
                                    <td style={{ padding: "14px 20px", minWidth: "220px" }}>
                                        <p style={{ margin: 0, fontWeight: 600, color: "var(--black-2)" }}>{log.entity}</p>
                                        <p style={{ margin: 0, fontSize: "12px", color: "var(--gray-3)" }}>{log.entityDetail}</p>
                                    </td>
                                    {/* Timestamp */}
                                    <td style={{ padding: "14px 20px", color: "var(--gray-3)", fontSize: "13px", whiteSpace: "nowrap" }}>
                                        {log.timestamp}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--gray-5)" }}>
                    <span style={{ fontSize: "13px", color: "var(--gray-3)" }}>
                        Showing <strong style={{ color: "var(--black-2)" }}>
                            {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                        </strong> to <strong style={{ color: "var(--black-2)" }}>
                            {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                        </strong> of <strong style={{ color: "var(--black-2)" }}>
                            {filtered.length}
                        </strong> results
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        {/* Prev */}
                        <button
                            onClick={() => goPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--gray-5)", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? "var(--gray-4)" : "var(--gray-2)" }}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {/* Page numbers with ellipsis */}
                        {(() => {
                            const pages: (number | "...")[] = [];
                            if (totalPages <= 5) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                pages.push(1);
                                if (currentPage > 3) pages.push("...");
                                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                                if (currentPage < totalPages - 2) pages.push("...");
                                pages.push(totalPages);
                            }
                            return pages.map((p, i) =>
                                p === "..." ? (
                                    <span key={`e${i}`} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "var(--gray-3)" }}>…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => goPage(p as number)}
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
                                )
                            );
                        })()}

                        {/* Next */}
                        <button
                            onClick={() => goPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--gray-5)", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentPage === totalPages ? "not-allowed" : "pointer", color: currentPage === totalPages ? "var(--gray-4)" : "var(--gray-2)" }}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
