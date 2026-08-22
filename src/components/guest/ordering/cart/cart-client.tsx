"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, getLineUnitPrice } from "@/store/guest/ordering/cart.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";

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

export default function CartClient({ location }: { location?: string }) {
  const linesMap = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const serviceChargeRate = useCartStore((s) => s.serviceChargeRate);
  const taxRate = useCartStore((s) => s.taxRate);
  const qrContext = useOrderContextStore((s) => s.qrContext);
  const locationText = qrContext ? `${qrContext.type} ${qrContext.location}` : "Unknown Location";

  // To ensure reactivity, we compute derived state by accessing s.lines
  const subtotal = useCartStore((s) => {
    // Access s.lines to trigger re-renders
    const _lines = s.lines;
    return s.subtotal();
  });
  const serviceCharge = useCartStore((s) => { const _lines = s.lines; return s.serviceCharge(); });
  const tax = useCartStore((s) => { const _lines = s.lines; return s.tax(); });
  const total = useCartStore((s) => { const _lines = s.lines; return s.total(); });
  const itemCount = useCartStore((s) => { const _lines = s.lines; return s.itemCount(); });

  const lines = React.useMemo(() => Object.values(linesMap), [linesMap]);

  return (
    <div className="max-w-[1680px] mx-auto px-4 md:px-6 py-4 animate-in fade-in duration-500">
      {/* ─── Empty state ─── */}
      {lines.length === 0 ? (
        <>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-base mb-4 md:mb-8 px-1">
            <Link href={qrContext ? `/guest/order?qrId=${qrContext.qrId}` : "/guest/order"} className="flex items-center gap-1 hover:text-[var(--brand-primary)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 10L10 3L17 10M5 8.5V16.5C5 16.776 5.224 17 5.5 17H8.5V13C8.5 12.724 8.724 12.5 9 12.5H11C11.276 12.5 11.5 12.724 11.5 13V17H14.5C14.776 17 15 16.776 15 16.5V8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span className="text-gray-400">Home</span>
            <ChevronRight />
            <Link href={qrContext ? `/guest/order/menu?qrId=${qrContext.qrId}` : "/guest/order/menu"} className="text-gray-400 hover:text-[var(--brand-primary)] hover:underline transition-colors">
              Menu
            </Link>
            <ChevronRight />
            <span className="text-[var(--brand-primary)] font-medium">Cart</span>
          </nav>
          <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-inner border border-gray-100/50">
              <svg width="40" height="40" viewBox="0 0 28 28" fill="none" className="text-gray-300">
                <path
                  d="M9.33 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM21 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM1.17 1.17h4.66l3.13 15.63a2.33 2.33 0 0 0 2.33 1.87h11.34a2.33 2.33 0 0 0 2.33-1.87l1.87-9.8H7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Your cart is empty</h2>
              <p className="text-base text-gray-500 font-medium max-w-sm mx-auto">Looks like you haven&apos;t added anything to your cart yet. Explore our menu to discover delicious options.</p>
            </div>
            <Link
              href={qrContext ? `/guest/order/menu?qrId=${qrContext.qrId}` : "/guest/order/menu"}
              className="mt-4 px-8 py-4 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-base hover:bg-[var(--brand-primary)]/90 hover:-translate-y-0.5 active:scale-95 shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] transition-all duration-300 flex items-center gap-2 group"
            >
              Browse Menu
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
          {/* ════════════════════ LEFT: Breadcrumbs + Title + Cart Items ════════════════════ */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm mb-2 px-1">
              <Link href={qrContext ? `/guest/order?qrId=${qrContext.qrId}` : "/guest/order"} className="flex items-center gap-1 text-gray-400 hover:text-[var(--brand-primary)] transition-colors">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 10L10 3L17 10M5 8.5V16.5C5 16.776 5.224 17 5.5 17H8.5V13C8.5 12.724 8.724 12.5 9 12.5H11C11.276 12.5 11.5 12.724 11.5 13V17H14.5C14.776 17 15 16.776 15 16.5V8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="text-gray-400">Home</span>
              <ChevronRight />
              <Link href={qrContext ? `/guest/order/menu?qrId=${qrContext.qrId}` : "/guest/order/menu"} className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors">
                Menu
              </Link>
              <ChevronRight />
              <span className="text-[var(--brand-primary)] font-medium">Cart</span>
            </nav>

            {/* Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100/50 shadow-sm flex items-center justify-center text-[var(--brand-primary)]">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M9.33 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM21 25.67a1.17 1.17 0 1 0 0-2.34 1.17 1.17 0 0 0 0 2.34ZM1.17 1.17h4.66l3.13 15.63a2.33 2.33 0 0 0 2.33 1.87h11.34a2.33 2.33 0 0 0 2.33-1.87l1.87-9.8H7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Your Cart</h1>
              <span className="text-sm font-bold tracking-wide px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full ml-auto md:ml-4 shadow-sm">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex flex-col divide-y divide-gray-100/80">
              {Object.entries(linesMap).map(([lineKey, line]) => {
                const { item, qty } = line;
                const unitPrice = getLineUnitPrice(line);
                return (
                <div
                  key={lineKey}
                  className="group hover:bg-white/80 p-5 flex gap-4 md:gap-6 items-center transition-colors duration-300 relative"
                >
                  {/* Subtle highlight gradient */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-[var(--brand-primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Thumbnail */}
                  <div className="relative shrink-0 w-[96px] h-[96px] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-50/50 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-200">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1 h-full gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 leading-tight truncate group-hover:text-[var(--brand-primary)] transition-colors">
                          {item.title}
                        </h3>
                        {item.tag ? (
                          <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-full bg-orange-50 text-[var(--brand-primary)] border border-orange-100/50">
                            {TAG_LABELS[item.tag] ?? item.tag}
                          </span>
                        ) : (
                          <div className="h-6" /> // spacer
                        )}
                      </div>
                      <button
                        onClick={() => remove(lineKey)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-all shrink-0"
                        aria-label={`Remove ${item.title}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-base font-bold text-[var(--brand-primary)]">
                        {formatLkr(unitPrice)}
                      </span>

                      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full p-1 shadow-sm group-hover:border-[var(--brand-primary)]/20 transition-colors">
                        <button
                          onClick={() => setQty(lineKey, qty - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-gray-900">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(lineKey, qty + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white cursor-pointer transition-colors"
                          aria-label="Increase quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      <span className="hidden sm:block text-lg font-bold text-gray-900">
                        {formatLkr(unitPrice * qty)}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* ════════════════════ RIGHT: Order Summary ════════════════════ */}
          <div className="w-full xl:w-[420px] shrink-0 xl:sticky xl:top-[32px] space-y-4 xl:mt-16">
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/10 to-transparent pointer-events-none" />
              
              <div className="p-6 md:p-8 space-y-6 relative z-10">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--brand-primary)]">
                      <path d="M9 11V6a3 3 0 0 1 6 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 11H3v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-500 font-medium">Subtotal ({itemCount})</span>
                    <span className="text-base font-bold text-gray-900">{formatLkr(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-500 font-medium">Service Charge ({Math.round(serviceChargeRate * 100)}%)</span>
                    <span className="text-base font-bold text-gray-900">{formatLkr(serviceCharge)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-500 font-medium">Tax ({Math.round(taxRate * 100)}%)</span>
                      <span className="text-base font-bold text-gray-900">{formatLkr(tax)}</span>
                    </div>
                  )}

                  <div className="pt-5 mt-3 border-t border-dashed border-gray-200 flex items-end justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-[var(--brand-primary)] leading-none tracking-tight">{formatLkr(total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/80 border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-orange-50 border border-orange-100/50 text-[var(--brand-primary)]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivering to</p>
                    <p className="text-base font-bold text-gray-900 leading-tight mt-0.5">
                      {locationText}
                    </p>
                  </div>
                </div>

                <Link
                  href="/guest/order/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[var(--brand-primary)] text-white rounded-2xl py-4 font-bold text-lg shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group"
                >
                  Proceed to Checkout
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                <p className="text-center text-[13px] text-gray-400 font-medium px-4">
                  By placing this order, you agree to the hotel&apos;s dining policy.
                </p>
              </div>
            </div>

            <Link
              href="/guest/order/help"
              className="group flex gap-4 items-center bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-5 hover:bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="w-12 h-12 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-[var(--brand-primary)] border border-orange-100/50 group-hover:scale-110 group-hover:bg-orange-100 transition-all shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-[15px] font-bold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">Need Help?</h4>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Contact Guest Services</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gray-400 group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-gray-300">
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
