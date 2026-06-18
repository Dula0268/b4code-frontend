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
  const inProgress = useStaffOrdersStore((s) => s.getCountByStatus("in-progress"));
  const deliveredCount = useStaffOrdersStore((s) => s.getCountByStatus("delivered")) + useStaffOrdersStore((s) => s.getCountByStatus("completed"));

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
      highlight: placedCount > 0 ? `${placedCount} New Orders` : "No New Orders",
      description: "Manage incoming guest orders and update prep status.",
      buttonLabel: "Manage Orders",
      buttonIcon: ArrowRight,
      href: "/staff/orders",
      icon: ClipboardList,
    },
    {
      title: "Menu Management",
      highlight: outOfStockCount > 0 ? `${outOfStockCount} Items Unavailable` : "All Items Available",
      description: "Update menu availability and manage property dishes.",
      buttonLabel: "Update Menu",
      buttonIcon: UtensilsCrossed,
      href: "/staff/menu",
      icon: UtensilsCrossed,
    },
    {
      title: "QR Management",
      highlight: `${activeQRs} Active QR Codes`,
      description: "Monitor and manage QR code locations for guest ordering.",
      buttonLabel: "View QR Codes",
      buttonIcon: Eye,
      href: "/staff/qr",
      icon: QrCode,
    },
    {
      title: "Guest Chats",
      highlight: unreadMessages > 0 ? `${unreadMessages} Unread Messages` : "No Unread Messages",
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
      fetchQRs(pid);
    } else {
      console.warn("⚠️ No propertyId found for staff dashboard");
      fetchOrders(1);
      fetchMenus(1);
      fetchQRs(1);
    }
  }, [user, fetchOrders, fetchMenus, fetchQRs]);

  return (
    <div className="h-full overflow-y-auto px-6 py-4 flex flex-col gap-4">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <Card key={stat.label} className="bg-white border-0 py-0 gap-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <CardContent className="px-4 py-3 flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-[#6b7280]">{stat.label}</span>
                  <span className="text-2xl font-bold text-[#111827] leading-tight">{stat.value}</span>
                  <div className={`flex items-center gap-1 ${stat.trendColor} mt-0.5`}>
                    <TrendIcon size={12} />
                    <span className="text-[10px] font-medium">{stat.trend}</span>
                  </div>
                </div>
                <div className={`${stat.iconBg} rounded-lg p-2 flex items-center justify-center`}>
                  <Icon size={18} className={stat.iconColor} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Management Cards Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-[300px]">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          const ButtonIcon = card.buttonIcon;
          return (
            <Card key={card.title} className="bg-white border-0 py-0 gap-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] h-full">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-[rgba(149,48,2,0.08)] rounded-lg w-9 h-9 flex items-center justify-center">
                      <Icon size={18} className="text-[var(--brand-primary)]" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-[#111827] m-0">{card.title}</h3>
                    <p className="text-lg font-bold m-0 mt-0.5 text-[var(--brand-primary)]">{card.highlight}</p>
                    <p className="text-xs text-[#6b7280] m-0 mt-0.5 line-clamp-2">{card.description}</p>
                  </div>
                </div>
                <Button asChild className="bg-[var(--brand-primary)] text-white mt-2 gap-1.5">
                  <Link href={card.href}>
                    {card.buttonLabel}
                    <ButtonIcon size={14} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
