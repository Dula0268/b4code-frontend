"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  Tag, ArrowRight,
} from "lucide-react"
import { Suspense } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Configuration & Data Mocks
// ─────────────────────────────────────────────────────────────────────────────

const APP_CONFIG = {
  defaultCurrency: "LKR",
  processingDays: "5–7 business days",
} as const

/** 
 * Currently mocked until backend connects properly.
 * Ensures strict types instead of unmanaged inline integers. 
 */
interface RefundData {
  bookingId: string;
  originalPayment: number;
  cancellationFee: number;
  refundable: number;
  cardLast4: string;
}

const DEFAULT_REFUND_DATA: RefundData = {
  bookingId: "#GP-88291",
  originalPayment: 25000,
  cancellationFee: 2500, // Non-refundable service fee
  refundable: 22500,     // Total minus fee
  cardLast4: "4242"
}

const POLICY_POINTS = [
  "Changes subject to room availability.",
  "Price difference is calculated based on current rates.",
  "Cancellations within 48 h of arrival may incur fees.",
]

/**
 * Validates and formats the currency
 * @param amount - amount to convert to text
 */
function formatCurrency(amount: number): string {
  return `${APP_CONFIG.defaultCurrency} ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Component: Accordion
// ─────────────────────────────────────────────────────────────────────────────

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

function AccordionItem({ title, children }: AccordionItemProps) {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-colors cursor-pointer text-left"
        style={{ background: "white", color: "var(--fg)" }}>
        {title}
        {open
          ? <ChevronUp size={15} style={{ color: "var(--gray-3)" }} />
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

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook for State & Business Logic
// ─────────────────────────────────────────────────────────────────────────────

function useRefundRequestLogic() {
  const router = useRouter()
  // Can be used to fetch the real refund data
  const searchParams = useSearchParams()
  const urlBookingId = searchParams.get("bookingId")

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // In real app, fetch this info using urlBookingId
  const refundData: RefundData = {
    ...DEFAULT_REFUND_DATA,
    bookingId: urlBookingId || DEFAULT_REFUND_DATA.bookingId
  }

  const handleRefundSubmit = async () => {
    setSubmitting(true)
    setErrorMsg(null)

    try {
      // Simulate Backend Call with validation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!refundData.bookingId) reject(new Error("Invalid Booking ID"))
          resolve(true)
        }, 1800)
      })
      setSubmitted(true)
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected network error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  return {
    refundData,
    submitting,
    submitted,
    errorMsg,
    handleRefundSubmit,
    handleGoBack
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Presentational Components
// ─────────────────────────────────────────────────────────────────────────────

function RefundSuccessView({ data }: { data: RefundData }) {
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
          Your refund request for booking <span className="font-semibold" style={{ color: "var(--fg)" }}>{data.bookingId}</span> has been submitted.
        </p>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--gray-3)" }}>
          <span className="font-bold" style={{ color: "var(--brand-primary)" }}>{formatCurrency(data.refundable)}</span>
          {" "}will be credited to your Visa ending in {data.cardLast4} within {APP_CONFIG.processingDays}.
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

function RefundRequestUI() {
  const logic = useRefundRequestLogic()

  if (logic.submitted) {
    return <RefundSuccessView data={logic.refundData} />
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[860px] mx-auto px-4 pt-7">

        <header className="mb-7">
          <h1 className="text-[1.625rem] font-black leading-tight" style={{ color: "var(--fg)" }}>Refund Request</h1>
          <p className="text-sm mt-1" style={{ color: "var(--gray-3)" }}>
            Please review your refundable amount and the policy before submitting your request for Booking{" "}
            <span className="font-semibold" style={{ color: "var(--fg)" }}>{logic.refundData.bookingId}</span>.
          </p>
        </header>

        {logic.errorMsg && (
          <div className="mb-5 p-4 rounded-xl flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle size={18} />
            <p className="text-sm font-semibold">{logic.errorMsg}</p>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left Column: Amount Card + Submit ───────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-0 w-full">
            <div className="rounded-t-2xl px-8 pt-10 pb-8"
              style={{ background: "linear-gradient(135deg, var(--primary-active) 0%, var(--brand-primary) 60%, #b83c04 100%)" }}>
              <p className="text-[0.6875rem] font-bold text-white/70 uppercase tracking-widest mb-3">Refundable Amount</p>
              <p className="text-[2.625rem] font-black text-white leading-none">{formatCurrency(logic.refundData.refundable)}</p>
            </div>

            <div className="ps-card rounded-t-none px-8 py-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "var(--gray-2)" }}>Original Payment</span>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>{formatCurrency(logic.refundData.originalPayment)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "var(--gray-2)" }}>Service Fees (Non-refundable)</span>
                <span className="font-semibold" style={{ color: "var(--state-error)" }}>−{formatCurrency(logic.refundData.cancellationFee)}</span>
              </div>
              <div className="h-px w-full" style={{ background: "var(--gray-5)" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--gray-3)" }}>
                The refund will be credited to your original payment method (Visa ending in {logic.refundData.cardLast4}).
              </p>
            </div>

            <button
              id="submit-refund-btn"
              onClick={logic.handleRefundSubmit}
              disabled={logic.submitting}
              className="mt-5 w-full flex items-center justify-center gap-2.5 text-white font-bold text-[0.9375rem] py-4 rounded-xl transition-colors cursor-pointer disabled:opacity-70"
              style={{ background: "var(--brand-primary)" }}>
              {logic.submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>Submit Refund Request <ArrowRight size={16} /></>
              )}
            </button>

            <footer className="mt-8 pt-6 border-t text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-[0.6875rem]" style={{ color: "var(--gray-4)" }}>
                © 2026 Prime Stay Sri Lanka. All rights reserved.{" "}
                <Link href="#" className="no-underline hover:underline" style={{ color: "var(--brand-primary)" }}>Terms</Link>{" | "}
                <Link href="#" className="no-underline hover:underline" style={{ color: "var(--brand-primary)" }}>Privacy</Link>
              </p>
            </footer>
          </div>

          {/* ── Right Column: Refund Policy Sidebar ──────────────────── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
            <div className="ps-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={15} style={{ color: "var(--brand-primary)" }} />
                <h2 className="text-sm font-bold" style={{ color: "var(--fg)" }}>Refund Policy</h2>
              </div>

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

              <div className="rounded-xl px-4 py-3 mb-4 border border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <p className="text-xs font-bold text-amber-700">Processing Fees</p>
                </div>
                <p className="text-xs leading-relaxed text-amber-600">
                  Standard service and processing fees ({formatCurrency(logic.refundData.cancellationFee)}) are non-refundable in all circumstances.
                </p>
              </div>

              <ul className="mb-4 flex flex-col gap-1.5">
                {POLICY_POINTS.map((point) => (
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
              onClick={logic.handleGoBack}
              className="w-full py-3 border rounded-xl text-sm font-bold transition-colors cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--gray-2)", background: "white" }}>
              Go Back
            </button>
          </aside>

        </div>
      </div>
    </div>
  )
}

/**
 * Main Export - Wrap the presentational component with Suspense 
 * to handle next/navigation hooks safely during SSR/CSR.
 */
export default function RefundRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
      </div>
    }>
      <RefundRequestUI />
    </Suspense>
  )
}
