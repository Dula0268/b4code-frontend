"use client";

import React from "react";
import PermissionToggle from "@/components/features/admin/settings/permission-toggle";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Permission {
    key: string;
    label: string;
    description: string;
    enabled: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PermissionSectionProps {
    /** Lucide icon or any React node shown before the title */
    icon: React.ReactNode;
    /** Section heading e.g. "User Management" */
    title: string;
    /** List of permission items */
    permissions: Permission[];
    /** Fires when a toggle is clicked — receives the permission key + new value */
    onToggle: (key: string, value: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PermissionSection({
    icon,
    title,
    permissions,
    onToggle,
}: PermissionSectionProps) {
    return (
        <div className="flex flex-col gap-3">
            {/* Section heading */}
            <div className="flex items-center gap-2">
                <span className="text-[var(--brand-primary)] flex-shrink-0">{icon}</span>
                <h3 className="m-0 text-[15px] font-bold text-[var(--black-2)]">
                    {title}
                </h3>
            </div>

            {/* Permission rows card — uses PermissionToggle for each row */}
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
