"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Calendar as CalendarIcon, Users, XCircle,
    ArrowUpCircle, ArrowDownCircle, RefreshCw, CreditCard, AlertTriangle, Check
} from "lucide-react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import CalendarPicker from "@/components/shared/forms/calendar-picker"
import { useEffect, useState, useRef } from "react"

function formatLKR(n: number) {
    return `LKR ${Math.abs(n).toLocaleString("en-US")}`
}

type ModalType = "payment" | "refund" | "cancel-confirm" | "cancel-refund" | "success" | null

export default function ModifyBookingPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const bookingRef = searchParams?.get("bookingRef") || ""
    const getBookingByCode = useGuestBookingStore(s => s.getBookingByCode)
    const updateBookingStatus = useGuestBookingStore(s => s.updateBookingStatus)
    const cancelBooking = useGuestBookingStore(s => s.cancelBooking)
    const storedBooking = getBookingByCode(bookingRef)

    const [mounted, setMounted] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [modal, setModal] = useState<ModalType>(null)
    const [modalMsg, setModalMsg] = useState("")

    // Form state — mirroring booking fields
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [guests, setGuests] = useState(2)
    const [specialRequests, setSpecialRequests] = useState("")
    const [calOpen, setCalOpen] = useState(false)
    const calRef = useRef<HTMLDivElement>(null)

    // Derived price
    const newNights = checkIn && checkOut && checkOut > checkIn
        ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
        : 0
    const baseRate = storedBooking?.basePrice || 0
    const newSubtotal = baseRate * newNights
    const newTax = newSubtotal * 0.1
    const newTotal = newSubtotal + newTax
    const priceDiff = storedBooking ? newTotal - storedBooking.totalPrice : 0

    useEffect(() => {
        setMounted(true)
        if (storedBooking) {
            setCheckIn(new Date(storedBooking.checkIn + "T00:00:00"))
            setCheckOut(new Date(storedBooking.checkOut + "T00:00:00"))
            setGuests(storedBooking.guests)
        }
    }, [storedBooking])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (calRef.current && !calRef.current.contains(e.target as Node)) {
                setCalOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fafafa]">
                <GuestTopbar />
                <main className="flex-1 max-w-[860px] w-full mx-auto px-6 py-10 mt-16 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#9a3300] border-t-transparent rounded-full animate-spin" />
                </main>
                <GuestFooter />
            </div>
        )
    }

    if (!storedBooking) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fafafa]">
                <GuestTopbar />
                <main className="flex-1 max-w-[860px] w-full mx-auto px-6 py-10 mt-16 text-center">
                    <h1 className="text-2xl font-bold text-[#1d1d1d] mb-4">Booking Not Found</h1>
                    <Link href="/guest/booking/my-bookings" className="text-[#9a3300] hover:underline font-medium">
                        Return to My Bookings
                    </Link>
                </main>
                <GuestFooter />
            </div>
        )
    }

    const handleDateChange = (ci: Date | null, co: Date | null) => {
        setCheckIn(ci)
        setCheckOut(co)
        if (ci && co && ci < co) setCalOpen(false)
    }

    const handleSaveChanges = () => {
        if (!checkIn || !checkOut || checkIn >= checkOut) {
            alert("Please select valid check-in and check-out dates.")
            return
        }
        if (priceDiff > 0) {
            setModal("payment")
        } else if (priceDiff < 0) {
            setModal("refund")
        } else {
            commitChanges()
        }
    }

    const commitChanges = () => {
        setIsSaving(true)
        setTimeout(() => {
            updateBookingStatus(bookingRef, {
                checkIn: checkIn!.toISOString().split("T")[0],
                checkOut: checkOut!.toISOString().split("T")[0],
                checkInFormatted: checkIn!.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                checkOutFormatted: checkOut!.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                nights: newNights,
                nightsLabel: `${newNights} night${newNights !== 1 ? "s" : ""}`,
                guests,
                guestsLabel: `${guests} Adults`,
                totalPrice: newTotal,
                taxes: newTax,
                status: "UPCOMING",
            })
            setIsSaving(false)
            setModal("success")
            setModalMsg("Booking updated successfully!")
        }, 900)
    }

    const handleCancelBooking = () => {
        setModal("cancel-confirm")
    }

    const confirmCancel = () => {
        const refundEligible = storedBooking.paidInFull || storedBooking.paymentMethod === "card"
        cancelBooking(storedBooking.id)
        setModal(refundEligible ? "cancel-refund" : "success")
        setModalMsg("Your booking has been cancelled.")
    }

    const closeAndRedirect = () => {
        setModal(null)
        router.push("/guest/booking/my-bookings")
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1 max-w-[860px] w-full mx-auto px-6 py-10 mt-16">
                {/* Back */}
                <div className="mb-6">
                    <Link href={`/guest/booking/confirmation?bookingRef=${bookingRef}`}
                        className="inline-flex items-center gap-2 text-[#555] hover:text-[#9a3300] font-medium transition-colors">
                        <ArrowLeft size={16} /> Back to Details
                    </Link>
                </div>

                <h1 className="text-[32px] font-bold text-[#1d1d1d] mb-1">Modify Booking</h1>
                <p className="text-[14px] text-[#555] mb-8">{storedBooking.property} · {storedBooking.location}</p>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

                    {/* ── LEFT ── */}
                    <div className="flex flex-col gap-6">

                        {/* Dates */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 shadow-sm">
                            <h2 className="text-[16px] font-bold text-[#1d1d1d] mb-4 flex items-center gap-2">
                                <CalendarIcon size={16} className="text-[#9a3300]" /> Stay Dates
                            </h2>
                            <div className="border border-[#e0e0e0] rounded-xl overflow-visible relative" ref={calRef}>
                                <div
                                    onClick={() => setCalOpen(!calOpen)}
                                    className="flex cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 p-4 border-r border-[#e0e0e0]">
                                        <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Check-in</p>
                                        <p className="text-[15px] font-bold text-[#1d1d1d]">
                                            {checkIn ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                                        </p>
                                    </div>
                                    <div className="flex-1 p-4">
                                        <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Check-out</p>
                                        <p className="text-[15px] font-bold text-[#1d1d1d]">
                                            {checkOut ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                                        </p>
                                    </div>
                                </div>
                                {calOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl z-50 shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0] p-4 flex justify-center">
                                        <CalendarPicker
                                            checkIn={checkIn}
                                            checkOut={checkOut}
                                            onChange={handleDateChange}
                                            onComplete={() => { }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 shadow-sm">
                            <h2 className="text-[16px] font-bold text-[#1d1d1d] mb-4 flex items-center gap-2">
                                <Users size={16} className="text-[#9a3300]" /> Guests
                            </h2>
                            <div className="flex items-center justify-between">
                                <p className="text-[14px] text-[#555]">Number of Guests</p>
                                <div className="flex items-center bg-white border border-[#e0e0e0] rounded-xl overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setGuests(g => Math.max(1, g - 1))}
                                        className="px-4 py-2.5 hover:bg-[#f5f5f5] text-[#1d1d1d] font-bold border-r border-[#e0e0e0] cursor-pointer transition-colors"
                                    >−</button>
                                    <span className="px-5 py-2.5 font-semibold text-[15px] min-w-[48px] text-center">{guests}</span>
                                    <button
                                        onClick={() => setGuests(g => Math.min(10, g + 1))}
                                        className="px-4 py-2.5 hover:bg-[#f5f5f5] text-[#1d1d1d] font-bold border-l border-[#e0e0e0] cursor-pointer transition-colors"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* Special Requests */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 shadow-sm">
                            <h2 className="text-[16px] font-bold text-[#1d1d1d] mb-4">Special Requests</h2>
                            <textarea
                                value={specialRequests}
                                onChange={e => setSpecialRequests(e.target.value)}
                                rows={4}
                                placeholder="Any special requirements or requests for your stay..."
                                className="w-full border border-[#e0e0e0] rounded-xl px-4 py-3 text-[14px] text-[#1d1d1d] resize-none focus:outline-none focus:border-[#9a3300] transition-colors bg-[#fafafa]"
                            />
                        </div>

                        {/* Cancel Booking */}
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <h2 className="text-[16px] font-bold text-red-700 mb-2 flex items-center gap-2">
                                <XCircle size={16} /> Cancel Booking
                            </h2>
                            <p className="text-[13px] text-red-600 mb-4">
                                Cancelling this booking is permanent. If you paid online, you may be eligible for a refund.
                            </p>
                            <button
                                onClick={handleCancelBooking}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Cancel This Booking
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT: Summary ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl p-5 shadow-sm lg:sticky lg:top-24 flex flex-col gap-4">
                        <h2 className="text-[15px] font-bold text-[#1d1d1d]">Price Summary</h2>

                        {/* Original */}
                        <div className="flex flex-col gap-1.5 pb-4 border-b border-[#f0f0f0]">
                            <div className="flex justify-between text-[13px] text-[#555]">
                                <span>Original total</span>
                                <span className="font-semibold text-[#1d1d1d]">{formatLKR(storedBooking.totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-[12px] text-[#888]">
                                <span>{storedBooking.nightsLabel}</span>
                                <span>{formatLKR(storedBooking.basePrice)} / night</span>
                            </div>
                        </div>

                        {/* New */}
                        {newNights > 0 && (
                            <div className="flex flex-col gap-1.5 pb-4 border-b border-[#f0f0f0]">
                                <div className="flex justify-between text-[13px] text-[#555]">
                                    <span>New subtotal</span>
                                    <span className="font-semibold text-[#1d1d1d]">{formatLKR(newSubtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[13px] text-[#555]">
                                    <span>Taxes (10%)</span>
                                    <span className="font-semibold text-[#1d1d1d]">{formatLKR(newTax)}</span>
                                </div>
                                <div className="flex justify-between text-[13px] font-bold text-[#1d1d1d] mt-1">
                                    <span>New total</span>
                                    <span>{formatLKR(newTotal)}</span>
                                </div>
                            </div>
                        )}

                        {/* Difference */}
                        {newNights > 0 && priceDiff !== 0 && (
                            <div className={`flex items-center gap-3 p-3 rounded-xl text-[13px] font-semibold ${priceDiff > 0
                                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                                    : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                }`}>
                                {priceDiff > 0
                                    ? <ArrowUpCircle size={18} className="text-amber-500 flex-shrink-0" />
                                    : <ArrowDownCircle size={18} className="text-emerald-500 flex-shrink-0" />}
                                <span>
                                    {priceDiff > 0
                                        ? `You'll pay an extra ${formatLKR(priceDiff)}`
                                        : `Refund of ${formatLKR(Math.abs(priceDiff))} will be requested`}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleSaveChanges}
                            disabled={isSaving || newNights < 1}
                            className="w-full py-3 bg-[#9a3300] hover:bg-[#852900] disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSaving
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <><RefreshCw size={15} /> Save Changes</>}
                        </button>
                        <Link
                            href={`/guest/booking/confirmation?bookingRef=${bookingRef}`}
                            className="w-full py-2.5 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#555] font-bold rounded-xl transition-colors text-center text-[13px]"
                        >
                            Discard Changes
                        </Link>
                    </div>
                </div>
            </main>

            {/* ══════════════════════════════════════════════ */}
            {/* MODALS */}
            {/* ══════════════════════════════════════════════ */}

            {/* Payment required */}
            {modal === "payment" && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <CreditCard size={20} className="text-amber-600" />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#1d1d1d]">Additional Payment Required</h3>
                        </div>
                        <p className="text-[14px] text-[#555]">
                            Your updated dates cost more than your original booking. An additional payment of{" "}
                            <span className="font-bold text-[#1d1d1d]">{formatLKR(priceDiff)}</span> is required to confirm this change.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[13px] text-amber-800">
                            <strong>Note:</strong> In a live environment, this would redirect to a secure payment gateway. For now, clicking "Confirm & Pay" will simulate the payment.
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setModal(null)}
                                className="flex-1 py-2.5 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#555] font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => { setModal(null); commitChanges() }}
                                className="flex-1 py-2.5 bg-[#9a3300] hover:bg-[#852900] text-white font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Confirm & Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund available */}
            {modal === "refund" && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ArrowDownCircle size={20} className="text-emerald-600" />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#1d1d1d]">Refund Available</h3>
                        </div>
                        <p className="text-[14px] text-[#555]">
                            Your updated dates are shorter, so a refund of{" "}
                            <span className="font-bold text-emerald-700">{formatLKR(Math.abs(priceDiff))}</span> will be requested and processed within 5–7 business days.
                        </p>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setModal(null)}
                                className="flex-1 py-2.5 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#555] font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => { setModal(null); commitChanges() }}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Confirm & Request Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel confirm */}
            {modal === "cancel-confirm" && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-600" />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#1d1d1d]">Cancel Booking?</h3>
                        </div>
                        <p className="text-[14px] text-[#555]">
                            Are you sure you want to cancel your stay at{" "}
                            <strong>{storedBooking.property}</strong>? This action cannot be undone.
                        </p>
                        {(storedBooking.paidInFull || storedBooking.paymentMethod === "card") && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[13px] text-emerald-800">
                                You paid online — you will be eligible to request a refund of{" "}
                                <strong>{formatLKR(storedBooking.totalPrice)}</strong>.
                            </div>
                        )}
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setModal(null)}
                                className="flex-1 py-2.5 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#555] font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel refund */}
            {modal === "cancel-refund" && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <ArrowDownCircle size={20} className="text-emerald-600" />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#1d1d1d]">Refund Requested</h3>
                        </div>
                        <p className="text-[14px] text-[#555]">
                            Your booking has been cancelled. A refund of{" "}
                            <span className="font-bold text-emerald-700">{formatLKR(storedBooking.totalPrice)}</span>{" "}
                            has been requested and will be processed within 5–7 business days.
                        </p>
                        <button
                            onClick={closeAndRedirect}
                            className="w-full py-2.5 bg-[#9a3300] hover:bg-[#852900] text-white font-bold rounded-xl transition-colors cursor-pointer"
                        >
                            Back to My Bookings
                        </button>
                    </div>
                </div>
            )}

            {/* Generic success */}
            {modal === "success" && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check size={28} className="text-emerald-600" />
                        </div>
                        <h3 className="text-[20px] font-bold text-[#1d1d1d]">{modalMsg}</h3>
                        <button
                            onClick={closeAndRedirect}
                            className="px-8 py-2.5 bg-[#9a3300] hover:bg-[#852900] text-white font-bold rounded-xl transition-colors cursor-pointer"
                        >
                            Back to My Bookings
                        </button>
                    </div>
                </div>
            )}

            <GuestFooter variant="full" />
        </div>
    )
}
