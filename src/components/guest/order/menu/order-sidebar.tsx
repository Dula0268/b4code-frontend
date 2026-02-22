"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/guest/order/cart-store";

export default function OrderSidebar({ formatLkr }: { formatLkr: (n: number) => string }) {
  const linesObj = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const serviceCharge = useCartStore((s) => s.serviceCharge());
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
    <div className="space-y-4">
      <Card className="rounded-xl border border-[var(--gray-5)] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden bg-white !p-0 !gap-0">
        {/* Header */}
        <div className="bg-[rgba(151,49,2,0.05)] border-b border-[var(--gray-5)] px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="#973102" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-lg font-bold text-[var(--black-2)]">Your Order</div>
          </div>
          <div className="bg-[var(--brand-primary)] rounded-full px-2 py-1">
            <div className="text-xs font-bold text-white">{itemCount} items</div>
          </div>
        </div>

        {/* Items List */}
        <div className="p-5 max-h-[400px] overflow-y-auto space-y-4">
          {lines.length === 0 ? (
            <div className="text-sm text-[var(--gray-3)] text-center py-4">No items added yet.</div>
          ) : (
            lines.map((l) => (
              <div key={l.item.id} className="flex items-start gap-3 w-full">
                {/* Image */}
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-[var(--gray-5)]">
                  {l.item.imageUrl ? (
                    <Image
                      src={l.item.imageUrl}
                      alt={l.item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : null}
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 min-w-0 gap-2">
                  <div className="flex items-start justify-between w-full">
                    <div className="text-sm font-medium text-[var(--black-2)] truncate pr-2">
                      {l.item.title}
                    </div>
                    <div className="text-sm font-semibold text-[var(--black-2)] shrink-0">
                      {formatLkr(l.item.priceLkr * l.qty)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-[var(--gray-3)] truncate pr-2">
                      {getTagLabel(l.item.tag) || "Standard"}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-[var(--gray-6)] border border-[var(--gray-5)] rounded px-2 py-1 shrink-0">
                      <button 
                        onClick={() => setQty(l.item.id, l.qty - 1)}
                        className="text-xs font-bold text-[var(--gray-3)] hover:text-[var(--black-2)] w-4 text-center"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-[var(--black-2)] min-w-[12px] text-center">
                        {l.qty}
                      </span>
                      <button 
                        onClick={() => setQty(l.item.id, l.qty + 1)}
                        className="text-xs font-bold text-[var(--gray-3)] hover:text-[var(--black-2)] w-4 text-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[rgba(249,250,251,0.5)] border-t border-[var(--gray-5)] p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-[var(--gray-3)]">
              <span>Subtotal</span>
              <span>{formatLkr(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--gray-3)]">
              <span>Service Charge (10%)</span>
              <span>{formatLkr(serviceCharge)}</span>
            </div>
            <div className="flex items-end justify-between pt-2 border-t border-dashed border-[var(--gray-4)] mt-2">
              <span className="text-base font-bold text-[var(--black-2)]">Total</span>
              <span className="text-xl font-bold text-[var(--brand-primary)]">
                {formatLkr(total)}
              </span>
            </div>
          </div>

          <Button
            asChild
            className="w-full h-12 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] shadow-[0px_10px_15px_-3px_rgba(151,49,2,0.3),0px_4px_6px_-4px_rgba(151,49,2,0.3)]"
            disabled={lines.length === 0}
          >
            <Link href="/guest/order/cart" className="flex items-center justify-center gap-2 text-white">
              <span className="text-base font-bold text-white">Go to Cart</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </Button>
        </div>
      </Card>

      {/* Contact Staff Card */}
      <Link href="/guest/order/help">
        <Card className="rounded-lg border-[var(--gray-5)] shadow-[var(--shadow-soft)] p-4 hover:bg-[#f8f6f5] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-primary)]/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.09 5.18 2 2 0 0 1 5.09 3h3a2 2 0 0 1 2 1.72c.13.81.37 1.61.7 2.36a2 2 0 0 1-.45 2.11L8.09 11.5a16 16 0 0 0 6.41 6.41l2.31-2.31a2 2 0 0 1 2.11-.45c.75.33 1.55.57 2.36.7A2 2 0 0 1 22 16.92Z" stroke="var(--brand-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--black-2)]">Contact Staff</div>
              <div className="text-xs text-[var(--gray-3)]">Call for immediate assistance</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="var(--gray-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Card>
      </Link>
    </div>
  );
}
