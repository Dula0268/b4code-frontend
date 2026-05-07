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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      trend: "+2 from last hour",
      trendIcon: TrendingUp,
      trendColor: "text-[var(--brand-primary)]",
    },
    {
      label: "In-Progress",
      value: String(inProgress),
      icon: Hourglass,
      iconBg: "bg-[rgba(255,180,1,0.08)]",
      iconColor: "text-[var(--brand-secondary)]",
      trend: "2 delayed > 15m",
      trendIcon: Hourglass,
      trendColor: "text-[var(--brand-secondary)]",
    },
    {
      label: "Delivered Today",
      value: String(deliveredCount),
      icon: CheckCheck,
      iconBg: "bg-[rgba(39,174,96,0.08)]",
      iconColor: "text-[var(--state-success)]",
      trend: "98% Satisfaction",
      trendIcon: CheckCheck,
      trendColor: "text-[var(--state-success)]",
    },
    {
      label: "Avg Prep Time",
      value: "18m",
      icon: Timer,
      iconBg: "bg-[rgba(47,128,237,0.08)]",
      iconColor: "text-[var(--state-info)]",
      trend: "-2m vs Yesterday",
      trendIcon: ArrowDown,
      trendColor: "text-[var(--state-info)]",
    },
  ];
}

function useManagementCards() {
  const placedCount = useStaffOrdersStore((s) => s.getCountByStatus("placed"));
  return [
    {
      title: "Order Management",
      highlight: `${placedCount} New Orders`,
      description: "Pending review and assignment to kitchen staff.",
      buttonLabel: "Manage Orders",
      buttonIcon: ArrowRight,
      href: "/staff/orders",
      icon: ClipboardList,
    },
    {
      title: "Menu Management",
      highlight: "2 Items Out of Stock",
      description: "Update availability for dinner service menu items.",
      buttonLabel: "Update Menu",
      buttonIcon: UtensilsCrossed,
      href: "/staff/menu",
      icon: UtensilsCrossed,
    },
    {
      title: "QR Management",
      highlight: "24 Active QRs",
      description: "Current active sessions across all dining areas.",
      buttonLabel: "View QR Codes",
      buttonIcon: Eye,
      href: "/staff/qr",
      icon: QrCode,
    },
    {
      title: "Guest Chats",
      highlight: "3 Unread Messages",
      description: "Direct inquiries from rooms 104, 202, and 305.",
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

  // Fetch orders when component mounts
  useEffect(() => {
    console.log("📊 StaffDashboard mounted, fetching orders...");
    fetchOrders(1); // Fetch orders for property ID 1
  }, []);

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
        {managementCards.map((card) => {
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
      </div>
    </div>
  );
}
