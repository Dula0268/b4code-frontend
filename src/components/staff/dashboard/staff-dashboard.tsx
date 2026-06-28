"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  TrendingUp,
  Hourglass,
  CheckCheck,
  Timer,
  ArrowDown,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  MessageSquare,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useStaffOrdersStore } from "@/store/staff/orders/staff-orders.store";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import { useStaffChatStore } from "@/store/staff/messages/staff-chat.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const outOfStockCount = menus.reduce((acc, menu) => acc + menu.items.filter(i => i.status === "draft").length, 0);
  const activeQRs = useStaffQRStore((s) => s.qrs.filter(q => q.status === "active").length);
  const unreadMessages = useStaffChatStore((s) => s.conversations.reduce((acc, conv) => acc + conv.unread, 0));

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
    {
      title: "Guest Chats",
      highlight: unreadMessages > 0 ? (unreadMessages === 1 ? "1 Unread Message" : `${unreadMessages} Unread Messages`) : "No Unread Messages",
      description: "Communicate directly with guests in real-time.",
      buttonLabel: "Open Chats",
      buttonIcon: MessageSquare,
      href: "/staff/messages",
      icon: MessageSquare,
    },
  ];
}

export default function StaffDashboard() {
  const stats = useStats();
  const managementCards = useManagementCards();
  const fetchOrders = useStaffOrdersStore((s) => s.fetchOrders);
  const loadingOrders = useStaffOrdersStore((s) => s.loading);
  const loadingMenus = useStaffMenuStore((s) => s.isLoading);
  const loadingQRs = useStaffQRStore((s) => s.loading);
  
  const { user } = useAuthStore();
  const fetchMenus = useStaffMenuStore((s) => s.fetchMenus);
  const fetchQRs = useStaffQRStore((s) => s.fetchQRs);

  // Permission gates
  const canOrders = usePermission("order_management");
  const canMenu = usePermission("menu_management");
  const canQR = usePermission("qr_management");
  const canMessages = usePermission("guest_messages");

  const permMap: Record<string, boolean> = {
    "/staff/orders": canOrders,
    "/staff/menu": canMenu,
    "/staff/qr": canQR,
    "/staff/messages": canMessages,
  };

  const visibleCards = managementCards.filter((c) => permMap[c.href] !== false);

  // Fetch all dashboard data when component mounts
  useEffect(() => {
    const propertyId = user?.propertyId || localStorage.getItem("selected_property_id");
    console.log(`📊 StaffDashboard: Refreshing all data for property: ${propertyId}...`);
    
    if (propertyId) {
      const pid = Number(propertyId);
      fetchOrders(pid);
      fetchMenus(pid);
      fetchQRs(pid, 0, 100);
    } else {
      console.warn("⚠️ No propertyId found for staff dashboard");
      fetchOrders(1);
      fetchMenus(1);
      fetchQRs(1, 0, 100);
    }
  }, [user, fetchOrders, fetchMenus, fetchQRs]);

  const isLoading = loadingOrders || loadingMenus || loadingQRs;

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {/* Stat Cards Row Skeleton */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 h-[88px] animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/4 mt-1"></div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Management Cards Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-[300px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex flex-col justify-between animate-pulse h-full">
              <div className="flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-5 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-1000 relative z-10">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-5 shrink-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <div key={stat.label} className="col-span-1 bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex justify-between items-start z-10">
                <div className={`p-2.5 ${stat.iconBg.replace('0.08', '0.15')} rounded-xl self-start group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className={stat.iconColor} />
                </div>
                <div className={`flex items-center gap-1 ${stat.trendColor} mt-1`}>
                  <TrendIcon size={12} />
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase">{stat.trend}</span>
                </div>
              </div>
              <div className="z-10 mt-6 flex flex-col gap-1">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase">{stat.label}</h3>
                <span className="text-[32px] font-extrabold text-[#1A1A1A] tracking-tighter leading-none">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Cards Grid */}
      <div className="grid grid-cols-2 gap-5 flex-1 min-h-[300px]">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          const ButtonIcon = card.buttonIcon;
          return (
            <div key={card.title} className="col-span-1 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(192,86,33,0.08)] transition-all duration-500 h-full flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#C05621] opacity-[0.03] blur-2xl rounded-full group-hover:scale-150 group-hover:opacity-[0.06] transition-all duration-700" />
              
              <div className="flex flex-col gap-4 z-10">
                <div className="bg-gradient-to-br from-[#FFF8F0] to-white border border-[#F0EBE7]/50 rounded-xl w-11 h-11 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Icon size={20} className="text-[#C05621]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[13px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">{card.title}</h3>
                  <p className="text-[22px] font-extrabold m-0 text-[#1A1A1A] tracking-tight">{card.highlight}</p>
                  <p className="text-[13px] font-semibold text-[#9E7B6A] m-0 mt-1">{card.description}</p>
                </div>
              </div>
              
              <Button asChild className="bg-[#1A1A1A] hover:bg-[#C05621] text-white mt-4 rounded-xl h-11 font-bold tracking-wide transition-colors group-hover:shadow-[0_4px_15px_rgb(192,86,33,0.3)] z-10">
                <Link href={card.href} className="flex items-center gap-2">
                  {card.buttonLabel}
                  <ButtonIcon size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          );
        })}
        {visibleCards.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-[var(--gray-3)]">
            <p className="text-sm font-medium">No features are currently enabled for your role.</p>
            <p className="text-xs mt-1">Contact your administrator to enable access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
