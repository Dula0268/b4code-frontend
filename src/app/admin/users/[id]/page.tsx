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
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        backgroundColor: bg,
        flexShrink: 0,
      }}
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
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#fff",
        borderRadius: "12px",
        padding: "14px 18px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        border: "1px solid #e8f5e9",
        animation: "slideIn 0.25s ease",
      }}
    >
      <CheckCircle2 size={18} color="#27ae60" />
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1d" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#888",
          marginLeft: "4px",
          display: "flex",
        }}
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 998,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "36px 32px",
          width: "420px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "rgba(149,48,2,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <RotateCcw size={22} color="var(--brand-primary)" />
        </div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--black-2)",
          }}
        >
          Reset Password?
        </h2>
        <p
          style={{
            margin: "0 0 28px",
            fontSize: "14px",
            color: "var(--gray-3)",
            lineHeight: 1.6,
          }}
        >
          A secure reset link will be sent to
          <br />
          <strong style={{ color: "var(--black-2)" }}>{email}</strong>
        </p>
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "1px solid var(--gray-5)",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--gray-2)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "var(--brand-primary)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(149,48,2,0.25)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--brand-primary)")
            }
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

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* ── Breadcrumb ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--gray-3)",
              fontSize: "14px",
              padding: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--black-2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--gray-3)")
            }
          >
            <ArrowLeft size={14} />
            User Management
          </button>
          <ChevronRight size={14} color="var(--gray-4)" />
          <span style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
            Account Details
          </span>
        </div>

        {/* ── Profile Header Card ── */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: user.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "26px",
              }}
            >
              {user.avatarInitial}
            </div>
            {/* Online dot */}
            <span
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: suspended ? "#eb5757" : "#27ae60",
                border: "2px solid #fff",
              }}
            />
          </div>

          {/* Name / email / badges */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h1
              style={{
                margin: "0 0 4px",
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--black-2)",
              }}
            >
              {user.name}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "14px", color: "var(--gray-3)" }}>
                {user.email}
              </span>
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "var(--gray-4)",
                  flexShrink: 0,
                }}
              />
              {/* Role badge */}
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(155,89,182,0.12)",
                  color: "#7d3c98",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {user.role}
              </span>
              {/* Suspended badge (only when suspended) */}
              {suspended && (
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(235,87,87,0.12)",
                    color: "#b83030",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  Suspended
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            {/* Reset Password */}
            <button
              onClick={() => setShowResetModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1.5px solid var(--gray-5)",
                backgroundColor: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--black-2)",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--brand-primary)";
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--gray-5)";
                e.currentTarget.style.color = "var(--black-2)";
              }}
            >
              <RotateCcw size={15} />
              Reset Password
            </button>

            {/* Suspend / Reactivate */}
            <button
              onClick={handleSuspendToggle}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: suspended
                  ? "var(--state-success)"
                  : "var(--state-error)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: suspended
                  ? "0 2px 8px rgba(39,174,96,0.3)"
                  : "0 2px 8px rgba(235,87,87,0.3)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {suspended ? <RefreshCw size={15} /> : <ShieldOff size={15} />}
              {suspended ? "Reactivate Account" : "Suspend Account"}
            </button>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.7fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* ── Account Information ── */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "24px 28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                margin: "0 0 22px",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--black-2)",
              }}
            >
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
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px 0",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--black-2)",
                }}
              >
                Activity Log
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                {/* Filter icon */}
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--gray-3)",
                    display: "flex",
                    padding: "4px",
                  }}
                >
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
