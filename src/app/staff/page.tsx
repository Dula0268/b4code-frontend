"use client";

import StaffHeader from "@/components/staff/layout/staff-header";
import StaffDashboard from "@/components/staff/dashboard/staff-dashboard";
import { useStaffGuard } from "@/hooks/use-staff-guard";
import AccessDenied from "@/components/shared/auth/access-denied";
import { useTranslations } from 'next-intl';

import { Skeleton } from "@/components/ui/skeleton";

function StaffDashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 bg-[#F8F9FA] mt-[64px]">
      <Skeleton className="h-24 bg-white rounded-3xl border border-[#E8EAED] w-full" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[65%] flex flex-col gap-6">
          <Skeleton className="h-[400px] bg-white rounded-3xl border border-[#E8EAED]" />
        </div>
        <div className="lg:w-[35%] flex flex-col gap-6">
          <Skeleton className="h-[250px] bg-white rounded-3xl border border-[#E8EAED]" />
          <Skeleton className="h-[200px] bg-white rounded-3xl border border-[#E8EAED]" />
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
    <>
      <StaffHeader
        title={t('title')}
        subtitle={`Operational Overview • ${today}`}
        searchPlaceholder="Search order #, room, or item..."
      />
      <main className="mt-[64px] flex-1 overflow-hidden">
        <StaffDashboard />
      </main>
    </>
  );
}
