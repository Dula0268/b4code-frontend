"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
    Tag, ArrowRight,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const BOOKING_ID = "#GP-88291"
const ORIGINAL_PAYMENT = 25_000
const SERVICE_FEE = 2_500          // 10% cancellation fee
const REFUNDABLE = ORIGINAL_PAYMENT - SERVICE_FEE
const CARD_LAST4 = "4242"

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-[13px] font-semibold text-[#1d1d1d] bg-white hover:bg-[#fafafa] transition-colors cursor-pointer"
            >
                {title}
                {open ? <ChevronUp size={15} className="text-[#828282]" /> : <ChevronDown size={15} className="text-[#828282]" />}
            </button>
            {open && (
                <div className="px-4 pb-4 pt-1 text-[12px] text-[#555] leading-relaxed bg-white border-t border-[#f0f0f0]">
                    {children}
                </div>
            )}
        </div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RefundRequestPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        setSubmitting(true)
        await new Promise(r => setTimeout(r, 1800))
        setSubmitting(false)
        setSubmitted(true)
    }

    // ── Success state ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-10 max-w-[480px] w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={30} className="text-[#27AE60]" />
                    </div>
                    <h2 className="text-[22px] font-bold text-[#1d1d1d] mb-2">Refund Request Submitted!</h2>
                    <p className="text-[13px] text-[#828282] leading-relaxed mb-1">
                        Your refund request for booking <span className="font-semibold text-[#1d1d1d]">{BOOKING_ID}</span> has been submitted.
                    </p>
                    <p className="text-[13px] text-[#828282] leading-relaxed mb-6">
                        <span className="font-bold text-[#953002]">{formatLKR(REFUNDABLE)}</span> will be credited to your Visa ending in {CARD_LAST4} within 5–7 business days.
                    </p>
                    <Link
                        href="/guest/booking/my-bookings"
                        className="inline-flex items-center justify-center w-full bg-[#953002] hover:bg-[#6d2200] text-white font-bold text-[14px] py-3 rounded-xl transition-colors no-underline"
                    >
                        Back to My Bookings
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-10">
            <div className="max-w-[860px] mx-auto px-4 pt-7">

                {/* Page header */}
                <div className="mb-7">
                    <h1 className="text-[26px] font-bold text-[#1d1d1d] leading-tight">Refund Request</h1>
                    <p className="text-[13px] text-[#828282] mt-1">
                        Please review your refundable amount and the policy before submitting your request for Booking{" "}
                        <span className="font-semibold text-[#1d1d1d]">{BOOKING_ID}</span>.
                    </p>
                </div>

                <div className="flex gap-6 items-start">

                    {/* ── LEFT: Refund card + submit ──────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0">

                        {/* Dark gradient refundable amount card */}
                        <div
                            className="rounded-t-2xl px-8 pt-10 pb-8"
                            style={{ background: "linear-gradient(135deg, #6d2200 0%, #953002 60%, #b83c04 100%)" }}
                        >
                            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-3">Refundable Amount</p>
                            <p className="text-[42px] font-black text-white leading-none">{formatLKR(REFUNDABLE)}</p>
                        </div>

                        {/* White details section */}
                        <div className="bg-white rounded-b-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-8 py-5 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-[#555]">Original Payment</span>
                                <span className="font-semibold text-[#1d1d1d]">{formatLKR(ORIGINAL_PAYMENT)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-[#555]">Service Fees (Non-refundable)</span>
                                <span className="font-semibold text-red-500">−{formatLKR(SERVICE_FEE)}</span>
                            </div>
                            <div className="h-px bg-[#f0f0f0]" />
                            <p className="text-[12px] text-[#828282] leading-relaxed">
                                The refund will be credited back to your original payment method (Visa ending in {CARD_LAST4}).
                            </p>
                        </div>

                        {/* Submit button */}
                        <button
                            id="submit-refund-btn"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="mt-5 w-full flex items-center justify-center gap-2.5 bg-[#953002] hover:bg-[#6d2200] disabled:opacity-70 text-white font-bold text-[15px] py-4 rounded-xl transition-colors cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Refund Request <ArrowRight size={16} />
                                </>
                            )}
                        </button>

                        {/* Inner footer note */}
                        <div className="mt-8 pt-6 border-t border-[#e8e8e8] text-center">
                            <p className="text-[11px] text-[#aaa]">
                                © 2026 Prime Stay Sri Lanka. All rights reserved.{" "}
                                <Link href="#" className="hover:text-[#953002] no-underline transition-colors">Terms of Service</Link>
                                {" | "}
                                <Link href="#" className="hover:text-[#953002] no-underline transition-colors">Privacy Policy</Link>
                            </p>
                        </div>
                    </div>

                    {/* ── RIGHT: Refund Policy sidebar ────────────────────────── */}
                    <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Tag size={15} className="text-[#953002]" />
                                <h2 className="text-[14px] font-bold text-[#1d1d1d]">Refund Policy</h2>
                            </div>

                            {/* Full Refund Eligible */}
                            <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl px-4 py-3 mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 size={13} className="text-[#27AE60]" />
                                    <p className="text-[12px] font-bold text-[#2E7D32]">Full Refund Eligible</p>
                                </div>
                                <p className="text-[12px] text-[#388E3C] leading-relaxed">
                                    Cancellations made 48 hours prior to the event are eligible for a full booking refund.
                                </p>
                            </div>

                            {/* Processing Fees */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle size={13} className="text-amber-500" />
                                    <p className="text-[12px] font-bold text-amber-700">Processing Fees</p>
                                </div>
                                <p className="text-[12px] text-amber-600 leading-relaxed">
                                    Standard service and processing fees ({formatLKR(SERVICE_FEE)}) are non-refundable under all circumstances.
                                </p>
                            </div>

                            {/* Accordions */}
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
                    </div>
                </div>
            </div>
        </div>
    )
}
