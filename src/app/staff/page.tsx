"use client";

import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import StaffHeader from "@/components/features/staff/layout/staff-header";
import StaffDashboard from "@/components/features/staff/dashboard/staff-dashboard";
import { useStaffGuard } from "@/hooks/use-staff-guard";
import AccessDenied from "@/components/shared/auth/access-denied";

export default function StaffPage() {
  const { ready, status, userRole } = useStaffGuard();
  
  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Staff" />;
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <StaffPageLayout>
      <StaffHeader
        title="Staff Dashboard"
        subtitle={`Operational Overview • ${today}`}
        searchPlaceholder="Search order #, room, or item..."
      />
      <main className="mt-[72px] flex-1">
        <StaffDashboard />
      </main>
    </StaffPageLayout>
  );
}
