"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MoreVertical,
  Loader2,
  X,
  Check,
  Trash2,
  Ban,
  ShieldCheck,
  Send,
} from "lucide-react";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import { UsersApi } from "@/api/admin/users.api";
import {
  useAdminUsersStore,
  type User,
  type UserStatus,
} from "@/store/admin/users/admin-users.store";

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Pick a consistent avatar colour from the user's email */
function avatarColor(email: string): string {
  const COLOURS = [
    "#f4a261",
    "#2f80ed",
    "#953002",
    "#27ae60",
    "#e67e22",
    "#e84393",
    "#16a085",
    "#8e44ad",
    "#2980b9",
    "#d35400",
  ];
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return COLOURS[Math.abs(hash) % COLOURS.length];
}

function avatarInitial(user: User): string {
  return (user.firstName?.[0] ?? user.email[0] ?? "?").toUpperCase();
}

function formatDateTime(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "Never", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, string> = {
    OWNER: "bg-[rgba(155,89,182,0.12)] text-[#7d3c98]",
    STAFF: "bg-[rgba(47,128,237,0.12)] text-[#1a5fa8]",
    ADMIN: "bg-[rgba(149,48,2,0.12)] text-[#953002]",
    GUEST: "bg-[rgba(39,174,96,0.12)] text-[#1a7a45]",
  };
  const label = role.charAt(0) + role.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block px-3 py-[3px] rounded-full text-xs font-semibold ${cfg[role] ?? "bg-gray-100 text-gray-600"}`}
    >
      {label}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = {
    ACTIVE: {
      class: "bg-[rgba(39,174,96,0.12)] text-[#1a7a45]",
      dot: "#27ae60",
    },
    SUSPENDED: {
      class: "bg-[rgba(235,87,87,0.12)] text-[#b83030]",
      dot: "#eb5757",
    },
    PENDING: {
      class: "bg-[rgba(242,201,76,0.12)] text-[#b38600]",
      dot: "#f2c94c",
    },
    APPROVED: {
      class: "bg-[rgba(39,174,96,0.12)] text-[#1a7a45]",
      dot: "#27ae60",
    },
    REJECTED: {
      class: "bg-[rgba(130,130,130,0.12)] text-[#4f4f4f]",
      dot: "#828282",
    },
  };
  const s = cfg[status] ?? cfg.ACTIVE;
  return (
    <span
      className={`inline-flex items-center gap-[5px] px-3 py-[3px] rounded-full text-xs font-semibold ${s.class}`}
    >
      <span
        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        style={{ backgroundColor: s.dot }}
      />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────
function RowMenu({
  user,
  onStatusToggle,
  onDelete,
}: {
  user: User;
  onStatusToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-transparent border-none cursor-pointer text-[var(--gray-4)] flex items-center justify-center p-1 rounded-md hover:bg-[var(--gray-5)] hover:text-[var(--gray-2)]"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-[var(--gray-5)] rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] z-[200] min-w-[160px] overflow-hidden">
          <button
            onClick={() => {
              onStatusToggle();
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-[10px] text-[13px] text-[var(--gray-2)] hover:bg-[var(--gray-6)] border-none bg-transparent cursor-pointer"
          >
            {user.status === "ACTIVE" ? (
              <>
                <Ban size={13} className="text-orange-500" /> Suspend
              </>
            ) : (
              <>
                <ShieldCheck size={13} className="text-green-600" /> Activate
              </>
            )}
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-[10px] text-[13px] text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer"
          >
            <Trash2 size={13} /> Delete User
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Invite User Drawer ───────────────────────────────────────────────────────────
function InviteUserDrawer({
  onClose,
  onInvite,
  saving,
}: {
  onClose: () => void;
  onInvite: (data: { email: string; role: string }) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    email: "",
    role: "STAFF",
  });
  const roles = ["OWNER", "STAFF", "ADMIN", "GUEST"];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[300] bg-black/40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[301] flex flex-col transition-transform duration-300 transform translate-x-0">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[18px] font-extrabold text-[var(--black-2)] m-0 flex items-center gap-2">
            <Send size={18} className="text-[var(--brand-primary)]" />
            Invite New User
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--gray-3)] hover:text-[var(--black-2)] bg-transparent border-none cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          <p className="text-sm text-[var(--gray-3)] m-0 leading-relaxed">
            Send an invitation link to a new user. They will be able to set their own name, password, and personal details securely.
          </p>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--gray-2)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-[10px] rounded-lg border border-[var(--gray-5)] text-[13px] text-[var(--black-2)] outline-none box-border focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--gray-2)] mb-1">
              Assign Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-[10px] rounded-lg border border-[var(--gray-5)] text-[13px] text-[var(--black-2)] outline-none bg-white focus:border-[var(--brand-primary)] transition-colors cursor-pointer appearance-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                paddingRight: "36px",
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-5 flex gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="flex-1 py-[10px] rounded-xl border border-[var(--gray-5)] bg-white text-[13px] text-[var(--gray-2)] font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={saving || !form.email}
            onClick={() => onInvite(form)}
            className="flex-1 py-[10px] rounded-xl bg-[var(--brand-primary)] text-white text-[13px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {saving ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  user,
  onConfirm,
  onClose,
  loading,
}: {
  user: User;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--gray-3)] hover:text-[var(--black-2)] bg-transparent border-none cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h2 className="text-[17px] font-extrabold text-[var(--black-2)]">
            Delete User?
          </h2>
          <p className="text-[13px] text-[var(--gray-3)]">
            Are you sure you want to delete{" "}
            <strong>
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </strong>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-[10px] rounded-[10px] border border-[var(--gray-5)] bg-white text-[13px] text-[var(--gray-2)] font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-[10px] rounded-[10px] bg-red-500 text-white text-[13px] font-semibold cursor-pointer hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function UsersManagementPage() {
  const router = useRouter();

  const {
    users,
    totalPages,
    totalElements,
    currentPage,
    loading,
    actionLoading,
    error,
    fetchUsers,
    createUser,
    updateUserStatus,
    deleteUser,
  } = useAdminUsersStore();

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [roleOpen, setRoleOpen] = useState(false);

  // ── Modal state ──
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const PAGE_SIZE = 6;
  const roles = ["All", "OWNER", "STAFF", "ADMIN", "GUEST"];

  // ── Initial fetch ──
  useEffect(() => {
    fetchUsers(undefined, undefined, undefined, 0);
  }, []);

  // ── Debounced search + filter re-fetch ──
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(
        search || undefined,
        roleFilter === "All" ? undefined : roleFilter,
        undefined,
        0,
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  function handlePageChange(page: number) {
    fetchUsers(
      search || undefined,
      roleFilter === "All" ? undefined : roleFilter,
      undefined,
      page,
    );
  }

  async function handleStatusToggle(user: User) {
    const next: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await updateUserStatus(user.id, next);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleInviteUser(data: { email: string; role: string }) {
    try {
      setInviting(true);
      await UsersApi.invite(data.email, data.role as import("@/api/admin/users.api").UserRole);
      setShowInviteDrawer(false);
      // Reload table
      fetchUsers(
        search || undefined,
        roleFilter === "All" ? undefined : roleFilter,
        undefined,
        0,
      );
    } catch (err: any) {
      // Extract backend error message if available
      const errorMessage = err.response?.data?.message || err.message || "Failed to send invite";
      alert(errorMessage);
    } finally {
      setInviting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const startRow = totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const endRow = Math.min((currentPage + 1) * PAGE_SIZE, totalElements);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-[var(--black-2)]">
              User Management
            </h1>
            <p className="mt-[6px] mb-0 text-sm text-[var(--gray-3)]">
              Manage platform access, roles, and account statuses.
            </p>
          </div>
          <button
            onClick={() => setShowInviteDrawer(true)}
            className="flex items-center gap-2 px-5 py-[10px] rounded-[10px] bg-[var(--brand-primary)] text-white border-none cursor-pointer text-sm font-semibold shadow-[0_2px_8px_rgba(149,48,2,0.25)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            <Send size={16} />
            Invite User
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            {error}
            <button
              onClick={() => useAdminUsersStore.getState().reset()}
              className="ml-4 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or property…"
                className="w-full py-[9px] pr-3 pl-9 rounded-lg border border-[var(--gray-5)] text-[13px] text-[var(--black-2)] bg-white outline-none box-border focus:border-[var(--brand-secondary)] transition-colors"
              />
            </div>

            <div className="flex-1" />

            {/* Filter by Role */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex items-center gap-2 px-4 py-[9px] rounded-lg border border-[var(--gray-5)] bg-white text-[13px] text-[var(--gray-2)] font-medium cursor-pointer hover:bg-[var(--gray-6)] hover:border-[var(--gray-4)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 3h12M3 7h8M5 11h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {roleFilter === "All"
                  ? "Filter by Role"
                  : roleFilter.charAt(0) + roleFilter.slice(1).toLowerCase()}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${roleOpen ? "rotate-180" : ""}`}
                />
              </button>

              {roleOpen && (
                <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-[var(--gray-5)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-[100] min-w-[160px] overflow-hidden">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRoleFilter(r);
                        setRoleOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-[10px] border-none text-[13px] cursor-pointer transition-colors ${
                        roleFilter === r
                          ? "bg-[rgba(149,48,2,0.08)] text-[var(--brand-primary)] font-semibold"
                          : "bg-white text-[var(--gray-2)] font-normal hover:bg-[var(--gray-6)]"
                      }`}
                    >
                      {r === "All"
                        ? "All Roles"
                        : r.charAt(0) + r.slice(1).toLowerCase()}
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2
                        size={28}
                        className="animate-spin mx-auto text-[var(--brand-primary)]"
                      />
                      <p className="mt-3 text-sm text-[var(--gray-3)]">
                        Loading users…
                      </p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-[var(--gray-3)] text-sm"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => {
                    const { date, time } = formatDateTime(user.lastLogin);
                    const color = avatarColor(user.email);
                    const initial = avatarInitial(user);
                    return (
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
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                              style={{ backgroundColor: color }}
                            >
                              {initial}
                            </div>
                            <div>
                              <p className="m-0 font-semibold text-[var(--black-2)]">
                                {user.fullName ||
                                  `${user.firstName} ${user.lastName}`}
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
                            {date}
                          </span>
                          {time && (
                            <span className="text-[var(--gray-3)] ml-2 text-[13px]">
                              {time}
                            </span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-[14px] w-10">
                          <RowMenu
                            user={user}
                            onStatusToggle={() => handleStatusToggle(user)}
                            onDelete={() => setDeleteTarget(user)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex justify-between items-center px-5 py-[14px] border-t border-[var(--gray-5)]">
            <span className="text-[13px] text-[var(--gray-3)]">
              Showing{" "}
              <strong className="text-[var(--black-2)]">{startRow}</strong> to{" "}
              <strong className="text-[var(--black-2)]">{endRow}</strong> of{" "}
              <strong className="text-[var(--black-2)]">{totalElements}</strong>{" "}
              results
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`w-8 h-8 rounded-md border border-[var(--gray-5)] bg-white flex items-center justify-center ${
                  currentPage === 0
                    ? "cursor-not-allowed text-[var(--gray-4)]"
                    : "cursor-pointer text-[var(--gray-2)]"
                }`}
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-md border cursor-pointer text-[13px] ${
                    currentPage === p
                      ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-white font-bold"
                      : "border-[var(--gray-5)] bg-white text-[var(--gray-2)] font-normal"
                  }`}
                >
                  {p + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                className={`w-8 h-8 rounded-md border border-[var(--gray-5)] bg-white flex items-center justify-center ${
                  currentPage >= totalPages - 1
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

      {/* ── Invite User Drawer ── */}
      {showInviteDrawer && (
        <InviteUserDrawer
          onClose={() => setShowInviteDrawer(false)}
          onInvite={handleInviteUser}
          saving={inviting}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </AdminPageLayout>
  );
}
