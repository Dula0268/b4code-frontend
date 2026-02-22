"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/guest/order/cart-store";
import { useOrderStore } from "@/store/guest/order/order-store";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

type PaymentMethod = "in-app" | "room-charge";

/* ─── Checkout Client ─── */

export default function CheckoutClient({ roomNumber = "304" }: { roomNumber?: string }) {
  const linesMap = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const lines = React.useMemo(() => Object.values(linesMap), [linesMap]);
  const subtotal = React.useMemo(
    () => lines.reduce((s, l) => s + l.item.priceLkr * l.qty, 0),
    [lines],
  );
  const serviceCharge = Math.round(subtotal * 0.1);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + serviceCharge + tax;

  const [kitchenInstructions, setKitchenInstructions] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("room-charge");
  const router = useRouter();
  const placeOrder = useOrderStore((s) => s.placeOrder);

  const handlePlaceOrder = () => {
    placeOrder({
      lines: lines.map((l) => ({ item: l.item, qty: l.qty })),
      subtotal,
      serviceCharge,
      tax,
      total,
      roomNumber: roomNumber,
      guestName: "John Smith",
      paymentMethod: paymentMethod === "room-charge" ? "room-charge" : "card",
    });
    router.push("/guest/order/confirmation");
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4">
      {/* ─── Breadcrumbs + Subtitle ─── */}
      <div className="space-y-1 mb-4">
        <nav className="flex items-center gap-2 text-base">
          <Link href="/guest/order" className="flex items-center gap-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12L12 3L21 12M5 10.5V20.5C5 20.776 5.224 21 5.5 21H10.5V16C10.5 15.724 10.724 15.5 11 15.5H13C13.276 15.5 13.5 15.724 13.5 16V21H18.5C18.776 21 19 20.776 19 20.5V10.5"
                stroke="#828282"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <span className="text-[16px] font-medium text-[#828282] leading-[22.4px]">Home</span>
          <ChevronRight />
          <Link
            href="/guest/order/menu"
            className="text-[16px] font-medium text-[#828282] leading-[22.4px] hover:underline"
          >
            Menu
          </Link>
          <ChevronRight />
          <Link
            href="/guest/order/cart"
            className="text-[16px] font-medium text-[#828282] leading-[22.4px] hover:underline"
          >
            Cart
          </Link>
          <ChevronRight />
          <span className="text-[16px] font-medium text-[#953002] leading-[22.4px]">Checkout</span>
        </nav>
        <p className="text-[16px] text-[#6b7280] leading-[24px]">
          Review your items and select a payment method.
        </p>
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* ════════════════════ LEFT: Order + Instructions ════════════════════ */}
        <div className="w-full md:w-[800px] md:shrink-0 space-y-4">
          {/* ── Your Order card ── */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                {/* Shopping bag icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"
                    stroke="#1f1f1f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[28px]">
                  Your Order
                </h2>
              </div>
              <Link
                href="/guest/order/cart"
                className="text-[14px] font-medium text-[#973102] leading-[20px] underline hover:opacity-80 transition"
              >
                Edit Items
              </Link>
            </div>

            {/* Items list */}
            <div>
              {lines.map(({ item, qty }, idx) => (
                <div
                  key={item.id}
                  className={`flex gap-4 items-center px-4 py-3 ${idx > 0 ? "border-t border-[#e5e7eb]" : ""}`}
                >
                  {/* Thumbnail 96×96 */}
                  <div className="relative shrink-0 w-[64px] h-[64px] rounded-lg overflow-hidden bg-[#f3f4f6]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Title + price row */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-[18px] font-semibold text-[#1f1f1f] leading-[28px]">
                        {item.title}
                      </h3>
                      <span className="text-[16px] font-semibold text-[#1f1f1f] leading-[24px] shrink-0">
                        {formatLkr(item.priceLkr)}
                      </span>
                    </div>

                    {/* Notes/description */}
                    <p className="text-[14px] text-[#6b7280] leading-[20px] truncate">
                      {item.description}
                    </p>

                    {/* Qty control + Remove */}
                    <div className="flex items-center gap-4 pt-2">
                      {/* Qty pill */}
                      <div className="flex items-center bg-[#f8f6f5] border border-[#e5e7eb] rounded-lg">
                        <button
                          onClick={() => setQty(item.id, qty - 1)}
                          className="px-2 py-1 text-[16px] text-[#6b7280] leading-[24px] cursor-pointer hover:bg-[#f0ebe8] rounded-l-lg transition"
                        >
                          -
                        </button>
                        <span className="px-2 text-[14px] font-medium text-[#1f1f1f] leading-[20px]">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(item.id, qty + 1)}
                          className="px-2 py-1 text-[16px] text-[#6b7280] leading-[24px] cursor-pointer hover:bg-[#f0ebe8] rounded-r-lg transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => remove(item.id)}
                        className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="py-[4px]">
                          <path
                            d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6"
                            stroke="#6b7280"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[12px] text-[#6b7280] leading-[16px]">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {lines.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-[16px] text-[#6b7280]">No items in your order.</p>
                  <Link
                    href="/guest/order/menu"
                    className="inline-block mt-4 text-[14px] font-medium text-[#973102] underline"
                  >
                    Browse Menu
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Kitchen Instructions card ── */}
          <div
            id="kitchen-instructions"
            className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 space-y-3 scroll-mt-4"
          >
            <div className="flex items-center gap-2">
              {/* Notepad / writing icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                  stroke="#1f1f1f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                  stroke="#1f1f1f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[28px]">
                Kitchen Instructions
              </h2>
            </div>

            <div className="space-y-2">
              <textarea
                value={kitchenInstructions}
                onChange={(e) => {
                  if (e.target.value.length <= 150) setKitchenInstructions(e.target.value);
                }}
                placeholder="e.g. Allergies, extra cutlery, sauce on the side..."
                className="w-full h-[100px] bg-[#f8f6f5] border border-[#e5e7eb] rounded-lg px-3 pt-3 text-[14px] text-[#1f1f1f] placeholder:text-[#6b7280] leading-[20px] resize-none focus:outline-none focus:ring-2 focus:ring-[#973102]/20 focus:border-[#973102] transition"
              />
              <p className="text-right text-[12px] text-[#6b7280] leading-[16px]">
                {kitchenInstructions.length}/150 characters
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════ RIGHT: Payment & Actions ════════════════════ */}
        <div className="w-full md:flex-1 md:min-w-0 space-y-4 md:sticky md:top-4">
          {/* ── Payment Details card ── */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Top section: summary + payment methods */}
            <div className="px-4 pt-4 pb-4 border-b border-[#e5e7eb] space-y-4">
              {/* Heading */}
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="1"
                    y="4"
                    width="22"
                    height="16"
                    rx="2"
                    stroke="#1f1f1f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 10h22"
                    stroke="#1f1f1f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[28px]">
                  Payment Details
                </h2>
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[14px] text-[#6b7280] leading-[20px]">Subtotal</span>
                  <span className="text-[14px] text-[#6b7280] leading-[20px]">
                    {formatLkr(subtotal)}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-[14px] text-[#6b7280] leading-[20px]">
                    Service Charge (10%)
                  </span>
                  <span className="text-[14px] text-[#6b7280] leading-[20px]">
                    {formatLkr(serviceCharge)}
                  </span>
                </div>
                <div className="border-t border-dashed border-[#e5e7eb]" />
                <div className="flex items-start justify-between">
                  <span className="text-[18px] font-bold text-[#1f1f1f] leading-[28px]">Total</span>
                  <span className="text-[18px] font-bold text-[#973102] leading-[28px]">
                    {formatLkr(total)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <p className="text-[14px] font-medium text-[#6b7280] uppercase tracking-[0.35px] leading-[20px]">
                  Payment Method
                </p>

                {/* Pay In-App option */}
                <button
                  onClick={() => setPaymentMethod("in-app")}
                  className={`w-full flex items-center gap-3 p-[13px] rounded-lg border transition cursor-pointer ${
                    paymentMethod === "in-app"
                      ? "bg-[rgba(151,49,2,0.05)] border-2 border-[rgba(149,48,2,0.5)]"
                      : "bg-[#f8f6f5] border-[#e5e7eb]"
                  }`}
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        stroke={paymentMethod === "in-app" ? "#953002" : "#1f1f1f"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 10h20"
                        stroke={paymentMethod === "in-app" ? "#953002" : "#1f1f1f"}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-[14px] font-medium leading-[20px] ${paymentMethod === "in-app" ? "text-[#953002]" : "text-[#1f1f1f]"}`}
                    >
                      Pay with Card
                    </p>
                    <p
                      className={`text-[12px] leading-[16px] ${paymentMethod === "in-app" ? "text-[rgba(151,49,2,0.8)]" : "text-[#6b7280]"}`}
                    >
                      Visa ending in 4242
                    </p>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className={`shrink-0 w-5 h-5 rounded-full border ${
                      paymentMethod === "in-app"
                        ? "bg-[#953002] border-[#953002]"
                        : "border-[#d1d5db]"
                    }`}
                  />
                </button>

                {/* Charge to Room option */}
                <button
                  onClick={() => setPaymentMethod("room-charge")}
                  className={`w-full flex items-center gap-3 rounded-lg border transition cursor-pointer ${
                    paymentMethod === "room-charge"
                      ? "bg-[rgba(151,49,2,0.05)] border-2 border-[rgba(149,48,2,0.5)] p-[14px]"
                      : "bg-[#f8f6f5] border-[#e5e7eb] p-[13px]"
                  }`}
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4M3 7l9-4 9 4"
                        stroke={paymentMethod === "room-charge" ? "#953002" : "#1f1f1f"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-[14px] font-medium leading-[20px] ${paymentMethod === "room-charge" ? "text-[#953002]" : "text-[#1f1f1f]"}`}
                    >
                      Charge to Room
                    </p>
                    <p
                      className={`text-[12px] leading-[16px] ${paymentMethod === "room-charge" ? "text-[rgba(151,49,2,0.8)]" : "text-[#6b7280]"}`}
                    >
                      Room {roomNumber} • Verified
                    </p>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className={`shrink-0 w-5 h-5 rounded-full border ${
                      paymentMethod === "room-charge"
                        ? "bg-[#953002] border-[#953002]"
                        : "border-[#d1d5db]"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom action area */}
            <div className="bg-[#f8f6f5] rounded-b-xl px-4 py-4 space-y-3">
              {/* Add instructions link */}
              <button
                onClick={() =>
                  document
                    .getElementById("kitchen-instructions")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full flex items-center justify-center gap-2 text-[14px] font-medium text-[#973102] hover:underline transition cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
                    stroke="#973102"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                    stroke="#973102"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Kitchen Instructions
              </button>

              {/* Place Order button */}
              <button
                onClick={handlePlaceOrder}
                className="w-full flex items-center justify-center gap-2 bg-[#973102] rounded-lg px-6 py-3 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#7c2802] transition cursor-pointer"
              >
                <span className="text-[16px] font-semibold text-white leading-[24px]">
                  Confirm & Place Order
                </span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-1">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="#6b7280"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="#6b7280"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[12px] text-[#6b7280] leading-[16px]">
                  Secure SSL Encrypted Transaction
                </span>
              </div>
            </div>
          </div>

          {/* ── Estimated Time card ── */}
          <div className="bg-[rgba(151,49,2,0.05)] border border-[rgba(151,49,2,0.2)] rounded-xl p-[17px] flex gap-3 items-start">
            <div className="shrink-0 pt-[2px]">
              {/* Clock icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#973102"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="#973102"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-[14px] font-semibold text-[#973102] leading-[20px]">
                Estimated Time
              </h4>
              <p className="text-[12px] text-[rgba(151,49,2,0.8)] leading-[19.5px]">
                Based on current kitchen volume, your order will be ready in approximately{" "}
                <span className="font-bold">20-25 minutes</span>.
              </p>
            </div>
          </div>

          {/* ── Need Help? link ── */}
          <Link
            href="/guest/order/help"
            className="flex items-center justify-center gap-2 text-[13px] text-[#828282] hover:text-[#973102] transition py-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9a3 3 0 1 1 3.95 2.84c-.58.2-1 .74-1 1.33V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            Need Help?
          </Link>
        </div>
      </div>
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
