"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  RotateCcw,
  ShieldOff,
  RefreshCw,
  Pencil,
  LogIn,
  Key,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

// ─── Shared user data (same as users list) ───────────────────────────────────
const ALL_USERS = [
  {
    id: "1",
    name: "Sarah Jenkins",
    email: "sarah.j@primestay.com",
    avatarColor: "#f4a261",
    avatarInitial: "S",
    role: "Owner" as const,
    status: "Active" as const,
    lastLogin: "Oct 24, 2023 at 09:41 AM",
    phone: "+1 (555) 123-4567",
    joined: "August 15, 2022",
    timezone: "(GMT-05:00) Eastern Time (US & Canada)",
  },
  {
    id: "2",
    name: "Mike Ross",
    email: "mike.ross@primestay.com",
    avatarColor: "#2f80ed",
    avatarInitial: "M",
    role: "Staff" as const,
    status: "Active" as const,
    lastLogin: "Oct 23, 2023 at 02:15 PM",
    phone: "+1 (555) 234-5678",
    joined: "March 10, 2023",
    timezone: "(GMT+00:00) London",
  },
  {
    id: "3",
    name: "John Doe",
    email: "john.d@gmail.com",
    avatarColor: "#953002",
    avatarInitial: "J",
    role: "Staff" as const,
    status: "Suspended" as const,
    lastLogin: "Sep 12, 2023 at 11:00 AM",
    phone: "+1 (555) 345-6789",
    joined: "June 1, 2022",
    timezone: "(GMT+05:30) India",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily.chen@primestay.com",
    avatarColor: "#27ae60",
    avatarInitial: "E",
    role: "Owner" as const,
    status: "Active" as const,
    lastLogin: "Oct 24, 2023 at 08:30 AM",
    phone: "+1 (555) 456-7890",
    joined: "January 5, 2021",
    timezone: "(GMT-08:00) Pacific Time",
  },
  {
    id: "5",
    name: "Aisha Kumar",
    email: "aisha.k@primestay.com",
    avatarColor: "#e67e22",
    avatarInitial: "A",
    role: "Staff" as const,
    status: "Active" as const,
    lastLogin: "Oct 21, 2023 at 03:40 PM",
    phone: "+1 (555) 567-8901",
    joined: "April 20, 2023",
    timezone: "(GMT+05:30) India",
  },
  {
    id: "6",
    name: "Nina Patel",
    email: "nina.patel@primestay.com",
    avatarColor: "#e84393",
    avatarInitial: "N",
    role: "Owner" as const,
    status: "Active" as const,
    lastLogin: "Oct 24, 2023 at 07:55 AM",
    phone: "+1 (555) 678-9012",
    joined: "September 3, 2020",
    timezone: "(GMT+05:30) India",
  },
  {
    id: "7",
    name: "Daniel Osei",
    email: "daniel.o@primestay.com",
    avatarColor: "#16a085",
    avatarInitial: "D",
    role: "Staff" as const,
    status: "Active" as const,
    lastLogin: "Oct 20, 2023 at 11:30 AM",
    phone: "+1 (555) 789-0123",
    joined: "July 12, 2022",
    timezone: "(GMT+00:00) London",
  },
  {
    id: "8",
    name: "Priya Sharma",
    email: "priya.s@primestay.com",
    avatarColor: "#8e44ad",
    avatarInitial: "P",
    role: "Owner" as const,
    status: "Suspended" as const,
    lastLogin: "Oct 19, 2023 at 02:00 PM",
    phone: "+1 (555) 890-1234",
    joined: "February 28, 2021",
    timezone: "(GMT+05:30) India",
  },
];

// ─── Mock activity log ────────────────────────────────────────────────────────
type ActionType = "update" | "login" | "password" | "create" | "delete";

const ACTIVITY_LOG: {
  action: ActionType;
  label: string;
  target: string;
  date: string;
  ip: string;
}[] = [
  {
    action: "update",
    label: "Update Property",
    target: "Sunset Villa (ID: #4092)",
    date: "Oct 24, 2023 09:45 AM",
    ip: "192.168.1.1",
  },
  {
    action: "login",
    label: "User Login",
    target: "System Access",
    date: "Oct 24, 2023 09:41 AM",
    ip: "192.168.1.1",
  },
  {
    action: "password",
    label: "Password Change",
    target: "Security Settings",
    date: "Oct 15, 2023 02:20 PM",
    ip: "192.168.2.5",
  },
  {
    action: "create",
    label: "New Listing Created",
    target: "Oceanview Apt (ID: #4095)",
    date: "Sep 30, 2023 11:15 AM",
    ip: "192.168.1.1",
  },
  {
    action: "delete",
    label: "Delete Listing",
    target: "Old Cabin (ID: #3021)",
    date: "Sep 28, 2023 04:30 PM",
    ip: "192.168.3.9",
  },
];

// ─── Activity icon ────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: ActionType }) {
  const cfg: Record<ActionType, { bg: string; icon: React.ReactNode }> = {
    update: { bg: "#e8f0fe", icon: <Pencil size={13} color="#3b82f6" /> },
    login: { bg: "#e6f7ee", icon: <LogIn size={13} color="#22c55e" /> },
    password: { bg: "#fff4e0", icon: <Key size={13} color="#f59e0b" /> },
    create: { bg: "#f3e8ff", icon: <Plus size={13} color="#a855f7" /> },
    delete: { bg: "#fee2e2", icon: <Trash2 size={13} color="#ef4444" /> },
  };
  const { bg, icon } = cfg[type];
  return (
    <span
      className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {icon}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[999] flex items-center gap-[10px] bg-white rounded-xl px-[18px] py-[14px] shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-[#e8f5e9] animate-[slideIn_0.25s_ease]">
      <CheckCircle2 size={18} color="#27ae60" />
      <span className="text-sm font-semibold text-[#1d1d1d]">{message}</span>
      <button
        onClick={onClose}
        className="bg-transparent border-none cursor-pointer text-[#888] ml-1 flex"
      >
        <X size={15} />
      </button>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({
  email,
  onClose,
  onSend,
}: {
  email: string;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[998] bg-black/45 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-8 py-9 w-[420px] shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-[52px] h-[52px] rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center mb-[18px]">
          <RotateCcw size={22} color="var(--brand-primary)" />
        </div>
        <h2 className="m-0 mb-2 text-xl font-bold text-[var(--black-2)]">
          Reset Password?
        </h2>
        <p className="m-0 mb-7 text-sm text-[var(--gray-3)] leading-relaxed">
          A secure reset link will be sent to
          <br />
          <strong className="text-[var(--black-2)]">{email}</strong>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-[22px] py-[10px] rounded-[10px] border border-[var(--gray-5)] bg-white text-sm font-semibold text-[var(--gray-2)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="px-[22px] py-[10px] rounded-[10px] border-none bg-[var(--brand-primary)] text-white text-sm font-bold cursor-pointer shadow-[0_2px_8px_rgba(149,48,2,0.25)] hover:bg-[var(--primary-hover)]"
          >
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = ALL_USERS.find((u) => u.id === params.id) ?? ALL_USERS[0];

  const [suspended, setSuspended] = useState(user.status === "Suspended");
  const [toast, setToast] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSuspendToggle = () => {
    const next = !suspended;
    setSuspended(next);
    setToast(
      next ? "User Suspended Successfully" : "Account Reactivated Successfully",
    );
  };

  const handleSendReset = () => {
    setShowResetModal(false);
    setToast("Password Reset Link Sent!");
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ── Reset Password Modal ── */}
      {showResetModal && (
        <ResetPasswordModal
          email={user.email}
          onClose={() => setShowResetModal(false)}
          onSend={handleSendReset}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-[var(--gray-3)] text-sm p-0 hover:text-[var(--black-2)]"
          >
            <ArrowLeft size={14} />
            User Management
          </button>
          <ChevronRight size={14} color="var(--gray-4)" />
          <span className="text-[var(--brand-primary)] font-semibold">
            Account Details
          </span>
        </div>

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-2xl px-7 py-6 shadow-sm flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-extrabold text-[26px]"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatarInitial}
            </div>
            {/* Online dot */}
            <span
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: suspended ? "#eb5757" : "#27ae60" }}
            />
          </div>

          {/* Name / email / badges */}
          <div className="flex-1 min-w-[200px]">
            <h1 className="m-0 mb-1 text-[22px] font-extrabold text-[var(--black-2)]">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--gray-3)]">{user.email}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--gray-4)] flex-shrink-0" />
              {/* Role badge */}
              <span className="px-[10px] py-[2px] rounded-full bg-[rgba(155,89,182,0.12)] text-[#7d3c98] text-xs font-bold">
                {user.role}
              </span>
              {/* Suspended badge (only when suspended) */}
              {suspended && (
                <span className="px-[10px] py-[2px] rounded-full bg-[rgba(235,87,87,0.12)] text-[#b83030] text-xs font-bold">
                  Suspended
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-shrink-0 flex-wrap">
            {/* Reset Password */}
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-[7px] px-[18px] py-[10px] rounded-[10px] border-[1.5px] border-[var(--gray-5)] bg-white text-sm font-semibold text-[var(--black-2)] cursor-pointer transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            >
              <RotateCcw size={15} />
              Reset Password
            </button>

            {/* Suspend / Reactivate */}
            <button
              onClick={handleSuspendToggle}
              className={`flex items-center gap-[7px] px-[18px] py-[10px] rounded-[10px] border-none text-white text-sm font-semibold cursor-pointer transition-opacity hover:opacity-88 ${
                suspended
                  ? "bg-[var(--state-success)] shadow-[0_2px_8px_rgba(39,174,96,0.3)]"
                  : "bg-[var(--state-error)] shadow-[0_2px_8px_rgba(235,87,87,0.3)]"
              }`}
            >
              {suspended ? <RefreshCw size={15} /> : <ShieldOff size={15} />}
              {suspended ? "Reactivate Account" : "Suspend Account"}
            </button>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-[1fr_1.7fr] gap-5 items-start">
          {/* ── Account Information ── */}
          <div className="bg-white rounded-2xl px-7 py-6 shadow-sm">
            <h2 className="m-0 mb-[22px] text-base font-bold text-[var(--black-2)]">
              Account Information
            </h2>
            {[
              { label: "EMAIL ADDRESS", value: user.email },
              { label: "PHONE NUMBER", value: user.phone },
              { label: "JOINED DATE", value: user.joined },
              { label: "LAST LOGIN", value: user.lastLogin },
              { label: "TIME ZONE", value: user.timezone },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: "var(--gray-3)",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "var(--black-2)",
                    fontWeight: 500,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Activity Log ── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-5">
              <h2 className="m-0 text-base font-bold text-[var(--black-2)]">
                Activity Log
              </h2>
              <div className="flex gap-2">
                {/* Filter icon */}
                <button className="bg-transparent border-none cursor-pointer text-[var(--gray-3)] flex p-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4h12M4 8h8M6 12h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                marginTop: "12px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gray-5)" }}>
                  {["ACTION", "TARGET", "DATE & TIME", "IP ADDRESS"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 24px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--gray-3)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_LOG.map((log, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--gray-5)" }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "#f5efec";
                    }}
                    onMouseLeave={(e) => {
                      (
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "";
                    }}
                  >
                    <td style={{ padding: "13px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <ActivityIcon type={log.action} />
                        <span
                          style={{ fontWeight: 600, color: "var(--black-2)" }}
                        >
                          {log.label}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{ padding: "13px 24px", color: "var(--gray-3)" }}
                    >
                      {log.target}
                    </td>
                    <td
                      style={{
                        padding: "13px 24px",
                        color: "var(--gray-3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log.date}
                    </td>
                    <td
                      style={{
                        padding: "13px 24px",
                        color: "var(--gray-3)",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                      }}
                    >
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* View Full Log */}
            <div style={{ padding: "16px 24px", textAlign: "center" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--brand-primary)",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                View Full Activity Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
