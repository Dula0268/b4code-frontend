"use client";

import OwnerHeader from "@/components/owner/layout/owner-header";
import OwnerDashboard from "@/components/owner/dashboard/owner-dashboard";
import { useOwnerGuard } from "@/hooks/use-owner-guard";
import AccessDenied from "@/components/shared/auth/access-denied";

import { Skeleton } from "@/components/ui/skeleton";

function OwnerDashboardSkeleton() {
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

export default function OwnerPage() {
  const { ready, status, userRole } = useOwnerGuard();
  
  if (status === "loading") return <OwnerDashboardSkeleton />;

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Owner" />;
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <OwnerHeader
        title="Owner Dashboard"
        subtitle={`Portfolio Overview • ${today}`}
      />
      <main className="mt-[64px] flex-1 min-h-0 overflow-hidden flex flex-col">
        <OwnerDashboard />
      </main>
    </>
  );
}
