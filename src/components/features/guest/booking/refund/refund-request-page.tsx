"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  Tag, ArrowRight,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// These values come from the cancel page navigation — swap for URL params or
// API response once the backend is connected
// ─────────────────────────────────────────────────────────────────────────────
const BOOKING_ID      = "#GP-88291"
const ORIGINAL_PAYMENT = 25_000
const CANCELLATION_FEE = 2_500    // 10% of payment — non-refundable service fee
const REFUNDABLE       = ORIGINAL_PAYMENT - CANCELLATION_FEE
const CARD_LAST4       = "4242"

const POLICY_POINTS = [
  "Changes subject to room availability.",
  "Price difference is calculated based on current rates.",
  "Cancellations within 48 h of arrival may incur fees.",
]

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion — each FAQ item manages its own open state independently
// ─────────────────────────────────────────────────────────────────────────────
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-colors cursor-pointer text-left"
        style={{ background: "white", color: "var(--fg)" }}>
        {title}
        {open
          ? <ChevronUp  size={15} style={{ color: "var(--gray-3)" }} />
          : <ChevronDown size={15} style={{ color: "var(--gray-3)" }} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-xs leading-relaxed border-t"
          style={{ background: "white", borderColor: "var(--gray-5)", color: "var(--gray-2)" }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function RefundRequestPage() {
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    // TODO: POST to /api/refunds with bookingId and reason
    await new Promise(r => setTimeout(r, 1800))
    setSubmitting(false)
    setSubmitted(true)
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4"
        style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="ps-card p-10 max-w-[480px] w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "color-mix(in srgb, var(--state-success) 12%, white)", border: "1px solid color-mix(in srgb, var(--state-success) 20%, transparent)" }}>
            <CheckCircle2 size={30} style={{ color: "var(--state-success)" }} />
          </div>
          <h2 className="text-[1.375rem] font-bold mb-2" style={{ color: "var(--fg)" }}>Refund Request Submitted!</h2>
          <p className="text-sm leading-relaxed mb-1" style={{ color: "var(--gray-3)" }}>
            Your refund request for booking <span className="font-semibold" style={{ color: "var(--fg)" }}>{BOOKING_ID}</span> has been submitted.
          </p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--gray-3)" }}>
            <span className="font-bold" style={{ color: "var(--brand-primary)" }}>{formatLKR(REFUNDABLE)}</span>
            {" "}will be credited to your Visa ending in {CARD_LAST4} within 5–7 business days.
          </p>
          <Link href="/guest/booking/my-bookings"
            className="inline-flex items-center justify-center w-full text-white font-bold text-sm py-3 rounded-xl transition-colors no-underline"
            style={{ background: "var(--brand-primary)" }}>
            Back to My Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[860px] mx-auto px-4 pt-7">

        <div className="mb-7">
          <h1 className="text-[1.625rem] font-black leading-tight" style={{ color: "var(--fg)" }}>Refund Request</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gray-3)" }}>
            Please review your refundable amount and the policy before submitting your request for Booking{" "}
            <span className="font-semibold" style={{ color: "var(--fg)" }}>{BOOKING_ID}</span>.
          </p>
        </div>

        {/* Stack on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: amount card + submit ───────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-0">

            {/* Gradient amount banner — stands out to confirm the refund value immediately */}
            <div className="rounded-t-2xl px-8 pt-10 pb-8"
              style={{ background: "linear-gradient(135deg, var(--primary-active) 0%, var(--brand-primary) 60%, #b83c04 100%)" }}>
              <p className="text-[0.6875rem] font-bold text-white/70 uppercase tracking-widest mb-3">Refundable Amount</p>
              <p className="text-[2.625rem] font-black text-white leading-none">{formatLKR(REFUNDABLE)}</p>
            </div>

            {/* White details section */}
            <div className="ps-card rounded-t-none px-8 py-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "var(--gray-2)" }}>Original Payment</span>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>{formatLKR(ORIGINAL_PAYMENT)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "var(--gray-2)" }}>Service Fees (Non-refundable)</span>
                <span className="font-semibold" style={{ color: "var(--state-error)" }}>−{formatLKR(CANCELLATION_FEE)}</span>
              </div>
              <div className="h-px" style={{ background: "var(--gray-5)" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--gray-3)" }}>
                The refund will be credited to your original payment method (Visa ending in {CARD_LAST4}).
              </p>
            </div>

            <button
              id="submit-refund-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-5 w-full flex items-center justify-center gap-2.5 text-white font-bold text-[0.9375rem] py-4 rounded-xl transition-colors cursor-pointer disabled:opacity-70"
              style={{ background: "var(--brand-primary)" }}>
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>Submit Refund Request <ArrowRight size={16} /></>
              )}
            </button>

            <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-[0.6875rem]" style={{ color: "var(--gray-4)" }}>
                © 2026 Prime Stay Sri Lanka. All rights reserved.{" "}
                <Link href="#" className="no-underline hover:underline" style={{ color: "var(--brand-primary)" }}>Terms</Link>{" | "}
                <Link href="#" className="no-underline hover:underline" style={{ color: "var(--brand-primary)" }}>Privacy</Link>
              </p>
            </div>
          </div>

          {/* ── Right: refund policy sidebar ─────────────────────────── */}
          <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
            <div className="ps-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={15} style={{ color: "var(--brand-primary)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--fg)" }}>Refund Policy</h2>
              </div>

              {/* Full refund eligible chip */}
              <div className="rounded-xl px-4 py-3 mb-3 border"
                style={{ background: "color-mix(in srgb, var(--state-success) 8%, white)", borderColor: "color-mix(in srgb, var(--state-success) 20%, transparent)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={13} style={{ color: "var(--state-success)" }} />
                  <p className="text-xs font-bold" style={{ color: "var(--state-success)" }}>Full Refund Eligible</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--state-success)" }}>
                  Cancellations made 48 hours prior are eligible for a full booking refund.
                </p>
              </div>

              {/* Processing fees warning */}
              <div className="rounded-xl px-4 py-3 mb-4 border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <p className="text-xs font-bold text-amber-700">Processing Fees</p>
                </div>
                <p className="text-xs leading-relaxed text-amber-600">
                  Standard service and processing fees ({formatLKR(CANCELLATION_FEE)}) are non-refundable in all circumstances.
                </p>
              </div>

              {/* Policy points */}
              <ul className="mb-4 flex flex-col gap-1.5">
                {POLICY_POINTS.map(point => (
                  <li key={point} className="flex items-start gap-2 text-xs" style={{ color: "var(--gray-2)" }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--brand-primary)" }}>•</span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                <AccordionItem title="Processing Timelines">
                  Refunds are typically processed within <strong>5–7 business days</strong> after the request is submitted.
                  Bank processing may take an additional 2–5 business days depending on your bank.
                </AccordionItem>
                <AccordionItem title="Late Cancellations">
                  Cancellations made within <strong>48 hours of check-in</strong> are subject to a 50% cancellation fee.
                  No-shows will be charged the full booking amount.
                </AccordionItem>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="w-full py-3 border rounded-xl text-sm font-bold transition-colors cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--gray-2)", background: "white" }}>
              Go Back
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
