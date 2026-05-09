"use client"

import { Suspense, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, Hash, ChevronRight, Info, ChevronDown } from "lucide-react"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { useAuthStore } from "@/store/auth/auth.store"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

// ─────────────────────────────────────────────────────────────────────────────
// Configuration & Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Fallback configuration if no valid booking is found. */
const APP_CONFIG = {
  cancellationFeePercent: 10,
  defaultCardSuffix: "4242",
  defaultCurrency: "LKR",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
} as const

const MOCK_DEMO_BOOKING = {
  id: "#123456",
  property: "Ocean View Villa, Malibu",
  imageSrc: "/images/booking/ocean-villa-malibu.png",
  checkIn: "Oct 12",
  checkOut: "Oct 15, 2023",
  totalPaid: 25000,
  cancellationPctFee: APP_CONFIG.cancellationFeePercent,
  cardLast4: APP_CONFIG.defaultCardSuffix,
}

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found a better deal",
  "Travel dates changed",
  "Health / emergency",
  "Property does not meet expectations",
  "Other",
]

/**
 * Formats numeric amount into localized currency
 * @param amount - The numeric amount to format
 */
function formatCurrency(amount: number): string {
  return `${APP_CONFIG.defaultCurrency} ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook for State & Business Logic
// ─────────────────────────────────────────────────────────────────────────────

function useCancelBookingLogic() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingIdParam = searchParams.get("bookingId")
  const bookingRefParam = searchParams.get("bookingRef")
  const propertyParam = searchParams.get("property")
  const imageSrcParam = searchParams.get("imageSrc")
  const checkInParam = searchParams.get("checkIn")
  const checkOutParam = searchParams.get("checkOut")
  const totalPriceParam = searchParams.get("totalPrice")

  const bookings = useGuestBookingStore((s) => s.bookings)
  const cancelBooking = useGuestBookingStore((s) => s.cancelBooking)

  const storeBooking = useMemo(
    () => (bookingIdParam ? bookings.find((b) => b.id === bookingIdParam) : undefined),
    [bookings, bookingIdParam]
  )

  const apiBookingId = bookingIdParam && !storeBooking ? bookingIdParam : null

  const parseDateLabel = (raw?: string | null, withYear?: boolean) => {
    if (!raw) return withYear ? "N/A" : "N/A"
    const date = new Date(`${raw}T00:00:00`)
    if (Number.isNaN(date.getTime())) return raw
    return date.toLocaleDateString("en-US", withYear ? { month: "short", day: "numeric", year: "numeric" } : { month: "short", day: "numeric" })
  }

  const activeBooking = storeBooking
    ? {
        id: storeBooking.confirmationCode,
        property: storeBooking.property,
        imageSrc: storeBooking.imageSrc,
        checkIn: storeBooking.checkInFormatted,
        checkOut: storeBooking.checkOutFormatted,
        totalPaid: storeBooking.totalPrice,
        cancellationPctFee: APP_CONFIG.cancellationFeePercent,
        cardLast4: APP_CONFIG.defaultCardSuffix,
      }
    : apiBookingId
    ? {
        id: bookingRefParam || apiBookingId,
        property: propertyParam || "Selected Property",
        imageSrc: imageSrcParam || "/images/booking/ocean-villa-malibu.png",
        checkIn: parseDateLabel(checkInParam, false),
        checkOut: parseDateLabel(checkOutParam, true),
        totalPaid: Number(totalPriceParam ?? 0) || 0,
        cancellationPctFee: APP_CONFIG.cancellationFeePercent,
        cardLast4: APP_CONFIG.defaultCardSuffix,
      }
    : MOCK_DEMO_BOOKING

  const [reason, setReason] = useState<string>("")
  const [comments, setComments] = useState<string>("")
  const [agreed, setAgreed] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const cancellationFee = Math.round(activeBooking.totalPaid * (activeBooking.cancellationPctFee / 100))
  const refundableAmount = activeBooking.totalPaid - cancellationFee

  const isNotFound = Boolean(bookingIdParam && !storeBooking && !apiBookingId)
  const canSubmit = reason.trim() !== "" && agreed && !submitting && !isNotFound

  const handleCancelSubmit = async () => {
    if (!canSubmit) return

    setErrorMsg(null)
    setSubmitting(true)

    try {
      const targetBookingId = storeBooking?.id || apiBookingId

      if (targetBookingId && !targetBookingId.startsWith("bk-")) {
        type AuthUserLike = { id?: number }
        const guestIdToUse = (useAuthStore.getState().user as AuthUserLike | null)?.id ?? 1;
        const res = await fetch(`${APP_CONFIG.apiBaseUrl}/guest/bookings/${targetBookingId}/cancel?guestId=${guestIdToUse}`, {
            method: "PATCH"
        });
        if (!res.ok) {
            throw new Error("Failed to cancel booking on server.");
        }
      }

      if (storeBooking) {
        cancelBooking(storeBooking.id)
      }

      // Preserve query params for refund component
      const targetUrl = bookingIdParam
        ? `/guest/booking/refund?bookingId=${encodeURIComponent(bookingIdParam)}`
        : "/guest/booking/refund"
        
      router.push(targetUrl)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to cancel the booking. Please try again."
      setErrorMsg(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  return {
    booking: activeBooking,
    reason, setReason,
    comments, setComments,
    agreed, setAgreed,
    submitting, errorMsg,
    cancellationFee, refundableAmount,
    isNotFound, canSubmit,
    handleCancelSubmit, handleGoBack,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Content (wrapped in Suspense for useSearchParams)
// ─────────────────────────────────────────────────────────────────────────────

function CancelBookingContent() {
  const logic = useCancelBookingLogic()

  return (
    <div className="min-h-screen flex flex-col">
      <GuestTopbar />

      <main className="flex-1 pt-20 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="max-w-[640px] mx-auto px-4 pt-7">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "var(--gray-3)" }}>
            <Link href="/guest/booking/my-bookings" className="no-underline hover:text-[var(--brand-primary)] transition-colors">
              My Bookings
            </Link>
            <ChevronRight size={12} />
            <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>Cancel Booking</span>
          </nav>

          <header>
            <h1 className="text-[1.75rem] font-black leading-tight mb-1" style={{ color: "var(--fg)" }}>
              Cancel Your Booking
            </h1>
            <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--gray-3)" }}>
              We&apos;re sorry to see you go. Please review the details and policy before confirming.
            </p>
          </header>

          {/* Dynamic Alerts */}
          {logic.isNotFound && (
            <p className="text-xs mb-5 p-3 rounded bg-red-50" style={{ color: "var(--state-error)" }}>
              Booking not found. Please return to My Bookings and try again.
            </p>
          )}
          {logic.errorMsg && (
            <p className="text-xs mb-5 p-3 rounded bg-red-50" style={{ color: "var(--state-error)" }}>
              {logic.errorMsg}
            </p>
          )}

          {/* Property Information Card */}
          <div className="ps-card overflow-hidden flex mb-5">
            <div className="relative w-36 h-28 flex-shrink-0">
              <Image src={logic.booking.imageSrc} alt={logic.booking.property} fill className="object-cover" sizes="144px" />
            </div>
            <div className="flex-1 px-5 py-4">
              <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand-primary)" }}>
                Current Booking
              </p>
              <p className="text-base font-bold leading-snug mb-2" style={{ color: "var(--fg)" }}>{logic.booking.property}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--gray-3)" }}>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} style={{ color: "var(--brand-primary)" }} />
                  {logic.booking.checkIn} – {logic.booking.checkOut}
                </span>
                <span className="flex items-center gap-1.5">
                  <Hash size={13} style={{ color: "var(--brand-primary)" }} />
                  ID: {logic.booking.id}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Calculation Card */}
          <div className="ps-card p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} style={{ color: "var(--brand-primary)" }} />
              <h2 className="text-[0.9375rem] font-bold" style={{ color: "var(--fg)" }}>Refund Calculation</h2>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--gray-2)" }}>Total amount paid</span>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>{formatCurrency(logic.booking.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--gray-2)" }}>Cancellation fee ({logic.booking.cancellationPctFee}%)</span>
                <span className="font-semibold" style={{ color: "var(--state-error)" }}>−{formatCurrency(logic.cancellationFee)}</span>
              </div>

              <div className="h-px my-1" style={{ background: "var(--gray-5)" }} />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>Total Refundable Amount</span>
                <span className="text-[1.375rem] font-black" style={{ color: "var(--brand-primary)" }}>
                  {formatCurrency(logic.refundableAmount)}
                </span>
              </div>
            </div>

            <p className="text-[0.6875rem] mt-3 leading-relaxed" style={{ color: "var(--gray-4)" }}>
              * Refund will be processed to your original payment method (Visa ending in {logic.booking.cardLast4}) within 5–7 business days.
            </p>
          </div>

          {/* Cancellation Reason Select */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" htmlFor="cancel-reason" style={{ color: "var(--fg)" }}>
              Reason for Cancellation
            </label>
            <div className="relative">
              <select
                id="cancel-reason"
                value={logic.reason}
                onChange={(e) => logic.setReason(e.target.value)}
                className="w-full appearance-none rounded-xl px-4 py-3 text-sm border outline-none transition-colors cursor-pointer pr-10"
                style={{
                  background: "white",
                  borderColor: "var(--border)",
                  color: logic.reason ? "var(--fg)" : "var(--gray-4)",
                }}
              >
                <option value="" disabled>Select a reason…</option>
                {CANCELLATION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--gray-3)" }} />
            </div>
          </div>

          {/* Optional Comments */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" htmlFor="cancel-comments" style={{ color: "var(--fg)" }}>
              Additional Comments{" "}
              <span className="font-normal" style={{ color: "var(--gray-3)" }}>(Optional)</span>
            </label>
            <textarea
              id="cancel-comments"
              rows={4}
              value={logic.comments}
              onChange={(e) => logic.setComments(e.target.value)}
              placeholder="Tell us more about why you're cancelling…"
              className="w-full rounded-xl px-4 py-3 text-sm border resize-none outline-none transition-colors"
              style={{
                background: "white",
                borderColor: "var(--border)",
                color: "var(--fg)",
              }}
            />
          </div>

          {/* T&C Agreement */}
          <div className="flex items-start gap-3 mb-8">
            <input
              id="agree-checkbox"
              type="checkbox"
              checked={logic.agreed}
              onChange={(e) => logic.setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer"
              style={{ accentColor: "var(--brand-primary)" }}
            />
            <label htmlFor="agree-checkbox" className="text-xs leading-relaxed cursor-pointer" style={{ color: "var(--gray-2)" }}>
              I understand that this action is permanent and I agree to the{" "}
              <Link href="#" className="font-semibold underline" style={{ color: "var(--brand-primary)" }}>
                Refund Policy
              </Link>{" "}
              and cancellation fees mentioned above.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={logic.handleGoBack}
              className="flex-1 py-3.5 border-2 text-sm font-bold rounded-xl transition-colors cursor-pointer"
              style={{ borderColor: "var(--fg)", color: "var(--fg)" }}>
              Keep My Booking
            </button>
            <button
              id="confirm-cancel-btn"
              onClick={logic.handleCancelSubmit}
              disabled={!logic.canSubmit}
              className="flex-1 py-3.5 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--brand-primary)" }}>
              {logic.submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : "Cancel & Refund Request"}
            </button>
          </div>

        </div>
      </main>

      <GuestFooter />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Export — Suspense boundary for useSearchParams
// ─────────────────────────────────────────────────────────────────────────────

export default function CancelBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
      </div>
    }>
      <CancelBookingContent />
    </Suspense>
  )
}
