"use client";

import { useState, useEffect } from "react";
import React from "react";
import { Search, Users, CreditCard, Settings, Loader2 } from "lucide-react";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import { useRBACStore } from "@/store/auth/rbac.store";
import type { Permission } from "@/api/admin/settings.api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "Admin" | "Owner" | "Staff" | "Guest";
const roles: Role[] = ["Admin", "Owner", "Staff", "Guest"];

// ─── Inlined PermissionToggle ─────────────────────────────────────────────────
function PermissionToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-[18px]">
      {/* Left: label + description */}
      <div className="flex-1 pr-8">
        <p className="m-0 text-[14px] font-semibold text-[var(--black-2)]">
          {label}
        </p>
        <p className="m-0 mt-1 text-[12.5px] text-[var(--gray-3)] leading-snug">
          {description}
        </p>
      </div>

      {/* Toggle switch — iOS style */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-[50px] h-[28px] rounded-full border-none outline-none cursor-pointer p-0 flex-shrink-0 transition-colors duration-250 ${
          enabled
            ? "bg-[#27ae60] shadow-[inset_0_1px_2px_rgba(0,0,0,0.10)]"
            : "bg-[#cbd5e0] shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
        }`}
      >
        {/* Knob */}
        <span
          className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25),_0_1px_2px_rgba(0,0,0,0.12)] transition-[left] duration-250 block ${
            enabled ? "left-[23px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Inlined PermissionSection ────────────────────────────────────────────────
function PermissionSection({
  icon,
  title,
  permissions,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  permissions: Permission[];
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--brand-primary)] flex-shrink-0">{icon}</span>
        <h3 className="m-0 text-[15px] font-bold text-[var(--black-2)]">
          {title}
        </h3>
      </div>

      {/* Permission rows card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-[var(--gray-5)]">
        {permissions.map((perm) => (
          <PermissionToggle
            key={perm.key}
            label={perm.label}
            description={perm.description}
            enabled={perm.enabled}
            onChange={(value) => onToggle(perm.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeRole, setActiveRole] = useState<Role>("Admin");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  
  // Track changes made by user before saving
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, boolean>>({});

  const {
    permissionsData,
    loading,
    actionLoading,
    fetchRolePermissions,
    updateRolePermissions
  } = useRBACStore();

  useEffect(() => {
    fetchRolePermissions(activeRole);
    setPendingUpdates({});
    setSaved(false);
  }, [activeRole, fetchRolePermissions]);

  const handleToggle = (key: string, value: boolean) => {
    setSaved(false);
    setPendingUpdates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(pendingUpdates).length === 0) return;
    
    try {
      await updateRolePermissions(activeRole, pendingUpdates);
      setPendingUpdates({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const currentDto = permissionsData[activeRole];
  const userPerms = currentDto?.permissions?.user || [];
  const financialPerms = currentDto?.permissions?.financial || [];
  const systemPerms = currentDto?.permissions?.system || [];

  // Override backend value with pending change if it exists
  const applyPending = (p: Permission) => ({
    ...p,
    enabled: pendingUpdates[p.key] !== undefined ? pendingUpdates[p.key] : p.enabled
  });

  const filter = (list: Permission[]) =>
    list
      .map(applyPending)
      .filter(
        (p) =>
          !search.trim() ||
          p.label.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      );

  return (
    <AdminPageLayout>
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
              Configure granular access control for different user roles in your
              organization. Changes take effect on the next user login.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setPendingUpdates({});
                setSaved(false);
              }}
              className="px-5 py-[9px] rounded-[10px] border border-[var(--gray-5)] bg-white text-sm font-semibold text-[var(--gray-2)] cursor-pointer hover:bg-[#f9f9f9] transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={actionLoading || Object.keys(pendingUpdates).length === 0}
              className="px-5 py-[9px] flex items-center justify-center gap-2 rounded-[10px] bg-[var(--brand-primary)] text-white border-none text-sm font-semibold cursor-pointer shadow-[0_2px_8px_rgba(149,48,2,0.25)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Role tabs */}
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
          <Search size={15} className="text-[var(--gray-4)] flex-shrink-0" />
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
          {loading ? (
            <div className="py-20 flex justify-center text-[var(--brand-primary)]">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : !currentDto ? (
            <div className="py-20 text-center text-[var(--gray-3)] text-sm">
              Failed to load permissions.
            </div>
          ) : (
            <>
              {filter(userPerms).length > 0 && (
                <PermissionSection
                  icon={<Users size={18} />}
                  title="User Management"
                  permissions={filter(userPerms)}
                  onToggle={handleToggle}
                />
              )}
              {filter(financialPerms).length > 0 && (
                <PermissionSection
                  icon={<CreditCard size={18} />}
                  title="Financial Operations"
                  permissions={filter(financialPerms)}
                  onToggle={handleToggle}
                />
              )}
              {filter(systemPerms).length > 0 && (
                <PermissionSection
                  icon={<Settings size={18} />}
                  title="System & Security"
                  permissions={filter(systemPerms)}
                  onToggle={handleToggle}
                />
              )}
              {filter(userPerms).length === 0 &&
                filter(financialPerms).length === 0 &&
                filter(systemPerms).length === 0 && (
                  <div className="text-center py-12 text-[var(--gray-3)] text-sm">
                    No permissions match &ldquo;{search}&rdquo;
                  </div>
                )}
            </>
          )}
        </div>

        {/* Save confirmation */}
        {saved && (
          <div className="flex items-center gap-3 px-5 py-3 bg-[rgba(39,174,96,0.10)] border border-[rgba(39,174,96,0.30)] rounded-2xl text-sm font-semibold text-[#1a7a45]">
            ✅ Changes saved successfully
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
