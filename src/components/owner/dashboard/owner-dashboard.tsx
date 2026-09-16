"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  CalendarCheck,
  Activity,
  Building,
  UtensilsCrossed,
  Star,
  Trophy,
  CalendarRange,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { ownerReservationApi, OwnerReservationDto } from "@/api/owner/owner-reservation.api";
import { ownerPropertyApi } from "@/api/owner/property.api";
import { analyticsApi, TopMenuItem } from "@/api/staff/analytics.api";
import { OwnerProperty } from "@/models/owner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthName(monthIndex: number): string {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
}

function getLast6Months(): { label: string; year: number; month: number }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ label: getMonthName(d.getMonth()), year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return result;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `LKR ${(value / 1_000).toFixed(1)}k`;
  return `LKR ${value.toFixed(2)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint {
  month: string;
  roomRevenue: number;
  foodRevenue: number;
}

interface BestProperty {
  name: string;
  revenue: number;
  bookingCount: number;
  rating?: number;
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────

interface TpPayload {
  name: string;
  value: number;
  color: string;
}
interface TpProps {
  active?: boolean;
  payload?: TpPayload[];
  label?: string;
}
function RevenueTooltip({ active, payload, label }: TpProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-3 rounded-xl border border-[#E8EAED] shadow-lg">
      <p className="text-[13px] font-bold text-[#1A1A1A] mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[12px] font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
}
function KpiCard({ title, value, subtitle, icon, iconBg, loading }: KpiCardProps) {
  // Extract base color for the background blob effect (removing opacity modifiers)
  const baseColorClass = iconBg.split('/')[0].replace(/\[rgba.*\]/, 'bg-[var(--brand-primary)]');
  
  return (
    <div className="group relative bg-gradient-to-br from-white to-[#FDFCFB] rounded-3xl border border-[#E8DDD8] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(149,48,2,0.06)] hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden">
      {/* Decorative subtle background blob */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500 blur-2xl ${baseColorClass}`} />
      
      <div className="relative z-10">
        <div className="flex flex-row items-center justify-between mb-5">
          <h3 className="text-[13px] font-bold text-[#8C7A73] group-hover:text-[#4A3F3A] transition-colors uppercase tracking-wider">{title}</h3>
          <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${iconBg} shadow-inner group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
        </div>
        <div>
          {loading ? (
            <>
              <Skeleton className="h-8 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </>
          ) : (
            <>
              <div className="text-[32px] font-black text-[#1A1A1A] tracking-tight leading-none mb-2">{value}</div>
              <p className="text-[13px] font-medium text-[#9E7B6A] flex items-center gap-1.5 opacity-90">
                {subtitle}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingFood, setLoadingFood] = useState(true);

  // KPI values
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeProperties, setActiveProperties] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [foodRevenueMtd, setFoodRevenueMtd] = useState(0);

  // Chart
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  // Right-side cards
  const [bestProperty, setBestProperty] = useState<BestProperty | null>(null);
  const [topItems, setTopItems] = useState<TopMenuItem[]>([]);

  // Seasonal
  const [peakMonth, setPeakMonth] = useState<string | null>(null);
  const [offPeakMonth, setOffPeakMonth] = useState<string | null>(null);
  const [hasSeasonalData, setHasSeasonalData] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    async function fetchAll() {
      // ── 1. Reservations ──
      try {
        const reservations: OwnerReservationDto[] = await ownerReservationApi.getAllReservations();

        const confirmed = reservations.filter(
          (r) => r.status === "CONFIRMED" || r.status === "CHECKED_IN" || r.status === "CHECKED_OUT"
        );
        setTotalBookings(confirmed.length);

        // MTD room revenue
        const mtdRoom = confirmed
          .filter((r) => r.createdAt && r.createdAt >= startOfMonth)
          .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0);

        // Revenue chart — last 6 months from reservations
        const months = getLast6Months();
        const roomByMonth: Record<string, number> = {};
        months.forEach((m) => (roomByMonth[m.label] = 0));

        confirmed.forEach((r) => {
          if (!r.createdAt) return;
          const d = new Date(r.createdAt);
          const label = getMonthName(d.getMonth());
          const monthEntry = months.find(
            (m) => m.label === label && m.year === d.getFullYear()
          );
          if (monthEntry) {
            roomByMonth[label] = (roomByMonth[label] || 0) + (parseFloat(r.totalAmount) || 0);
          }
        });

        // Build chart array (will be merged with food later)
        const partial: ChartPoint[] = months.map((m) => ({
          month: m.label,
          roomRevenue: Math.round(roomByMonth[m.label] || 0),
          foodRevenue: 0,
        }));
        setChartData(partial);

        // Best property by revenue this month
        const propRevMap: Record<number, { name: string; revenue: number; count: number }> = {};
        confirmed
          .filter((r) => r.createdAt && r.createdAt >= startOfMonth)
          .forEach((r) => {
            if (!propRevMap[r.propertyId]) {
              propRevMap[r.propertyId] = { name: r.propertyName, revenue: 0, count: 0 };
            }
            propRevMap[r.propertyId].revenue += parseFloat(r.totalAmount) || 0;
            propRevMap[r.propertyId].count += 1;
          });

        const best = Object.values(propRevMap).sort((a, b) => b.revenue - a.revenue)[0];
        if (best) {
          setBestProperty({ name: best.name, revenue: best.revenue, bookingCount: best.count });
        }

        // Seasonal trends — find peak/off-peak from last 6 months room data
        const monthLabels = months.map((m) => m.label);
        if (monthLabels.some((l) => (roomByMonth[l] || 0) > 0)) {
          const sorted = [...monthLabels].sort(
            (a, b) => (roomByMonth[b] || 0) - (roomByMonth[a] || 0)
          );
          setPeakMonth(sorted[0]);
          setOffPeakMonth(sorted[sorted.length - 1]);
          setHasSeasonalData(true);
        }

        setTotalRevenue(mtdRoom); // will be updated once food loads
        setLoadingKpi(false);
        setLoadingChart(false);
      } catch {
        setLoadingKpi(false);
        setLoadingChart(false);
      }

      // ── 2. Properties ──
      try {
        const page = await ownerPropertyApi.listProperties({ size: 100 });
        const props: OwnerProperty[] = page.properties;
        const active = props.filter((p) => p.status === "ACTIVE");
        setActiveProperties(active.length);

        // Avg rating across properties
        const rated = props.filter((p) => typeof p.rating === "number" && (p.rating as number) > 0);
        if (rated.length > 0) {
          const avg = rated.reduce((s, p) => s + (p.rating as number), 0) / rated.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      } catch {
        // graceful degradation
      }

      // ── 3. Food analytics — try across all properties ──
      setLoadingFood(true);
      try {
        const page = await ownerPropertyApi.listProperties({ size: 100 });
        const props: OwnerProperty[] = page.properties;
        const now2 = new Date();
        const startDate = new Date(now2.getFullYear(), now2.getMonth(), 1)
          .toISOString()
          .slice(0, 10);
        const endDate = now2.toISOString().slice(0, 10);

        let totalFoodMtd = 0;
        const allTopItems: Record<string, { menuItemId: number; name: string; volume: number; revenue: number }> = {};

        // Fetch per-property food data in parallel
        await Promise.allSettled(
          props.map(async (p) => {
            try {
              const [summary, items] = await Promise.all([
                analyticsApi.getOrderSummary(p.id, startDate, endDate),
                analyticsApi.getTopMenuItems(p.id, startDate, endDate, 5),
              ]);
              totalFoodMtd += summary.totalRevenue || 0;
              items.forEach((item) => {
                if (!allTopItems[item.name]) {
                  allTopItems[item.name] = { menuItemId: item.menuItemId, name: item.name, volume: 0, revenue: 0 };
                }
                allTopItems[item.name].volume += item.volume;
                allTopItems[item.name].revenue += item.revenue;
              });
            } catch {
              // ignore per-property failure
            }
          })
        );

        setFoodRevenueMtd(totalFoodMtd);
        setTotalRevenue((prev) => prev + totalFoodMtd);

        const sortedItems = Object.values(allTopItems)
          .sort((a, b) => b.volume - a.volume)
          .slice(0, 5);
        setTopItems(sortedItems);

        // Merge food into chart — approximate: distribute totalFoodMtd into current month
        setChartData((prev) =>
          prev.map((point, idx) => {
            // For simplicity, put the food revenue into the last (current) month
            if (idx === prev.length - 1) {
              return { ...point, foodRevenue: Math.round(totalFoodMtd) };
            }
            return point;
          })
        );
      } catch {
        // graceful degradation
      } finally {
        setLoadingFood(false);
      }
    }

    fetchAll();
  }, []);

  // ── KPI cards data ─────────────────────────────────────────────────────────
  const kpiCards: KpiCardProps[] = [
    {
      title: "Total Revenue (MTD)",
      value: formatCurrency(totalRevenue),
      subtitle: "Rooms + food this month",
      icon: <TrendingUp className="h-4 w-4 text-[#10B981]" />,
      iconBg: "bg-[#10B981]/10",
      loading: loadingKpi || loadingFood,
    },
    {
      title: "Total Bookings",
      value: totalBookings.toLocaleString(),
      subtitle: "Confirmed reservations",
      icon: <CalendarCheck className="h-4 w-4 text-[#953002]" />,
      iconBg: "bg-[rgba(149,48,2,0.1)]",
      loading: loadingKpi,
    },
    {
      title: "Occupancy Rate",
      value: totalBookings > 0 ? `${Math.min(Math.round((totalBookings / Math.max(activeProperties * 30, 1)) * 100), 100)}%` : "—",
      subtitle: "Avg across properties",
      icon: <Activity className="h-4 w-4 text-[#3B82F6]" />,
      iconBg: "bg-[#3B82F6]/10",
      loading: loadingKpi,
    },
    {
      title: "Active Properties",
      value: activeProperties.toLocaleString(),
      subtitle: "Listed and live",
      icon: <Building className="h-4 w-4 text-[#953002]" />,
      iconBg: "bg-[rgba(149,48,2,0.1)]",
      loading: loadingKpi,
    },
    {
      title: "Food Revenue (MTD)",
      value: formatCurrency(foodRevenueMtd),
      subtitle: "From food & beverage orders",
      icon: <UtensilsCrossed className="h-4 w-4 text-[#F59E0B]" />,
      iconBg: "bg-[#F59E0B]/10",
      loading: loadingFood,
    },
    {
      title: "Avg. Guest Rating",
      value: avgRating != null ? `${avgRating} / 5` : "—",
      subtitle: "Across all properties",
      icon: <Star className="h-4 w-4 text-[#F59E0B]" />,
      iconBg: "bg-[#F59E0B]/10",
      loading: loadingKpi,
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto bg-[#F5F6F8]">

      {/* B1 — KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        {kpiCards.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {/* B2 + B3/B4 — Chart row */}
      <div className="flex flex-col lg:flex-row gap-5 mb-5">

        {/* B2 — Revenue Chart (60%) */}
        <div className="flex-[3] bg-white rounded-3xl border border-[#E8EAED] shadow-sm p-6 flex flex-col gap-4 min-h-[340px]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">Revenue Breakdown</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#953002] inline-block" />
                <span className="text-[#6B7280]">Room Revenue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" />
                <span className="text-[#6B7280]">Food Revenue</span>
              </span>
            </div>
          </div>

          {loadingChart ? (
            <div className="flex-1 flex flex-col gap-3 justify-end">
              {[70, 50, 80, 60, 90, 55].map((h, i) => (
                <Skeleton key={i} className="w-full rounded" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="roomGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#953002" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#953002" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="foodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="transparent"
                    tick={{ fill: "#9E9E9E", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: "#9E9E9E", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => {
                      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                      if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                      return v.toString();
                    }}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={0}
                    wrapperStyle={{ display: "none" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="roomRevenue"
                    name="Room Revenue"
                    stroke="#953002"
                    strokeWidth={2}
                    fill="url(#roomGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#953002" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="foodRevenue"
                    name="Food Revenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#foodGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#f59e0b" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right column — B3 + B4 (40%) */}
        <div className="flex-[2] flex flex-col gap-4">

          {/* B3 — Best Performing Property */}
          <div className="bg-white rounded-3xl border border-[#E8EAED] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#953002]/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-[#953002]" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">Best Property This Month</h3>
            </div>
            {loadingKpi ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : bestProperty ? (
              <div>
                <p className="text-base font-black text-[#1A1A1A] truncate">{bestProperty.name}</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span>Revenue</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatCurrency(bestProperty.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span>Bookings</span>
                    <span className="font-semibold text-[#1A1A1A]">{bestProperty.bookingCount}</span>
                  </div>
                  {bestProperty.rating != null && (
                    <div className="flex justify-between text-xs text-[#6B7280]">
                      <span>Rating</span>
                      <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                        <Star className="h-3 w-3 text-[#F59E0B]" />
                        {bestProperty.rating}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6B7280]">No booking data available yet.</p>
            )}
          </div>

          {/* B4 — Top Selling Menu Items */}
          <div className="bg-white rounded-3xl border border-[#E8EAED] shadow-sm p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                <UtensilsCrossed className="h-4 w-4 text-[#F59E0B]" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">Top Menu Items</h3>
            </div>
            {loadingFood ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : topItems.length > 0 ? (
              <div className="space-y-2">
                {topItems.map((item, i) => (
                  <div key={item.menuItemId ?? item.name} className="flex items-center gap-2 text-sm">
                    <span className="text-[11px] font-bold w-5 h-5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate text-[#1A1A1A] font-medium">{item.name}</span>
                    <span className="text-[#6B7280] text-xs">{item.volume} orders</span>
                    <span className="text-[#10B981] text-xs font-semibold">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <UtensilsCrossed className="h-8 w-8 text-[#E8EAED] mb-2" />
                <p className="text-sm text-[#6B7280]">No food orders yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* B5 — Seasonal Trends */}
      <div className="bg-white rounded-3xl border border-[#E8EAED] shadow-sm px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
            <CalendarRange className="h-4 w-4 text-[#3B82F6]" />
          </div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Seasonal Trends</h3>
        </div>
        {hasSeasonalData ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-[#ECFDF5] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wide mb-1">Peak Month</p>
              <p className="text-xl font-black text-[#1A1A1A]">{peakMonth}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Highest room revenue in the last 6 months</p>
            </div>
            <div className="flex-1 bg-[#FEF3C7] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#D97706] uppercase tracking-wide mb-1">Off-Peak Month</p>
              <p className="text-xl font-black text-[#1A1A1A]">{offPeakMonth}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Lowest room revenue in the last 6 months</p>
            </div>
            <div className="flex-1 bg-[#EFF6FF] rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide mb-1">Tip</p>
              <p className="text-xs text-[#1A1A1A] mt-0.5">
                Configure seasonal pricing rules in the{" "}
                <span className="font-semibold text-[#953002]">Rates</span> section to maximize revenue during peak periods.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[#F5F6F8] rounded-2xl px-5 py-4">
            <CalendarRange className="h-5 w-5 text-[#6B7280]" />
            <p className="text-sm text-[#6B7280]">
              Not enough booking data to determine seasonal trends yet. Configure seasonal pricing rules in the{" "}
              <span className="font-semibold text-[#953002]">Rates</span> section to get personalized recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
