"use client"

import { Suspense, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, Hash, ChevronRight, Info, ChevronDown } from "lucide-react"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"

// ─────────────────────────────────────────────────────────────────────────────
// Demo fallback — shown when no bookingId query param is present
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_BOOKING = {
  id: "#123456",
  property: "Ocean View Villa, Malibu",
  imageSrc: "/images/booking/ocean-villa-malibu.png",
  checkIn: "Oct 12",
  checkOut: "Oct 15, 2023",
  totalPaid: 25_000,
  cancellationPctFee: 10,   // percentage charged for cancellation
  cardLast4: "4242",
}

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found a better deal",
  "Travel dates changed",
  "Health / emergency",
  "Property does not meet expectations",
  "Other",
]

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — separated so Suspense can wrap useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
function CancelBookingInner() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const bookingId   = searchParams.get("bookingId")

  const bookings       = useGuestBookingStore(s => s.bookings)
  const cancelBooking  = useGuestBookingStore(s => s.cancelBooking)

  // Look up the real booking from the store when a bookingId is supplied
  const storeBooking = useMemo(
    () => (bookingId ? bookings.find(b => b.id === bookingId) : undefined),
    [bookings, bookingId],
  )

  const booking = storeBooking
    ? {
        id:                  storeBooking.confirmationCode,
        property:            storeBooking.property,
        imageSrc:            storeBooking.imageSrc,
        checkIn:             storeBooking.checkInFormatted,
        checkOut:            storeBooking.checkOutFormatted,
        totalPaid:           storeBooking.totalPrice,
        cancellationPctFee:  10,
        cardLast4:           "4242",
      }
    : DEMO_BOOKING

  const [reason,    setReason]    = useState("")
  const [comments,  setComments]  = useState("")
  const [agreed,    setAgreed]    = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cancellationFee   = Math.round(booking.totalPaid * (booking.cancellationPctFee / 100))
  const refundableAmount  = booking.totalPaid - cancellationFee

  // Require a reason and agreement; also block when a bookingId was given but not found
  const canSubmit = reason !== "" && agreed && !submitting && (!bookingId || !!storeBooking)

  const handleCancel = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))

    if (storeBooking) cancelBooking(storeBooking.id)

    setSubmitting(false)
    // Preserve the bookingId in the refund URL so the refund page can reference it
    router.push(bookingId
      ? `/guest/booking/refund?bookingId=${encodeURIComponent(bookingId)}`
      : "/guest/booking/refund",
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[640px] mx-auto px-4 pt-7">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "var(--gray-3)" }}>
          <Link href="/guest/booking/my-bookings" className="no-underline hover:text-[var(--brand-primary)] transition-colors">
            My Bookings
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>Cancel Booking</span>
        </nav>

        <h1 className="text-[1.75rem] font-black leading-tight mb-1" style={{ color: "var(--fg)" }}>
          Cancel Your Booking
        </h1>
        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--gray-3)" }}>
          We&apos;re sorry to see you go. Please review the details and policy before confirming.
        </p>

        {/* Booking not found alert — only if a real bookingId was provided */}
        {bookingId && !storeBooking && (
          <p className="text-xs mb-5" style={{ color: "var(--state-error)" }}>
            Booking not found. Please return to My Bookings and try again.
          </p>
        )}

        {/* Property card */}
        <div className="ps-card overflow-hidden flex mb-5">
          <div className="relative w-36 h-28 flex-shrink-0">
            <Image src={booking.imageSrc} alt={booking.property} fill className="object-cover" sizes="144px" />
          </div>
          <div className="flex-1 px-5 py-4">
            <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand-primary)" }}>
              Current Booking
            </p>
            <p className="text-base font-bold leading-snug mb-2" style={{ color: "var(--fg)" }}>{booking.property}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--gray-3)" }}>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} style={{ color: "var(--brand-primary)" }} />
                {booking.checkIn} – {booking.checkOut}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash size={13} style={{ color: "var(--brand-primary)" }} />
                ID: {booking.id}
              </span>
            </div>
          </div>
        </div>

        {/* Refund calculation */}
        <div className="ps-card p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} style={{ color: "var(--brand-primary)" }} />
            <h2 className="text-[0.9375rem] font-bold" style={{ color: "var(--fg)" }}>Refund Calculation</h2>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--gray-2)" }}>Total amount paid</span>
              <span className="font-semibold" style={{ color: "var(--fg)" }}>{formatLKR(booking.totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--gray-2)" }}>Cancellation fee ({booking.cancellationPctFee}%)</span>
              <span className="font-semibold" style={{ color: "var(--state-error)" }}>−{formatLKR(cancellationFee)}</span>
            </div>

            <div className="h-px my-1" style={{ background: "var(--gray-5)" }} />

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold" style={{ color: "var(--fg)" }}>Total Refundable Amount</span>
              <span className="text-[1.375rem] font-black" style={{ color: "var(--brand-primary)" }}>
                {formatLKR(refundableAmount)}
              </span>
            </div>
          </div>

          <p className="text-[0.6875rem] mt-3 leading-relaxed" style={{ color: "var(--gray-4)" }}>
            * Refund will be processed to your original payment method (Visa ending in {booking.cardLast4}) within 5–7 business days.
          </p>
        </div>

        {/* Reason select */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2" htmlFor="cancel-reason" style={{ color: "var(--fg)" }}>
            Reason for Cancellation
          </label>
          <div className="relative">
            <select
              id="cancel-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full appearance-none rounded-xl px-4 py-3 text-sm border outline-none transition-colors cursor-pointer pr-10"
              style={{
                background:   "white",
                borderColor:  "var(--border)",
                color:        reason ? "var(--fg)" : "var(--gray-4)",
              }}
            >
              <option value="" disabled>Select a reason…</option>
              {CANCELLATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--gray-3)" }} />
          </div>
        </div>

        {/* Optional comments */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" htmlFor="cancel-comments" style={{ color: "var(--fg)" }}>
            Additional Comments{" "}
            <span className="font-normal" style={{ color: "var(--gray-3)" }}>(Optional)</span>
          </label>
          <textarea
            id="cancel-comments"
            rows={4}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Tell us more about why you're cancelling…"
            className="w-full rounded-xl px-4 py-3 text-sm border resize-none outline-none transition-colors"
            style={{
              background:  "white",
              borderColor: "var(--border)",
              color:       "var(--fg)",
            }}
          />
        </div>

        {/* Agreement checkbox */}
        <div className="flex items-start gap-3 mb-8">
          <input
            id="agree-checkbox"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
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

        {/* Action buttons — stacked on mobile, side-by-side on sm+ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3.5 border-2 text-sm font-bold rounded-xl transition-colors cursor-pointer"
            style={{ borderColor: "var(--fg)", color: "var(--fg)" }}>
            Keep My Booking
          </button>
          <button
            id="confirm-cancel-btn"
            onClick={handleCancel}
            disabled={!canSubmit}
            className="flex-1 py-3.5 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--brand-primary)" }}>
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </>
            ) : "Cancel & Refund Request"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function CancelBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
      </div>
    }>
      <CancelBookingInner />
    </Suspense>
  )
}
