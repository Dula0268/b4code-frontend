"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  UtensilsCrossed,
  QrCode,
  ArrowRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  Sunrise,
  Sun,
  Moon,
  ChevronRight,
  AlertCircle,
  BellRing
} from "lucide-react";
import { useStaffOrdersStore } from "@/store/staff/orders/staff-orders.store";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { usePermission } from "@/hooks/use-permission";

function useStats() {
  const queueCount = useStaffOrdersStore((s) => s.getCountByStatus("placed"));
  const acceptedCount = useStaffOrdersStore((s) => s.getCountByStatus("accepted"));
  const inProgressCount = useStaffOrdersStore((s) => s.getCountByStatus("in-progress"));
  const inProgress = acceptedCount + inProgressCount;
  const deliveredCount = useStaffOrdersStore((s) => s.getCountByStatus("delivered"));

  return [
    {
      label: "Orders in Queue",
      value: String(queueCount),
      icon: ClipboardList,
      iconBg: "bg-[rgba(149,48,2,0.08)]",
      iconColor: "text-[var(--brand-primary)]",
      trend: queueCount > 0 ? "Action required" : "Queue clear",
      trendIcon: TrendingUp,
      trendColor: queueCount > 0 ? "text-[var(--brand-primary)]" : "text-[var(--gray-3)]",
    },
    {
      label: "In-Progress",
      value: String(inProgress),
      icon: Hourglass,
      iconBg: "bg-[rgba(255,180,1,0.08)]",
      iconColor: "text-[var(--brand-secondary)]",
      trend: inProgress > 0 ? "Actively prepping" : "Kitchen idle",
      trendIcon: Hourglass,
      trendColor: "text-[var(--brand-secondary)]",
    },
    {
      label: "Delivered Today",
      value: String(deliveredCount),
      icon: CheckCheck,
      iconBg: "bg-[rgba(39,174,96,0.08)]",
      iconColor: "text-[var(--state-success)]",
      trend: "Daily total",
      trendIcon: CheckCheck,
      trendColor: "text-[var(--state-success)]",
    },
    {
      label: "Avg Prep Time",
      value: "—",
      icon: Timer,
      iconBg: "bg-[rgba(47,128,237,0.08)]",
      iconColor: "text-[var(--state-info)]",
      trend: "Tracking active",
      trendIcon: ArrowDown,
      trendColor: "text-[var(--state-info)]",
    },
  ];
}

function useManagementCards() {
  const placedCount = useStaffOrdersStore((s) => s.getCountByStatus("placed"));
  const menus = useStaffMenuStore((s) => s.menus);
  const outOfStockCount = menus.reduce((acc: number, menu: any) => acc + menu.items.filter((i: any) => i.status === "draft").length, 0);
  const activeQRs = useStaffQRStore((s) => s.qrs.filter(q => q.status === "active").length);

  return [
    {
      title: "Order Management",
      highlight: placedCount > 0 ? (placedCount === 1 ? "1 New Order" : `${placedCount} New Orders`) : "No New Orders",
      description: "Manage incoming guest orders and update prep status.",
      buttonLabel: "Manage Orders",
      buttonIcon: ArrowRight,
      href: "/staff/orders",
      icon: ClipboardList,
    },
    {
      title: "Menu Management",
      highlight: outOfStockCount > 0 ? (outOfStockCount === 1 ? "1 Item Unavailable" : `${outOfStockCount} Items Unavailable`) : "All Items Available",
      description: "Update menu availability and manage property dishes.",
      buttonLabel: "Update Menu",
      buttonIcon: UtensilsCrossed,
      href: "/staff/menu",
      icon: UtensilsCrossed,
    },
    {
      title: "QR Management",
      highlight: activeQRs === 1 ? "1 Active QR Code" : `${activeQRs} Active QR Codes`,
      description: "Monitor and manage QR code locations for guest ordering.",
      buttonLabel: "View QR Codes",
      buttonIcon: Eye,
      href: "/staff/qr",
      icon: QrCode,
    },
  ];
}

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const fetchOrders = useStaffOrdersStore((s) => s.fetchOrders);
  const loadingOrders = useStaffOrdersStore((s) => s.loading);
  const orders = useStaffOrdersStore((s) => s.orders);
  const updateStatus = useStaffOrdersStore((s) => s.updateStatus);
  
  const loadingMenus = useStaffMenuStore((s) => s.isLoading);
  const loadingQRs = useStaffQRStore((s) => s.loading);
  const fetchMenus = useStaffMenuStore((s) => s.fetchMenus);
  const fetchQRs = useStaffQRStore((s) => s.fetchQRs);

  // Time-based greeting
  const [greeting, setGreeting] = useState("Good Morning");
  const [GreetingIcon, setGreetingIcon] = useState<any>(Sunrise);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
      setGreetingIcon(() => Sunrise);
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
      setGreetingIcon(() => Sun);
    } else {
      setGreeting("Good Evening");
      setGreetingIcon(() => Moon);
    }
  }, []);

  // Permission gates
  const canOrders = usePermission("order_management");
  const canMenu = usePermission("menu_management");
  const canQR = usePermission("qr_management");

  const permMap: Record<string, boolean> = {
    "/staff/orders": canOrders,
    "/staff/menu": canMenu,
    "/staff/qr": canQR,
  };

  const visibleCards = managementCards.filter((c) => permMap[c.href] !== false);

  // Fetch all dashboard data when component mounts
  useEffect(() => {
    const propertyId = user?.propertyId || (typeof window !== 'undefined' ? localStorage.getItem("selected_property_id") : null);
    if (propertyId) {
      const pid = Number(propertyId);
      fetchOrders(pid);
      fetchMenus(pid);
      fetchQRs(pid, 0, 100);
    } else {
      fetchOrders(1);
      fetchMenus(1);
      fetchQRs(1, 0, 100);
    }
  }, [user, fetchOrders, fetchMenus, fetchQRs]);

  const isLoading = loadingOrders || loadingMenus || loadingQRs;

  // Deriving metrics
  const activeOrders = useMemo(() => {
    return Object.values(orders).filter(
      (o) => o.status === "placed" || o.status === "accepted" || o.status === "in-progress"
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [orders]);

  const placedCount = useMemo(() => activeOrders.filter((o) => o.status === "placed").length, [activeOrders]);
  const completedCount = useMemo(() => Object.values(orders).filter((o) => o.status === "delivered").length, [orders]);
  const totalOrders = useMemo(() => Object.values(orders).length, [orders]);
  const completionPercentage = totalOrders === 0 ? 0 : Math.round((completedCount / totalOrders) * 100);

  // Status computation
  const propertyStatus = useMemo(() => {
    if (placedCount > 5) return { label: "High Volume", color: "bg-[#FEE2E2] text-[#DC2626]", dot: "bg-[#DC2626]" };
    if (placedCount > 2) return { label: "Busy", color: "bg-[#FEF3C7] text-[#D97706]", dot: "bg-[#D97706]" };
    return { label: "Normal Tempo", color: "bg-[#D1FAE5] text-[#059669]", dot: "bg-[#059669]" };
  }, [placedCount]);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-[#F8F9FA] animate-pulse">
        {/* Header Skeleton */}
        <div className="h-24 bg-white rounded-3xl border border-[#E8EAED]"></div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:w-[65%] flex flex-col gap-6">
            <div className="h-[400px] bg-white rounded-3xl border border-[#E8EAED]"></div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="lg:w-[35%] flex flex-col gap-6">
            <div className="h-[250px] bg-white rounded-3xl border border-[#E8EAED]"></div>
            <div className="h-[200px] bg-white rounded-3xl border border-[#E8EAED]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 lg:px-8 py-6 flex flex-col gap-6 bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* 1. Ambient Welcome Header */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#C05621] to-[#E2A03F] opacity-[0.08] blur-3xl rounded-full" />
          
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-gradient-to-br from-[#FFF8F0] to-white rounded-2xl border border-[#F0EBE7] shadow-sm">
              <GreetingIcon size={28} className="text-[#C05621]" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#1A1A1A] tracking-tight m-0">
                {greeting}, {user?.firstName || "Staff"}
              </h1>
              <p className="text-[#6B7280] font-medium mt-1">Here is what is happening at your property today.</p>
            </div>
          </div>

          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full ${propertyStatus.color} font-bold text-sm tracking-wide z-10 border border-white shadow-sm`}>
            <div className={`w-2 h-2 rounded-full ${propertyStatus.dot} animate-pulse`} />
            {propertyStatus.label}
          </div>
        </div>

        {/* Bento Grid Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Column (65%) */}
          <div className="lg:w-[65%] flex flex-col gap-6">
            
            {/* Needs Attention Feed */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFF8F0] p-2 rounded-xl text-[#C05621]">
                    <BellRing size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Live Queue</h2>
                </div>
                {placedCount > 0 && (
                  <span className="bg-[#C05621] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {placedCount} New
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 opacity-50">
                    <CheckCircle2 size={48} className="text-[#059669] mb-4" />
                    <p className="text-lg font-bold text-[#1A1A1A]">All caught up!</p>
                    <p className="text-[#6B7280] text-sm">There are no active orders waiting.</p>
                  </div>
                ) : (
                  activeOrders.map((order) => {
                    const isNew = order.status === "placed";
                    const waitTime = formatDistanceToNow(new Date(order.createdAt), { addSuffix: false });
                    
                    return (
                      <div key={order.id} className="group relative overflow-hidden bg-white border border-[#E8EAED] hover:border-[#C05621]/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {isNew && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C05621]" />}
                        
                        <div className="flex items-center gap-4">
                          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl ${isNew ? 'bg-[#FFF8F0] text-[#C05621]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {order.type === 'Table Order' ? 'Table' : 'Room'}
                            </span>
                            <span className="text-lg font-extrabold leading-none">
                              {order.table.replace(/^(Room|Table)\s+/i, '')}
                            </span>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1A1A]">Order #{order.id}</span>
                              <span className="text-xs font-medium text-[#6B7280] flex items-center gap-1">
                                <Clock size={12} /> {waitTime}
                              </span>
                            </div>
                            <p className="text-sm text-[#6B7280] mt-1 line-clamp-1">
                              {order.items.length} items • {order.items.map(i => i.menuItemName).join(", ")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isNew ? (
                            <button 
                              onClick={() => updateStatus(order.id, "accepted")}
                              className="bg-[#1A1A1A] hover:bg-[#C05621] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors w-full sm:w-auto"
                            >
                              Accept Order
                            </button>
                          ) : (
                            <Link 
                              href={`/staff/orders/${order.id}`}
                              className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1A1A1A] text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                              View Details <ChevronRight size={16} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column (35%) */}
          <div className="lg:w-[35%] flex flex-col gap-6">
            
            {/* Live Metrics Ring */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <h3 className="text-[13px] font-bold tracking-[0.15em] text-[#6B7280] uppercase mb-6">Today&apos;s Progress</h3>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F3F4F6" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke="#C05621" 
                      strokeWidth="8" 
                      strokeDasharray={`${(completionPercentage / 100) * 251.2} 251.2`} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-[#1A1A1A] tracking-tighter">{completionPercentage}%</span>
                    <span className="text-[10px] font-bold tracking-widest text-[#6B7280] uppercase mt-1">Complete</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F9FA] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-[#1A1A1A]">{totalOrders}</span>
                  <span className="text-[10px] font-bold tracking-widest text-[#6B7280] uppercase mt-1">Total Orders</span>
                </div>
                <div className="bg-[#F8F9FA] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-[#059669]">{completedCount}</span>
                  <span className="text-[10px] font-bold tracking-widest text-[#6B7280] uppercase mt-1">Delivered</span>
                </div>
              </div>
            </div>

            {/* Quick Tools Dock */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 flex-1">
              <h3 className="text-[13px] font-bold tracking-[0.15em] text-[#6B7280] uppercase mb-4">Quick Tools</h3>
              
              <div className="flex flex-col gap-3">
                {canOrders && (
                  <Link href="/staff/orders" className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <ClipboardList size={18} />
                      </div>
                      <span className="font-bold text-[#1A1A1A]">Manage Orders</span>
                    </div>
                    <ArrowRight size={16} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {canMenu && (
                  <Link href="/staff/menu" className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <UtensilsCrossed size={18} />
                      </div>
                      <span className="font-bold text-[#1A1A1A]">Update Menu</span>
                    </div>
                    <ArrowRight size={16} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {canQR && (
                  <Link href="/staff/qr" className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <QrCode size={18} />
                      </div>
                      <span className="font-bold text-[#1A1A1A]">QR Codes</span>
                    </div>
                    <ArrowRight size={16} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                
                {canMessages && (
                  <Link href="/staff/messages" className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <MessageSquare size={18} />
                      </div>
                      <span className="font-bold text-[#1A1A1A]">Guest Chats</span>
                    </div>
                    <ArrowRight size={16} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
