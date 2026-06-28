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
      <main className="mt-[72px] flex-1 p-8 text-[#9E7B6A]">
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
      <main className="mt-[72px] flex-1 p-6 h-[calc(100vh-72px)] overflow-hidden bg-[#f8f6f5] flex flex-col">
      
        {/* ── Page Header ── */}
        <div className="flex justify-between items-end flex-shrink-0 mb-4">
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
          <div className="flex-1 flex justify-center items-center">
            <Activity className="animate-spin text-[#C05621]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in duration-700">
            
            {/* ── KPI Cards Row (Fixed Height) ── */}
            <div className="grid grid-cols-5 gap-4 flex-shrink-0">
              {/* Total Revenue */}
              <div className="col-span-1 bg-white rounded-xl border border-[#F0EBE7] p-4 shadow-sm flex flex-col justify-center border-l-4 border-l-[#C05621]">
                <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">Total Revenue</p>
                <p className="text-[24px] font-bold text-[#1A1A1A] leading-none m-0 mt-2">
                  LKR {formatCurrency(summary?.totalRevenue || 0).replace('$', '')}
                </p>
              </div>

              {/* Total Orders */}
              <div className="col-span-1 bg-white rounded-xl border border-[#F0EBE7] p-4 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">Total Orders</p>
                  <ShoppingCart size={14} color="#9E7B6A" />
                </div>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-[24px] font-bold text-[#1A1A1A] leading-none m-0">{summary?.totalOrders || 0}</p>
                  <span className="text-[12px] font-medium text-[#2D7D5C] bg-[#E6F5EF] px-1.5 py-0.5 rounded">
                    {completionRate}% Done
                  </span>
                </div>
              </div>
              
              {/* Avg Order Value */}
              <div className="col-span-1 bg-white rounded-xl border border-[#F0EBE7] p-4 shadow-sm flex flex-col justify-center">
                <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">Avg Order Value</p>
                <p className="text-[24px] font-bold text-[#1A1A1A] leading-none m-0 mt-2">
                  LKR {formatCurrency(summary?.averageOrderValue || 0).replace('$', '')}
                </p>
              </div>

              {/* Most Sold Item */}
              <div className="col-span-1 bg-white rounded-xl border border-[#F0EBE7] p-4 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-widest text-[#9E7B6A] uppercase m-0">Top Item</p>
                  <Flame size={14} color="#C05621" />
                </div>
                <p className="text-[16px] font-bold text-[#1A1A1A] leading-tight line-clamp-1 m-0 mt-2">
                  {mostSoldItem ? mostSoldItem.name : "No Data"}
                </p>
                {mostSoldItem && (
                  <p className="text-[11px] text-[#9E7B6A] font-medium m-0 mt-0.5">{mostSoldItem.volume} sold</p>
                )}
              </div>

              {/* View Order History Button */}
              <div 
                onClick={() => router.push('/staff/orders')}
                className="col-span-1 bg-[#2D7D5C] rounded-xl p-4 shadow-sm flex flex-col justify-center cursor-pointer hover:bg-[#236348] transition-colors group relative overflow-hidden"
              >
                <History className="absolute -right-2 -bottom-2 h-16 w-16 text-white opacity-10 group-hover:scale-110 transition-transform" />
                <p className="text-[11px] font-semibold tracking-widest text-[rgba(255,255,255,0.7)] uppercase m-0 z-10">Manage</p>
                <div className="flex items-center justify-between mt-2 z-10">
                  <p className="text-[18px] font-bold text-white leading-none m-0">Order History</p>
                  <ArrowRight color="white" size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* ── Main Chart and List Row (Fills Remaining Space) ── */}
            <div className="flex gap-4 flex-1 min-h-0">
              
              {/* Revenue Chart */}
              <div className="flex-[5] bg-white rounded-2xl border border-[#F0EBE7] p-5 shadow-sm flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <p className="text-[14px] font-bold text-[#1A1A1A] m-0 flex items-center gap-2">
                    <Activity size={16} color="#C05621" /> Revenue Timeline
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#C05621]" />
                      <span className="text-[11px] font-medium text-[#9E7B6A]">Gross Revenue</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                        tick={{ fill: "#9E7B6A", fontSize: 11 }} 
                        tickLine={false} 
                        axisLine={false}
                        dy={8} 
                      />
                      <YAxis 
                        stroke="transparent" 
                        tick={{ fill: "#9E7B6A", fontSize: 11 }} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#F0EBE7', borderRadius: '8px', color: '#1A1A1A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#C05621', fontWeight: 'bold', fontSize: '13px' }}
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

              {/* Right Column: Top Items & Rejected Stats */}
              <div className="flex-[3] flex flex-col gap-4 min-h-0">
                
                <div className="flex-1 bg-white rounded-2xl border border-[#F0EBE7] p-5 shadow-sm flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                    <Flame size={16} color="#C05621" />
                    <h2 className="text-[14px] font-bold text-[#1A1A1A] m-0">Top Selling Items</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {topItems.length > 0 ? (
                      <div className="space-y-3">
                        {topItems.map((item, i) => (
                          <div key={item.menuItemId} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-7 h-7 rounded-lg font-bold text-[12px] flex-shrink-0
                                ${i === 0 ? 'bg-[#FFF8F0] text-[#C05621]' : 
                                  i === 1 ? 'bg-[#F0EBE7] text-[#1A1A1A]' : 
                                  i === 2 ? 'bg-[#F0EBE7] text-[#9E7B6A]' : 
                                  'bg-transparent text-[#9E7B6A] border border-[#F0EBE7]'}`}>
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-[#1A1A1A] line-clamp-1 m-0">{item.name}</p>
                                <p className="text-[11px] font-medium text-[#9E7B6A] m-0 mt-0.5">{item.volume} units sold</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[13px] font-bold text-[#2D7D5C] m-0 whitespace-nowrap">
                                LKR {formatCurrency(item.revenue).replace('$', '')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#9E7B6A]">
                        <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-[13px] font-medium">No items sold</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Rejected/Failed small card */}
                <div className="bg-[#FFF6F6] rounded-xl border border-[#FDE8E8] p-4 flex justify-between items-center flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FDE8E8] flex items-center justify-center">
                      <XCircle size={16} color="#EB5757" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-[#EB5757] uppercase m-0">Failed / Rejected</p>
                      <p className="text-[11px] text-[#EB5757] opacity-80 m-0 mt-0.5">Orders not fulfilled</p>
                    </div>
                  </div>
                  <p className="text-[24px] font-bold text-[#EB5757] m-0">{summary?.rejectedCount || 0}</p>
                </div>

              </div>

            </div>
          </div>
        )}
      </main>
    </StaffPageLayout>
  );
}
