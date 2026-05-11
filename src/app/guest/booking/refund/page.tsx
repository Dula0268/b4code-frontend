"use client"

import { useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, FileText, Download, MessageSquare, AlertCircle, ChevronRight, Hash } from "lucide-react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

// ─────────────────────────────────────────────────────────────────────────────
// Configuration & Constants
// ─────────────────────────────────────────────────────────────────────────────
const APP_CONFIG = {
  currency: "LKR",
  refundProcessingDays: "5–7",
} as const

const MOCK_REFUND = {
  id: "REF-992810",
  bookingId: "BK-123456",
  property: "Ocean View Villa, Malibu",
  amount: 22500,
  method: "Visa ending in 4242",
  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  status: "Processing",
}

function formatCurrency(amount: number) {
  return `${APP_CONFIG.currency} ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Business Logic Hook
// ─────────────────────────────────────────────────────────────────────────────
function useRefundRequestLogic() {
  const searchParams = useSearchParams()
  const bookingIdParam = searchParams.get("bookingId")
   const source = searchParams.get("source")
   const refundAmountParam = searchParams.get("refundAmount")

  // For a real app, you would fetch refund details using bookingIdParam.
  // Here we use mock data representing the initiated refund.
  const refundData = useMemo(() => {
    return {
      ...MOCK_REFUND,
      bookingId: bookingIdParam || MOCK_REFUND.bookingId,
       source: source || "cancel",
       amount: refundAmountParam ? Number(refundAmountParam) : MOCK_REFUND.amount,
    }
    }, [bookingIdParam, source, refundAmountParam])

  return { refundData }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────────────────────────────────────
function RefundRequestContent() {
  const { refundData } = useRefundRequestLogic()

  return (
    <div className="min-h-screen flex flex-col">
      <GuestTopbar />
      <main className="flex-1 pt-24 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="max-w-[560px] mx-auto px-4">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-16 h-16 mb-5">
              <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "color-mix(in srgb, var(--brand-primary) 30%, transparent)" }} />
              <div className="relative w-full h-full rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--brand-primary) 12%, white)" }}>
                <CheckCircle2 size={32} strokeWidth={2.5} style={{ color: "var(--brand-primary)" }} />
              </div>
            </div>
            <h1 className="text-[1.875rem] font-black leading-tight mb-2" style={{ color: "var(--fg)" }}>Refund Initiated</h1>
            <p className="text-sm leading-relaxed max-w-[400px]" style={{ color: "var(--gray-3)" }}>
               {refundData.source === "modify"
                 ? "Your reservation was updated and the refund difference has been initiated to your original payment method."
                 : "Your cancellation was successful. We have initiated your refund to your original payment method."}
            </p>
          </div>

          <div className="ps-card overflow-hidden mb-6">
            <div className="px-6 py-5 border-b flex justify-between items-center" style={{ borderColor: "var(--gray-5)", background: "color-mix(in srgb, var(--gray-5) 20%, white)" }}>
              <div>
                <p className="text-[0.6875rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gray-4)" }}>Refund ID</p>
                <div className="flex items-center gap-1.5"><Hash size={14} style={{ color: "var(--gray-3)" }}/><span className="text-sm font-bold" style={{ color: "var(--fg)" }}>{refundData.id}</span></div>
              </div>
              <div className="text-right">
                <p className="text-[0.6875rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gray-4)" }}>Status</p>
                <span className="inline-block text-[0.6875rem] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wide">{refundData.status}</span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium" style={{ color: "var(--gray-3)" }}>Refund Amount</span>
                <span className="text-2xl font-black" style={{ color: "var(--brand-primary)" }}>{formatCurrency(refundData.amount)}</span>
              </div>
              <div className="h-px w-full" style={{ background: "var(--gray-5)" }} />
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[var(--gray-3)] mb-1">Property</p><p className="text-sm font-bold text-[var(--fg)]">{refundData.property}</p></div>
                <div><p className="text-xs text-[var(--gray-3)] mb-1">Booking ID</p><p className="text-sm font-bold text-[var(--fg)]">{refundData.bookingId}</p></div>
                <div><p className="text-xs text-[var(--gray-3)] mb-1">Refund Method</p><p className="text-sm font-bold text-[var(--fg)]">{refundData.method}</p></div>
                <div><p className="text-xs text-[var(--gray-3)] mb-1">Date Initiated</p><p className="text-sm font-bold text-[var(--fg)]">{refundData.date}</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 border border-blue-200 bg-blue-50">
            <AlertCircle size={18} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">What happens next?</p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Please allow {APP_CONFIG.refundProcessingDays} business days for the funds to appear in your account, depending on your bank&apos;s processing time. An email receipt has been sent to you.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/guest/booking/my-bookings" className="w-full py-3.5 flex items-center justify-center text-sm font-bold text-white rounded-xl transition-colors no-underline" style={{ background: "var(--brand-primary)" }}>
              Back to My Bookings
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--gray-2)] bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"><Download size={15}/> Receipt</button>
              <button className="flex items-center justify-center gap-2 py-3 border border-[var(--border)] rounded-xl text-sm font-bold text-[var(--gray-2)] bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"><MessageSquare size={15}/> Support</button>
            </div>
          </div>

        </div>
      </main>
      <GuestFooter />
    </div>
  )
}

export default function RefundRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}><div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" /></div>}>
      <RefundRequestContent />
    </Suspense>
  )
}
