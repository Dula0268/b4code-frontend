"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayload {
  payload: { month: string; revenue: number; netRevenue: number };
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
            Gross: LKR {payload[0].payload.revenue?.toLocaleString() || '0'}
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

// ─── Component ────────────────────────────────────────────────────────────────
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import { Loader2 } from "lucide-react";

export default function RevenueTrendChart() {
  const { revenueTrend, fetchRevenueTrend, trendLoading } = useAdminFinanceStore();
  const [timeframe, setTimeframe] = useState<"today" | "7days" | "month">("month");

  useEffect(() => {
    fetchRevenueTrend(timeframe);
  }, [timeframe, fetchRevenueTrend]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 relative w-full h-full min-h-[400px]">
      
      {/* ── Gross Booking Value Chart Section ── */}
      <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
        {trendLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-[#C05621]" size={32} />
          </div>
        )}
        
        {/* ── Header ── */}
        <div className="flex justify-end gap-4 z-10">
          <div className="flex flex-col items-end gap-3">
            {/* Timeframe Toggle */}
            <div className="flex items-center bg-[#F8F6F5] rounded-xl p-1 border border-[#E8DDD8]/50">
              {(["today", "7days", "month"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                    timeframe === t
                      ? "bg-white text-[#C05621] shadow-sm border border-[#E8DDD8]/50"
                      : "text-[#9E7B6A] hover:text-[#1A1A1A] hover:bg-white/50"
                  }`}
                >
                  {t === "today" ? "Today" : t === "7days" ? "7 Days" : "Month"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] z-10 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueTrend}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
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
                tickFormatter={(value: number) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value.toString();
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9E7B6A', right: 0 }} />
              <Bar
                name="Gross Booking Value"
                dataKey="revenue"
                fill="#C05621"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Bar
                name="Net Revenue"
                dataKey="netRevenue"
                fill="#2D7D5C"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
