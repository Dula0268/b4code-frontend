"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/guest/order/order-store";

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
    <div className="min-h-[calc(100vh-72px)] bg-[#fafaf9] flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-[880px] bg-white border border-[#E0E0E0] rounded-2xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row">
        {/* ════════════════════ LEFT: Order Completed ════════════════════ */}
        <div className="w-full md:w-[340px] md:shrink-0 bg-white p-5 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#E0E0E0]">
          {/* Green checkmark */}
          <div className="w-[48px] h-[48px] rounded-full bg-[#e8f5e9] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#27AE60" />
              <path
                d="M8 12l3 3 5-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-[18px] font-bold text-[#1D1D1D] leading-[24px] mb-1">
            Order Completed!
          </h2>
          <p className="text-[13px] text-[#828282] leading-[18px] max-w-[260px] mb-4">
            Thank you for dining with Prime Stay. We hope you enjoyed your meal.
          </p>

          {/* Order details mini card */}
          <div className="w-full bg-[#fafaf9] border border-[#E0E0E0] rounded-lg p-3 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#333333] uppercase tracking-wider">
                ORDER {orderId}
              </span>
              <span className="text-[12px] font-semibold text-[#27AE60]">{orderDate}</span>
            </div>

            <div className="space-y-1">
              {orderItems.map((line, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#333333] leading-[18px]">{line.item.title}</span>
                  <span className="text-[13px] text-[#828282] leading-[18px]">{line.qty}x</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E0E0E0] pt-2 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#1D1D1D]">Total</span>
              <span className="text-[13px] font-bold text-[#973102]">
                {formatLkr(orderTotal)}
              </span>
            </div>
          </div>

          {/* View Receipt button */}
          <Link
            href="/guest/order/receipt"
            className="mt-3 w-full flex items-center justify-center gap-2 border border-[#E0E0E0] bg-white rounded-lg px-4 py-2 hover:bg-[#f8f6f5] transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[13px] font-medium text-[#333333] leading-[18px]">
              View Receipt
            </span>
          </Link>
        </div>

        {/* ════════════════════ RIGHT: Thank You ════════════════════ */}
        <div className="flex-1 bg-gradient-to-b from-[#f0faf0] to-[#f8fdf8] flex flex-col items-center justify-center text-center p-6">
          {/* Green check circle */}
          <div className="w-[56px] h-[56px] rounded-full bg-[#e8f5e9] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 12l3 3 5-5"
                stroke="#27AE60"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-[22px] font-bold text-[#1D1D1D] leading-[28px] mb-2">
            Thank You for Your Feedback!
          </h2>
          <p className="text-[13px] text-[#828282] leading-[20px] max-w-[300px] mb-6">
            Your review helps us improve our service at Prime Stay.
          </p>

          <Link
            href="/guest/order/menu"
            className="bg-[#973102] rounded-lg px-8 py-3 text-[15px] font-semibold text-white leading-[22px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
