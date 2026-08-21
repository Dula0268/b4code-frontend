"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/guest/ordering/order.store";

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
  const location = order?.location ?? "";
  const items = order?.lines ?? [];
  const subtotal = order?.subtotal ?? 0;
  const serviceCharge = order?.serviceCharge ?? 0;
  const grandTotal = order?.total ?? 0;
  const paymentMethod = order?.paymentMethod === "room-charge" 
    ? `Charged to ${location}` 
    : order?.paymentMethod === "cash" || order?.paymentMethod === "pay-at-property"
    ? "Pay with Cash / at Property"
    : "Visa ending in •••• 4242";

  const serviceChargeRatePercent = subtotal > 0 ? Math.round((serviceCharge / subtotal) * 100) : 10;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50/50 px-4 py-8 flex flex-col items-center">
      {/* ── Payment Successful badge ── */}
      <div className="flex items-center gap-2 mb-6 bg-green-50/80 backdrop-blur-md px-4 py-2 rounded-full border border-green-100/50 shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#10B981" />
          <path
            d="M8 12l3 3 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-semibold text-green-700 tracking-wide">
          Payment Successful
        </span>
      </div>

      {/* ── Receipt card ── */}
      <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/10 to-transparent pointer-events-none" />

        {/* Header with hotel branding */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100/80 relative z-10">
          {/* Hotel icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center shadow-inner border border-orange-100/50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4M3 7l9-4 9 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--brand-primary)]"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-[3px] uppercase">
            ORDER RECEIPT
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            Thank you for your order!
          </p>
        </div>

        {/* Guest & order info */}
        <div className="px-8 py-5 border-b border-gray-100/80 bg-white/40 relative z-10">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">DATE</span>
              <p className="text-gray-900 font-medium mt-1">{date}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">TIME</span>
              <p className="text-gray-900 font-medium mt-1">{time}</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">GUEST</span>
              <p className="text-gray-900 font-medium mt-1 truncate">{guest}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">LOCATION</span>
              <p className="text-gray-900 font-medium mt-1 truncate">{location}</p>
            </div>
          </div>
        </div>

        {/* Receipt ID */}
        <div className="px-8 py-3 border-b border-gray-100/80 bg-gray-50/50 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">RECEIPT ID</span>
            <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">{receiptId}</span>
          </div>
        </div>

        {/* Itemized list */}
        <div className="px-8 py-5 border-b border-gray-100/80 space-y-3 bg-white/60 relative z-10">
          {items.map((line, idx) => (
            <div key={idx} className="flex items-start justify-between gap-4 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  <span className="text-gray-400 font-semibold mr-2">{line.qty}x</span>
                  <span className="group-hover:text-[var(--brand-primary)] transition-colors">{line.item.title}</span>
                </p>
              </div>
              <span className="text-sm text-gray-900 font-semibold shrink-0">
                {formatLkr(line.item.priceLkr * line.qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-8 py-5 border-b border-gray-100/80 space-y-2.5 bg-white/40 relative z-10">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="text-gray-900 font-semibold">{formatLkr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Service Charge ({serviceChargeRatePercent}%)</span>
            <span className="text-gray-900 font-semibold">{formatLkr(serviceCharge)}</span>
          </div>
          <div className="border-t border-dashed border-gray-200/80 pt-4 mt-2 flex justify-between items-center">
            <span className="text-base font-bold text-gray-900 tracking-wide">
              Grand Total
            </span>
            <span className="text-lg font-bold text-[var(--brand-primary)]">
              {formatLkr(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment method + footer */}
        <div className="px-8 py-6 text-center space-y-4 bg-gray-50/50 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-gray-200/80 px-4 py-2 rounded-xl shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold text-gray-700">Paid via {paymentMethod}</span>
          </div>
          <div className="pt-2">
            <p className="text-sm font-semibold text-gray-600">
              Thank you for your order!
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1">
              This serves as your official receipt.
            </p>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-4 mt-6 w-full max-w-[480px]">
        <Link
          href="/guest/order/confirmation"
          className="flex-1 flex items-center justify-center gap-2 bg-white/80 border border-gray-200/80 rounded-2xl px-6 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-gray-700 font-medium group"
        >
          <span className="text-base">Go Back</span>
        </Link>
        <button
          disabled
          title="Coming soon"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-200 rounded-2xl px-6 py-4 cursor-not-allowed opacity-70"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-base font-semibold text-gray-500">Download PDF (Coming soon)</span>
        </button>
      </div>

      {/* ── Footer links (disabled: no ToS/Privacy pages exist yet) ── */}
      <div className="flex items-center justify-center gap-6 mt-8 text-xs font-semibold text-gray-300">
        <button disabled title="Coming soon" className="cursor-not-allowed">
          Terms of Service
        </button>
        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
        <button disabled title="Coming soon" className="cursor-not-allowed">
          Privacy Policy
        </button>
      </div>
    </div>
  );
}
