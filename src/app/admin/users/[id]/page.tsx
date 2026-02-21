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
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import UserProfileHeader from "@/components/features/admin/users/user-profile-header";
import UserAccountInformation from "@/components/features/admin/users/user-account-information";
import UserActivityLog, {
  type ActivityLogEntry,
} from "@/components/features/admin/users/user-activity-log";

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
const ACTIVITY_LOG: ActivityLogEntry[] = [
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

      <AdminPageLayout>
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
          <UserProfileHeader
            user={user}
            suspended={suspended}
            onResetPassword={() => setShowResetModal(true)}
            onSuspendToggle={handleSuspendToggle}
          />

          {/* ── Two-column body ── */}
          <div className="grid grid-cols-[1fr_1.7fr] gap-5 items-start">
            {/* ── Account Information ── */}
            <UserAccountInformation user={user} />

            {/* ── Activity Log ── */}
            <UserActivityLog activities={ACTIVITY_LOG} />
          </div>
        </div>
      </AdminPageLayout>
    </>
  );
}
