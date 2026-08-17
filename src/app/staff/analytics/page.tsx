"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyticsApi, OrderSummary, OrderTrend, TopMenuItem } from "@/api/staff/analytics.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingCart, 
  XCircle,
  Calendar,
  Activity,
  Flame,
  ArrowRight,
  History,
  CheckCircle,
  DollarSign
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
  const router = useRouter();
  const { user } = useAuthStore();
  const propertyId = user?.propertyId;

  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("month");
  
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
      <main className="mt-[64px] flex-1 p-8 text-[#9E7B6A]">
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

  const mostSoldItem = topItems.length > 0 ? topItems[0] : null;

  return (
    <StaffPageLayout>
      <StaffHeader
        title="Analytics"
        subtitle="Performance Dashboard"
        searchPlaceholder="Search order #, room, or item..."
      />
      <main className="mt-[64px] flex-1 p-4 lg:p-6 min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden bg-[#F5F6F8] flex flex-col custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end flex-shrink-0 mb-4 gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A] leading-tight m-0">
              Staff Performance
            </h1>
            <p className="text-[13px] text-[#9E7B6A] mt-1">
              Real-time insights for your property&apos;s orders and items.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-[#F0EBE7] shadow-sm w-full sm:w-auto">
            <Calendar className="h-4 w-4 text-[#9E7B6A] ml-2 shrink-0" />
            <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
              <SelectTrigger className="w-full sm:w-[160px] bg-transparent border-none shadow-none text-[#1A1A1A] font-medium h-8 focus:ring-0">
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
          <div className="flex-1 flex justify-center items-center">
            <Activity className="animate-spin text-[#C05621]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col gap-5 flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-1000 relative z-10">
            
            {/* ── KPI Bento Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-shrink-0">
              
              {/* Total Revenue - Big feature card */}
              <div className="col-span-1 lg:col-span-4 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(192,86,33,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C05621] opacity-[0.08] blur-3xl rounded-full group-hover:scale-150 group-hover:opacity-[0.12] transition-all duration-700" />
                <div className="flex justify-between items-start z-10">
                  <div className="p-2 bg-gradient-to-br from-[#FFF8F0] to-white rounded-xl shadow-sm border border-[#F0EBE7]/50">
                    <DollarSign size={18} className="text-[#C05621]" />
                  </div>
                  <span className="text-[12px] font-bold text-[#2D7D5C] bg-[#E6F5EF] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <TrendingUp size={12} /> {summary?.totalOrders} Orders
                  </span>
                </div>
                <div className="z-10 mt-6 lg:mt-6">
                  <h3 className="text-[12px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Total Revenue</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[20px] font-medium text-[#C05621]">LKR</span>
                    <span className="text-[32px] sm:text-[42px] font-extrabold text-[#1A1A1A] tracking-tighter leading-none truncate max-w-full">
                      {formatCurrency(summary?.totalRevenue || 0).replace('$', '').split('.')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle KPIs */}
              <div className="col-span-1 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Avg Order Value */}
                <div className="col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[120px]">
                  <div className="p-2 bg-[#F8F6F5] rounded-xl self-start">
                    <Activity size={16} className="text-[#9E7B6A]" />
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Avg Order</h3>
                    <p className="text-[20px] sm:text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0 truncate">
                      LKR {formatCurrency(summary?.averageOrderValue || 0).replace('$', '')}
                    </p>
                  </div>
                </div>

                {/* Most Sold Item */}
                <div className="col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group min-h-[120px]">
                  <div className="p-2 bg-[#FFF8F0] rounded-xl self-start group-hover:scale-110 transition-transform">
                    <Flame size={16} className="text-[#C05621]" />
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Top Item</h3>
                    <p className="text-[15px] sm:text-[17px] font-bold text-[#1A1A1A] leading-tight line-clamp-1 m-0">
                      {mostSoldItem ? mostSoldItem.name : "N/A"}
                    </p>
                    <p className="text-[12px] font-semibold text-[#C05621] mt-0.5 m-0">{mostSoldItem?.volume || 0} units</p>
                  </div>
                </div>
              </div>

              {/* View Order History Button */}
              <div 
                onClick={() => router.push('/staff/orders')}
                className="col-span-1 lg:col-span-3 bg-gradient-to-br from-[#1A5039] to-[#2D7D5C] rounded-3xl p-6 shadow-[0_8px_30px_rgb(45,125,92,0.3)] hover:shadow-[0_12px_40px_rgb(45,125,92,0.4)] hover:-translate-y-1 flex flex-col justify-between cursor-pointer transition-all duration-500 group relative overflow-hidden min-h-[140px]"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <History className="absolute -right-4 -bottom-4 h-28 w-28 text-white opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700" />
                
                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl self-start border border-white/20">
                  <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                </div>
                
                <div className="z-10 mt-6 sm:mt-0">
                  <h3 className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase mb-1">Manage</h3>
                  <p className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight leading-none m-0">Order History</p>
                </div>
              </div>
            </div>

            {/* ── Main Chart and List Row ── */}
            <div className="flex flex-col lg:flex-row gap-5 flex-1 lg:min-h-0 pb-10">
              
              {/* Revenue Chart Box */}
              <div className="flex-[5] bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[300px] lg:min-h-0">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                  <h2 className="text-[17px] font-extrabold text-[#1A1A1A] m-0 flex items-center gap-2.5">
                    <span className="w-2 h-6 bg-[#C05621] rounded-full" />
                    Revenue Timeline
                  </h2>
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#C05621] shadow-[0_0_8px_rgb(192,86,33,0.8)]" />
                    <span className="text-[11px] font-bold tracking-[0.1em] text-[#9E7B6A] uppercase">Gross</span>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C05621" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#C05621" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE7" vertical={false} opacity={0.6} />
                      <XAxis 
                        dataKey="timeLabel" 
                        stroke="transparent" 
                        tick={{ fill: "#9E7B6A", fontSize: 12, fontWeight: 600 }} 
                        tickLine={false} 
                        axisLine={false}
                        dy={15} 
                      />
                      <YAxis 
                        stroke="transparent" 
                        tick={{ fill: "#9E7B6A", fontSize: 12, fontWeight: 600 }} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.5)', borderRadius: '16px', color: '#1A1A1A', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                        itemStyle={{ color: '#C05621', fontWeight: '900', fontSize: '15px' }}
                        cursor={{ stroke: '#C05621', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#C05621" 
                        strokeWidth={4}
                        fill="url(#colorRevenuePremium)" 
                        activeDot={{ r: 7, fill: "#fff", stroke: "#C05621", strokeWidth: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Column: Top Items Leaderboard */}
              <div className="flex-[3] flex flex-col gap-5 min-h-[300px] lg:min-h-0">
                
                <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#FFF8F0] to-transparent opacity-80 rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-5 flex-shrink-0 relative z-10">
                    <h2 className="text-[17px] font-extrabold text-[#1A1A1A] m-0">Frequently Ordered</h2>
                    <div className="p-1.5 bg-gradient-to-br from-[#FFF8F0] to-white border border-[#F0EBE7]/50 rounded-xl shadow-sm">
                      <Flame size={16} className="text-[#C05621]" />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                    {topItems.length > 0 ? (
                      <div className="space-y-3">
                        {topItems.map((item, i) => (
                          <div key={item.menuItemId} className="flex items-center justify-between group hover:bg-white/80 p-3 -mx-3 rounded-2xl transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-default border border-transparent hover:border-white">
                            <div className="flex items-center gap-4">
                              <div className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold text-[13px] flex-shrink-0 transition-transform group-hover:scale-110
                                ${i === 0 ? 'bg-gradient-to-br from-[#C05621] to-[#99451A] text-white shadow-[0_4px_10px_rgb(192,86,33,0.3)]' : 
                                  i === 1 ? 'bg-gradient-to-br from-[#E8E8E8] to-[#D4D4D4] text-[#1A1A1A] shadow-sm' : 
                                  i === 2 ? 'bg-gradient-to-br from-[#F5E6DA] to-[#E3D1C3] text-[#9E7B6A] shadow-sm' : 
                                  'bg-white text-[#9E7B6A] border border-[#F0EBE7]'}`}>
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-[#1A1A1A] line-clamp-1 m-0 group-hover:text-[#C05621] transition-colors">{item.name}</p>
                                <p className="text-[12px] font-semibold text-[#9E7B6A] m-0 mt-0.5">{item.volume} units</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[14px] font-extrabold text-[#2D7D5C] m-0 whitespace-nowrap bg-[#E6F5EF] px-2 py-1 rounded-lg">
                                LKR {formatCurrency(item.revenue).replace('$', '').split('.')[0]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#9E7B6A]">
                        <div className="p-5 bg-white/50 rounded-full mb-3 shadow-sm border border-white">
                          <ShoppingCart className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="text-[14px] font-bold">No data available</p>
                      </div>
                    )}
                  </div>
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
