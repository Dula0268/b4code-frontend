"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAnalyticsStore } from "@/store/admin/analytics/admin-analytics.store";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BedDouble,
  CalendarCheck,
  ArrowRight,
  Building2,
  Users,
  BadgeDollarSign,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayload {
  payload: { month: string };
  value: number;
}
interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg border border-[#F0EBE7] shadow-md">
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">
          {payload[0].payload.month}
        </p>
        <p className="text-[13px] font-medium text-[#C05621]">
          LKR {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Occupancy Ring ───────────────────────────────────────────────────────────
function OccupancyRing({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={130} height={130} className="block">
      <circle cx={65} cy={65} r={r} fill="none" stroke="#F0EBE7" strokeWidth={12} />
      <circle
        cx={65}
        cy={65}
        r={r}
        fill="none"
        stroke="#2D7D5C"
        strokeWidth={12}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
      />
      <text x={65} y={65} textAnchor="middle" dominantBaseline="middle" fontSize={20} fontWeight={700} fill="#1A1A1A">
        {pct}%
      </text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlatformAnalyticsPage() {
  const router = useRouter();
  const { platformAnalytics, platformSummary, bookingsChart, loading, error, fetchAnalyticsData } = useAdminAnalyticsStore();

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading && !platformAnalytics) {
    return (
      <AdminPageLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin text-[var(--brand-primary)]" size={40} />
        </div>
      </AdminPageLayout>
    );
  }

  const formatCurrency = (val: number | undefined) => 
    val !== undefined ? val.toLocaleString() : "0";

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight m-0">
            Platform Performance
          </h1>
          <p className="text-[13px] text-[#9E7B6A] mt-1">
            Real-time insights across your luxury property network.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* ── Row 1: Gross Booking Value Chart + Net Revenue ── */}
        <div className="flex gap-5">
          {/* Gross Booking Value Chart */}
          <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase mb-1">
                  Gross Booking Value
                </p>
                <p className="text-[34px] font-bold text-[#C05621] leading-none m-0">
                  LKR {formatCurrency(platformAnalytics?.grossBookingValue)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[12px] font-semibold ${
                (platformAnalytics?.grossBookingValueChangePct ?? 0) >= 0 
                  ? "bg-[#E6F5EF] text-[#2D7D5C]" 
                  : "bg-red-50 text-red-600"
              }`}>
                {(platformAnalytics?.grossBookingValueChangePct ?? 0) > 0 ? "+" : ""}
                {platformAnalytics?.grossBookingValueChangePct ?? 0}% vs last mo
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={bookingsChart}
                margin={{ top: 10, right: 0, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C05621" stopOpacity={0.13} />
                    <stop offset="100%" stopColor="#C05621" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="#F0EBE7"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="transparent"
                  tick={{ fill: "#9E7B6A", fontSize: 12, fontWeight: 400 }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "#9E7B6A", fontSize: 12, fontWeight: 400 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#E8DDD8", strokeWidth: 1 }}
                />
                <Area
                  type="natural"
                  dataKey="value"
                  stroke="#C05621"
                  strokeWidth={2.5}
                  fill="url(#bookingGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#C05621", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Net Revenue */}
          <div className="w-[220px] bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col justify-center gap-3 border-l-4 border-l-[#2D7D5C]">
            <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
              Net Revenue
            </p>
            <p className="text-[28px] font-bold text-[#1A1A1A] leading-none m-0">
              LKR {formatCurrency(platformAnalytics?.netRevenue)}
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} color="#27ae60" />
              <span className="text-[12px] font-medium text-[#9E7B6A]">
                After {platformAnalytics?.commissionRate ?? 20}% commission
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Occupancy Rate + Avg Daily Rate + RevPAR ── */}
        <div className="flex gap-5">
          {/* Occupancy Rate */}
          <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col items-center gap-4">
            <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase self-start">
              Occupancy Rate
            </p>
            <OccupancyRing pct={platformAnalytics?.occupancyRate ?? 0} />
            <p className="text-[12px] text-[#9E7B6A] text-center leading-snug">
              Current active stays across all regions
            </p>
          </div>

          {/* Avg Daily Rate */}
          <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <BedDouble size={20} color="#C05621" />
              </div>
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                Avg. Daily Rate
              </p>
            </div>
            <p className="text-[36px] font-bold text-[#1A1A1A] leading-none m-0">
              LKR {formatCurrency(platformAnalytics?.avgDailyRate)}
            </p>
            <div>
              <div className="h-2 rounded-full bg-[#F0EBE7] overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-[#C05621]"
                  style={{ width: `${Math.min(100, ((platformAnalytics?.avgDailyRate ?? 0) / (platformAnalytics?.avgDailyRateGoal || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-[12px] text-[#9E7B6A]">Goal: LKR {formatCurrency(platformAnalytics?.avgDailyRateGoal)}/night</p>
            </div>
          </div>

          {/* RevPAR — clickable, dark brown */}
          <div
            className="flex-1 bg-[#7B2504] rounded-2xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-[#8B2905] transition-colors"
            onClick={() => router.push("/admin/analytics/revpar")}
          >
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[rgba(255,255,255,0.7)] uppercase m-0">
                RevPAR
              </p>
              <p className="text-[36px] font-bold text-white leading-none mt-2 mb-0">
                LKR {formatCurrency(platformAnalytics?.revpar)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <p className="text-[12px] text-[rgba(255,255,255,0.75)]">
                Click to see room-wise breakdown
              </p>
              <ArrowRight size={18} color="white" />
            </div>
          </div>
        </div>

        {/* ── Row 3: Stat Cards ── */}
        <div className="grid grid-cols-4 gap-5">
          {/* Avg Lead Time */}
          <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Clock size={14} color="#9E7B6A" />
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                Avg. Lead Time
              </p>
            </div>
            <p className="text-[30px] font-bold text-[#1A1A1A] leading-none m-0">
              {platformSummary?.avgLeadTimeDays ?? 0} <span className="text-[16px] font-normal text-[#9E7B6A]">days</span>
            </p>
            <div className="flex items-center gap-1">
              {(platformSummary?.avgLeadTimeChange ?? 0) <= 0 ? (
                <TrendingDown size={13} color="#27ae60" />
              ) : (
                <TrendingUp size={13} color="#EB5757" />
              )}
              <span className="text-[12px] text-[#6B7280]">
                {platformSummary?.avgLeadTimeChange ?? 0} days from last week
              </span>
            </div>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <XCircle size={14} color="#9E7B6A" />
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                Cancellation Rate
              </p>
            </div>
            <p className="text-[30px] font-bold text-[#EB5757] leading-none m-0">
              {platformSummary?.cancellationRate ?? 0}%
            </p>
            <div className="h-[2px] w-12 rounded bg-[#EB5757]" />
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} color="#9E7B6A" />
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                Total Bookings
              </p>
            </div>
            <p className="text-[30px] font-bold text-[#1A1A1A] leading-none m-0">
              {formatCurrency(platformSummary?.totalBookings)}
            </p>
          </div>

          {/* Active Bookings */}
          <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} color="#9E7B6A" />
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                Active Bookings
              </p>
            </div>
            <p className="text-[30px] font-bold text-[#1A1A1A] leading-none m-0">
              {formatCurrency(platformSummary?.activeBookings)}
            </p>
          </div>
        </div>

        {/* ── Row 4: New Listings + Registered Users + Platform Commission ── */}
        <div className="flex gap-5">
          {/* New Listings */}
          <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0EBE7] flex items-center justify-center flex-shrink-0">
              <Building2 size={22} color="#C05621" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0 mb-1">
                New Listings
              </p>
              <p className="text-[28px] font-bold text-[#1A1A1A] leading-none m-0">
                {formatCurrency(platformSummary?.newListingsThisWeek)}
              </p>
              <p className="text-[12px] text-[#9E7B6A] mt-0.5">
                Properties onboarding this week
              </p>
            </div>
          </div>

          {/* Registered Users */}
          <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0EBE7] flex items-center justify-center flex-shrink-0">
              <Users size={22} color="#C05621" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0 mb-1">
                Registered Users
              </p>
              <p className="text-[28px] font-bold text-[#1A1A1A] leading-none m-0">
                {formatCurrency(platformSummary?.registeredUsers)}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp size={12} color="#27ae60" />
                <p className="text-[12px] text-[#27ae60] m-0">↑ {platformSummary?.registeredUsersGrowthPct ?? 0}% this month</p>
              </div>
            </div>
          </div>

          {/* Platform Commission */}
          <div className="flex-1 bg-[#2D4A3E] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <BadgeDollarSign size={16} color="rgba(255,255,255,0.7)" />
              <p className="text-[11px] font-semibold tracking-widest text-[rgba(255,255,255,0.7)] uppercase m-0">
                Platform Commission
              </p>
            </div>
            <p className="text-[34px] font-bold text-white leading-none m-0 mt-3">
              LKR {formatCurrency(platformSummary?.platformCommission)}
            </p>
            <div className="mt-4 flex items-center gap-2 bg-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2 w-fit">
              <span className="w-4 h-4 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                <span className="block w-2 h-1.5 border-b-2 border-r-2 border-white rotate-45 -translate-y-px" />
              </span>
              <p className="text-[12px] text-white m-0">Payout scheduled for 1st Oct</p>
            </div>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
