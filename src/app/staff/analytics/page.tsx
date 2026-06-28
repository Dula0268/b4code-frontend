"use client";

import React, { useEffect, useState } from "react";
import { analyticsApi, OrderSummary, OrderTrend, TopMenuItem } from "@/api/staff/analytics.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  CheckCircle, 
  XCircle,
  Calendar,
  Activity,
  Flame,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import StaffHeader from "@/components/staff/layout/staff-header";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const propertyId = user?.propertyId;

  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");
  
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [trends, setTrends] = useState<OrderTrend[]>([]);
  const [topItems, setTopItems] = useState<TopMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let startDate, endDate;
        let interval = "hour";
        const today = new Date();

        if (timeframe === "today") {
          startDate = format(startOfDay(today), "yyyy-MM-dd");
          endDate = format(endOfDay(today), "yyyy-MM-dd");
          interval = "hour";
        } else if (timeframe === "week") {
          startDate = format(startOfDay(subDays(today, 7)), "yyyy-MM-dd");
          endDate = format(endOfDay(today), "yyyy-MM-dd");
          interval = "day";
        } else if (timeframe === "month") {
          startDate = format(startOfDay(subDays(today, 30)), "yyyy-MM-dd");
          endDate = format(endOfDay(today), "yyyy-MM-dd");
          interval = "day";
        }

        const [sumRes, trendRes, topRes] = await Promise.all([
          analyticsApi.getOrderSummary(propertyId, startDate, endDate),
          analyticsApi.getOrderTrends(propertyId, startDate, endDate, interval),
          analyticsApi.getTopMenuItems(propertyId, startDate, endDate, 5)
        ]);

        setSummary(sumRes);
        
        // Format trends for recharts
        const formattedTrends = trendRes.map(t => ({
          ...t,
          timeLabel: interval === "hour" 
            ? format(new Date(t.timestamp.replace(" ", "T")), "h a")
            : format(new Date(t.timestamp.replace(" ", "T")), "MMM d")
        }));
        setTrends(formattedTrends);
        setTopItems(topRes);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [propertyId, timeframe]);

  if (!propertyId) return (
    <StaffPageLayout>
      <StaffHeader title="Analytics" subtitle="Performance Dashboard" searchPlaceholder="Search..." />
      <main className="mt-[72px] flex-1 p-8 text-slate-500">
        No property selected.
      </main>
    </StaffPageLayout>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);
  };

  const completionRate = summary && summary.totalOrders > 0 
    ? Math.round((summary.completedCount / summary.totalOrders) * 100) 
    : 0;

  return (
    <StaffPageLayout>
      <StaffHeader
        title="Analytics"
        subtitle="Performance Dashboard"
        searchPlaceholder="Search order #, room, or item..."
      />
      <main className="mt-[72px] flex-1 p-8 h-full overflow-y-auto bg-[#f8f6f5]">
      
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        
        {/* ── Page Header ── */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight m-0">
              Staff Performance
            </h1>
            <p className="text-[13px] text-[#9E7B6A] mt-1">
              Real-time insights for your property's orders and items.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-[#F0EBE7] shadow-sm">
            <Calendar className="h-4 w-4 text-[#9E7B6A] ml-2" />
            <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
              <SelectTrigger className="w-[160px] bg-transparent border-none shadow-none text-[#1A1A1A] font-medium h-8 focus:ring-0">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#F0EBE7] shadow-lg">
                <SelectItem value="today" className="cursor-pointer">Today</SelectItem>
                <SelectItem value="week" className="cursor-pointer">Last 7 Days</SelectItem>
                <SelectItem value="month" className="cursor-pointer">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Activity className="animate-spin text-[#C05621]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            
            {/* ── Row 1: Main Trend + Net Revenue ── */}
            <div className="flex flex-col xl:flex-row gap-5">
              {/* Gross Revenue Chart */}
              <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase mb-1">
                      Total Revenue
                    </p>
                    <p className="text-[34px] font-bold text-[#C05621] leading-none m-0">
                      LKR {formatCurrency(summary?.totalRevenue || 0).replace('$', '')}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-[12px] font-semibold bg-[#E6F5EF] text-[#2D7D5C]">
                    {summary?.totalOrders} Orders
                  </span>
                </div>
                
                <div className="h-[220px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C05621" stopOpacity={0.15}/>
                          <stop offset="100%" stopColor="#C05621" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="0" stroke="#F0EBE7" vertical={false} />
                      <XAxis 
                        dataKey="timeLabel" 
                        stroke="transparent" 
                        tick={{ fill: "#9E7B6A", fontSize: 12 }} 
                        tickLine={false} 
                        axisLine={false}
                        dy={8} 
                      />
                      <YAxis 
                        stroke="transparent" 
                        tick={{ fill: "#9E7B6A", fontSize: 12 }} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#F0EBE7', borderRadius: '8px', color: '#1A1A1A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#C05621', fontWeight: 'bold' }}
                        cursor={{ stroke: '#E8DDD8', strokeWidth: 1 }}
                      />
                      <Area 
                        type="natural" 
                        dataKey="revenue" 
                        stroke="#C05621" 
                        strokeWidth={2.5}
                        fill="url(#colorRevenue)" 
                        activeDot={{ r: 5, fill: "#C05621", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top KPI Cards Side */}
              <div className="flex flex-col gap-5 w-full xl:w-[260px]">
                {/* Avg Order Value */}
                <div className="bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col justify-center flex-1 border-l-4 border-l-[#2D7D5C]">
                  <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                    Avg. Order Value
                  </p>
                  <p className="text-[28px] font-bold text-[#1A1A1A] leading-none m-0 mt-3">
                    LKR {formatCurrency(summary?.averageOrderValue || 0).replace('$', '')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <TrendingUp size={14} color="#27ae60" />
                    <span className="text-[12px] font-medium text-[#9E7B6A]">
                      Per completed order
                    </span>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col justify-center flex-1">
                  <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                    Completion Rate
                  </p>
                  <div className="flex items-end gap-2 mt-3">
                    <p className="text-[28px] font-bold text-[#1A1A1A] leading-none m-0">
                      {completionRate}%
                    </p>
                    <span className="text-[14px] text-[#9E7B6A] mb-1">
                      ({summary?.completedCount} done)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F0EBE7] overflow-hidden mt-3">
                    <div
                      className="h-full rounded-full bg-[#2D7D5C]"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 2: Secondary Stats & Top Items ── */}
            <div className="flex flex-col xl:flex-row gap-5">
              
              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-2 gap-5 w-full xl:w-[400px]">
                
                {/* Total Orders */}
                <div className="bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} color="#9E7B6A" />
                    <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                      Total Orders
                    </p>
                  </div>
                  <p className="text-[32px] font-bold text-[#1A1A1A] leading-none m-0">
                    {summary?.totalOrders || 0}
                  </p>
                </div>

                {/* Rejected Orders */}
                <div className="bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <XCircle size={16} color="#9E7B6A" />
                    <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">
                      Rejected
                    </p>
                  </div>
                  <p className="text-[32px] font-bold text-[#EB5757] leading-none m-0">
                    {summary?.rejectedCount || 0}
                  </p>
                </div>

              </div>

              {/* Top Selling Items */}
              <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <Flame size={18} color="#C05621" />
                  <h2 className="text-[15px] font-bold text-[#1A1A1A] m-0">Top Selling Menu Items</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {topItems.length > 0 ? (
                    topItems.map((item, i) => (
                      <div key={item.menuItemId} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-[13px]
                            ${i === 0 ? 'bg-[#FFF8F0] text-[#C05621]' : 
                              i === 1 ? 'bg-[#F0EBE7] text-[#1A1A1A]' : 
                              i === 2 ? 'bg-[#F0EBE7] text-[#9E7B6A]' : 
                              'bg-transparent text-[#9E7B6A] border border-[#F0EBE7]'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#1A1A1A] line-clamp-1 m-0">{item.name}</p>
                            <p className="text-[12px] font-medium text-[#9E7B6A] m-0 mt-0.5">{item.volume} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-bold text-[#2D7D5C] m-0">
                            LKR {formatCurrency(item.revenue).replace('$', '')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#9E7B6A] py-8">
                      <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-[14px] font-medium">No items sold</p>
                      <p className="text-[12px] mt-1">Try selecting a broader timeframe.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
    </StaffPageLayout>
  );
}
