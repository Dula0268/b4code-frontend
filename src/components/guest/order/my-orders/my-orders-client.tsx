"use client";

import * as React from "react";
import Link from "next/link";
import { useOrderStore, type Order, type OrderStatus } from "@/store/guest/order/order-store";

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
  Placed:       { bg: "bg-[#dbeafe] border-[#bfdbfe]", dot: "bg-[#3b82f6]", text: "text-[#1e40af]" },
  Accepted:     { bg: "bg-[#fef3c7] border-[#fde68a]", dot: "bg-[#f59e0b]", text: "text-[#92400e]" },
  "In-Progress":{ bg: "bg-[#fef3c7] border-[#fde68a]", dot: "bg-[#f59e0b]", text: "text-[#92400e]" },
  Delivered:    { bg: "bg-[#dcfce7] border-[#bbf7d0]", dot: "bg-[#22c55e]", text: "text-[#166534]" },
  Rejected:     { bg: "bg-[#fee2e2] border-[#fecaca]", dot: "bg-[#ef4444]", text: "text-[#991b1b]" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-medium leading-[16px] ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ─── Service type helpers ─── */

function ServiceIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#ffedd5] flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M3 7l1.7 11.5a2 2 0 0 0 2 1.5h10.6a2 2 0 0 0 2-1.5L21 7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ─── Pagination ─── */

const PAGE_SIZE = 5;

/* ─── Component ─── */

export default function MyOrdersClient() {
  const orderHistory = useOrderStore((s) => s.orderHistory);
  const currentOrder = useOrderStore((s) => s.currentOrder);

  // Combine current order (if any) with history
  const allOrders = React.useMemo(() => {
    const list: Order[] = [];
    if (currentOrder) list.push(currentOrder);
    list.push(...orderHistory);
    return list;
  }, [currentOrder, orderHistory]);

  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
  const paged = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalSpent = React.useMemo(
    () => allOrders.reduce((sum, o) => sum + o.total, 0),
    [allOrders],
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 md:py-5">
      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-base mb-1">
        <Link href="/guest/order" className="flex items-center gap-1">
          <HomeIcon />
        </Link>
        <span className="text-[16px] font-medium text-[#828282] leading-[22.4px]">Home</span>
        <ChevronRight />
        <span className="text-[16px] font-medium text-[#af3a04] leading-[22.4px]">Order History</span>
      </nav>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-bold text-[#1D1D1D] leading-[30px] md:leading-[36px] tracking-[-0.5px]">
            Order History
          </h1>
          <p className="text-[14px] text-[#835748] leading-[20px] mt-1">
            View and manage your past orders during your stay
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#ede4de] rounded-lg bg-white text-[14px] font-medium text-[#1D1D1D] hover:bg-[#f8f6f5] transition cursor-pointer shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filter
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white border border-[#ede4de] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden mb-5">
        {/* Table header — desktop only */}
        <div className="hidden md:grid bg-[#fcfaf9] border-b border-[#ede4de] px-6 py-3 grid-cols-[140px_180px_220px_1fr_160px_50px] gap-4 items-center">
          <span className="text-[12px] font-semibold text-[#835748] uppercase tracking-[0.6px] leading-[16px]">Order ID</span>
          <span className="text-[12px] font-semibold text-[#835748] uppercase tracking-[0.6px] leading-[16px]">Date & Time</span>
          <span className="text-[12px] font-semibold text-[#835748] uppercase tracking-[0.6px] leading-[16px]">Service</span>
          <span className="text-[12px] font-semibold text-[#835748] uppercase tracking-[0.6px] leading-[16px] text-right">Total LKR</span>
          <span className="text-[12px] font-semibold text-[#835748] uppercase tracking-[0.6px] leading-[16px] text-center">Status</span>
          <span />
        </div>

        {/* Table rows */}
        {paged.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[14px] text-[#6b7280]">No orders yet.</p>
            <Link href="/guest/order/menu" className="inline-block mt-2 text-[14px] font-medium text-[#af3a04] underline">Browse Menu</Link>
          </div>
        ) : (
          paged.map((order, idx) => {
            const placedTs = order.timeline[0]?.timestamp ?? Date.now();
            return (
              <React.Fragment key={order.id}>
                {/* Desktop row */}
                <div
                  className={`hidden md:grid px-6 py-4 grid-cols-[140px_180px_220px_1fr_160px_50px] gap-4 items-center hover:bg-[#faf8f7] transition ${idx > 0 ? "border-t border-[#ede4de]" : ""}`}
                >
                  {/* Order ID */}
                  <span className="text-[14px] font-medium text-[#af3a04] leading-[20px]">
                    {order.id}
                  </span>

                  {/* Date & Time */}
                  <div>
                    <p className="text-[14px] text-[#1D1D1D] leading-[20px]">{formatDate(placedTs)}</p>
                    <p className="text-[12px] text-[#1D1D1D] leading-[16px]">{formatTimeShort(placedTs)}</p>
                  </div>

                  {/* Service */}
                  <div className="flex items-center gap-3">
                    <ServiceIcon />
                    <span className="text-[14px] text-[#835748] leading-[20px]">In-Room Dining</span>
                  </div>

                  {/* Total */}
                  <span className="text-[14px] font-bold text-[#1D1D1D] leading-[20px] text-right">
                    {formatLkr(order.total)}
                  </span>

                  {/* Status */}
                  <div className="flex justify-center">
                    <StatusBadge status={order.currentStatus} />
                  </div>

                  {/* Chevron */}
                  <div className="flex justify-end">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Mobile card */}
                <div
                  className={`md:hidden px-4 py-3 hover:bg-[#faf8f7] transition ${idx > 0 ? "border-t border-[#ede4de]" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-medium text-[#af3a04] leading-[20px]">
                      {order.id}
                    </span>
                    <StatusBadge status={order.currentStatus} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ServiceIcon />
                      <div>
                        <p className="text-[13px] text-[#1D1D1D] leading-[18px]">{formatDate(placedTs)}</p>
                        <p className="text-[11px] text-[#835748] leading-[14px]">{formatTimeShort(placedTs)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#1D1D1D] leading-[20px]">
                        {formatLkr(order.total)} LKR
                      </span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L10 8L6 12" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* Pagination footer */}
        {allOrders.length > 0 && (
          <div className="border-t border-[#ede4de] px-6 py-3 flex items-center justify-between">
            <p className="text-[14px] text-[#835748] leading-[20px]">
              Showing{" "}
              <span className="font-medium text-[#af3a04]">{(page - 1) * PAGE_SIZE + 1}</span>
              {" "}to{" "}
              <span className="font-medium text-[#af3a04]">{Math.min(page * PAGE_SIZE, allOrders.length)}</span>
              {" "}of{" "}
              <span className="font-medium text-[#af3a04]">{allOrders.length}</span>
              {" "}results
            </p>

            <div className="flex items-center border border-[#1D1D1D] rounded-md overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-2 border-r border-[#1D1D1D] bg-white hover:bg-[#f8f6f5] disabled:opacity-40 transition cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8L10 12" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-1.5 text-[14px] font-medium leading-[20px] border-r border-[#1D1D1D] last:border-r-0 transition cursor-pointer ${
                    p === page
                      ? "bg-[rgba(175,58,4,0.1)] text-[#af3a04] border-[#af3a04]"
                      : "bg-white text-[#1D1D1D] hover:bg-[#f8f6f5]"
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-2 border-l border-[#1D1D1D] bg-white hover:bg-[#f8f6f5] disabled:opacity-40 transition cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="#1D1D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer summary cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Spent */}
        <div className="bg-white border border-[#ede4de] rounded-lg p-6 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <p className="text-[14px] font-medium text-[#1D1D1D] leading-[20px]">Total Spent</p>
            <p className="text-[24px] font-bold text-[#1D1D1D] leading-[32px]">
              {formatLkr(totalSpent)} LKR
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[rgba(175,58,4,0.1)] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="#af3a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10h22" stroke="#af3a04" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#ede4de] rounded-lg p-6 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <p className="text-[14px] font-medium text-[#1D1D1D] leading-[20px]">Total Orders</p>
            <p className="text-[24px] font-bold text-[#1D1D1D] leading-[32px]">
              {allOrders.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[rgba(175,58,4,0.1)] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#af3a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#af3a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Need Help? */}
        <Link
          href="/guest/order/help"
          className="relative overflow-hidden rounded-lg p-6 flex flex-col justify-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
          style={{ background: "linear-gradient(165deg, #af3a04 0%, #9a3412 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <p className="text-[14px] font-medium text-white/80 leading-[20px]">Need Help?</p>
          <div className="flex items-center gap-2 mt-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 18v-6a9 9 0 1 1 18 0v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[16px] font-bold text-white leading-[24px]">Contact Front Desk</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L12 3L21 12M5 10.5V20.5C5 20.776 5.224 21 5.5 21H10.5V16C10.5 15.724 10.724 15.5 11 15.5H13C13.276 15.5 13.5 15.724 13.5 16V21H18.5C18.776 21 19 20.776 19 20.5V10.5"
        stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M6 4L10 8L6 12" stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
