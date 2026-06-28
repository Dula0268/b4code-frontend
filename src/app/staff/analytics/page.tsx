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
  Flame
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

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

  if (!propertyId) return <div className="p-8 text-white">No property selected.</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);
  };

  const completionRate = summary && summary.totalOrders > 0 
    ? Math.round((summary.completedCount / summary.totalOrders) * 100) 
    : 0;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Real-time insights and analytics for your orders.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white backdrop-blur-md">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Activity className="h-10 w-10 text-primary animate-pulse" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{formatCurrency(summary?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{summary?.totalOrders} orders
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{formatCurrency(summary?.averageOrderValue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per completed order
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{completionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.completedCount} completed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Orders</CardTitle>
                <XCircle className="h-5 w-5 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{summary?.rejectedCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders failed/cancelled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Trend Chart */}
            <Card className="col-span-1 lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis 
                      dataKey="timeLabel" 
                      stroke="#ffffff50" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#ffffff50" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      activeDot={{ r: 6, fill: '#fff', stroke: '#4f46e5', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Items List/Chart */}
            <Card className="col-span-1 bg-white/5 border-white/10 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Top Selling Items
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-4 space-y-6">
                {topItems.length > 0 ? topItems.map((item, i) => (
                  <div key={item.menuItemId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground text-xs">{item.volume} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-10">
                    <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                    <p>No item data found</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
          </div>
        </>
      )}
    </div>
  );
}
