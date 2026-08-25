"use client";

import { useEffect } from "react";
import OwnerSidebar from "@/components/owner/layout/owner-sidebar";
import OwnerHeader from "@/components/owner/layout/owner-header";
import RoleGuard from "@/components/shared/auth/role-guard";
import { useAuthStore } from "@/store/auth/auth.store";
import { useRBACStore } from "@/store/auth/rbac.store";

interface OwnerPageLayoutProps {
  children: React.ReactNode;
}

function PermissionLoader() {
  const { user } = useAuthStore();
  const { permissionsData, loading, fetchMyPermissions } = useRBACStore();

  useEffect(() => {
    if (!user?.role || loading) return;
    const role = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();
    if (!permissionsData[role]) {
      fetchMyPermissions(role);
    }
  }, [user, permissionsData, loading, fetchMyPermissions]);

  return null;
}

export default function OwnerPageLayout({ children }: OwnerPageLayoutProps) {
  return (
    <RoleGuard allowedRoles={["owner"]}>
      <PermissionLoader />
      {/* Full screen container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          backgroundColor: '#FAFBFC',
        }}
      >
        {/* Sidebar: Fixed 260px on left */}
        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 260,
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRight: '1px solid #e0e0e0',
            zIndex: 0,
          }}
        >
          <OwnerSidebar />
        </aside>

        {/* Content: Positioned absolutely from 260px to right edge */}
        <main
          style={{
            position: 'fixed',
            left: 260,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#F5F6F8',
            zIndex: 1,
          }}
        >
          <OwnerHeader />
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
