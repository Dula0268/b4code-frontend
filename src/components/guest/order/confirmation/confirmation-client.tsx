"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/guest/order/order-store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ─── Order Confirmed Client ─── */

export default function ConfirmationClient() {
  const order = useOrderStore((s) => s.currentOrder);

  const orderNumber = order?.id ?? "#ORD-0000";
  const totalAmount = order?.total ?? 0;
  const roomNumber = order?.roomNumber ?? "304";

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-6 bg-[#fafaf9]">
      <div className="w-full max-w-[480px] text-center space-y-5">
        {/* ── Green checkmark ── */}
        <div className="flex justify-center">
          <div className="w-[56px] h-[56px] rounded-full bg-[#e8f5e9] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
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
        </div>

        {/* ── Heading + description ── */}
        <div className="space-y-2">
          <h1 className="text-[22px] font-bold text-[#1D1D1D] leading-[28px]">
            Order Confirmed!
          </h1>
          <p className="text-[14px] text-[#828282] leading-[20px] max-w-[380px] mx-auto">
            Thank you for your order. We are preparing your meal and will deliver it shortly to{" "}
            <span className="font-semibold text-[#333333]">Room {roomNumber}</span>.
          </p>
        </div>

        {/* ── Order details card ── */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#828282] uppercase tracking-wider leading-[16px]">
                Order Number
              </p>
              <p className="text-[16px] font-semibold text-[#1D1D1D] leading-[24px]">
                {orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#828282] uppercase tracking-wider leading-[16px]">
                Status
              </p>
              <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-[#e8f5e9] text-[12px] font-medium text-[#27AE60] leading-[16px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
                Placed
              </span>
            </div>
          </div>
          <div className="border-t border-dashed border-[#E0E0E0]" />
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-[#828282] leading-[20px]">Total Amount</p>
            <p className="text-[16px] font-bold text-[#973102] leading-[24px]">
              {formatLkr(totalAmount)}
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-2">
          {/* Track Order - Primary */}
          <Link
            href="/guest/order/track"
            className="w-full flex items-center justify-center gap-2 bg-[#973102] rounded-lg px-6 py-3 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition"
          >
            <span className="text-[16px] font-semibold text-white leading-[24px]">Track Order</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-1">
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
            className="w-full flex items-center justify-center gap-2 border border-[#E0E0E0] bg-white rounded-lg px-6 py-3 hover:bg-[#f8f6f5] transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
            <span className="text-[16px] font-medium text-[#333333] leading-[24px]">
              View Receipt
            </span>
          </Link>
        </div>

        {/* ── Secondary links ── */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/guest/order/help"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#828282] hover:text-[#973102] transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 18v-6a9 9 0 1 1 18 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Need Help?
          </Link>
          <span className="text-[#E0E0E0]">|</span>
          <Link
            href="/guest/order/menu"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#828282] hover:text-[#973102] transition"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M13 8H3M3 8L7 4M3 8L7 12"
                stroke="currentColor"
                strokeWidth="1.5"
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
