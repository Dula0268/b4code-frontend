"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/guest/order/cart-store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TAG_LABELS: Record<string, string> = {
  POPULAR: "Popular",
  SPICY: "Spicy",
  VEG: "Veg",
  NON_VEG: "Non Veg",
};

/* ─── Cart Client ─── */

export default function CartClient({ roomNumber = "304" }: { roomNumber?: string }) {
  const linesMap = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const lines = React.useMemo(() => Object.values(linesMap), [linesMap]);
  const itemCount = React.useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = React.useMemo(
    () => lines.reduce((s, l) => s + l.item.priceLkr * l.qty, 0),
    [lines],
  );
  const serviceCharge = Math.round(subtotal * 0.1);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + serviceCharge + tax;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
      {/* ─── Empty state ─── */}
      {lines.length === 0 ? (
        <>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-base mb-4 md:mb-8 px-1">
            <Link href="/guest/order" className="flex items-center gap-1">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 10L10 3L17 10M5 8.5V16.5C5 16.776 5.224 17 5.5 17H8.5V13C8.5 12.724 8.724 12.5 9 12.5H11C11.276 12.5 11.5 12.724 11.5 13V17H14.5C14.776 17 15 16.776 15 16.5V8.5"
                  stroke="#828282"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span className="text-[#828282]">Home</span>
            <ChevronRight />
            <Link href="/guest/order/menu" className="text-[#828282] hover:underline">
              Menu
            </Link>
            <ChevronRight />
            <span className="text-[#953002] font-medium">Cart</span>
          </nav>
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <svg width="64" height="64" viewBox="0 0 28 28" fill="none" className="opacity-30">
              <path
                d="M9.33 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM21 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM1.17 1.17h4.66l3.13 15.63a2.33 2.33 0 0 0 2.33 1.87h11.34a2.33 2.33 0 0 0 2.33-1.87l1.87-9.8H7"
                stroke="#828282"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg text-[#6b7280]">Your cart is empty</p>
            <Link
              href="/guest/order/menu"
              className="px-6 py-3 rounded-lg bg-[#af3a04] text-white font-bold text-base hover:bg-[#923002] transition"
            >
              Browse Menu
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* ════════════════════ LEFT: Breadcrumbs + Title + Cart Items ════════════════════ */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-2 px-1">
              <Link href="/guest/order" className="flex items-center gap-1">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 10L10 3L17 10M5 8.5V16.5C5 16.776 5.224 17 5.5 17H8.5V13C8.5 12.724 8.724 12.5 9 12.5H11C11.276 12.5 11.5 12.724 11.5 13V17H14.5C14.776 17 15 16.776 15 16.5V8.5"
                    stroke="#828282"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="text-[#828282]">Home</span>
              <ChevronRight />
              <Link href="/guest/order/menu" className="text-[#828282] hover:underline">
                Menu
              </Link>
              <ChevronRight />
              <span className="text-[#953002] font-medium">Cart</span>
            </nav>

            {/* Title */}
            <div className="flex items-center gap-2 mb-2">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <path
                  d="M9.33 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM21 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM1.17 1.17h4.66l3.13 15.63a2.33 2.33 0 0 0 2.33 1.87h11.34a2.33 2.33 0 0 0 2.33-1.87l1.87-9.8H7"
                  stroke="#111827"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-[22px] font-bold text-[#111827] leading-[28px]">Your Cart</h1>
              <span className="text-[14px] text-[#6b7280] leading-[20px]">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            </div>

            {lines.map(({ item, qty }) => (
              <div
                key={item.id}
                className="bg-white border border-[#f3f4f6] rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-3 flex gap-3 items-center"
              >
                {/* Thumbnail – 72×72 */}
                <div className="relative shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden bg-[#e5e7eb]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {/* Top: title + delete */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-[#111827] leading-[20px]">
                        {item.title}
                      </h3>
                      {item.tag && (
                        <span className="text-[12px] text-[#6b7280] leading-[16px]">
                          {TAG_LABELS[item.tag] ?? item.tag}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-0.5 cursor-pointer hover:opacity-70 transition shrink-0"
                      aria-label={`Remove ${item.title}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6"
                          stroke="#9ca3af"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Bottom: price, qty, line total */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#af3a04] leading-[18px]">
                      {formatLkr(item.priceLkr)}
                    </span>

                    {/* Qty control pill */}
                    <div className="flex items-center bg-[#f9fafb] border border-[#e5e7eb] rounded-md">
                      <button
                        onClick={() => setQty(item.id, qty - 1)}
                        className="px-1.5 py-0.5 cursor-pointer hover:bg-[#f3f4f6] rounded-l-md transition"
                        aria-label="Decrease quantity"
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7h8" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                      <span className="w-6 text-center text-[13px] font-semibold text-[#111827] leading-[18px]">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(item.id, qty + 1)}
                        className="px-1.5 py-0.5 cursor-pointer hover:bg-[#f3f4f6] rounded-r-md transition"
                        aria-label="Increase quantity"
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M7 3v8M3 7h8" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="text-[14px] font-bold text-[#111827] leading-[20px]">
                      {formatLkr(item.priceLkr * qty)}
                    </span>
                  </div>
                </div>
              </div>
            ))}


          </div>

          {/* ════════════════════ RIGHT: Order Summary ════════════════════ */}
          <div className="w-full md:w-[360px] md:shrink-0 md:sticky md:top-4 space-y-4">
            {/* Summary card */}
            <div className="bg-white border border-[#f3f4f6] rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden p-4 space-y-4">
              <h2 className="text-[18px] font-bold text-[#111827] leading-[24px]">
                Order Summary
              </h2>

              {/* Line items */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] text-[#4b5563] leading-[18px]">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span className="text-[13px] font-medium text-[#4b5563] leading-[18px]">
                    {formatLkr(subtotal)}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[13px] text-[#4b5563] leading-[18px]">
                    Service Charge (10%)
                  </span>
                  <span className="text-[13px] font-medium text-[#4b5563] leading-[18px]">
                    {formatLkr(serviceCharge)}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[13px] text-[#4b5563] leading-[18px]">Tax (5%)</span>
                  <span className="text-[13px] font-medium text-[#4b5563] leading-[18px]">
                    {formatLkr(tax)}
                  </span>
                </div>

                {/* Dashed divider + total */}
                <div className="border-t border-dashed border-[#d1d5db] pt-2">
                  <div className="flex items-end justify-between">
                    <span className="text-[14px] font-bold text-[#111827] leading-[20px]">
                      Total Amount
                    </span>
                    <span className="text-[20px] font-bold text-[#af3a04] leading-[28px]">
                      {formatLkr(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivering to */}
              <div className="flex items-center gap-2 bg-[#f8f6f5] border border-[#e5e7eb] rounded-lg p-2.5">
                <div className="shrink-0 flex items-center justify-center p-2 rounded-full bg-[rgba(175,58,4,0.1)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0"
                      stroke="#af3a04"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#6b7280] uppercase tracking-[0.3px] leading-[16px]">
                    Delivering to
                  </p>
                  <p className="text-[14px] font-bold text-[#111827] leading-[20px]">
                    Room {roomNumber}
                  </p>
                </div>
              </div>

              {/* Checkout button */}
              <Link
                href="/guest/order/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[#af3a04] rounded-lg p-3 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:bg-[#923002] transition"
              >
                <span className="text-[16px] font-bold text-white leading-[24px]">Checkout</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-[3px]">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* Policy note */}
              <p className="text-center text-[12px] text-[#9ca3af] leading-[16px]">
                By placing this order, you agree to the hotel&apos;s dining policy.
              </p>
            </div>

            {/* Need Help card */}
            <Link
              href="/guest/order/help"
              className="bg-[rgba(175,58,4,0.05)] border border-[rgba(175,58,4,0.1)] rounded-xl p-[17px] flex gap-3 items-start hover:bg-[rgba(175,58,4,0.08)] transition"
            >
              <div className="shrink-0 pt-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 18v-6a9 9 0 1 1 18 0v6"
                    stroke="#af3a04"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z"
                    stroke="#af3a04"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-[14px] font-bold text-[#111827] leading-[20px]">Need Help?</h4>
                <p className="text-[12px] text-[#4b5563] leading-[16px]">
                  Contact Guest Services for assistance with your order.
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-1">
                <path d="M6 4L10 8L6 12" stroke="#af3a04" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small helper components ─── */

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M6 4L10 8L6 12"
        stroke="#828282"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
