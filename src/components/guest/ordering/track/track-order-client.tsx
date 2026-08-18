"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useOrderStore, type OrderStatus } from "@/store/guest/ordering/order.store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ─── Status pipeline (happy path + rejected) ─── */

const STATUS_PIPELINE: OrderStatus[] = [
  "placed",
  "accepted",
  "in-progress",
  "delivered",
];

const STATUS_DESCRIPTIONS: Record<OrderStatus, (loc: string) => string> = {
  placed: (loc) => `We have received your order request from ${loc}.`,
  accepted: () => "The kitchen has accepted your order and started preparing.",
  "in-progress": () =>
    "Your order is being plated and prepared for room service delivery.",
  delivered: (loc) => `Order successfully delivered to ${loc}.`,
  cancelled: () => "Unfortunately, the kitchen was unable to fulfill your order.",
  "payment-pending": () => "Payment is pending.",
};

/* ─── Hero config by status ─── */

function getHeroBanner(status: OrderStatus, rejectionReason?: string) {
  if (status === "cancelled") {
    return {
      bg: "bg-gradient-to-br from-red-50/80 to-red-100/80 border-red-200/50",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#EF4444" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: "Order Cancelled",
      subtitle: rejectionReason || "The kitchen was unable to process your order at this time.",
      titleColor: "text-red-600",
    };
  }
  if (status === "delivered") {
    return {
      bg: "bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#10B981" />
          <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Order Delivered!",
      subtitle: "We hope you enjoy your meal. Thank you for ordering with Prime Stay.",
      titleColor: "text-green-700",
    };
  }
  return {
    bg: "bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#F97316" strokeWidth="2" fill="white" />
        <path d="M12 6v6l4 2" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: status === "placed" ? "Order Placed" : status === "accepted" ? "Being Prepared" : "In Progress",
    subtitle: "Your order is being prepared. We\u2019ll update you as it progresses.",
    titleColor: "text-[var(--brand-primary)]",
  };
}

/* ─── Status badge helper ─── */

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    placed: { bg: "bg-blue-50/80 border border-blue-100/50", text: "text-blue-700", label: "Placed" },
    accepted: { bg: "bg-orange-50/80 border border-orange-100/50", text: "text-orange-700", label: "Accepted" },
    "in-progress": { bg: "bg-orange-50/80 border border-orange-100/50", text: "text-orange-700", label: "In Progress" },
    delivered: { bg: "bg-green-50/80 border border-green-100/50", text: "text-green-700", label: "Delivered" },
    cancelled: { bg: "bg-red-50/80 border border-red-100/50", text: "text-red-700", label: "Cancelled" },
    "payment-pending": { bg: "bg-gray-50/80 border border-gray-200/50", text: "text-gray-600", label: "Payment Pending" },
  };
  const c = config[status];
  return (
    <span className={`px-3 py-1 rounded-full ${c.bg} ${c.text} text-xs font-semibold tracking-wide shadow-sm backdrop-blur-md`}>
      {c.label}
    </span>
  );
}

/* ─── Track Order Client ─── */

/* ─── Backend status → frontend status mapper ─── */
function mapBackendStatus(backendStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    NEW: "placed",
    PREPARING: "accepted",
    READY: "in-progress",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    PAYMENT_PENDING: "placed",
    payment_pending: "placed",
    placed: "placed",
    accepted: "accepted",
    "in-progress": "in-progress",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return statusMap[backendStatus] || (statusMap[backendStatus.toLowerCase()] as OrderStatus) || "placed";
}

export default function TrackOrderClient() {
  const order = useOrderStore((s) => s.currentOrder);
  const advanceStatus = useOrderStore((s) => s.advanceStatus);
  const syncCurrentOrder = useOrderStore((s) => s.syncCurrentOrder);

  const numericOrderId = order?.id?.replace('#ORD-', '');

  React.useEffect(() => {
    syncCurrentOrder();
  }, [syncCurrentOrder]);


  /* ── No order state ── */
  if (!order) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <nav className="flex items-center gap-2 text-sm mb-6 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/60 shadow-sm">
          <Link href="/guest/order" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors group">
            <HomeIcon />
            <span className="font-medium">Home</span>
          </Link>
          <ChevronRight />
          <span className="font-semibold text-[var(--brand-primary)]">Track Order</span>
        </nav>
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-gray-300">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-500">No active order to track</p>
          <Link
            href="/guest/order/menu"
            className="px-8 py-4 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-base hover:bg-[#C05621] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/20"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const hero = getHeroBanner(order.currentStatus, order.rejectionReason);

  /* Build timeline display from order's real timeline + remaining pipeline steps */
  const isRejected = order.currentStatus === "cancelled";
  const completedStatuses = new Set(order.timeline.map((t) => t.status));
  const timelineMap = Object.fromEntries(order.timeline.map((t) => [t.status, t]));

  /* For rejected orders, show only completed steps + the rejected step */
  const displaySteps = isRejected
    ? [
        ...STATUS_PIPELINE.filter((s) => completedStatuses.has(s)),
        "cancelled" as OrderStatus,
      ]
    : STATUS_PIPELINE;

  /* First item image for sidebar hero */
  const firstItemImage = order.lines[0]?.item.imageUrl;

  /* Find last completed status for the pulse animation */
  const completedList = Array.from(completedStatuses);
  const lastCompletedStatus = completedList.length > 0 ? completedList[completedList.length - 1] : null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-sm mb-6 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/60 shadow-sm">
        <Link href="/guest/order" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors group">
          <HomeIcon />
          <span className="font-medium">Home</span>
        </Link>
        <ChevronRight />
        <span className="font-semibold text-[var(--brand-primary)]">Track Order</span>
      </nav>

      {/* ─── Order meta ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Track Order
        </h1>
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 shadow-sm">
          <span className="text-sm font-bold text-[var(--brand-primary)]">{order.id}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span className="text-sm font-semibold text-gray-600">{order.location}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span className="text-sm font-semibold text-gray-600">{order.placedAt}</span>
        </div>
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ════════════════════ LEFT: Timeline ════════════════════ */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* ── Hero banner (compact) ── */}
          <div className={`rounded-3xl border backdrop-blur-xl ${hero.bg} px-6 py-6 flex items-center gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)]`}>
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-white/60">
              {hero.icon}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${hero.titleColor} tracking-tight`}>
                {hero.title}
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {hero.subtitle}
              </p>
            </div>
          </div>

          {/* ── Status Timeline (compact) ── */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] px-8 py-8 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-lg font-bold text-gray-900 mb-8 relative z-10 tracking-tight">
              Order Status
            </h3>

            <div className="relative z-10">
              {displaySteps.map((status, idx) => {
                const isLast = idx === displaySteps.length - 1;
                const completed = completedStatuses.has(status);
                const timeEntry = timelineMap[status];
                const isRejectedStep = status === "cancelled";
                const isFinal = status === "delivered" && completed;
                const isLastCompleted = status === lastCompletedStatus;

                return (
                  <div key={status} className="flex gap-5">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center relative">
                      <div className="relative flex items-center justify-center">
                        {/* Pulse effect for active step */}
                        {completed && isLastCompleted && !isRejectedStep && (
                          <div className="absolute inset-0 rounded-full bg-[var(--brand-primary)] opacity-20 animate-ping scale-150" />
                        )}
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 border-2 ${
                            isRejectedStep
                              ? "bg-red-500 border-red-500 text-white shadow-red-200"
                              : completed
                                ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-orange-200 scale-110"
                                : "bg-white border-gray-200 text-gray-300"
                          }`}
                        >
                          {isRejectedStep ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          ) : completed ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                          )}
                        </div>
                      </div>
                      {!isLast && (
                        <div
                          className={`w-[2px] flex-1 min-h-[40px] my-1 rounded-full transition-colors duration-500 ${
                            completed &&
                            (displaySteps[idx + 1] === "cancelled"
                              ? true
                              : completedStatuses.has(displaySteps[idx + 1]))
                              ? isRejected
                                ? "bg-red-500"
                                : "bg-[var(--brand-primary)]"
                              : "bg-gray-100"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`${isLast ? "pb-0" : "pb-8"} flex-1`}>
                      <div className="flex items-center gap-3">
                        <h4
                          className={`text-base font-bold ${
                            isRejectedStep
                              ? "text-red-600"
                              : isFinal
                                ? "text-green-600"
                                : completed
                                  ? "text-gray-900"
                                  : "text-gray-400"
                          }`}
                        >
                          {status === "delivered"
                            ? "Delivered to Location"
                            : status === "in-progress"
                              ? "In Progress"
                              : status === "accepted"
                                ? "Accepted"
                                : status === "placed"
                                  ? "Placed"
                                  : status}
                        </h4>
                        {timeEntry && (
                          <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                            {timeEntry.time}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-medium mt-1.5 max-w-[420px] ${completed || isRejectedStep ? "text-gray-500" : "text-gray-300"}`}>
                        {completed || isRejectedStep
                          ? isRejectedStep && order.rejectionReason
                            ? order.rejectionReason
                            : STATUS_DESCRIPTIONS[status](order.location || "")
                          : "Pending..."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom action buttons ── */}
          <div className="flex flex-wrap gap-4 pt-2">
            {order.currentStatus === "delivered" && (
              <Link
                href="/guest/order/review"
                className="flex items-center justify-center gap-2 bg-[var(--brand-primary)] rounded-2xl px-6 py-4 shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:bg-[#C05621] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white group-hover:rotate-12 transition-transform">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                <span className="text-base font-bold text-white">Review Order</span>
              </Link>
            )}
            <Link
              href="/guest/order/receipt"
              className="flex items-center justify-center gap-2 bg-white/80 border border-gray-200/80 rounded-2xl px-6 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600 group-hover:text-[var(--brand-primary)] transition-colors">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-base font-bold text-gray-700">View Receipt</span>
            </Link>
            <Link
              href="/guest/order/help"
              className="flex items-center justify-center gap-2 bg-white/80 border border-gray-200/80 rounded-2xl px-6 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600 group-hover:text-[var(--brand-primary)] transition-colors">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 9a3 3 0 1 1 3.95 2.84c-.58.2-1 .74-1 1.33V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1.5" fill="currentColor" />
              </svg>
              <span className="text-base font-bold text-gray-700">Need Help?</span>
            </Link>
            {order.currentStatus === "cancelled" && (
              <Link
                href="/guest/order/menu"
                className="flex items-center justify-center gap-2 bg-[var(--brand-primary)] rounded-2xl px-6 py-4 shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:bg-[#C05621] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <span className="text-base font-bold text-white">Back to Menu</span>
              </Link>
            )}
          </div>
        </div>

        {/* ════════════════════ RIGHT: Order Summary sidebar ════════════════════ */}
        <div className="w-full lg:w-[380px] lg:shrink-0 lg:sticky lg:top-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
            {/* Subtle top glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gray-100/50 to-transparent pointer-events-none" />
            
            {/* Food hero image */}
            {firstItemImage && (
              <div className="relative w-full h-[180px] bg-gray-50 border-b border-white/60">
                <Image
                  src={firstItemImage}
                  alt="Your selection"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 380px"
                />
                {/* Gradient overlay for text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-gray-900 shadow-md">
                    Your Selection
                  </span>
                </div>
              </div>
            )}

            {/* Order Summary Content */}
            <div className="px-6 py-6 space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                  Order Summary
                </h3>
                <StatusBadge status={order.currentStatus} />
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.lines.map((line, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 group">
                    <span className="text-sm font-medium text-gray-700 leading-relaxed">
                      <span className="text-gray-400 font-bold mr-2">{line.qty}x</span>
                      <span className="group-hover:text-[var(--brand-primary)] transition-colors">{line.item.title}</span>
                    </span>
                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      {formatLkr(line.item.priceLkr * line.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100/80" />

              {/* Totals */}
              <div className="space-y-2.5">
                {(() => {
                  const scPercent = order.subtotal > 0 ? Math.round((order.serviceCharge / order.subtotal) * 100) : 10;
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="text-gray-900 font-bold">{formatLkr(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Service Charge ({scPercent}%)</span>
                        <span className="text-gray-900 font-bold">{formatLkr(order.serviceCharge)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="border-t border-dashed border-gray-200/80" />

              {/* Total */}
              <div className="flex justify-between items-center py-1">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-[var(--brand-primary)]">{formatLkr(order.total)}</span>
              </div>

              {/* Charged to Room */}
              <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100/80 rounded-2xl px-4 py-3 mt-2 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                    <path
                      d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4M3 7l9-4 9 4"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {order.paymentMethod === "room-charge"
                    ? `Charged to ${order.location}`
                    : order.paymentMethod === "cash" || order.paymentMethod === "pay-at-property"
                      ? "Pay with Cash / at Property"
                      : "Paid with Card"}
                </span>
              </div>
            </div>
          </div>
        </div>
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
