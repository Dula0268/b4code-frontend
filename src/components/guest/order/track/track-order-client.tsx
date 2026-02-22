"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useOrderStore, type OrderStatus } from "@/store/guest/order/order-store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ─── Status pipeline (happy path + rejected) ─── */

const STATUS_PIPELINE: OrderStatus[] = [
  "Placed",
  "Accepted",
  "In-Progress",
  "Delivered",
];

const STATUS_DESCRIPTIONS: Record<OrderStatus, (room: string) => string> = {
  Placed: (room) => `We have received your order request from Room ${room}.`,
  Accepted: () => "The kitchen has accepted your order and started preparing.",
  "In-Progress": () =>
    "Your order is being plated and prepared for room service delivery.",
  Delivered: (room) => `Order successfully delivered to Room ${room}.`,
  Rejected: () => "Unfortunately, the kitchen was unable to fulfill your order.",
};

/* ─── Hero config by status ─── */

function getHeroBanner(status: OrderStatus, rejectionReason?: string) {
  if (status === "Rejected") {
    return {
      bg: "bg-gradient-to-br from-[#fde8e8] to-[#fbd5d5]",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#EB5757" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: "Order Rejected",
      subtitle: rejectionReason || "The kitchen was unable to process your order at this time.",
      titleColor: "text-[#EB5757]",
    };
  }
  if (status === "Delivered") {
    return {
      bg: "bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9]",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#27AE60" />
          <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Order Delivered!",
      subtitle: "We hope you enjoy your meal. Thank you for ordering with Prime Stay.",
      titleColor: "text-[#1D1D1D]",
    };
  }
  return {
    bg: "bg-gradient-to-br from-[#fff8e1] to-[#fff3cd]",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#F2994A" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="#F2994A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: status === "Placed" ? "Order Placed" : status === "Accepted" ? "Being Prepared" : "In Progress",
    subtitle: "Your order is being prepared. We\u2019ll update you as it progresses.",
    titleColor: "text-[#1D1D1D]",
  };
}

/* ─── Status badge helper ─── */

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { bg: string; text: string }> = {
    Placed: { bg: "bg-[#e8f5e9]", text: "text-[#27AE60]" },
    Accepted: { bg: "bg-[#fff3cd]", text: "text-[#856404]" },
    "In-Progress": { bg: "bg-[#fff3cd]", text: "text-[#856404]" },
    Delivered: { bg: "bg-[#e8f5e9]", text: "text-[#27AE60]" },
    Rejected: { bg: "bg-[#fde8e8]", text: "text-[#EB5757]" },
  };
  const c = config[status];
  return (
    <span className={`px-2 py-0.5 rounded-full ${c.bg} ${c.text} text-[11px] font-medium`}>
      {status}
    </span>
  );
}

/* ─── Track Order Client ─── */

export default function TrackOrderClient() {
  const order = useOrderStore((s) => s.currentOrder);
  const advanceStatus = useOrderStore((s) => s.advanceStatus);

  /* ── Demo controls: simulate status progression ── */
  const nextStatus = React.useMemo(() => {
    if (!order) return null;
    if (order.currentStatus === "Delivered" || order.currentStatus === "Rejected") return null;
    const idx = STATUS_PIPELINE.indexOf(order.currentStatus);
    return idx >= 0 && idx < STATUS_PIPELINE.length - 1 ? STATUS_PIPELINE[idx + 1] : null;
  }, [order]);

  /* ── No order state ── */
  if (!order) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <nav className="flex items-center gap-2 text-base mb-6">
          <Link href="/guest/order" className="flex items-center gap-1">
            <HomeIcon />
          </Link>
          <span className="text-[14px] font-medium text-[#828282]">Home</span>
          <ChevronRight />
          <span className="text-[14px] font-medium text-[#953002]">Track Order</span>
        </nav>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-30">
            <circle cx="12" cy="12" r="10" stroke="#828282" strokeWidth="1.5" />
            <path d="M12 6v6l4 2" stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[16px] text-[#828282]">No active order to track</p>
          <Link
            href="/guest/order/menu"
            className="px-6 py-3 rounded-lg bg-[#973102] text-white font-semibold text-[14px] hover:bg-[#7c2802] transition"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const hero = getHeroBanner(order.currentStatus, order.rejectionReason);

  /* Build timeline display from order's real timeline + remaining pipeline steps */
  const isRejected = order.currentStatus === "Rejected";
  const completedStatuses = new Set(order.timeline.map((t) => t.status));
  const timelineMap = Object.fromEntries(order.timeline.map((t) => [t.status, t]));

  /* For rejected orders, show only completed steps + the rejected step */
  const displaySteps = isRejected
    ? [
        ...STATUS_PIPELINE.filter((s) => completedStatuses.has(s)),
        "Rejected" as OrderStatus,
      ]
    : STATUS_PIPELINE;

  /* First item image for sidebar hero */
  const firstItemImage = order.lines[0]?.item.imageUrl;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 md:py-5">
      {/* ─── Breadcrumbs ─── */}
      <nav className="flex items-center gap-2 text-sm mb-1">
        <Link href="/guest/order" className="flex items-center gap-1">
          <HomeIcon />
        </Link>
        <span className="text-[14px] font-medium text-[#828282]">Home</span>
        <ChevronRight />
        <span className="text-[14px] font-medium text-[#953002]">Track Order</span>
      </nav>

      {/* ─── Order meta ─── */}
      <p className="text-[13px] text-[#828282] leading-[18px] mb-5">
        Order {order.id} • Room {order.roomNumber} • {order.placedAt}
      </p>

      {/* ─── Two-column layout ─── */}
      <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start">
        {/* ════════════════════ LEFT: Timeline ════════════════════ */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* ── Hero banner (compact) ── */}
          <div className={`rounded-xl ${hero.bg} px-5 py-4 flex items-center gap-4`}>
            <div className="w-[44px] h-[44px] rounded-full bg-white/80 flex items-center justify-center shrink-0">
              {hero.icon}
            </div>
            <div>
              <h2 className={`text-[18px] font-bold leading-[24px] ${hero.titleColor}`}>
                {hero.title}
              </h2>
              <p className="text-[13px] text-[#4a4a4a] leading-[18px] mt-0.5">
                {hero.subtitle}
              </p>
            </div>
          </div>

          {/* ── Status Timeline (compact) ── */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl px-6 py-5">
            <h3 className="text-[15px] font-semibold text-[#1D1D1D] leading-[22px] mb-4">
              Order Status
            </h3>

            <div>
              {displaySteps.map((status, idx) => {
                const isLast = idx === displaySteps.length - 1;
                const completed = completedStatuses.has(status);
                const timeEntry = timelineMap[status];
                const isRejectedStep = status === "Rejected";
                const isFinal = status === "Delivered" && completed;

                return (
                  <div key={status} className="flex gap-3">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 ${
                          isRejectedStep
                            ? "bg-[#EB5757]"
                            : completed
                              ? "bg-[#27AE60]"
                              : "bg-white border-2 border-[#E0E0E0]"
                        }`}
                      >
                        {isRejectedStep ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        ) : completed ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </div>
                      {!isLast && (
                        <div
                          className={`w-[2px] flex-1 min-h-[32px] ${
                            completed &&
                            (displaySteps[idx + 1] === "Rejected"
                              ? true
                              : completedStatuses.has(displaySteps[idx + 1]))
                              ? isRejected
                                ? "bg-[#EB5757]"
                                : "bg-[#27AE60]"
                              : "bg-[#E0E0E0]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`${isLast ? "pb-0" : "pb-5"}`}>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-[14px] font-semibold leading-[20px] ${
                            isRejectedStep
                              ? "text-[#EB5757]"
                              : isFinal
                                ? "text-[#27AE60]"
                                : completed
                                  ? "text-[#1D1D1D]"
                                  : "text-[#828282]"
                          }`}
                        >
                          {status === "Delivered" ? `Delivered to Room` : status}
                        </h4>
                        {timeEntry && (
                          <span className="text-[12px] text-[#828282] leading-[16px]">
                            {timeEntry.time}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#828282] leading-[17px] mt-0.5 max-w-[420px]">
                        {completed || isRejectedStep
                          ? isRejectedStep && order.rejectionReason
                            ? order.rejectionReason
                            : STATUS_DESCRIPTIONS[status](order.roomNumber)
                          : "Pending..."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Demo status controls ── */}
          {(nextStatus || (!isRejected && order.currentStatus !== "Delivered")) && (
            <div className="bg-[#fafaf9] border border-dashed border-[#E0E0E0] rounded-xl px-5 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-[12px] text-[#828282] font-medium uppercase tracking-wider">
                Simulate:
              </span>
              {nextStatus && (
                <button
                  onClick={() => advanceStatus(nextStatus)}
                  className="px-3 py-1.5 rounded-md bg-[#27AE60] text-white text-[12px] font-medium hover:bg-[#219a52] transition cursor-pointer"
                >
                  \u2192 {nextStatus}
                </button>
              )}
              {!isRejected && order.currentStatus !== "Delivered" && (
                <button
                  onClick={() => advanceStatus("Rejected", "Kitchen is currently closed for this item.")}
                  className="px-3 py-1.5 rounded-md bg-[#EB5757] text-white text-[12px] font-medium hover:bg-[#d94444] transition cursor-pointer"
                >
                  \u2715 Reject
                </button>
              )}
            </div>
          )}

          {/* ── Bottom action buttons ── */}
          <div className="flex gap-3">
            {order.currentStatus === "Delivered" && (
              <Link
                href="/guest/order/review"
                className="flex items-center justify-center gap-2 bg-[#973102] rounded-lg px-6 py-3 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
                    stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[14px] font-semibold text-white leading-[20px]">Review Order</span>
              </Link>
            )}
            <Link
              href="/guest/order/receipt"
              className="flex items-center justify-center gap-2 border border-[#E0E0E0] bg-white rounded-lg px-6 py-3 hover:bg-[#f8f6f5] transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14px] font-medium text-[#333333] leading-[20px]">View Receipt</span>
            </Link>
            <Link
              href="/guest/order/help"
              className="flex items-center justify-center gap-2 border border-[#E0E0E0] bg-white rounded-lg px-6 py-3 hover:bg-[#f8f6f5] transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="#333" strokeWidth="1.5" />
                <path d="M9 9a3 3 0 1 1 3.95 2.84c-.58.2-1 .74-1 1.33V14" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="17" r="0.5" fill="#333" stroke="#333" strokeWidth="0.5" />
              </svg>
              <span className="text-[14px] font-medium text-[#333333] leading-[20px]">Need Help?</span>
            </Link>
            {order.currentStatus === "Rejected" && (
              <Link
                href="/guest/order/menu"
                className="flex items-center justify-center gap-2 bg-[#973102] rounded-lg px-6 py-3 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition"
              >
                <span className="text-[14px] font-semibold text-white leading-[20px]">Back to Menu</span>
              </Link>
            )}
          </div>
        </div>

        {/* ════════════════════ RIGHT: Order Summary sidebar ════════════════════ */}
        <div className="w-full md:w-[340px] md:shrink-0 md:sticky md:top-6">
          <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Food hero image */}
            {firstItemImage && (
              <div className="relative w-full h-[140px] bg-[#f3f4f6]">
                <Image
                  src={firstItemImage}
                  alt="Your selection"
                  fill
                  className="object-cover"
                  sizes="340px"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/90 text-[11px] font-medium text-[#1D1D1D] shadow-sm">
                    Your Selection
                  </span>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-[#1D1D1D] leading-[20px] uppercase tracking-[0.5px]">
                  Order Summary
                </h3>
                <StatusBadge status={order.currentStatus} />
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.lines.map((line, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#333333] leading-[18px]">
                      <span className="text-[#828282]">{line.qty}x</span> {line.item.title}
                    </span>
                    <span className="text-[13px] text-[#333333] leading-[18px] font-medium shrink-0">
                      {formatLkr(line.item.priceLkr * line.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E0E0E0]" />

              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#828282]">Subtotal</span>
                  <span className="text-[#333333]">{formatLkr(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#828282]">Service Charge (10%)</span>
                  <span className="text-[#333333]">{formatLkr(order.serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#828282]">Tax (5%)</span>
                  <span className="text-[#333333]">{formatLkr(order.tax)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#E0E0E0]" />

              {/* Total */}
              <div className="flex justify-between">
                <span className="text-[14px] font-bold text-[#1D1D1D] leading-[20px]">Total Amount</span>
                <span className="text-[14px] font-bold text-[#973102] leading-[20px]">{formatLkr(order.total)}</span>
              </div>

              {/* Charged to Room */}
              <div className="flex items-center gap-2 bg-[#f8f6f5] rounded-lg px-3 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4M3 7l9-4 9 4"
                    stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[12px] text-[#828282] leading-[16px]">
                  {order.paymentMethod === "room-charge"
                    ? `Charged to Room ${order.roomNumber}`
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
