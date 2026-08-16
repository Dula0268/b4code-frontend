"use client";

import { useEffect } from "react";
import StaffSidebar from "@/components/staff/layout/staff-sidebar";
import RoleGuard from "@/components/shared/auth/role-guard";
import { useAuthStore } from "@/store/auth/auth.store";
import { useRBACStore } from "@/store/auth/rbac.store";
import StaffGlobalOrdersProvider from "./staff-global-orders";
interface StaffPageLayoutProps {
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

export default function StaffPageLayout({ children }: StaffPageLayoutProps) {
  return (
    <RoleGuard allowedRoles={["staff", "admin", "owner"]}>
      <PermissionLoader />
      <div className="flex h-screen overflow-hidden bg-[#FAFBFC]">
        {/* Fixed Sidebar */}
        <StaffSidebar />

        {/* Right side: header + page content */}
        <div className="ml-[260px] flex-1 flex flex-col h-full overflow-hidden bg-[#F5F6F8]">
          {children}
        </div>

        {/* Global Staff Orders Notification Provider */}
        <StaffGlobalOrdersProvider />
      </div>
    </RoleGuard>
  );
}

