"use client";

import { useEffect } from "react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import TotalRevenueCard from "@/components/features/admin/dashboard/kpi-cards/total-revenue-card";
import OccupancyRateCard from "@/components/features/admin/dashboard/kpi-cards/occupancy-rate-card";
import ActiveBookingsCard from "@/components/features/admin/dashboard/kpi-cards/active-bookings-card";
import RevenueTrendChart from "@/components/features/admin/finance/revenue-trend-chart";
import RecentVerificationRequests, {
  type VerificationRequest,
} from "@/components/features/admin/dashboard/recent-verification-requests";
import { useAdminDashboardStore } from "@/store/admin/dashboard/admin-dashboard.store";
import type { RecentVerification } from "@/api/admin/dashboard.api";
import { Loader2 } from "lucide-react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import AccessDenied from "@/components/shared/auth/access-denied";

// ─── Helper Functions ─────────────────────────────────────────────────────────
const mapToVerificationRequest = (
  v: RecentVerification,
): VerificationRequest => ({
  id: v.id,
  name: v.name,
  entityId: v.entityId,
  type: v.type,
  dateSubmitted: v.dateSubmitted,
  status: (v.status as "Pending" | "Verified" | "Rejected") || "Pending",
  action: (v.action as "Review" | "View") || "Review",
  icon: (v.icon === "user" ? "user" : "property") as "property" | "user",
});

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { ready, status, userRole } = useAdminGuard();
  const { kpis, recentVerifications, loading, error, fetchDashboardData } =
    useAdminDashboardStore();

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Admin" />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Page Title ── */}
        <h1 className="text-[22px] font-bold text-[#1A1A1A] m-0">
          Dashboard Overview
        </h1>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading && !kpis ? (
          <div className="flex justify-center items-center py-20">
            <Loader2
              className="animate-spin text-(--brand-primary)"
              size={32}
            />
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-3 gap-5">
              <TotalRevenueCard
                value={kpis?.totalRevenue.value ?? "LKR 0"}
                change={kpis?.totalRevenue.change ?? "0%"}
                positive={kpis?.totalRevenue.positive ?? true}
              />
              <OccupancyRateCard
                value={kpis?.occupancyRate.value ?? "0%"}
                change={kpis?.occupancyRate.change ?? "0%"}
                positive={kpis?.occupancyRate.positive ?? true}
              />
              <ActiveBookingsCard
                value={kpis?.activeBookings.value ?? "0"}
                change={kpis?.activeBookings.change ?? "0%"}
                positive={kpis?.activeBookings.positive ?? true}
              />
            </div>

            {/* ── Revenue Trend Chart ── */}
            <RevenueTrendChart />

            {/* ── Recent Verification Requests ── */}
            <RecentVerificationRequests
              requests={recentVerifications.map(mapToVerificationRequest)}
            />
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
