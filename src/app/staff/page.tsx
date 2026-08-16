"use client";

import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import StaffHeader from "@/components/staff/layout/staff-header";
import StaffDashboard from "@/components/staff/dashboard/staff-dashboard";
import { useStaffGuard } from "@/hooks/use-staff-guard";
import AccessDenied from "@/components/shared/auth/access-denied";
import { useTranslations } from 'next-intl';

import { Skeleton } from "@/components/ui/skeleton";

function StaffDashboardSkeleton() {
  return (
    <div className="flex h-screen bg-[#f8f6f5] overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-[260px] bg-white border-r border-[#e5e7eb] flex flex-col p-5 gap-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex-1 flex flex-col gap-4 mt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6">
        {/* Header Row */}
        <div className="flex justify-between items-center h-16 bg-white rounded-xl px-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-40" />
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        {/* 4 Management Cards Grid */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <Skeleton className="h-full w-full rounded-xl" />
          <Skeleton className="h-full w-full rounded-xl" />
          <Skeleton className="h-full w-full rounded-xl" />
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const t = useTranslations('StaffDashboard');
  const { ready, status, userRole } = useStaffGuard();
  
  if (status === "loading") return <StaffDashboardSkeleton />;

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
        title={t('title')}
        subtitle={`Operational Overview • ${today}`}
        searchPlaceholder="Search order #, room, or item..."
      />
      <main className="mt-[64px] flex-1 overflow-hidden">
        <StaffDashboard />
      </main>
    </StaffPageLayout>
  );
}
