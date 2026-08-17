"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/guest/ordering/order.store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ─── Thank You Client ─── */

export default function ThankYouClient() {
  const order = useOrderStore((s) => s.currentOrder);

  const orderId = order?.id ?? "#ORD-0000";
  const orderDate = order?.placedAt ?? "Today";
  const orderItems = order?.lines ?? [];
  const orderTotal = order?.total ?? 0;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50/50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[880px] bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none" />

        {/* ════════════════════ LEFT: Order Completed ════════════════════ */}
        <div className="w-full md:w-[360px] md:shrink-0 bg-white/60 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100/80 relative z-10">
          {/* Green checkmark */}
          <div className="flex justify-center relative mb-6">
            <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full scale-150" />
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-500 to-green-400 flex items-center justify-center shadow-lg shadow-green-500/30 relative z-10 border-2 border-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
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

          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
            Order Completed!
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-[260px] mb-6">
            Thank you for dining with Prime Stay. We hope you enjoyed your meal.
          </p>

          {/* Order details mini card */}
          <div className="w-full bg-white/80 backdrop-blur-md border border-gray-100/80 rounded-2xl p-4 text-left space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                ORDER {orderId}
              </span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{orderDate}</span>
            </div>

            <div className="space-y-1.5">
              {orderItems.map((line, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 line-clamp-1">{line.item.title}</span>
                  <span className="text-sm text-gray-400 font-medium ml-2 shrink-0">{line.qty}x</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-200/80 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-sm font-bold text-[var(--brand-primary)]">
                {formatLkr(orderTotal)}
              </span>
            </div>
          </div>

          {/* View Receipt button */}
          <Link
            href="/guest/order/receipt"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white/80 border border-gray-200/80 rounded-xl px-4 py-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group"
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
            <span className="text-[14px] font-semibold text-gray-700">
              View Receipt
            </span>
          </Link>
        </div>

        {/* ════════════════════ RIGHT: Thank You ════════════════════ */}
        <div className="flex-1 bg-white/40 flex flex-col items-center justify-center text-center p-8 md:p-12 relative z-10">
          {/* Green check circle */}
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 shadow-inner border border-green-100/50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-green-500">
              <path
                d="M8 12l3 3 5-5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
            Thank You for Your Feedback!
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed max-w-[300px] mb-8">
            Your review helps us improve our service at Prime Stay.
          </p>

          <Link
            href="/guest/order/menu"
            className="bg-[var(--brand-primary)] rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-[#C05621] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2"
          >
            <span>Back to Menu</span>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="transform group-hover:translate-x-1 transition-transform">
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
