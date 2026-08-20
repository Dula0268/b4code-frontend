"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAnalyticsStore } from "@/store/admin/analytics/admin-analytics.store";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
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

// ─── Gross Booking Value Chart Data ───────────────────────────────────────────
const bookingData = [
  { month: "Jan", value: 820000 },
  { month: "Feb", value: 940000 },
  { month: "Mar", value: 680000 },
  { month: "Apr", value: 1050000 },
  { month: "May", value: 780000 },
  { month: "Jun", value: 1100000 },
  { month: "Jul", value: 1284500 },
  { month: "Aug", value: 960000 },
  { month: "Sep", value: 840000 },
  { month: "Oct", value: 1020000 },
  { month: "Nov", value: 1180000 },
  { month: "Dec", value: 1090000 },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayload {
  payload: { month: string; value: number; netRevenue: number };
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
        <p className="text-[13px] font-semibold text-[#1A1A1A] mb-2">
          {payload[0].payload.month}
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-[#C05621] m-0">
            Gross: LKR {payload[0].payload.value?.toLocaleString() || '0'}
          </p>
          <p className="text-[13px] font-medium text-[#2D7D5C] m-0">
            Net: LKR {payload[0].payload.netRevenue?.toLocaleString() || '0'}
          </p>
        </div>
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
        {Number.isInteger(pct) ? pct : pct.toFixed(1)}%
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
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D7D5C" stopOpacity={0.13} />
                    <stop offset="100%" stopColor="#2D7D5C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8DDD8"
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
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9E7B6A', right: 0 }} />
                <Area
                  name="Gross Booking Value"
                  type="natural"
                  dataKey="value"
                  stroke="#C05621"
                  strokeWidth={2.5}
                  fill="url(#bookingGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#C05621", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area
                  name="Net Revenue"
                  type="natural"
                  dataKey="netRevenue"
                  stroke="#2D7D5C"
                  strokeWidth={2.5}
                  fill="url(#netGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#2D7D5C", stroke: "#fff", strokeWidth: 2 }}
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

        {/* ── Row 3 & 4: KPI Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Avg Lead Time */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="p-2.5 bg-[#F8F6F5] rounded-xl self-start group-hover:scale-110 transition-transform">
              <Clock size={18} className="text-[#9E7B6A]" />
            </div>
            <div className="mt-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Avg. Lead Time</h3>
              <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
                {platformSummary?.avgLeadTimeDays ?? 0} <span className="text-[14px] font-medium text-[#9E7B6A]">days</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {(platformSummary?.avgLeadTimeChange ?? 0) <= 0 ? (
                  <TrendingDown size={14} color="#27ae60" />
                ) : (
                  <TrendingUp size={14} color="#EB5757" />
                )}
                <span className="text-[12px] font-medium text-[#6B7280]">
                  {platformSummary?.avgLeadTimeChange ?? 0} days from last week
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(235,87,87,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#EB5757] opacity-[0.04] blur-2xl rounded-full group-hover:scale-150 group-hover:opacity-[0.08] transition-all duration-700" />
            <div className="p-2.5 bg-red-50 rounded-xl self-start group-hover:scale-110 transition-transform z-10">
              <XCircle size={18} className="text-[#EB5757]" />
            </div>
            <div className="mt-4 z-10">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Cancel Rate</h3>
              <p className="text-[24px] font-bold text-[#EB5757] tracking-tight m-0">
                {platformSummary?.cancellationRate ?? 0}%
              </p>
              <div className="h-[3px] w-full rounded-full bg-[#F0EBE7] overflow-hidden mt-2.5">
                <div className="h-full rounded-full bg-[#EB5757]" style={{ width: `${platformSummary?.cancellationRate ?? 0}%` }} />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="p-2.5 bg-[#F8F6F5] rounded-xl self-start group-hover:scale-110 transition-transform">
              <CalendarCheck size={18} className="text-[#9E7B6A]" />
            </div>
            <div className="mt-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Total Bookings</h3>
              <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
                {formatCurrency(platformSummary?.totalBookings)}
              </p>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(45,125,92,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="p-2.5 bg-[#E6F5EF] rounded-xl self-start group-hover:scale-110 transition-transform">
              <CalendarCheck size={18} className="text-[#2D7D5C]" />
            </div>
            <div className="mt-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Active Bookings</h3>
              <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
                {formatCurrency(platformSummary?.activeBookings)}
              </p>
            </div>
          </div>

          {/* Total Properties */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="p-2.5 bg-[#F8F6F5] rounded-xl self-start group-hover:scale-110 transition-transform">
              <Building2 size={18} className="text-[#1A1A1A]" />
            </div>
            <div className="mt-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Total Properties</h3>
              <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
                {formatCurrency(platformSummary?.totalProperties)}
              </p>
              <p className="text-[12px] font-medium text-[#9E7B6A] mt-1 m-0">Properties on platform</p>
            </div>
          </div>

          {/* New Listings */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(192,86,33,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="p-2.5 bg-[#FFF8F0] rounded-xl self-start group-hover:scale-110 transition-transform">
              <Building2 size={18} className="text-[#C05621]" />
            </div>
            <div className="mt-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">New Listings</h3>
              <p className="text-[24px] font-bold text-[#C05621] tracking-tight m-0">
                {formatCurrency(platformSummary?.newListingsThisWeek)}
              </p>
              <p className="text-[12px] font-medium text-[#9E7B6A] mt-1 m-0">Onboarded this week</p>
            </div>
          </div>

          {/* Registered Users */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="p-2.5 bg-[#F8F6F5] rounded-xl self-start group-hover:scale-110 transition-transform">
              <Users size={18} className="text-[#1A1A1A]" />
            </div>
            <div className="mt-4">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Registered Users</h3>
              <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
                {formatCurrency(platformSummary?.registeredUsers)}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp size={14} color="#27ae60" />
                <span className="text-[12px] font-medium text-[#27ae60]">
                  ↑ {platformSummary?.registeredUsersGrowthPct ?? 0}% this month
                </span>
              </div>
            </div>
          </div>

          {/* Platform Commission (Hero Style) */}
          <div className="bg-gradient-to-br from-[#1A5039] to-[#2D7D5C] rounded-3xl p-6 shadow-[0_8px_30px_rgb(45,125,92,0.3)] hover:shadow-[0_12px_40px_rgb(45,125,92,0.4)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <BadgeDollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700" />
            
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl self-start border border-white/20">
              <BadgeDollarSign size={18} className="text-white" />
            </div>
            <div className="mt-4 z-10">
              <h3 className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase mb-1">Platform Commission</h3>
              <p className="text-[24px] font-bold text-white tracking-tight m-0 truncate">
                LKR {formatCurrency(platformSummary?.platformCommission)}
              </p>
              <div className="mt-2.5 flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1.5 w-fit border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] shadow-[0_0_8px_rgba(76,175,80,0.8)]" />
                <p className="text-[10px] font-semibold tracking-wider text-white uppercase m-0">Payout 1st Oct</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
