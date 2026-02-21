"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import AuditLogsHeader from "@/components/features/admin/audit-logs/audit-logs-header";
import AuditLogsTable, {
  LogEntry,
  UserRole,
  ActionType,
} from "@/components/features/admin/audit-logs/audit-logs-table";

// ─── Helper Functions ──────────────────────────────────────────────────────────
function roleCfg(role: "All" | UserRole) {
  const map: Record<string, string> = {
    All: "bg-[var(--brand-primary)]/8 text-[var(--brand-primary)]",
    Admin: "bg-blue-500/12 text-blue-700",
    Staff: "bg-green-500/12 text-green-700",
    Owner: "bg-purple-500/12 text-purple-700",
  };
  return map[role] ?? map.All;
}

// ─── Filters Component ─────────────────────────────────────────────────────────
interface AuditLogsFiltersProps {
  search: string;
  roleFilter: "All" | UserRole;
  roleOpen: boolean;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (role: "All" | UserRole) => void;
  onRoleOpenChange: (open: boolean) => void;
}

function AuditLogsFilters({
  search,
  roleFilter,
  roleOpen,
  onSearchChange,
  onRoleFilterChange,
  onRoleOpenChange,
}: AuditLogsFiltersProps) {
  const roles: ("All" | UserRole)[] = ["All", "Admin", "Staff", "Owner"];

  return (
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
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2 px-3 pl-9 rounded-[10px] border-[1.5px] border-[var(--gray-5)] text-[13px] text-[var(--black-2)] bg-white outline-none box-border focus:border-[var(--brand-primary)]"
        />
      </div>

      {/* Role Filter */}
      <div className="relative">
        <button
          onClick={() => onRoleOpenChange(!roleOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border-[1.5px] border-[var(--gray-5)] bg-white text-[13px] font-semibold cursor-pointer ${roleCfg(roleFilter)}`}
        >
          Role: {roleFilter}
          <ChevronDown size={14} />
        </button>
        {roleOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 bg-white border-[1.5px] border-[var(--gray-5)] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] z-[100] min-w-[150px] overflow-hidden">
            {roles.map((r) => {
              return (
                <button
                  key={r}
                  onClick={() => {
                    onRoleFilterChange(r);
                    onRoleOpenChange(false);
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
  );
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

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        <AuditLogsHeader />

        <AuditLogsFilters
          search={search}
          roleFilter={roleFilter}
          roleOpen={roleOpen}
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          onRoleFilterChange={(role) => {
            setRoleFilter(role);
            setCurrentPage(1);
          }}
          onRoleOpenChange={setRoleOpen}
        />

        <AuditLogsTable
          logs={paged}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminPageLayout>
  );
}
