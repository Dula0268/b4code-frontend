"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    CalendarDays, Hash, ChevronRight, Info,
    ChevronDown, AlertTriangle,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const BOOKING = {
    id: "#123456",
    property: "Ocean View Villa, Malibu",
    imageSrc: "/images/booking/ocean-villa-malibu.png",
    checkIn: "Oct 12",
    checkOut: "Oct 15, 2023",
    totalPaid: 25_000,
    cancellationPctFee: 10,
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

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CancelBookingPage() {
    const router = useRouter()

    const [reason, setReason] = useState("")
    const [comments, setComments] = useState("")
    const [agreed, setAgreed] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // Price calc
    const cancellationFee = Math.round(BOOKING.totalPaid * (BOOKING.cancellationPctFee / 100))
    const refundableAmount = BOOKING.totalPaid - cancellationFee

    const canSubmit = reason !== "" && agreed && !submitting

    const handleCancel = async () => {
        if (!canSubmit) return
        setSubmitting(true)
        await new Promise(r => setTimeout(r, 1500))
        setSubmitting(false)
        setSubmitted(true)
    }

    // ── Success state ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] p-10 max-w-[480px] w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-[#fff4eb] flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle size={28} className="text-[#953002]" />
                    </div>
                    <h2 className="text-[22px] font-bold text-[#1d1d1d] mb-2">Cancellation Requested</h2>
                    <p className="text-[13px] text-[#828282] leading-relaxed mb-1">
                        Your booking <span className="font-semibold text-[#1d1d1d]">{BOOKING.id}</span> has been cancelled.
                    </p>
                    <p className="text-[13px] text-[#828282] leading-relaxed mb-6">
                        A refund of <span className="font-bold text-[#953002]">{formatLKR(refundableAmount)}</span> will be
                        processed to your Visa ending in {BOOKING.cardLast4} within 5–7 business days.
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
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
            <div className="max-w-[640px] mx-auto px-4 pt-7">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[12px] text-[#828282] mb-6">
                    <Link href="/guest/booking/my-bookings" className="hover:text-[#953002] transition-colors no-underline">
                        My Bookings
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-[#953002] font-semibold">Cancel Booking</span>
                </nav>

                {/* Title */}
                <h1 className="text-[28px] font-bold text-[#1d1d1d] leading-tight mb-1">Cancel Your Booking</h1>
                <p className="text-[13px] text-[#828282] mb-7 leading-relaxed">
                    We&apos;re sorry to see you go. Please review the details and policy before confirming your cancellation.
                </p>

                {/* ── Current Booking card ─────────────────────────────────────── */}
                <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex gap-0 mb-5">
                    {/* Image */}
                    <div className="relative w-[140px] h-[105px] flex-shrink-0">
                        <Image
                            src={BOOKING.imageSrc}
                            alt={BOOKING.property}
                            fill
                            className="object-cover"
                            sizes="140px"
                        />
                    </div>
                    {/* Info */}
                    <div className="flex-1 px-5 py-4">
                        <p className="text-[10px] font-bold text-[#953002] uppercase tracking-widest mb-1">Current Booking</p>
                        <p className="text-[16px] font-bold text-[#1d1d1d] leading-snug mb-2">{BOOKING.property}</p>
                        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#828282]">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays size={13} className="text-[#953002]" />
                                {BOOKING.checkIn} – {BOOKING.checkOut}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Hash size={13} className="text-[#953002]" />
                                ID: {BOOKING.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Refund Calculation card ──────────────────────────────────── */}
                <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 mb-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Info size={16} className="text-[#953002]" />
                        <h2 className="text-[15px] font-bold text-[#1d1d1d]">Refund Calculation</h2>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between text-[13px]">
                            <span className="text-[#555]">Total amount paid</span>
                            <span className="font-semibold text-[#1d1d1d]">{formatLKR(BOOKING.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                            <span className="text-[#555]">Cancellation fee ({BOOKING.cancellationPctFee}%)</span>
                            <span className="font-semibold text-red-500">−{formatLKR(cancellationFee)}</span>
                        </div>

                        <div className="h-px bg-[#f0f0f0] my-1" />

                        <div className="flex justify-between items-baseline">
                            <span className="text-[14px] font-bold text-[#1d1d1d]">Total Refundable Amount</span>
                            <span className="text-[22px] font-black text-[#953002]">{formatLKR(refundableAmount)}</span>
                        </div>
                    </div>

                    <p className="text-[11px] text-[#aaa] mt-3 leading-relaxed">
                        * Refund will be processed back to your original payment method (Visa ending in {BOOKING.cardLast4}) within 5–7 business days.
                    </p>
                </div>

                {/* ── Reason for Cancellation ──────────────────────────────────── */}
                <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-[#1d1d1d] mb-2" htmlFor="cancel-reason">
                        Reason for Cancellation
                    </label>
                    <div className="relative">
                        <select
                            id="cancel-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full appearance-none bg-white border border-[#e0e0e0] rounded-xl px-4 py-3 text-[13px] text-[#1d1d1d] focus:outline-none focus:border-[#953002] focus:ring-1 focus:ring-[#953002]/30 cursor-pointer transition-colors pr-10"
                        >
                            <option value="" disabled>Select a reason...</option>
                            {CANCELLATION_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828282] pointer-events-none" />
                    </div>
                </div>

                {/* ── Additional Comments ──────────────────────────────────────── */}
                <div className="mb-6">
                    <label className="block text-[13px] font-semibold text-[#1d1d1d] mb-2" htmlFor="cancel-comments">
                        Additional Comments <span className="text-[#828282] font-normal">(Optional)</span>
                    </label>
                    <textarea
                        id="cancel-comments"
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Tell us more about why you're cancelling..."
                        className="w-full bg-white border border-[#e0e0e0] rounded-xl px-4 py-3 text-[13px] text-[#1d1d1d] placeholder:text-[#bbb] resize-none focus:outline-none focus:border-[#953002] focus:ring-1 focus:ring-[#953002]/30 transition-colors"
                    />
                </div>

                {/* ── Agreement checkbox ────────────────────────────────────────── */}
                <div className="flex items-start gap-3 mb-8">
                    <input
                        id="agree-checkbox"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#953002] flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="agree-checkbox" className="text-[12px] text-[#555] leading-relaxed cursor-pointer">
                        I understand that this action is permanent and I agree to the{" "}
                        <Link href="#" className="text-[#953002] font-semibold underline hover:text-[#6d2200]">
                            Refund Policy
                        </Link>
                        {" "}and cancellation fees mentioned above.
                    </label>
                </div>

                {/* ── Action buttons ────────────────────────────────────────────── */}
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 py-3.5 border-2 border-[#1d1d1d] text-[#1d1d1d] text-[14px] font-bold rounded-xl hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                    >
                        Keep My Booking
                    </button>
                    <button
                        id="confirm-cancel-btn"
                        onClick={handleCancel}
                        disabled={!canSubmit}
                        className="flex-1 py-3.5 bg-[#953002] hover:bg-[#6d2200] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Cancel & Refund Request"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
