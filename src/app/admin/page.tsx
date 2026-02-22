"use client";

import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import TotalRevenueCard from "@/components/features/admin/dashboard/kpi-cards/total-revenue-card";
import OccupancyRateCard from "@/components/features/admin/dashboard/kpi-cards/occupancy-rate-card";
import ActiveBookingsCard from "@/components/features/admin/dashboard/kpi-cards/active-bookings-card";
import RevenueTrendChart from "@/components/features/admin/finance/revenue-trend-chart";
import RecentVerificationRequests, {
  type VerificationRequest,
} from "@/components/features/admin/dashboard/recent-verification-requests";

// ─── Static Data ──────────────────────────────────────────────────────────────
const RECENT_VERIFICATIONS: VerificationRequest[] = [
  {
    id: "1",
    name: "Sunny Villa",
    entityId: "#PROP-8291",
    type: "Property Verification",
    dateSubmitted: "Oct 24, 2023",
    status: "Pending",
    action: "Review",
    icon: "property",
  },
  {
    id: "3",
    name: "Downtown Loft",
    entityId: "#PROP-1120",
    type: "Property Verification",
    dateSubmitted: "Oct 22, 2023",
    status: "Rejected",
    action: "View",
    icon: "property",
  },
  {
    id: "5",
    name: "Ocean Breeze Suite",
    entityId: "#PROP-3345",
    type: "Property Verification",
    dateSubmitted: "Oct 20, 2023",
    status: "Pending",
    action: "Review",
    icon: "property",
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Page Title ── */}
        <h1 className="text-[22px] font-bold text-[var(--black-2)] m-0">
          Dashboard Overview
        </h1>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-3 gap-5">
          <TotalRevenueCard
            value="LKR 1,200,000"
            change="+12%"
            positive={true}
          />
          <OccupancyRateCard value="82%" change="+4%" positive={true} />
          <ActiveBookingsCard value="1,240" change="-1%" positive={false} />
        </div>

        {/* ── Revenue Trend Chart ── */}
        <RevenueTrendChart />

        {/* ── Recent Verification Requests ── */}
        <RecentVerificationRequests requests={RECENT_VERIFICATIONS} />
      </div>
    </AdminPageLayout>
  );
}
