"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";

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
  {
    id: "1",
    name: "Sarah Jenkins",
    email: "sarah.j@primestay.com",
    avatarColor: "#f4a261",
    avatarInitial: "S",
    role: "Owner",
    status: "Active",
    lastLogin: "Oct 24, 2023",
    lastLoginTime: "09:41 AM",
  },
  {
    id: "2",
    name: "Mike Ross",
    email: "mike.ross@primestay.com",
    avatarColor: "#2f80ed",
    avatarInitial: "M",
    role: "Staff",
    status: "Active",
    lastLogin: "Oct 23, 2023",
    lastLoginTime: "02:15 PM",
  },
  {
    id: "3",
    name: "John Doe",
    email: "john.d@gmail.com",
    avatarColor: "#953002",
    avatarInitial: "J",
    role: "Staff",
    status: "Suspended",
    lastLogin: "Sep 12, 2023",
    lastLoginTime: "11:00 AM",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily.chen@primestay.com",
    avatarColor: "#27ae60",
    avatarInitial: "E",
    role: "Owner",
    status: "Active",
    lastLogin: "Oct 24, 2023",
    lastLoginTime: "08:30 AM",
  },
  {
    id: "5",
    name: "Aisha Kumar",
    email: "aisha.k@primestay.com",
    avatarColor: "#e67e22",
    avatarInitial: "A",
    role: "Staff",
    status: "Active",
    lastLogin: "Oct 21, 2023",
    lastLoginTime: "03:40 PM",
  },
  {
    id: "6",
    name: "Nina Patel",
    email: "nina.patel@primestay.com",
    avatarColor: "#e84393",
    avatarInitial: "N",
    role: "Owner",
    status: "Active",
    lastLogin: "Oct 24, 2023",
    lastLoginTime: "07:55 AM",
  },
  {
    id: "7",
    name: "Daniel Osei",
    email: "daniel.o@primestay.com",
    avatarColor: "#16a085",
    avatarInitial: "D",
    role: "Staff",
    status: "Active",
    lastLogin: "Oct 20, 2023",
    lastLoginTime: "11:30 AM",
  },
  {
    id: "8",
    name: "Priya Sharma",
    email: "priya.s@primestay.com",
    avatarColor: "#8e44ad",
    avatarInitial: "P",
    role: "Owner",
    status: "Suspended",
    lastLogin: "Oct 19, 2023",
    lastLoginTime: "02:00 PM",
  },
];

const PAGE_SIZE = 6;

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const cfg: Record<UserRole, string> = {
    Owner: "bg-[rgba(155,89,182,0.12)] text-[#7d3c98]",
    Staff: "bg-[rgba(47,128,237,0.12)] text-[#1a5fa8]",
  };
  return (
    <span
      className={`inline-block px-3 py-[3px] rounded-full text-xs font-semibold ${cfg[role]}`}
    >
      {role}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserStatus }) {
  const cfg: Record<UserStatus, { class: string; dot: string }> = {
    Active: {
      class: "bg-[rgba(39,174,96,0.12)] text-[#1a7a45]",
      dot: "#27ae60",
    },
    Suspended: {
      class: "bg-[rgba(235,87,87,0.12)] text-[#b83030]",
      dot: "#eb5757",
    },
  };
  const { class: classNames, dot } = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-[5px] px-3 py-[3px] rounded-full text-xs font-semibold ${classNames}`}
    >
      <span
        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        style={{ backgroundColor: dot }}
      />
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function UserAvatar({ user }: { user: User }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
      style={{ backgroundColor: user.avatarColor }}
    >
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
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const roles: ("All" | UserRole)[] = ["All", "Owner", "Staff"];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-[var(--black-2)]">
            User Management
          </h1>
          <p className="mt-[6px] mb-0 text-sm text-[var(--gray-3)]">
            Manage platform access, roles, and account statuses.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-[10px] rounded-[10px] bg-[var(--brand-primary)] text-white border-none cursor-pointer text-sm font-semibold shadow-[0_2px_8px_rgba(149,48,2,0.25)] transition-colors hover:bg-[var(--primary-hover)]">
          <UserPlus size={16} />
          Add New User
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--gray-5)]">
          {/* Search */}
          <div className="relative flex-1 max-w-[340px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-4)] pointer-events-none"
            />
            <input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-[9px] pr-3 pl-9 rounded-lg border border-[var(--gray-5)] text-[13px] text-[var(--black-2)] bg-white outline-none box-border"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Filter by Role */}
          <div className="relative">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex items-center gap-[7px] px-[14px] py-2 rounded-lg border border-[var(--gray-5)] bg-white text-[13px] text-[var(--gray-2)] cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 3h12M3 7h8M5 11h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {roleFilter === "All" ? "Filter by Role" : roleFilter}
              <ChevronDown size={13} />
            </button>
            {roleOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 bg-white border border-[var(--gray-5)] rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] z-[100] min-w-[140px] overflow-hidden">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRoleFilter(r);
                      setRoleOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full text-left px-4 py-[9px] border-none text-[13px] cursor-pointer ${
                      roleFilter === r
                        ? "bg-[rgba(149,48,2,0.07)] text-[var(--brand-primary)] font-semibold"
                        : "bg-white text-[var(--gray-2)] font-normal"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#F6F8F7]">
                {["USER", "ROLE", "STATUS", "LAST LOGIN", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-[11px] text-left text-[11.5px] font-bold text-[var(--gray-3)] tracking-[0.06em] uppercase whitespace-nowrap"
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
                    className="py-10 text-center text-[var(--gray-3)] text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                paged.map((user, idx) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className={`border-t border-[var(--gray-5)] transition-colors cursor-pointer ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    } hover:bg-[#f5efec]`}
                  >
                    {/* User */}
                    <td className="px-4 py-[14px] min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="m-0 font-semibold text-[var(--black-2)]">
                            {user.name}
                          </p>
                          <p className="m-0 text-xs text-[var(--gray-3)]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-[14px]">
                      <RoleBadge role={user.role} />
                    </td>
                    {/* Status */}
                    <td className="px-4 py-[14px]">
                      <StatusBadge status={user.status} />
                    </td>
                    {/* Last Login */}
                    <td className="px-4 py-[14px] whitespace-nowrap">
                      <span className="text-[var(--black-2)] font-medium">
                        {user.lastLogin}
                      </span>
                      <span className="text-[var(--gray-3)] ml-2 text-[13px]">
                        {user.lastLoginTime}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-[14px] w-10">
                      <button className="bg-transparent border-none cursor-pointer text-[var(--gray-4)] flex items-center justify-center p-1 rounded-md hover:bg-[var(--gray-5)] hover:text-[var(--gray-2)]">
                        <MoreVertical size={16} />
                      </button>
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg border border-[var(--gray-5)] bg-white flex items-center justify-center ${
                currentPage === 1
                  ? "cursor-not-allowed text-[var(--gray-4)]"
                  : "cursor-pointer text-[var(--gray-2)]"
              }`}
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg border cursor-pointer text-[13px] ${
                  currentPage === p
                    ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-white font-bold"
                    : "border-[var(--gray-5)] bg-white text-[var(--gray-2)] font-normal"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`w-8 h-8 rounded-lg border border-[var(--gray-5)] bg-white flex items-center justify-center ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-[var(--gray-4)]"
                  : "cursor-pointer text-[var(--gray-2)]"
              }`}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
