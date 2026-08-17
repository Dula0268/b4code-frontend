"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/guest/ordering/cart.store";

export default function OrderSidebar({ formatLkr }: { formatLkr: (n: number) => string }) {
  const linesObj = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const serviceCharge = useCartStore((s) => s.serviceCharge());
  const serviceChargeRate = useCartStore((s) => s.serviceChargeRate);
  const total = useCartStore((s) => s.total());
  const itemCount = useCartStore((s) => s.itemCount());
  const setQty = useCartStore((s) => s.setQty);

  // Memoize array conversion to avoid infinite loops with getServerSnapshot
  const lines = React.useMemo(() => Object.values(linesObj), [linesObj]);

  const getTagLabel = (tag?: string) => {
    if (!tag) return "";
    if (tag === "VEG") return "Veg";
    if (tag === "SPICY") return "Spicy";
    if (tag === "NON_VEG") return "Non Veg";
    if (tag === "POPULAR") return "Popular";
    return tag;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-gray-100/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100/50 flex items-center justify-center shadow-inner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--brand-primary)]">
                <path d="M9 11V6a3 3 0 0 1 6 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 11H3v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900 tracking-tight">Your Order</div>
          </div>
          <div className="bg-[var(--brand-primary)] text-white text-xs font-bold tracking-wide rounded-full px-3 py-1.5 shadow-sm">
            {itemCount} items
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-[400px] overflow-y-auto relative z-10 custom-scrollbar">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                  <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No items added yet.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100/80">
            {lines.map((l) => (
              <div key={l.item.id} className="flex items-center gap-4 w-full group p-5 hover:bg-white/50 transition-colors">
                {/* Image */}
                <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm">
                  {l.item.imageUrl ? (
                    <Image
                      src={l.item.imageUrl}
                      alt={l.item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-50/50 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-orange-200">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="text-sm font-bold text-gray-900 truncate group-hover:text-[var(--brand-primary)] transition-colors">
                      {l.item.title}
                    </div>
                    <div className="text-sm font-bold text-gray-900 shrink-0">
                      {formatLkr(l.item.priceLkr * l.qty)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    {l.item.tag ? (
                      <div className="text-[10px] font-bold tracking-wide text-[var(--brand-primary)] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100/50">
                        {getTagLabel(l.item.tag)}
                      </div>
                    ) : (
                      <div />
                    )}
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full p-1 shadow-sm shrink-0">
                      <button 
                        onClick={() => setQty(l.item.id, l.qty - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-3 text-center">
                        {l.qty}
                      </span>
                      <button 
                        onClick={() => setQty(l.item.id, l.qty + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-50 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors cursor-pointer"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50/50 border-t border-gray-100/80 p-6 space-y-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Subtotal</span>
              <span className="text-gray-900 font-semibold">{formatLkr(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
              <span>Service Charge ({Math.round(serviceChargeRate * 100)}%)</span>
              <span className="text-gray-900 font-semibold">{formatLkr(serviceCharge)}</span>
            </div>
            <div className="flex items-end justify-between pt-4 mt-2 border-t border-dashed border-gray-200">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-[var(--brand-primary)]">
                {formatLkr(total)}
              </span>
            </div>
          </div>

          <Link
            href="/guest/order/cart"
            className={`w-full flex items-center justify-center gap-2 bg-[var(--brand-primary)] text-white rounded-2xl py-4 font-bold text-base shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 transition-all duration-300 group ${lines.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <span>View Cart</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Contact Staff Card */}
      <Link href="/guest/order/help" className="block group">
        <div className="flex gap-4 items-center bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-5 hover:bg-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="w-12 h-12 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100/50 group-hover:scale-110 group-hover:bg-orange-100 transition-all shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72c.13.81.37 1.61.7 2.36a2 2 0 0 1-.45 2.11L8.09 11.5a16 16 0 0 0 6.41 6.41l2.31-2.31a2 2 0 0 1 2.11-.45c.75.33 1.55.57 2.36.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">Contact Staff</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">Call for immediate assistance</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gray-400 group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
