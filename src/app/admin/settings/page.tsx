"use client";

import { useState } from "react";
import { Search, Users, CreditCard, Settings } from "lucide-react";
import AdminHeader from "@/components/features/admin/admin-header";
import AdminSidebar from "@/components/features/admin/admin-sidebar";
import PermissionSection, {
  Permission,
} from "@/components/features/admin/settings/permission-section";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "Admin" | "Owner" | "Staff" | "Guest";
const roles: Role[] = ["Admin", "Owner", "Staff", "Guest"];

// ─── Default permission data ──────────────────────────────────────────────────
const defaultPermissions: Record<
  Role,
  { user: Permission[]; financial: Permission[]; system: Permission[] }
> = {
  Admin: {
    user: [
      {
        key: "manage_users",
        label: "Manage Users",
        description: "Allow role to create, edit and deactivate user accounts.",
        enabled: true,
      },
      {
        key: "invite_members",
        label: "Invite Members",
        description: "Send email invitations to join the workspace.",
        enabled: true,
      },
      {
        key: "delete_accounts",
        label: "Delete Accounts",
        description: "Permanently remove users from the organization database.",
        enabled: false,
      },
    ],
    financial: [
      {
        key: "process_refunds",
        label: "Process Refunds",
        description: "Ability to issue partial or full refunds to customers.",
        enabled: true,
      },
      {
        key: "view_transactions",
        label: "View Transactions",
        description:
          "Read-only access to historical payment data and invoices.",
        enabled: true,
      },
    ],
    system: [
      {
        key: "edit_workspace",
        label: "Edit Workspace Settings",
        description: "Modify workspace name, logo, and general appearance.",
        enabled: true,
      },
      {
        key: "audit_logs",
        label: "Audit Logs",
        description: "View detailed history of all actions performed by users.",
        enabled: true,
      },
    ],
  },
  Owner: {
    user: [
      {
        key: "manage_users",
        label: "Manage Users",
        description: "Allow role to create, edit and deactivate user accounts.",
        enabled: true,
      },
      {
        key: "invite_members",
        label: "Invite Members",
        description: "Send email invitations to join the workspace.",
        enabled: true,
      },
      {
        key: "delete_accounts",
        label: "Delete Accounts",
        description: "Permanently remove users from the organization database.",
        enabled: true,
      },
    ],
    financial: [
      {
        key: "process_refunds",
        label: "Process Refunds",
        description: "Ability to issue partial or full refunds to customers.",
        enabled: true,
      },
      {
        key: "view_transactions",
        label: "View Transactions",
        description:
          "Read-only access to historical payment data and invoices.",
        enabled: true,
      },
    ],
    system: [
      {
        key: "edit_workspace",
        label: "Edit Workspace Settings",
        description: "Modify workspace name, logo, and general appearance.",
        enabled: true,
      },
      {
        key: "audit_logs",
        label: "Audit Logs",
        description: "View detailed history of all actions performed by users.",
        enabled: false,
      },
    ],
  },
  Staff: {
    user: [
      {
        key: "manage_users",
        label: "Manage Users",
        description: "Allow role to create, edit and deactivate user accounts.",
        enabled: false,
      },
      {
        key: "invite_members",
        label: "Invite Members",
        description: "Send email invitations to join the workspace.",
        enabled: true,
      },
      {
        key: "delete_accounts",
        label: "Delete Accounts",
        description: "Permanently remove users from the organization database.",
        enabled: false,
      },
    ],
    financial: [
      {
        key: "process_refunds",
        label: "Process Refunds",
        description: "Ability to issue partial or full refunds to customers.",
        enabled: false,
      },
      {
        key: "view_transactions",
        label: "View Transactions",
        description:
          "Read-only access to historical payment data and invoices.",
        enabled: true,
      },
    ],
    system: [
      {
        key: "edit_workspace",
        label: "Edit Workspace Settings",
        description: "Modify workspace name, logo, and general appearance.",
        enabled: false,
      },
      {
        key: "audit_logs",
        label: "Audit Logs",
        description: "View detailed history of all actions performed by users.",
        enabled: false,
      },
    ],
  },
  Guest: {
    user: [
      {
        key: "manage_users",
        label: "Manage Users",
        description: "Allow role to create, edit and deactivate user accounts.",
        enabled: false,
      },
      {
        key: "invite_members",
        label: "Invite Members",
        description: "Send email invitations to join the workspace.",
        enabled: false,
      },
      {
        key: "delete_accounts",
        label: "Delete Accounts",
        description: "Permanently remove users from the organization database.",
        enabled: false,
      },
    ],
    financial: [
      {
        key: "process_refunds",
        label: "Process Refunds",
        description: "Ability to issue partial or full refunds to customers.",
        enabled: false,
      },
      {
        key: "view_transactions",
        label: "View Transactions",
        description:
          "Read-only access to historical payment data and invoices.",
        enabled: false,
      },
    ],
    system: [
      {
        key: "edit_workspace",
        label: "Edit Workspace Settings",
        description: "Modify workspace name, logo, and general appearance.",
        enabled: false,
      },
      {
        key: "audit_logs",
        label: "Audit Logs",
        description: "View detailed history of all actions performed by users.",
        enabled: false,
      },
    ],
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeRole, setActiveRole] = useState<Role>("Admin");
  const [permData, setPermData] = useState(defaultPermissions);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const handleToggle = (
    section: "user" | "financial" | "system",
    key: string,
    value: boolean,
  ) => {
    setSaved(false);
    setPermData((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [section]: prev[activeRole][section].map((p) =>
          p.key === key ? { ...p, enabled: value } : p,
        ),
      },
    }));
  };

  const filter = (list: Permission[]) =>
    list.filter(
      (p) =>
        !search.trim() ||
        p.label.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    );

  const current = permData[activeRole];

  return (
    <div className="flex min-h-screen bg-[#F6F8F7]">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Right side: header + page content */}
      <div className="ml-[260px] flex-1 flex flex-col">
        {/* Fixed Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="mt-[68px] p-7 flex-1">
          <div className="max-w-[900px] w-full mx-auto flex flex-col gap-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[var(--gray-3)]">
              <span>Settings</span>
              <span className="text-[var(--gray-4)]">›</span>
              <span className="text-[var(--brand-primary)] font-semibold">
                Role Permission
              </span>
            </nav>

            {/* Page title + action buttons */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="m-0 text-2xl font-extrabold text-[var(--black-2)]">
                  Light Permission Settings
                </h1>
                <p className="m-0 mt-[6px] text-sm text-[var(--gray-3)] max-w-[440px] leading-relaxed">
                  Configure granular access control for different user roles in
                  your organization. Changes take effect on the next user login.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setPermData(defaultPermissions);
                    setSaved(false);
                  }}
                  className="px-5 py-[9px] rounded-[10px] border border-[var(--gray-5)] bg-white text-sm font-semibold text-[var(--gray-2)] cursor-pointer hover:bg-[#f9f9f9] transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => setSaved(true)}
                  className="px-5 py-[9px] rounded-[10px] bg-[var(--brand-primary)] text-white border-none text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(149,48,2,0.25)] hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Role tabs — no icons */}
            <div className="flex items-center bg-white rounded-full border border-[var(--gray-5)] p-1 shadow-sm w-full">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setActiveRole(r);
                    setSaved(false);
                    setSearch("");
                  }}
                  className={`flex-1 py-[9px] rounded-full text-sm font-semibold border-none cursor-pointer transition-colors ${
                    activeRole === r
                      ? "bg-[var(--brand-primary)] text-white shadow-sm"
                      : "bg-transparent text-[var(--gray-2)] hover:bg-[#f5f5f5]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-3 px-4 py-[11px] bg-white border border-[var(--gray-5)] rounded-[12px] shadow-sm">
              <Search
                size={15}
                className="text-[var(--gray-4)] flex-shrink-0"
              />
              <input
                type="text"
                placeholder="Search permissions (e.g. 'refunds', 'delete')…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border-none outline-none bg-transparent text-sm text-[var(--black-2)] placeholder:text-[var(--gray-4)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[var(--gray-4)] bg-transparent border-none cursor-pointer text-xs hover:text-[var(--gray-2)]"
                >
                  ✕
                </button>
              )}
              <span className="text-[11px] text-[var(--gray-4)] bg-[#f5f5f5] border border-[var(--gray-5)] rounded px-[6px] py-[2px] font-mono select-none flex-shrink-0">
                ⌘K
              </span>
            </div>

            {/* Permission sections */}
            <div className="flex flex-col gap-7">
              {filter(current.user).length > 0 && (
                <PermissionSection
                  icon={<Users size={18} />}
                  title="User Management"
                  permissions={filter(current.user)}
                  onToggle={(key, value) => handleToggle("user", key, value)}
                />
              )}
              {filter(current.financial).length > 0 && (
                <PermissionSection
                  icon={<CreditCard size={18} />}
                  title="Financial Operations"
                  permissions={filter(current.financial)}
                  onToggle={(key, value) =>
                    handleToggle("financial", key, value)
                  }
                />
              )}
              {filter(current.system).length > 0 && (
                <PermissionSection
                  icon={<Settings size={18} />}
                  title="System & Security"
                  permissions={filter(current.system)}
                  onToggle={(key, value) => handleToggle("system", key, value)}
                />
              )}
              {filter(current.user).length === 0 &&
                filter(current.financial).length === 0 &&
                filter(current.system).length === 0 && (
                  <div className="text-center py-12 text-[var(--gray-3)] text-sm">
                    No permissions match &ldquo;{search}&rdquo;
                  </div>
                )}
            </div>

            {/* Save confirmation */}
            {saved && (
              <div className="flex items-center gap-3 px-5 py-3 bg-[rgba(39,174,96,0.10)] border border-[rgba(39,174,96,0.30)] rounded-2xl text-sm font-semibold text-[#1a7a45]">
                ✅ Changes saved successfully
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
