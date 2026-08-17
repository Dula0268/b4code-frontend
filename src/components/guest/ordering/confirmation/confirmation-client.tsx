"use client";

import * as React from "react";
import Link from "next/link";
import { useOrderStore } from "@/store/guest/ordering/order.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ─── Order Confirmed Client ─── */

export default function ConfirmationClient() {
  const order = useOrderStore((s) => s.currentOrder);
  const syncCurrentOrder = useOrderStore((s) => s.syncCurrentOrder);
  const qrContext = useOrderContextStore((s) => s.qrContext);
  const [simulated, setSimulated] = React.useState(false);

  React.useEffect(() => {
    if (!order?.id || simulated) return;

    const numericOrderId = order.id.replace('#ORD-', '');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

    // Always check the backend status directly - don't trust Zustand store alone
    fetch(`${apiBase}/orders/${numericOrderId}`)
      .then((r) => r.json())
      .then((backendOrder) => {
        if (backendOrder.status === 'PAYMENT_PENDING') {
          // Payment confirmed by user on PayHere but webhook can't reach localhost
          // Call simulate-payment to transition the order to PLACED
          return fetch(`${apiBase}/orders/${numericOrderId}/simulate-payment`, {
            method: 'POST',
          }).then(() => {
            setSimulated(true);
            // Give SSE 600ms to propagate to staff store before syncing guest view
            return new Promise<void>((resolve) => setTimeout(resolve, 600));
          }).then(() => syncCurrentOrder());
        } else {
          // Already PLACED or beyond - just sync the store
          setSimulated(true);
          return syncCurrentOrder();
        }
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  const orderNumber = order?.id ?? "#ORD-0000";
  const totalAmount = order?.total ?? 0;
  
  let locationStr = order?.location ?? "";
  const cleanLoc = locationStr.replace(/^(RM|ROOM|TB|TABLE)-?/i, "");
  
  let formattedLocation = locationStr;
  if (qrContext?.type) {
    const t = qrContext.type.toLowerCase();
    if (t === "room" || t === "table") {
      formattedLocation = `${t.charAt(0).toUpperCase() + t.slice(1)} ${cleanLoc}`;
    } else {
      formattedLocation = cleanLoc;
    }
  } else {
    if (/^(RM|ROOM)-?/i.test(locationStr)) {
      formattedLocation = `Room ${cleanLoc}`;
    } else if (/^(TB|TABLE)-?/i.test(locationStr)) {
      formattedLocation = `Table ${cleanLoc}`;
    } else if (!isNaN(Number(locationStr)) && locationStr !== "") {
      formattedLocation = `Room ${locationStr}`; // fallback for numbers
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8 bg-gray-50/50">
      <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-8 text-center space-y-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none" />

        {/* ── Green checkmark ── */}
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full scale-150 animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-green-400 flex items-center justify-center shadow-lg shadow-green-500/30 relative z-10 border-4 border-white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ── Heading + description ── */}
        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 max-w-[320px] mx-auto text-[15px] leading-relaxed">
            Thank you for your order. We are preparing your meal and will deliver it shortly to{" "}
            <span className="font-semibold text-gray-900 bg-gray-100/80 px-2 py-0.5 rounded-md">{formattedLocation}</span>.
          </p>
        </div>

        {/* ── Order details card ── */}
        <div className="bg-white/60 backdrop-blur-md border border-gray-100/80 rounded-2xl p-5 space-y-4 text-left shadow-sm relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Order Number
              </p>
              <p className="text-[17px] font-semibold text-gray-900">
                {orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                Status
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-xs font-medium text-green-600 border border-green-100/50 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Preparing
              </span>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-200/80" />
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium">Total Amount</p>
            <p className="text-xl font-bold text-[var(--brand-primary)]">
              {formatLkr(totalAmount)}
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3 relative z-10">
          {/* Track Order - Primary */}
          <Link
            href="/guest/order/track"
            className="w-full flex items-center justify-center gap-2 bg-[var(--brand-primary)] rounded-2xl px-6 py-4 shadow-lg shadow-orange-500/20 hover:bg-[#C05621] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <span className="text-base font-semibold text-white">Track Order</span>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="ml-1 transform group-hover:translate-x-1 transition-transform">
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* View Receipt - Outlined */}
          <Link
            href="/guest/order/receipt"
            className="w-full flex items-center justify-center gap-2 bg-white/80 border border-gray-200/80 rounded-2xl px-6 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-gray-700 font-medium group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>View Receipt</span>
          </Link>
        </div>

        {/* ── Secondary links ── */}
        <div className="flex items-center justify-center gap-4 pt-2 relative z-10">
          <Link
            href="/guest/order/help"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-[var(--brand-primary)] transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform">
              <path d="M3 18v-6a9 9 0 1 1 18 0v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Need Help?
          </Link>
          <span className="text-gray-200">|</span>
          <Link
            href="/guest/order/menu"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-[var(--brand-primary)] transition-colors group"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path
                d="M13 8H3M3 8L7 4M3 8L7 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

