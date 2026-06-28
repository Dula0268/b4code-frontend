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
      <main className="mt-[72px] flex-1 p-6 md:p-10 space-y-8 h-full overflow-y-auto">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-[rgba(149,48,2,0.1)] rounded-lg">
              <BarChart3 className="h-6 w-6 text-[var(--brand-primary,#953002)]" />
            </div>
            Performance Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Monitor real-time insights and revenue growth.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <Calendar className="h-4 w-4 text-slate-400 ml-2" />
          <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
            <SelectTrigger className="w-[160px] bg-white border-none shadow-sm text-slate-700 font-medium h-9 focus:ring-1 focus:ring-[var(--brand-primary,#953002)] rounded-lg">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="today" className="cursor-pointer focus:bg-slate-50">Today</SelectItem>
              <SelectItem value="week" className="cursor-pointer focus:bg-slate-50">Last 7 Days</SelectItem>
              <SelectItem value="month" className="cursor-pointer focus:bg-slate-50">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Activity className="h-10 w-10 text-[var(--brand-primary,#953002)] animate-pulse" />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                <CardTitle className="text-sm font-semibold text-slate-500">Total Revenue</CardTitle>
                <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary?.totalRevenue || 0)}</div>
                <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">{summary?.totalOrders}</span> orders
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                <CardTitle className="text-sm font-semibold text-slate-500">Avg. Order Value</CardTitle>
                <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{formatCurrency(summary?.averageOrderValue || 0)}</div>
                <div className="mt-2 text-xs font-medium text-slate-500">
                  Per completed order
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary,#953002)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                <CardTitle className="text-sm font-semibold text-slate-500">Completion Rate</CardTitle>
                <div className="p-2 bg-[rgba(149,48,2,0.06)] rounded-xl group-hover:bg-[rgba(149,48,2,0.1)] transition-colors">
                  <CheckCircle className="h-5 w-5 text-[var(--brand-primary,#953002)]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{completionRate}%</div>
                <div className="mt-2 text-xs font-medium text-slate-500">
                  <span className="text-slate-700 font-semibold">{summary?.completedCount}</span> completed
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                <CardTitle className="text-sm font-semibold text-slate-500">Rejected Orders</CardTitle>
                <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                  <XCircle className="h-5 w-5 text-rose-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{summary?.rejectedCount || 0}</div>
                <div className="mt-2 text-xs font-medium text-slate-500">
                  Failed or cancelled
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
            
            {/* Main Trend Chart */}
            <Card className="col-span-1 xl:col-span-2 bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
                <CardTitle className="text-base text-slate-800 font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[var(--brand-primary,#953002)]" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[380px] w-full pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#953002" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#953002" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="timeLabel" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#953002" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      activeDot={{ r: 6, fill: '#fff', stroke: '#953002', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Items List */}
            <Card className="col-span-1 bg-white border-slate-100 shadow-sm rounded-2xl flex flex-col h-[460px]">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
                <CardTitle className="text-base text-slate-800 font-semibold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Top Selling Items
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-y-auto custom-scrollbar">
                {topItems.length > 0 ? (
                  <div className="space-y-5">
                    {topItems.map((item, i) => (
                      <div key={item.menuItemId} className="flex items-center justify-between group hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm
                            ${i === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-100/50' : 
                              i === 1 ? 'bg-slate-100 text-slate-700' : 
                              i === 2 ? 'bg-orange-50 text-orange-700' : 
                              'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-slate-800 font-semibold line-clamp-1">{item.name}</p>
                            <p className="text-slate-500 text-xs font-medium">{item.volume} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 font-bold">{formatCurrency(item.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                      <ShoppingCart className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="font-medium">No item data found</p>
                    <p className="text-xs mt-1">Try selecting a different timeframe.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>
        </div>
      )}
      </main>
    </StaffPageLayout>
  );
}
