"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  MoreVertical,
  UserPlus,
} from "lucide-react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import { userApi } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────

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


interface BackendUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  createdAt: string;
}

// ─── Helper ───────────────────────────────────────────────────────────

function stringToColor(str: string) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#f4a261",
    "#2f80ed",
    "#953002",
    "#27ae60",
    "#e67e22",
    "#e84393",
    "#16a085",
    "#8e44ad",
  ];

  return colors[Math.abs(hash) % colors.length];
}

const PAGE_SIZE = 6;

// ─── Role Badge ───────────────────────────────────────────────────────

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

// ─── Status Badge ─────────────────────────────────────────────────────

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
        className="w-[6px] h-[6px] rounded-full"
        style={{ backgroundColor: dot }}
      />
      {status}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: User }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ backgroundColor: user.avatarColor }}
    >
      {user.avatarInitial}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [roleOpen, setRoleOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await userApi.getAllUsers();


        const backendUsers = data as BackendUser[];

        const formattedUsers: User[] = backendUsers.map((u) => {
          const name =
            `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
            "Unknown User";

          const role: UserRole =
            u.role?.toLowerCase() === "owner" ? "Owner" : "Staff";

          return {
            id: u.id.toString(),
            name,
            email: u.email,
            avatarColor: stringToColor(name),
            avatarInitial: name.charAt(0).toUpperCase(),
            role,
            status: "Active",
            lastLogin: new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            lastLoginTime: new Date(u.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // ── Filter ──────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
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
    currentPage * PAGE_SIZE
  );

  const roles: ("All" | UserRole)[] = ["All", "Owner", "Staff"];

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-gray-500">
              Manage platform access, roles, and account statuses.
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-lg">
            <UserPlus size={16} />
            Add New User
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl">

          {/* Toolbar */}
          <div className="flex gap-3 p-4 border-b">

            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search users..."
                className="w-full pl-9 p-2 border rounded-md"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="border px-3 py-2 rounded-md"
              >
                {roleFilter}
                <ChevronDown size={14} />
              </button>

              {roleOpen && (
                <div className="absolute bg-white border mt-1 rounded shadow">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRoleFilter(r);
                        setRoleOpen(false);
                        setCurrentPage(1);
                      }}
                      className="block px-3 py-2 w-full text-left"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-6">
                    Loading...
                  </td>
                </tr>
              ) : (
                paged.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="border-t cursor-pointer hover:bg-gray-50"
                  >
                    <td className="p-3 flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div>
                        <p>{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>

                    <td><RoleBadge role={user.role} /></td>
                    <td><StatusBadge status={user.status} /></td>

                    <td>
                      {user.lastLogin}{" "}
                      <span className="text-gray-400">
                        {user.lastLoginTime}
                      </span>
                    </td>

                    <td>
                      <MoreVertical size={16} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  );
}