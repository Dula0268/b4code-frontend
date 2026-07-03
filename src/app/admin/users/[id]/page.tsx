"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  RotateCcw,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import UserProfileHeader from "@/components/admin/users/user-profile-header";
import UserAccountInformation from "@/components/admin/users/user-account-information";
import { UsersApi } from "@/api/admin/users.api";
import UserActivityLog, {
  type ActivityLogEntry,
} from "@/components/admin/users/user-activity-log";

// ─── User Type ───────────────────────────────
type User = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  avatarInitial: string;
  role: string;
  status: string;
  lastLogin: string;
  phone: string;
  joined: string;
  timezone: string;
};

// Helper to generate consistent avatar colors
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

// ─── Mock activity log removed, using real-time data from API ───

// ─── Toast ───────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-999 flex items-center gap-2.5 bg-white rounded-xl px-4.5 py-3.5 shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-[#e8f5e9] animate-[slideIn_0.25s_ease]">
      <CheckCircle2 size={18} color="#27ae60" />
      <span className="text-sm font-semibold text-[#1d1d1d]">{message}</span>
      <button
        onClick={onClose}
        className="bg-transparent border-none cursor-pointer text-[#888] ml-1 flex"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Reset Password Modal ────────────────────────────────────────────
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
      className="fixed inset-0 z-998 bg-black/45 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl px-8 py-9 w-105 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-13 h-13 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center mb-4.5">
          <RotateCcw size={22} color="var(--brand-primary)" />
        </div>

        <h2 className="m-0 mb-2 text-xl font-bold text-(--black-2)">
          Reset Password?
        </h2>

        <p className="m-0 mb-7 text-sm text-(--gray-3) leading-relaxed">
          A secure reset link will be sent to
          <br />
          <strong className="text-(--black-2)">{email}</strong>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5.5 py-2.5 rounded-[10px] border border-(--gray-5) bg-white text-sm font-semibold text-(--gray-2)"
          >
            Cancel
          </button>

          <button
            onClick={onSend}
            className="px-5.5 py-2.5 rounded-[10px] bg-(--brand-primary) text-white text-sm font-bold"
          >
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("Staff");
  const [toast, setToast] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const id = parseInt(params.id as string);
        if (isNaN(id)) return;

        const [u, logs] = await Promise.all([
          UsersApi.getById(id),
          UsersApi.getActivityLogs(id)
        ]);

        const name =
          `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User";

        const formattedRole = u.role
          ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()
          : "Staff";

        const formattedStatus = u.status
          ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase()
          : "Active";

        const formattedUser: User = {
          id: u.id.toString(),
          name,
          email: u.email,
          avatarColor: stringToColor(name),
          avatarInitial: name.charAt(0).toUpperCase(),
          role: formattedRole,
          status: formattedStatus,
          lastLogin: u.lastLogin
            ? new Date(u.lastLogin).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }) +
              " at " +
              new Date(u.lastLogin).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Never",
          phone: "+1 (555) 000-0000",
          joined: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Unknown",
          timezone: "(GMT+00:00) Default Timezone",
        };

        setUser(formattedUser);
        setCurrentRole(formattedUser.role);
        setSuspended(formattedUser.status === "Suspended");

        const formattedLogs = logs.map(log => ({
          action: log.action || "update",
          label: log.action ? log.action.replace(/_/g, ' ') : "Unknown Action",
          target: log.entityDetail || log.entity || "System",
          date: log.timestamp || "Unknown Time",
          ip: log.ip || "Unknown IP",
        }));
        setActivityLogs(formattedLogs);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [params.id]);

  const handleRoleChange = async (newRole: string) => {
    try {
      if (!user) return;

      await UsersApi.update(Number(user.id), {
        role: newRole as import("@/api/admin/users.api").UserRole,
      });
      setCurrentRole(newRole);
      setToast(`Role updated to ${newRole}`);
    } catch (err) {
      console.error("Failed to update role:", err);
      setToast("Failed to update user role");
    }
  };

  const handleSuspendToggle = async () => {
    const next = !suspended;
    try {
      if (!user) return;

      const newStatus = next ? "SUSPENDED" : "ACTIVE";
      await UsersApi.updateStatus(
        Number(user.id),
        newStatus as import("@/api/admin/users.api").UserStatus,
      );
      setSuspended(next);

      // Refresh activity logs after status change
      const logs = await UsersApi.getActivityLogs(Number(user.id));
      const formattedLogs = logs.map(log => ({
        action: log.action || "update",
        label: log.action ? log.action.replace(/_/g, ' ') : "Unknown Action",
        target: log.entityDetail || log.entity || "System",
        date: log.timestamp || "Unknown Time",
        ip: log.ip || "Unknown IP",
      }));
      setActivityLogs(formattedLogs);

      setToast(
        next
          ? "User Suspended Successfully"
          : "Account Reactivated Successfully",
      );
    } catch (err) {
      console.error("Failed to update user status:", err);
      setToast("Failed to update user status");
    }
  };

  const handleSendReset = () => {
    setShowResetModal(false);
    setToast("Password Reset Link Sent!");
  };

  if (loading) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center h-64 text-(--gray-3)">
          Loading user details...
        </div>
      </AdminPageLayout>
    );
  }

  if (!user) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center h-64 text-(--gray-3)">
          User not found.
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {showResetModal && (
        <ResetPasswordModal
          email={user.email}
          onClose={() => setShowResetModal(false)}
          onSend={handleSendReset}
        />
      )}

      <AdminPageLayout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-(--gray-3)"
            >
              <ArrowLeft size={14} />
              User Management
            </button>

            <ChevronRight size={14} />
            <span className="text-(--brand-primary) font-semibold">
              Account Details
            </span>
          </div>

          <UserProfileHeader
            user={{ ...user, role: currentRole }}
            suspended={suspended}
            onResetPassword={() => setShowResetModal(true)}
            onSuspendToggle={handleSuspendToggle}
            onRoleChange={handleRoleChange}
          />

          <div className="grid grid-cols-[1fr_1.7fr] gap-5 items-start">
            <UserAccountInformation user={user} />
            <UserActivityLog activities={activityLogs} />
          </div>
        </div>
      </AdminPageLayout>
    </>
  );
}
