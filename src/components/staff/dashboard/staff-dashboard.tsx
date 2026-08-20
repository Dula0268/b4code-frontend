"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, isToday } from "date-fns";
import {
  UtensilsCrossed,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Clock,
  CheckCircle2,
  CheckCheck,
  Hourglass,
  Sunrise,
  Sun,
  Moon,
  ChevronRight,
  BellRing,
  MessageSquare
} from "lucide-react";
import { useStaffOrdersStore } from "@/store/staff/orders/staff-orders.store";
import { useStaffMenuStore } from "@/store/staff/menu/staff-menu.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { usePermission } from "@/hooks/use-permission";

const PAGE_SIZE = 5;

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const fetchOrders = useStaffOrdersStore((s) => s.fetchOrders);
  const loadingOrders = useStaffOrdersStore((s) => s.loading);
  const orders = useStaffOrdersStore((s) => s.orders);
  const acceptOrder = useStaffOrdersStore((s) => s.acceptOrder);

  const menus = useStaffMenuStore((s) => s.menus);
  const loadingMenus = useStaffMenuStore((s) => s.isLoading);
  const fetchMenus = useStaffMenuStore((s) => s.fetchMenus);

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
  const canMessages = usePermission("guest_messages");

  // Tracks whether this page has completed its own first fetch, so the
  // full-page skeleton only ever shows once — see isInitialLoading below.
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Fetch dashboard data on mount. Live updates (SSE + background poll) are
  // already owned by StaffGlobalOrdersProvider at the layout level — this
  // page just reads from the shared store instead of running its own SSE
  // connection, so navigating away doesn't kill the app-wide live feed.
  useEffect(() => {
    const rawPropertyId = user?.propertyId || (typeof window !== 'undefined' ? localStorage.getItem("selected_property_id") : null);
    const pid = rawPropertyId ? Number(rawPropertyId) : null;
    if (!pid) return;

    Promise.all([fetchOrders(pid), fetchMenus(pid)]).finally(() => setHasLoadedOnce(true));
  }, [user, fetchOrders, fetchMenus]);

  // Only block the whole page behind a skeleton on the very first load —
  // the global 15s background poll flips `loading` too, and gating on that
  // was making the dashboard flash back to a skeleton every few seconds.
  const isInitialLoading = !hasLoadedOnce && (loadingOrders || loadingMenus);

  // Deriving metrics — newest orders first
  const activeOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === "placed" || o.status === "accepted" || o.status === "in-progress")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const placedCount = useMemo(() => activeOrders.filter((o) => o.status === "placed").length, [activeOrders]);
  const inProgressCount = useMemo(
    () => activeOrders.filter((o) => o.status === "accepted" || o.status === "in-progress").length,
    [activeOrders]
  );
  const deliveredTodayCount = useMemo(
    () => orders.filter((o) => o.status === "delivered" && isToday(new Date(o.createdAt))).length,
    [orders]
  );
  const outOfStockCount = useMemo(
    () => menus.reduce((acc, menu) => acc + menu.items.filter((i) => i.status === "draft").length, 0),
    [menus]
  );

  // Status computation
  const propertyStatus = useMemo(() => {
    if (placedCount > 5) return { label: "High Volume", color: "bg-[#FEE2E2] text-[#DC2626]", dot: "bg-[#DC2626]" };
    if (placedCount > 2) return { label: "Busy", color: "bg-[#FEF3C7] text-[#D97706]", dot: "bg-[#D97706]" };
    return { label: "Normal Tempo", color: "bg-[#D1FAE5] text-[#059669]", dot: "bg-[#059669]" };
  }, [placedCount]);

  const kpiTiles = [
    {
      key: "queue",
      label: "Orders in Queue",
      value: placedCount,
      icon: ClipboardList,
      accent: "text-[#C05621] bg-[#FFF8F0]",
      href: canOrders ? "/staff/orders" : undefined,
    },
    {
      key: "progress",
      label: "In Progress",
      value: inProgressCount,
      icon: Hourglass,
      accent: "text-[#D97706] bg-[#FFFBEB]",
      href: canOrders ? "/staff/orders" : undefined,
    },
    {
      key: "delivered",
      label: "Delivered Today",
      value: deliveredTodayCount,
      icon: CheckCheck,
      accent: "text-[#059669] bg-[#ECFDF5]",
      href: canOrders ? "/staff/orders" : undefined,
    },
    {
      key: "unavailable",
      label: "Items Unavailable",
      value: outOfStockCount,
      icon: UtensilsCrossed,
      accent: "text-[#DC2626] bg-[#FEF2F2]",
      href: canMenu ? "/staff/menu" : undefined,
    },
  ];

  // Pagination for the Live Queue list
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(activeOrders.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  const pagedOrders = activeOrders.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (isInitialLoading) {
    return (
      <div className="h-full overflow-y-auto px-6 py-6 flex flex-col gap-5 bg-[#F8F9FA] animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-[#E8EAED]"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[90px] bg-white rounded-2xl border border-[#E8EAED]"></div>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="lg:w-[68%] h-[360px] bg-white rounded-2xl border border-[#E8EAED]"></div>
          <div className="lg:w-[32%] h-[360px] bg-white rounded-2xl border border-[#E8EAED]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 lg:px-8 py-6 flex flex-col gap-5 bg-[#F8F9FA]">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-5">

        {/* Ambient Welcome Header */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#C05621] to-[#E2A03F] opacity-[0.08] blur-3xl rounded-full" />

          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-gradient-to-br from-[#FFF8F0] to-white rounded-2xl border border-[#F0EBE7] shadow-sm">
              <GreetingIcon size={26} className="text-[#C05621]" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-[#1A1A1A] tracking-tight m-0">
                {greeting}, {user?.profile?.firstName || "Staff"}
              </h1>
              <p className="text-[#6B7280] font-medium mt-1 text-sm">Here is what is happening at your property today.</p>
            </div>
          </div>


        </div>

        {/* KPI Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpiTiles.map((tile) => {
            const Icon = tile.icon;
            const content = (
              <div className="bg-white rounded-2xl border border-[#E8EAED] p-4 flex items-center gap-3 h-full transition-shadow hover:shadow-md">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tile.accent}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold text-[#1A1A1A] leading-none">{tile.value}</div>
                  <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mt-1 truncate">{tile.label}</div>
                </div>
              </div>
            );
            return tile.href ? (
              <Link key={tile.key} href={tile.href}>{content}</Link>
            ) : (
              <div key={tile.key}>{content}</div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Live Queue (main column) */}
          <div className="lg:w-[68%] flex flex-col gap-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFF8F0] p-2 rounded-xl text-[#C05621]">
                    <BellRing size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Live Queue</h2>
                </div>
                {placedCount > 0 && (
                  <span className="bg-[#C05621] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {placedCount} New
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {activeOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <CheckCircle2 size={40} className="text-[#059669] mb-3" />
                    <p className="text-base font-bold text-[#1A1A1A]">All caught up!</p>
                    <p className="text-[#6B7280] text-sm">There are no active orders waiting.</p>
                  </div>
                ) : (
                  pagedOrders.map((order) => {
                    const isNew = order.status === "placed";
                    const waitTime = formatDistanceToNow(new Date(order.createdAt), { addSuffix: false });

                    return (
                      <div key={order.id} className="group relative overflow-hidden bg-white border border-[#E8EAED] hover:border-[#C05621]/30 rounded-xl p-3 transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {isNew && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C05621]" />}

                        <div className="flex items-center gap-3">
                          <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg shrink-0 ${isNew ? 'bg-[#FFF8F0] text-[#C05621]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                              {order.type === 'Table Order' ? 'Table' : 'Room'}
                            </span>
                            <span className="text-sm font-extrabold leading-none">
                              {order.table.replace(/^(Room|Table)\s+/i, '')}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1A1A] text-sm">Order #{order.id}</span>
                              <span className="text-xs font-medium text-[#6B7280] flex items-center gap-1">
                                <Clock size={11} /> {waitTime}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
                              {order.items.length} items • {order.items.map(i => i.name).join(", ")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isNew ? (
                            <button
                              onClick={() => acceptOrder(order.id)}
                              className="bg-[#1A1A1A] hover:bg-[#C05621] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors w-full sm:w-auto"
                            >
                              Accept Order
                            </button>
                          ) : (
                            <Link
                              href={`/staff/orders/${order.id}`}
                              className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1A1A1A] text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto"
                            >
                              View Details <ChevronRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeOrders.length > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8EAED]">
                  <span className="text-xs font-medium text-[#6B7280]">
                    Showing {page * PAGE_SIZE + 1}–{Math.min(activeOrders.length, page * PAGE_SIZE + PAGE_SIZE)} of {activeOrders.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="w-7 h-7 rounded-lg border border-[#E8EAED] flex items-center justify-center text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F3F4F6] transition-colors"
                      aria-label="Previous page"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <span className="text-xs font-bold text-[#1A1A1A] w-14 text-center">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="w-7 h-7 rounded-lg border border-[#E8EAED] flex items-center justify-center text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F3F4F6] transition-colors"
                      aria-label="Next page"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tools (sidebar column) */}
          <div className="lg:w-[32%] flex flex-col gap-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
              <h3 className="text-[12px] font-bold tracking-[0.12em] text-[#6B7280] uppercase mb-3">Quick Tools</h3>

              <div className="flex flex-col gap-2">
                {canOrders && (
                  <Link href="/staff/orders" className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <ClipboardList size={16} />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm">Manage Orders</span>
                    </div>
                    <ArrowRight size={15} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {canMenu && (
                  <Link href="/staff/menu" className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <UtensilsCrossed size={16} />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm">Update Menu</span>
                    </div>
                    <ArrowRight size={15} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {canQR && (
                  <Link href="/staff/qr" className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <QrCode size={16} />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm">QR Codes</span>
                    </div>
                    <ArrowRight size={15} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {canMessages && (
                  <Link href="/staff/messages" className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF8F0] border border-transparent hover:border-[#F0EBE7] transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] group-hover:bg-white flex items-center justify-center text-[#1A1A1A] group-hover:text-[#C05621] transition-colors shadow-sm">
                        <MessageSquare size={16} />
                      </div>
                      <span className="font-bold text-[#1A1A1A] text-sm">Guest Chats</span>
                    </div>
                    <ArrowRight size={15} className="text-[#6B7280] group-hover:text-[#C05621] group-hover:translate-x-1 transition-transform" />
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
