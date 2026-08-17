"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/guest/ordering/cart.store";
import { useOrderStore } from "@/store/guest/ordering/order.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import { useGuestSessionStore } from "@/store/guest/ordering/guest-session.store";
import { paymentApi } from "@/api/payment/payment.api";

/* ─── Helpers ─── */

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

type PaymentMethod = "cash" | "online" | "pay-at-property" | "card" | "room-charge";

/* ─── Checkout Client ─── */

export default function CheckoutClient() {
  const user = useAuthStore((s) => s.user);
  
  // Derived data from session
  const qrContext = useOrderContextStore((s) => s.qrContext);
  const location = qrContext?.location || (user?.roomId ? String(user.roomId) : "");
  const authGuestName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "";
  const propertyId = user?.propertyId || qrContext?.propertyId;
  const guestId = user?.userId;

  const isRoomQr = qrContext?.type?.toUpperCase().includes("ROOM");
  const isTableQr = !isRoomQr;
  
  const sessionGuestName = useGuestSessionStore((s) => s.guestName);
  const sessionGuestPhone = useGuestSessionStore((s) => s.guestPhone);
  const setGuestDetails = useGuestSessionStore((s) => s.setGuestDetails);

  const [walkInName, setWalkInName] = React.useState(sessionGuestName || "");
  const [walkInPhone, setWalkInPhone] = React.useState(sessionGuestPhone || "");

  React.useEffect(() => {
    setGuestDetails(walkInName, walkInPhone);
  }, [walkInName, walkInPhone, setGuestDetails]);
  
  const isWalkIn = !user;
  const finalGuestName = isWalkIn ? walkInName : authGuestName;

  const serviceChargeRate = useCartStore((s) => s.serviceChargeRate);

  const linesMap = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clearCart = useCartStore((s) => s.clear);

  const lines = React.useMemo(() => Object.values(linesMap), [linesMap]);
  const subtotal = React.useMemo(
    () => lines.reduce((s, l) => s + l.item.priceLkr * l.qty, 0),
    [lines],
  );
  const serviceCharge = Math.round(subtotal * serviceChargeRate);
  const total = subtotal + serviceCharge;

  const [kitchenInstructions, setKitchenInstructions] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    user ? "room-charge" : "cash"
  );
  const router = useRouter();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePlaceOrder = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
    // Room QR but not logged in — block ordering
    if (isRoomQr && !user) {
      return;
    }

    if (!location || !finalGuestName || !propertyId) {
      toast.error("Please provide your name and ensure you have scanned a valid QR code.");
      setIsProcessing(false);
      return;
    }

    // Walk-in (table QR) requires phone
    if (isTableQr && !user && !walkInPhone) {
      toast.error("Please provide your phone number.");
      setIsProcessing(false);
      return;
    }

    // Determine actual payment method value for the API
    let resolvedPaymentMethod: "cash" | "online" | "pay-at-property" | "card" | "room-charge" = paymentMethod;
    if (!user) {
      // Walk-in: cash or online
      resolvedPaymentMethod = paymentMethod === "online" ? "online" : "cash";
    } else {
      // Logged-in room guest: card (online/PayHere) or pay-at-property (room charge)
      resolvedPaymentMethod = paymentMethod === "room-charge" ? "pay-at-property" : "online";
    }

    const guestSessionId = useGuestSessionStore.getState().sessionId;

    setGuestDetails(finalGuestName, walkInPhone);

    const orderId = await placeOrder({
      lines: lines.map((l) => ({ 
        item: l.item, 
        qty: l.qty, 
        selectedVariantId: l.selectedVariantId,
        selectedModifiers: l.selectedModifiers
      })),
      subtotal,
      serviceCharge,
      tax: 0,
      total,
      location,
      guestName: finalGuestName,
      guestPhone: walkInPhone,
      guestInstructions: kitchenInstructions,
      paymentMethod: resolvedPaymentMethod,
      propertyId,
      guestId,
      guestSessionId: guestSessionId || undefined,
    });
    
    if (orderId) {
      clearCart();

      // If guest chose online payment, redirect through PayHere before confirmation
      if (resolvedPaymentMethod === "online") {
        try {
          const response = await paymentApi.initiatePayment({
            amount: total,
            currency: "LKR",
            paymentMethod: "VISA",
            firstName: finalGuestName.split(" ")[0] || "Guest",
            lastName: finalGuestName.split(" ").slice(1).join(" ") || "",
            email: "",
            phone: walkInPhone || "",
            foodOrderId: Number(orderId),
            returnParams: window.location.origin + "/guest/order/confirmation",
          });

          if (response.checkoutUrl && response.payHereParams) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = response.checkoutUrl;
            form.style.display = "none";

            const params = new URLSearchParams(response.payHereParams);
            params.forEach((value, key) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
            return; // PayHere will redirect to /guest/order/confirmation on success
          }
        } catch (err) {
          console.error("Payment initiation failed:", err);
          toast.error("Could not initiate online payment. Please try cash instead.");
          setIsProcessing(false);
          return;
        }
      }

      router.push("/guest/order/confirmation");
    } else {
      toast.error("Failed to place order. Please try again.");
    }
    } finally {
      // If we're redirecting to PayHere, this might run before the page unloads, but that's fine.
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 pb-24 md:pb-12">
      {/* ─── Breadcrumbs + Subtitle ─── */}
      <div className="space-y-1.5 mb-8">
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href={qrContext ? `/guest/order?qrId=${qrContext.qrId}` : "/guest/order"} className="flex items-center gap-1.5 text-gray-400 hover:text-[var(--brand-primary)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12L12 3L21 12M5 10.5V20.5C5 20.776 5.224 21 5.5 21H10.5V16C10.5 15.724 10.724 15.5 11 15.5H13C13.276 15.5 13.5 15.724 13.5 16V21H18.5C18.776 21 19 20.776 19 20.5V10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </Link>
          <ChevronRight />
          <Link
            href={qrContext ? `/guest/order/menu?qrId=${qrContext.qrId}` : "/guest/order/menu"}
            className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
          >
            Menu
          </Link>
          <ChevronRight />
          <Link
            href="/guest/order/cart"
            className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
          >
            Cart
          </Link>
          <ChevronRight />
          <span className="text-[var(--brand-primary)] font-bold">Checkout</span>
        </nav>
        <p className="text-base text-gray-500 font-medium pt-2">
          Review your items and select a payment method.
        </p>
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* ════════════════════ LEFT: Order + Instructions ════════════════════ */}
        <div className="w-full md:w-[700px] lg:w-[800px] md:shrink-0 space-y-6">
          {/* ── Your Order card ── */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-gray-100/80 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-900 shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Your Order
                </h2>
              </div>
              <Link
                href="/guest/order/cart"
                className="text-sm font-bold px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              >
                Edit
              </Link>
            </div>

            {/* Items list */}
            <div className="flex flex-col divide-y divide-gray-100/80 relative z-10">
              {Object.entries(linesMap).map(([lineKey, { item, qty }], idx) => (
                <div
                  key={lineKey}
                  className="flex gap-4 md:gap-6 items-center px-6 md:px-8 py-5 bg-white/50 hover:bg-white/80 transition-colors duration-300 group"
                >
                  {/* Thumbnail 96×96 */}
                  <div className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="96px"
                      />
                    ) : null}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2 py-1">
                    {/* Title + price row */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[var(--brand-primary)] transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-lg font-bold text-gray-900 shrink-0">
                        {formatLkr(item.priceLkr)}
                      </span>
                    </div>

                    {/* Notes/description */}
                    <p className="text-sm text-gray-500 font-medium truncate pr-8">
                      {item.description}
                    </p>

                    {/* Qty control + Remove */}
                    <div className="flex items-center gap-4 pt-2">
                      {/* Qty pill */}
                      <div className="flex items-center bg-white border border-gray-100 rounded-full group-hover:border-[var(--brand-primary)]/20 transition-colors shadow-sm p-1">
                        <button
                          onClick={() => setQty(lineKey, qty - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(lineKey, qty + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => remove(lineKey)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {lines.length === 0 && (
                <div className="px-6 py-16 text-center bg-white/40 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner border border-gray-100">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-500">No items in your order.</p>
                  <Link
                    href="/guest/order/menu"
                    className="inline-flex mt-6 items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-base font-bold text-[var(--brand-primary)] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
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
            className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6 md:p-8 space-y-5 scroll-mt-24 transition-all focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100/50 flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Kitchen Instructions
              </h2>
            </div>

            <div className="space-y-3">
              <textarea
                value={kitchenInstructions}
                onChange={(e) => {
                  if (e.target.value.length <= 150) setKitchenInstructions(e.target.value);
                }}
                placeholder="e.g. Allergies, extra cutlery, sauce on the side..."
                className="w-full h-[140px] bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 text-base font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all shadow-sm"
              />
              <p className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                {kitchenInstructions.length}/150 chars
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════ RIGHT: Payment & Actions ════════════════════ */}
        <div className="w-full md:flex-1 md:min-w-[380px] space-y-6 md:sticky md:top-[88px]">
          {/* ── Payment Details card ── */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--brand-primary)]/5 to-transparent pointer-events-none" />

            {/* Top section: summary + payment methods */}
            <div className="p-6 md:p-8 border-b border-gray-100/80 space-y-8 relative z-10">
              {/* Heading */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Payment
                </h2>
              </div>

              {/* Totals */}
              <div className="bg-white/80 rounded-2xl p-5 md:p-6 space-y-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Subtotal</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatLkr(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Service Charge ({Math.round(serviceChargeRate * 100)}%)
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatLkr(serviceCharge)}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 mt-2" />
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-[var(--brand-primary)] leading-none tracking-tight">
                    {formatLkr(total)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">
                  Select Method
                </p>

                {/* ── ROOM QR + NOT LOGGED IN: Room Verification ── */}
                {isRoomQr && !user && (
                  <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-6 space-y-5 text-center shadow-sm">
                    <div className="flex justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200/50">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      Room Verification
                    </h3>
                    <p className="text-sm font-medium text-amber-900/70">
                      To place an order to your room, please enter your name to verify that this room is occupied.
                    </p>
                    <div className="space-y-3 pt-2 text-left">
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        className="w-full bg-white border border-amber-200/80 rounded-xl px-4 py-4 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                      />
                      <input
                        type="text"
                        value={location}
                        disabled
                        className="w-full bg-amber-100/50 border border-amber-200/50 rounded-xl px-4 py-4 text-base font-bold text-amber-800 cursor-not-allowed opacity-80"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await useAuthStore.getState().roomLogin(walkInName, location, Number(propertyId));
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Verification failed");
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 shadow-[0_4px_12px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_20px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 rounded-xl px-6 py-4 text-white font-bold text-base active:scale-95 transition-all cursor-pointer mt-2"
                    >
                      Verify & Continue
                    </button>
                  </div>
                )}

                {/* ── TABLE QR + WALK-IN (not logged in): Name/Phone + Cash/Online ── */}
                {isTableQr && !user && (
                  <>
                    <div className="space-y-4 mb-8 bg-white/50 p-5 rounded-3xl border border-gray-100 shadow-sm">
                      <p className="text-sm font-bold text-gray-900 mb-2 px-1">Guest Details <span className="text-gray-400 font-medium ml-1">(Walk-in)</span></p>
                      <input
                        type="text"
                        placeholder="Your Full Name *"
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all shadow-sm"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number *"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      {/* Pay with Cash */}
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        className={`w-full flex items-center gap-5 p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer group ${
                          paymentMethod === "cash"
                            ? "bg-orange-50 border-[var(--brand-primary)]/40 shadow-sm"
                            : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 shadow-sm"
                        }`}
                      >
                        <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${paymentMethod === 'cash' ? 'bg-[var(--brand-primary)] text-white scale-105' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 border border-gray-100'}`}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="6" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-base font-bold leading-tight mb-1 transition-colors ${paymentMethod === "cash" ? "text-[var(--brand-primary)]" : "text-gray-900"}`}>
                            Pay with Cash
                          </p>
                          <p className="text-sm font-medium text-gray-500 leading-tight">
                            Pay at counter or on delivery
                          </p>
                        </div>
                        <div className={`shrink-0 w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${paymentMethod === "cash" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-gray-200"}`}>
                          {paymentMethod === "cash" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                      </button>

                      {/* Online Payment */}
                      <button
                        onClick={() => setPaymentMethod("online")}
                        className={`w-full flex items-center gap-5 p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer group ${
                          paymentMethod === "online"
                            ? "bg-orange-50 border-[var(--brand-primary)]/40 shadow-sm"
                            : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 shadow-sm"
                        }`}
                      >
                        <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${paymentMethod === 'online' ? 'bg-[var(--brand-primary)] text-white scale-105' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 border border-gray-100'}`}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-base font-bold leading-tight mb-1 transition-colors ${paymentMethod === "online" ? "text-[var(--brand-primary)]" : "text-gray-900"}`}>
                            Online Payment
                          </p>
                          <p className="text-sm font-medium text-gray-500 leading-tight">
                            Pay securely via PayHere
                          </p>
                        </div>
                        <div className={`shrink-0 w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${paymentMethod === "online" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-gray-200"}`}>
                          {paymentMethod === "online" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    </div>
                  </>
                )}

                {/* ── LOGGED IN (room guest): Card + Room Charge ── */}
                {user && (
                  <div className="space-y-3">
                    {/* Pay with Card (online/PayHere) */}
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full flex items-center gap-5 p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer group ${
                        paymentMethod === "card"
                          ? "bg-orange-50 border-[var(--brand-primary)]/40 shadow-sm"
                          : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${paymentMethod === 'card' ? 'bg-[var(--brand-primary)] text-white scale-105' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 border border-gray-100'}`}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-base font-bold leading-tight mb-1 transition-colors ${paymentMethod === "card" ? "text-[var(--brand-primary)]" : "text-gray-900"}`}>
                          Pay with Card
                        </p>
                        <p className="text-sm font-medium text-gray-500 leading-tight">
                          Online payment via PayHere
                        </p>
                      </div>
                      <div className={`shrink-0 w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${paymentMethod === "card" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-gray-200"}`}>
                        {paymentMethod === "card" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                    </button>

                    {/* Charge to Room */}
                    <button
                      onClick={() => setPaymentMethod("room-charge")}
                      className={`w-full flex items-center gap-5 p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer group ${
                        paymentMethod === "room-charge"
                          ? "bg-orange-50 border-[var(--brand-primary)]/40 shadow-sm"
                          : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${paymentMethod === 'room-charge' ? 'bg-[var(--brand-primary)] text-white scale-105' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 border border-gray-100'}`}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4M3 7l9-4 9 4"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-base font-bold leading-tight mb-1 transition-colors ${paymentMethod === "room-charge" ? "text-[var(--brand-primary)]" : "text-gray-900"}`}>
                          Charge to Room
                        </p>
                        <p className={`text-sm font-medium leading-tight flex items-center gap-2 ${paymentMethod === "room-charge" ? "text-[var(--brand-primary)]/80" : "text-gray-500"}`}>
                          {location} <span className="w-1 h-1 rounded-full bg-current opacity-50" /> Verified
                        </p>
                      </div>
                      <div className={`shrink-0 w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${paymentMethod === "room-charge" ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-gray-200"}`}>
                        {paymentMethod === "room-charge" && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom action area */}
            <div className="bg-gray-50/50 px-6 py-6 space-y-5 relative z-10 border-t border-gray-100/80">
              {/* Add instructions link */}
              <button
                onClick={() =>
                  document
                    .getElementById("kitchen-instructions")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--brand-primary)] transition-colors cursor-pointer group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:-translate-y-0.5 transition-transform">
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
                Add Kitchen Instructions
              </button>

              {/* Place Order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-[var(--brand-primary)] rounded-2xl px-6 py-4 md:py-5 shadow-[0_8px_16px_rgba(217,119,6,0.2)] hover:shadow-[0_12px_24px_rgba(217,119,6,0.3)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:-translate-y-0 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 cursor-pointer group"
              >
                {isProcessing ? (
                  <span className="text-lg font-bold text-white tracking-wide flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <span className="text-lg font-bold text-white tracking-wide">
                      Confirm & Place Order
                    </span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-500">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Secure SSL Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* ── Estimated Time card ── */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-5 flex gap-4 items-start shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100/50 flex items-center justify-center text-[var(--brand-primary)] shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="space-y-1 py-1">
              <h4 className="text-base font-bold text-gray-900">
                Estimated Time
              </h4>
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Your order will be ready in approximately{" "}
                <span className="font-bold text-gray-900">20-25 minutes</span>.
              </p>
            </div>
          </div>

          {/* ── Need Help? link ── */}
          <Link
            href="/guest/order/help"
            className="flex items-center justify-center gap-3 text-sm font-bold text-gray-500 hover:text-[var(--brand-primary)] transition-colors py-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 group-hover:shadow transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="group-hover:text-[var(--brand-primary)] transition-colors">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 9a3 3 0 1 1 3.95 2.84c-.58.2-1 .74-1 1.33V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1.5" fill="currentColor" />
              </svg>
            </div>
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
