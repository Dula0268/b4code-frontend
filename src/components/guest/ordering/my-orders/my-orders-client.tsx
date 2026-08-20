"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrderStore, type Order, type OrderStatus } from "@/store/guest/ordering/order.store";
import { useGuestSessionStore } from "@/store/guest/ordering/guest-session.store";

import { useAuthStore } from "@/store/auth/auth.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTimeShort(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/* ─── Status badge ─── */

const STATUS_STYLES: Record<OrderStatus, { bg: string; dot: string; text: string }> = {
  placed:       { bg: "bg-blue-50/80 backdrop-blur-md border border-blue-100", dot: "bg-blue-500", text: "text-blue-700" },
  accepted:     { bg: "bg-orange-50/80 backdrop-blur-md border border-orange-100", dot: "bg-orange-500", text: "text-orange-700" },
  "in-progress":{ bg: "bg-orange-50/80 backdrop-blur-md border border-orange-100", dot: "bg-orange-500", text: "text-orange-700" },
  delivered:    { bg: "bg-green-50/80 backdrop-blur-md border border-green-100", dot: "bg-green-500", text: "text-green-700" },
  cancelled:    { bg: "bg-red-50/80 backdrop-blur-md border border-red-100", dot: "bg-red-500", text: "text-red-700" },
  "payment-pending": { bg: "bg-gray-50/80 backdrop-blur-md border border-gray-200", dot: "bg-gray-400", text: "text-gray-600" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status];
  const labelMap: Record<OrderStatus, string> = {
    placed: "Placed",
    accepted: "Accepted",
    "in-progress": "In Progress",
    delivered: "Delivered",
    cancelled: "Cancelled",
    "payment-pending": "Payment Pending",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${s.bg} ${s.text} shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {labelMap[status]}
    </span>
  );
}

/* ─── Service type helpers ─── */

function ServiceIcon() {
  return (
    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50 shadow-inner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 7l1.7 11.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand-primary)]" />
      </svg>
    </div>
  );
}

/* ─── Pagination ─── */

const PAGE_SIZE = 5;

/* ─── Component ─── */

export default function MyOrdersClient() {
  const router = useRouter();
  const orderHistory = useOrderStore((s) => s.orderHistory);
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const fetchOrderHistory = useOrderStore((s) => s.fetchOrderHistory);
  const user = useAuthStore((s) => s.user);
  const guestSessionId = useGuestSessionStore((s) => s.sessionId);

  React.useEffect(() => {
    fetchOrderHistory(user?.userId, guestSessionId || undefined);
  }, [user?.userId, guestSessionId, fetchOrderHistory]);

  const [filter, setFilter] = React.useState<"All" | "Active" | "Past">("All");

  // Combine current order (if any) with history
  const allOrders = React.useMemo(() => {
    const list: Order[] = [];
    if (currentOrder) {
      list.push(currentOrder);
    }
    
    // Add history orders, avoiding duplicates
    for (const histOrder of orderHistory) {
      if (!list.find((o) => o.id === histOrder.id)) {
        list.push(histOrder);
      }
    }

    // Apply Filter
    const filteredList = list.filter((order) => {
      // Never show payment-pending orders
      if (order.currentStatus === "payment-pending") return false;

      if (filter === "All") return true;
      const isActive = ["placed", "accepted", "in-progress"].includes(order.currentStatus);
      if (filter === "Active") return isActive;
      if (filter === "Past") return !isActive;
      return true;
    });
    
    // Sort by timestamp descending (newest first)
    filteredList.sort((a, b) => {
      const aTime = a.timeline?.[a.timeline.length - 1]?.timestamp || 0;
      const bTime = b.timeline?.[b.timeline.length - 1]?.timestamp || 0;
      return bTime - aTime;
    });

    return filteredList;
  }, [currentOrder, orderHistory, filter]);

  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
  const paged = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalSpent = React.useMemo(
    () => allOrders.reduce((sum, o) => sum + o.total, 0),
    [allOrders],
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-sm mb-6 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/60">
        <Link href="/guest/order" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors group">
          <HomeIcon />
          <span className="font-medium">Home</span>
        </Link>
        <ChevronRight />
        <span className="font-semibold text-[var(--brand-primary)]">Order History</span>
      </nav>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Order History
          </h1>
          <p className="text-base text-gray-500 mt-2">
            View and manage your past orders during your stay
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-white/60 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filter: {filter}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-white/60 shadow-lg bg-white/90 backdrop-blur-xl">
            <DropdownMenuItem onClick={() => setFilter("All")} className="cursor-pointer font-medium focus:bg-orange-50 focus:text-[var(--brand-primary)]">
              All Orders
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("Active")} className="cursor-pointer font-medium focus:bg-orange-50 focus:text-[var(--brand-primary)]">
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("Past")} className="cursor-pointer font-medium focus:bg-orange-50 focus:text-[var(--brand-primary)]">
              Past
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden mb-8 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/5 to-transparent pointer-events-none" />

        {/* Table header — desktop only */}
        <div className="hidden md:grid bg-white/40 border-b border-gray-100/80 px-8 py-4 grid-cols-[140px_180px_220px_1fr_160px_100px_50px] gap-4 items-center relative z-10">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total LKR</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</span>
          <span />
        </div>

        {/* Table rows */}
        <div className="relative z-10">
          {paged.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <p className="text-base text-gray-500 font-medium">No orders found.</p>
              <Link href="/guest/order/menu" className="inline-block mt-3 px-6 py-2 bg-[var(--brand-primary)] text-white font-semibold rounded-xl hover:bg-[#C05621] transition-colors shadow-sm">
                Browse Menu
              </Link>
            </div>
          ) : (
            paged.map((order, idx) => {
              const placedTs = order.timeline?.[0]?.timestamp ?? Date.now();
              const uniqueKey = `${order.id}-${order.timeline?.[0]?.timestamp ?? idx}`;
              return (
                <React.Fragment key={uniqueKey}>
                  {/* Desktop row */}
                  <div
                    onClick={() => {
                      useOrderStore.setState({ currentOrder: order });
                      router.push("/guest/order/track");
                    }}
                    className={`hidden md:grid px-8 py-5 grid-cols-[140px_180px_220px_1fr_160px_100px_50px] gap-4 items-center hover:bg-white/80 transition-colors cursor-pointer group ${idx > 0 ? "border-t border-gray-100/80" : ""}`}
                  >
                    {/* Order ID */}
                    <span className="text-sm font-bold text-[var(--brand-primary)] tracking-wide group-hover:scale-105 transition-transform origin-left">
                      {order.id}
                    </span>

                    {/* Date & Time */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(placedTs)}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{formatTimeShort(placedTs)}</p>
                    </div>

                    {/* Service */}
                    <div className="flex items-center gap-3">
                      <ServiceIcon />
                      <span className="text-sm font-medium text-gray-700">In-Room Dining</span>
                    </div>

                    {/* Total */}
                    <span className="text-base font-bold text-gray-900 text-right">
                      {formatLkr(order.total)}
                    </span>

                    {/* Status */}
                    <div className="flex justify-center">
                      <StatusBadge status={order.currentStatus} />
                    </div>

                    {/* Review button */}
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          useOrderStore.setState({ currentOrder: order });
                          router.push("/guest/order/review");
                        }}
                        className="text-sm font-semibold text-[var(--brand-primary)] hover:text-[#C05621] hover:underline underline-offset-4 transition-all cursor-pointer"
                      >
                        Review
                      </button>
                    </div>

                    {/* Chevron */}
                    <div className="flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-gray-400 group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div
                    onClick={() => {
                      useOrderStore.setState({ currentOrder: order });
                      router.push("/guest/order/track");
                    }}
                    className={`md:hidden px-5 py-4 hover:bg-white/80 transition-colors cursor-pointer group ${idx > 0 ? "border-t border-gray-100/80" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[var(--brand-primary)] tracking-wide">
                        {order.id}
                      </span>
                      <StatusBadge status={order.currentStatus} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <ServiceIcon />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(placedTs)}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{formatTimeShort(placedTs)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">
                          {formatLkr(order.total)} LKR
                        </span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 group-hover:translate-x-1 transition-transform">
                          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        useOrderStore.setState({ currentOrder: order });
                        router.push("/guest/order/review");
                      }}
                      className="w-full py-2 bg-orange-50/50 hover:bg-orange-100/50 rounded-xl text-sm font-semibold text-center text-[var(--brand-primary)] hover:text-[#C05621] transition-colors cursor-pointer"
                    >
                      Write Review
                    </button>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Pagination footer */}
        {allOrders.length > 0 && (
          <div className="border-t border-gray-100/80 bg-white/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <p className="text-sm font-medium text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span>
              {" "}to{" "}
              <span className="font-bold text-gray-900">{Math.min(page * PAGE_SIZE, allOrders.length)}</span>
              {" "}of{" "}
              <span className="font-bold text-gray-900">{allOrders.length}</span>
              {" "}results
            </p>

            <div className="flex items-center bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border-r border-gray-200/80 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-gray-600">
                  <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 text-sm font-bold border-r border-gray-200/80 last:border-r-0 transition-colors cursor-pointer ${
                      p === page
                        ? "bg-orange-50 text-[var(--brand-primary)]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border-l border-gray-200/80 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-gray-600">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer summary cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Total Spent */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-shadow">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatLkr(totalSpent)} <span className="text-base font-semibold text-gray-400">LKR</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100/50 flex items-center justify-center shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[var(--brand-primary)]">
              <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-shadow">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {allOrders.length}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100/50 flex items-center justify-center shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[var(--brand-primary)]">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Need Help? */}
        <Link
          href="/guest/order/help"
          className="relative overflow-hidden rounded-3xl p-6 flex flex-col justify-center shadow-[0_8px_32px_rgba(217,119,6,0.15)] group transition-transform hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, var(--brand-primary) 0%, #C05621 100%)" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-1">Need Help?</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M3 18v-6a9 9 0 1 1 18 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform">Contact Front Desk</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform">
      <path
        d="M3 12L12 3L21 12M5 10.5V20.5C5 20.776 5.224 21 5.5 21H10.5V16C10.5 15.724 10.724 15.5 11 15.5H13C13.276 15.5 13.5 15.724 13.5 16V21H18.5C18.776 21 19 20.776 19 20.5V10.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 shrink-0">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
