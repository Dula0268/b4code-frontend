"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
          Revenue : LKR {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import { Loader2 } from "lucide-react";

export default function RevenueTrendChart() {
  const { revenueTrend, trendLoading } = useAdminFinanceStore();

  return (
    <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-5 relative">
      {trendLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#1A1A1A]">
            Revenue Trend
          </h2>
          <p className="text-[13px] text-[#9E7B6A] mt-1">
            Gross volume over time
          </p>
        </div>
        <button 
          suppressHydrationWarning
          className="px-4 py-2 text-[14px] font-medium text-[#C05621] bg-[#FDEADE] rounded-lg hover:bg-[#FBD5C0] transition-colors"
        >
          Monthly
        </button>
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={revenueTrend}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C05621" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#C05621" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="#F0EBE7"
            vertical={false}
            horizontalPoints={[0, 75, 150, 225, 300]}
          />
          <XAxis
            dataKey="month"
            stroke="transparent"
            tick={{ fill: "#9E7B6A", fontSize: 13, fontWeight: 400 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#9E7B6A", fontSize: 13, fontWeight: 400 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            ticks={[0, 250000, 500000, 750000, 1000000]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#E8DDD8", strokeWidth: 1 }}
          />
          <Area
            type="natural"
            dataKey="revenue"
            stroke="#C05621"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#C05621",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
