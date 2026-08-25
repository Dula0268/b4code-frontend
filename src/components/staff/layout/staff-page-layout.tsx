"use client";

import { useEffect } from "react";
import StaffSidebar from "@/components/staff/layout/staff-sidebar";
import RoleGuard from "@/components/shared/auth/role-guard";
import { useAuthStore } from "@/store/auth/auth.store";
import { useRBACStore } from "@/store/auth/rbac.store";
import StaffGlobalOrdersProvider from "./staff-global-orders";
import ConnectionStatusBanner from "./connection-status";
import { useStaffBookingsStore } from "@/store/staff/bookings/staff-bookings.store";

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

function BookingsSseLoader() {
  const { user } = useAuthStore();
  const { setupSse, stopSse } = useStaffBookingsStore();

  useEffect(() => {
    const propertyId = user?.propertyId || localStorage.getItem("selected_property_id");
    if (!propertyId) return;

    setupSse(Number(propertyId));

    return () => {
      stopSse();
    };
  }, [user, setupSse, stopSse]);

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
        <div className="ml-0 lg:ml-[260px] flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#F5F6F8]">
          {/*
            The shell is h-screen / overflow-hidden, so something inside it has to
            own the vertical scroll. This wrapper is that scroll container.
            `min-h-0` is the load-bearing part: a flex item defaults to
            min-height:auto and refuses to shrink below its content, which is what
            silently disabled scrolling across the staff pages.
          */}
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Persistent connection / data-freshness indicator (visible on mobile too) */}
        <ConnectionStatusBanner />

        {/* Global Staff Orders Notification Provider */}
        <StaffGlobalOrdersProvider />

        {/* Global Bookings SSE Loader for Badges */}
        <BookingsSseLoader />
      </div>
    </RoleGuard>
  );
}

