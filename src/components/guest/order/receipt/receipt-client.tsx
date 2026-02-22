"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/guest/order/order-store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatReceiptDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatReceiptTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/* ─── Receipt Client ─── */

export default function ReceiptClient() {
  const order = useOrderStore((s) => s.currentOrder);

  /* Derive receipt values from the real order */
  const receiptId = order ? `#R-${order.id.replace("#ORD-", "")}-XJ` : "#R-0000-XJ";
  const placedTimestamp = order?.timeline?.[0]?.timestamp;
  const placedDate = placedTimestamp ? new Date(placedTimestamp) : new Date();
  const date = formatReceiptDate(placedDate);
  const time = formatReceiptTime(placedDate);
  const guest = order?.guestName ?? "Guest";
  const roomNumber = order?.roomNumber ?? "304";
  const items = order?.lines ?? [];
  const subtotal = order?.subtotal ?? 0;
  const serviceCharge = order?.serviceCharge ?? 0;
  const tax = order?.tax ?? 0;
  const grandTotal = order?.total ?? 0;
  const paymentMethod = order?.paymentMethod === "card" ? "Visa ending in •••• 4242" : `Charged to Room ${roomNumber}`;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fafaf9] px-4 py-4 flex flex-col items-center">
      {/* ── Payment Successful badge ── */}
      <div className="flex items-center gap-2 mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#27AE60" />
          <path
            d="M8 12l3 3 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[14px] font-semibold text-[#27AE60] leading-[20px]">
          Payment Successful
        </span>
      </div>

      {/* ── Receipt card ── */}
      <div className="w-full max-w-[480px] bg-white border border-[#E0E0E0] rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header with hotel branding */}
        <div className="px-6 pt-4 pb-3 text-center border-b border-[#E0E0E0]">
          {/* Hotel icon */}
          <div className="flex justify-center mb-1.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4M3 7l9-4 9 4"
                stroke="#953002"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-[16px] font-bold text-[#1D1D1D] tracking-[2px] uppercase leading-[22px]">
            PRIME STAY
          </h2>
          <p className="text-[11px] text-[#828282] leading-[16px] mt-0.5">
            42 Galle Face Terrace, Colombo 03 • +94 11 254 1010
          </p>
        </div>

        {/* Guest & order info */}
        <div className="px-6 py-3 border-b border-[#E0E0E0]">
          <div className="grid grid-cols-2 gap-y-2 text-[12px]">
            <div>
              <span className="text-[#828282] uppercase tracking-wider text-[10px]">DATE</span>
              <p className="text-[#333333] font-medium mt-0.5">{date}</p>
            </div>
            <div className="text-right">
              <span className="text-[#828282] uppercase tracking-wider text-[10px]">TIME</span>
              <p className="text-[#333333] font-medium mt-0.5">{time}</p>
            </div>
            <div>
              <span className="text-[#828282] uppercase tracking-wider text-[10px]">GUEST</span>
              <p className="text-[#333333] font-medium mt-0.5">{guest}</p>
            </div>
            <div className="text-right">
              <span className="text-[#828282] uppercase tracking-wider text-[10px]">ROOM</span>
              <p className="text-[#333333] font-medium mt-0.5">{roomNumber}</p>
            </div>
          </div>
        </div>

        {/* Receipt ID */}
        <div className="px-6 py-2 border-b border-[#E0E0E0] bg-[#fafaf9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#828282] uppercase tracking-wider">RECEIPT ID</span>
            <span className="text-[13px] font-semibold text-[#1D1D1D]">{receiptId}</span>
          </div>
        </div>

        {/* Itemized list */}
        <div className="px-6 py-3 border-b border-[#E0E0E0] space-y-2">
          {items.map((line, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#333333] leading-[18px]">
                  <span className="text-[#828282]">{line.qty}x</span>{" "}
                  <span className="font-medium">{line.item.title}</span>
                </p>
              </div>
              <span className="text-[13px] text-[#333333] leading-[18px] shrink-0 font-medium">
                {formatLkr(line.item.priceLkr * line.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-3 border-b border-[#E0E0E0] space-y-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#828282]">Subtotal</span>
            <span className="text-[#333333]">{formatLkr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#828282]">Service Charge (10%)</span>
            <span className="text-[#333333]">{formatLkr(serviceCharge)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#828282]">Tax (5%)</span>
            <span className="text-[#333333]">{formatLkr(tax)}</span>
          </div>
          <div className="border-t border-dashed border-[#E0E0E0] pt-2 flex justify-between">
            <span className="text-[15px] font-bold text-[#1D1D1D] leading-[22px]">
              Grand Total
            </span>
            <span className="text-[15px] font-bold text-[#973102] leading-[22px]">
              {formatLkr(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment method + footer */}
        <div className="px-6 py-3 text-center space-y-2">
          <p className="text-[12px] text-[#828282] leading-[18px]">
            Paid with <span className="font-medium text-[#333333]">{paymentMethod}</span>
          </p>
          <div className="border-t border-[#E0E0E0] pt-2">
            <p className="text-[12px] text-[#828282] leading-[18px] font-medium">
              Thank you for staying with Prime Stay
            </p>
            <p className="text-[10px] text-[#828282] leading-[14px] mt-0.5">
              All prices are inclusive of applicable taxes. This serves as your official receipt.
            </p>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-3 mt-4 w-full max-w-[480px]">
        <Link
          href="/guest/order/confirmation"
          className="flex-1 flex items-center justify-center gap-2 border border-[#E0E0E0] bg-white rounded-lg px-5 py-2.5 hover:bg-[#f8f6f5] transition"
        >
          <span className="text-[14px] font-medium text-[#333333] leading-[20px]">Go Back</span>
        </Link>
        <button className="flex-1 flex items-center justify-center gap-2 bg-[#973102] rounded-lg px-5 py-2.5 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[14px] font-semibold text-white leading-[20px]">Download PDF</span>
        </button>
      </div>

      {/* ── Footer links ── */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-[#828282]">
        <button className="hover:text-[#973102] transition cursor-pointer underline">
          Terms of Service
        </button>
        <span>•</span>
        <button className="hover:text-[#973102] transition cursor-pointer underline">
          Privacy Policy
        </button>
      </div>
    </div>
  );
}
