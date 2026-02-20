"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "Admin" | "Staff" | "Owner";
type ActionType =
  | "Updated"
  | "Deleted"
  | "Login Success"
  | "Created"
  | "Config Change"
  | "Login Failed";

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
  {
    id: "1",
    userName: "Admin User",
    userRole: "Admin",
    avatarColor: "#f4a261",
    avatarInitial: "A",
    ip: "192.168.1.45",
    action: "Updated",
    entity: "Rate Plan: Summer Special 2024",
    entityDetail: "ID: RP-2024-SUM",
    timestamp: "Oct 24, 2023 09:45 AM",
  },
  {
    id: "2",
    userName: "Admin User",
    userRole: "Admin",
    avatarColor: "#f4a261",
    avatarInitial: "A",
    ip: "127.0.0.1",
    action: "Deleted",
    entity: "Room Type: Deluxe King",
    entityDetail: "ID: RT-DLX-KG-404",
    timestamp: "Oct 24, 2023 09:31 AM",
  },
  {
    id: "3",
    userName: "Mike Ross",
    userRole: "Staff",
    avatarColor: "#2f80ed",
    avatarInitial: "M",
    ip: "203.112.88.10",
    action: "Login Success",
    entity: "Web Portal Access",
    entityDetail: "Session: 8f92-a1b2",
    timestamp: "Oct 24, 2023 08:58 AM",
  },
  {
    id: "4",
    userName: "Alice Liu",
    userRole: "Staff",
    avatarColor: "#27ae60",
    avatarInitial: "A",
    ip: "192.168.1.102",
    action: "Created",
    entity: "New Booking: #99283",
    entityDetail: "Guest: John Doe",
    timestamp: "Oct 23, 2023 05:12 PM",
  },
  {
    id: "5",
    userName: "Admin User",
    userRole: "Admin",
    avatarColor: "#f4a261",
    avatarInitial: "A",
    ip: "10.0.5.22",
    action: "Config Change",
    entity: "Firewall Rules Update",
    entityDetail: "Policy: Default-Deny",
    timestamp: "Oct 23, 2023 03:40 PM",
  },
  {
    id: "6",
    userName: "Admin User",
    userRole: "Admin",
    avatarColor: "#f4a261",
    avatarInitial: "A",
    ip: "192.168.1.45",
    action: "Login Failed",
    entity: "Invalid Password Attempt",
    entityDetail: "Source: External",
    timestamp: "Oct 23, 2023 02:20 PM",
  },
  {
    id: "7",
    userName: "Nina Patel",
    userRole: "Owner",
    avatarColor: "#e84393",
    avatarInitial: "N",
    ip: "192.168.2.10",
    action: "Updated",
    entity: "Property: Sunset Villa",
    entityDetail: "ID: PROP-4092",
    timestamp: "Oct 22, 2023 11:05 AM",
  },
  {
    id: "8",
    userName: "Priya Sharma",
    userRole: "Owner",
    avatarColor: "#8e44ad",
    avatarInitial: "P",
    ip: "192.168.3.55",
    action: "Created",
    entity: "New Listing: Oceanview Apt",
    entityDetail: "ID: PROP-4095",
    timestamp: "Oct 22, 2023 10:30 AM",
  },
  {
    id: "9",
    userName: "Mike Ross",
    userRole: "Staff",
    avatarColor: "#2f80ed",
    avatarInitial: "M",
    ip: "203.112.88.10",
    action: "Deleted",
    entity: "Old Cabin Listing",
    entityDetail: "ID: PROP-3021",
    timestamp: "Oct 21, 2023 04:15 PM",
  },
  {
    id: "10",
    userName: "Daniel Osei",
    userRole: "Staff",
    avatarColor: "#16a085",
    avatarInitial: "D",
    ip: "192.168.1.78",
    action: "Login Success",
    entity: "Web Portal Access",
    entityDetail: "Session: c3d4-e5f6",
    timestamp: "Oct 20, 2023 08:02 AM",
  },
  {
    id: "11",
    userName: "Emily Chen",
    userRole: "Owner",
    avatarColor: "#27ae60",
    avatarInitial: "E",
    ip: "192.168.4.12",
    action: "Config Change",
    entity: "Pricing Rule Update",
    entityDetail: "Rule: Weekday-Standard",
    timestamp: "Oct 19, 2023 03:30 PM",
  },
  {
    id: "12",
    userName: "Alice Liu",
    userRole: "Staff",
    avatarColor: "#27ae60",
    avatarInitial: "A",
    ip: "192.168.1.102",
    action: "Login Failed",
    entity: "Invalid OTP Attempt",
    entityDetail: "Source: Mobile App",
    timestamp: "Oct 18, 2023 01:45 PM",
  },
];

const PAGE_SIZE = 10;

// ─── Action Badge ──────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: ActionType }) {
  const cfg: Record<ActionType, string> = {
    Updated: "bg-yellow-100/80 text-yellow-800",
    Deleted: "bg-red-100/70 text-red-700",
    "Login Success": "bg-green-100/70 text-green-700",
    Created: "bg-green-100/70 text-green-700",
    "Config Change": "bg-gray-100/70 text-gray-700",
    "Login Failed": "bg-red-100/70 text-red-700",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${cfg[action]}`}
    >
      {action}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ entry }: { entry: LogEntry }) {
  return (
    <div
      className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
      style={{ backgroundColor: entry.avatarColor }}
    >
      {entry.avatarInitial}
    </div>
  );
}

// ─── Role Pill (for filter active) ────────────────────────────────────────────
function roleCfg(role: "All" | UserRole) {
  const map: Record<string, string> = {
    All: "bg-[var(--brand-primary)]/8 text-[var(--brand-primary)]",
    Admin: "bg-blue-500/12 text-blue-700",
    Staff: "bg-green-500/12 text-green-700",
    Owner: "bg-purple-500/12 text-purple-700",
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
    const matchSearch =
      !q ||
      log.userName.toLowerCase().includes(q) ||
      log.ip.includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityDetail.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || log.userRole === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const roles: ("All" | UserRole)[] = ["All", "Admin", "Staff", "Owner"];

  const goPage = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-[var(--black-2)]">
            Audit Logs
          </h1>
          <p className="mt-1.5 mb-0 text-sm text-[var(--gray-3)]">
            Track system-wide activities, user actions, and security events.
          </p>
        </div>
        {/* Export CSV */}
        <button className="flex items-center gap-2 px-[18px] py-2.5 rounded-[10px] border-[1.5px] border-[var(--gray-5)] bg-white text-[13.5px] font-semibold text-[var(--black-2)] cursor-pointer shadow-sm hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex gap-3 items-center flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-4)] pointer-events-none"
            size={14}
          />
          <input
            placeholder="Search by User, IP, or Entity ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 pl-9 rounded-[10px] border-[1.5px] border-[var(--gray-5)] text-[13px] text-[var(--black-2)] bg-white outline-none box-border focus:border-[var(--brand-primary)]"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border-[1.5px] border-[var(--gray-5)] bg-white text-[13px] font-semibold cursor-pointer ${roleCfg(roleFilter)}`}
          >
            Role: {roleFilter}
            <ChevronDown size={14} />
          </button>
          {roleOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 bg-white border-[1.5px] border-[var(--gray-5)] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] z-[100] min-w-[150px] overflow-hidden">
              {roles.map((r) => {
                const colorClass = roleCfg(r);
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRoleFilter(r);
                      setRoleOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2 w-full text-left px-3.5 py-2 border-none text-[13px] cursor-pointer ${
                      roleFilter === r
                        ? "bg-[var(--brand-primary)]/5 text-[var(--brand-primary)] font-semibold"
                        : "bg-white text-[var(--gray-2)] font-normal hover:bg-gray-50"
                    }`}
                  >
                    {r !== "All" && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            r === "Admin"
                              ? "#1a5fa8"
                              : r === "Staff"
                                ? "#1a7a45"
                                : "#7d3c98",
                        }}
                      />
                    )}
                    {r === "All" ? "All Roles" : r}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date Range (static display) */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-[10px] border-[1.5px] border-[var(--gray-5)] bg-white text-[13px] text-[var(--gray-2)] cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect
              x="1"
              y="2"
              width="12"
              height="11"
              rx="1.5"
              stroke="var(--gray-3)"
              strokeWidth="1.2"
            />
            <path
              d="M4 1v2M10 1v2M1 5h12"
              stroke="var(--gray-3)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          Oct 01 – Oct 24, 2023
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#F6F8F7]">
                {[
                  "USER / ROLE",
                  "IP ADDRESS",
                  "ACTION",
                  "ENTITY / DETAILS",
                  "TIMESTAMP",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-[11px] text-left text-[11px] font-bold text-[var(--gray-3)] tracking-wider uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[var(--gray-3)] text-sm"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                paged.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={`border-t border-[var(--gray-5)] transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    } hover:bg-[#f5efec]`}
                  >
                    {/* User / Role */}
                    <td className="px-5 py-[14px] min-w-[180px]">
                      <div className="flex items-center gap-[10px]">
                        <Avatar entry={log} />
                        <div>
                          <p className="m-0 font-semibold text-[var(--black-2)]">
                            {log.userName}
                          </p>
                          <p className="m-0 text-xs text-[var(--gray-3)]">
                            {log.userRole}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* IP */}
                    <td className="px-5 py-[14px] text-[var(--gray-2)] font-mono text-[13px] whitespace-nowrap">
                      {log.ip}
                    </td>
                    {/* Action */}
                    <td className="px-5 py-[14px]">
                      <ActionBadge action={log.action} />
                    </td>
                    {/* Entity */}
                    <td className="px-5 py-[14px] min-w-[220px]">
                      <p className="m-0 font-semibold text-[var(--black-2)]">
                        {log.entity}
                      </p>
                      <p className="m-0 text-xs text-[var(--gray-3)]">
                        {log.entityDetail}
                      </p>
                    </td>
                    {/* Timestamp */}
                    <td className="px-5 py-[14px] text-[var(--gray-3)] text-[13px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex justify-between items-center px-5 py-[14px] border-t border-[var(--gray-5)]">
          <span className="text-[13px] text-[var(--gray-3)]">
            Showing{" "}
            <strong className="text-[var(--black-2)]">
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-[var(--black-2)]">
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-[var(--black-2)]">{filtered.length}</strong>{" "}
            results
          </span>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg border border-[var(--gray-5)] bg-white flex items-center justify-center ${
                currentPage === 1
                  ? "cursor-not-allowed text-[var(--gray-4)]"
                  : "cursor-pointer text-[var(--gray-2)]"
              }`}
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
                for (
                  let i = Math.max(2, currentPage - 1);
                  i <= Math.min(totalPages - 1, currentPage + 1);
                  i++
                )
                  pages.push(i);
                if (currentPage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }
              return pages.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`e${i}`}
                    className="w-8 h-8 flex items-center justify-center text-[13px] text-[var(--gray-3)]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goPage(p as number)}
                    className={`w-8 h-8 rounded-lg border cursor-pointer text-[13px] ${
                      currentPage === p
                        ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-white font-bold"
                        : "border-[var(--gray-5)] bg-white text-[var(--gray-2)] font-normal"
                    }`}
                  >
                    {p}
                  </button>
                ),
              );
            })()}

            {/* Next */}
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-lg border border-[var(--gray-5)] bg-white flex items-center justify-center ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-[var(--gray-4)]"
                  : "cursor-pointer text-[var(--gray-2)]"
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
