"use client";

import { useEffect } from "react";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import TotalRevenueCard from "@/components/features/admin/dashboard/kpi-cards/total-revenue-card";
import OccupancyRateCard from "@/components/features/admin/dashboard/kpi-cards/occupancy-rate-card";
import ActiveBookingsCard from "@/components/features/admin/dashboard/kpi-cards/active-bookings-card";
import RevenueTrendChart from "@/components/features/admin/finance/revenue-trend-chart";
import RecentVerificationRequests from "@/components/features/admin/dashboard/recent-verification-requests";
import { useAdminDashboardStore } from "@/store/admin/dashboard/admin-dashboard.store";
import { Loader2 } from "lucide-react";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const {
    kpis,
    revenueTrend,
    recentVerifications,
    loading,
    error,
    fetchDashboardData,
  } = useAdminDashboardStore();

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
            {/* The component expects VerificationRequest[], our type is RecentVerification[]. They map 1:1 */}
            <RecentVerificationRequests requests={recentVerifications as any} />
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
