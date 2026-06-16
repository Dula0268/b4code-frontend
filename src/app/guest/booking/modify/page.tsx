"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Calendar as CalendarIcon, Users, XCircle,
    ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard, AlertTriangle, Check,
    Info, HelpCircle, Shield, Trash2, Home, MapPin, ChevronRight, AlertCircle, Clock
} from "lucide-react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import CalendarPicker from "@/components/shared/forms/calendar-picker"
import { useEffect, useState, useRef } from "react"

function formatLKR(n: number) {
    return `LKR ${Math.abs(n).toLocaleString("en-US")}`
}

type ModalType = "success-modify" | "success-cancel" | null

const CANCEL_REASONS = [
    { id: "plans", label: "Change of plans / trip cancelled" },
    { id: "schedule", label: "Scheduling conflict / dates changed" },
    { id: "alternative", label: "Found a better accommodation alternative" },
    { id: "personal", label: "Personal or family emergency" },
    { id: "other", label: "Other reason" },
]

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

    // Editor & Cancellation States
    const [checkIn, setCheckIn] = useState<Date | null>(null)
    const [checkOut, setCheckOut] = useState<Date | null>(null)
    const [guests, setGuests] = useState(2)
    const [specialRequests, setSpecialRequests] = useState("")
    const [calOpen, setCalOpen] = useState(false)
    
    // Cancellation toggle state
    const [isCancelMode, setIsCancelMode] = useState(false)
    const [cancelReasonId, setCancelReasonId] = useState("")
    const [cancelReasonText, setCancelReasonText] = useState("")

    const calRef = useRef<HTMLDivElement>(null)

    // Derived values for modification
    const newNights = checkIn && checkOut && checkOut > checkIn
        ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
        : 0
    const baseRate = storedBooking?.basePrice || 0
    const newSubtotal = baseRate * newNights
    const newTax = newSubtotal * 0.1
    const newTotal = newSubtotal + newTax
    const priceDiff = storedBooking ? newTotal - storedBooking.totalPrice : 0

    // Load initial values
    useEffect(() => {
        setMounted(true)
        if (storedBooking) {
            setCheckIn(new Date(storedBooking.checkIn + "T00:00:00"))
            setCheckOut(new Date(storedBooking.checkOut + "T00:00:00"))
            setGuests(storedBooking.guests)
            setSpecialRequests(storedBooking.nationalId || "") // reusing field if needed
        }
    }, [storedBooking])

    // Click outside handler for CalendarPicker
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
            <div className="min-h-screen flex flex-col bg-[#f8fafc]">
                <GuestTopbar />
                <main className="flex-1 w-full px-6 xl:px-12 py-10 mt-16 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#9a3300] border-t-transparent rounded-full animate-spin" />
                </main>
            </div>
        )
    }

    if (!storedBooking) {
        return (
            <div className="min-h-screen flex flex-col bg-[#f8fafc]">
                <GuestTopbar />
                <main className="flex-1 w-full px-6 xl:px-12 py-16 mt-16 text-center">
                    <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-[#0f172a] mb-4">Booking Not Found</h1>
                        <p className="text-gray-500 mb-6">We couldn&apos;t retrieve details for this booking code. It may have expired or been removed.</p>
                        <Link href="/guest/booking/my-bookings" className="inline-block px-6 py-2.5 bg-[#9a3300] hover:bg-[#852900] text-white font-bold rounded-xl transition-all">
                            Return to My Bookings
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const handleDateChange = (ci: Date | null, co: Date | null) => {
        setCheckIn(ci)
        setCheckOut(co)
        if (ci && co && ci < co) setCalOpen(false)
    }

    // Submit Changes
    const handleSaveChanges = () => {
        if (!checkIn || !checkOut || checkIn >= checkOut) {
            alert("Please select valid stay dates.")
            return
        }

        setIsSaving(true)
        setTimeout(() => {
            updateBookingStatus(bookingRef, {
                checkIn: checkIn.toISOString().split("T")[0],
                checkOut: checkOut.toISOString().split("T")[0],
                checkInFormatted: checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                checkOutFormatted: checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                nights: newNights,
                nightsLabel: `${newNights} night${newNights !== 1 ? "s" : ""}`,
                guests,
                guestsLabel: `${guests} Adults`,
                totalPrice: newTotal,
                taxes: newTax,
                status: "UPCOMING",
            })
            setIsSaving(false)
            setModal("success-modify")
            setModalMsg(priceDiff > 0 
                ? `Booking modified successfully! Extra charge of ${formatLKR(priceDiff)} has been processed.`
                : priceDiff < 0 
                ? `Booking modified successfully! Refund of ${formatLKR(Math.abs(priceDiff))} is being processed.`
                : "Booking modified successfully!"
            )
        }, 1200)
    }

    // Request Refund / Cancel Submit
    const handleConfirmCancel = () => {
        if (!cancelReasonId) return

        setIsSaving(true)
        setTimeout(() => {
            cancelBooking(storedBooking.id)
            setIsSaving(false)
            setModal("success-cancel")
            const isRefundable = storedBooking.paidInFull || storedBooking.paymentMethod === "online"
            setModalMsg(isRefundable
                ? `Your booking has been cancelled. A full refund of ${formatLKR(storedBooking.totalPrice)} is on its way to your card.`
                : "Your booking has been cancelled. No payments were processed."
            )
        }, 1200)
    }

    const isRefundable = storedBooking.paidInFull || storedBooking.paymentMethod === "online"

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a]">
            <GuestTopbar />
            
            <main className="flex-1 w-full px-6 xl:px-12 py-8 mt-16 max-w-[1700px] mx-auto flex flex-col gap-6">
                
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
                    <div>
                        <div className="mb-2">
                            <Link href="/guest/booking/my-bookings"
                                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#9a3300] font-semibold transition-colors">
                                <ArrowLeft size={14} /> Back to My Bookings
                            </Link>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0f172a]">
                            Manage Reservation
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review stay details, adjust travel dates, or cancel this booking in one place.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-[#e2e8f0]/40 border border-[#e2e8f0] rounded-2xl px-5 py-3 self-start md:self-auto shadow-sm">
                        <Clock size={16} className="text-[#9a3300]" />
                        <div className="text-xs">
                            <p className="text-gray-400 font-semibold uppercase tracking-wider">Booked On</p>
                            <p className="font-bold text-[#0f172a]">
                                {storedBooking.bookedAt ? new Date(storedBooking.bookedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* REDESIGNED 3-COLUMN FULL SCREEN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* COLUMN 1: DETAILS SECTION (lg:col-span-3)                      */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="lg:col-span-3 flex flex-col gap-6 w-full">
                        <div className="bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                            <div className="p-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
                                <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-gray-400">
                                    1. Reservation Details
                                </h3>
                            </div>

                            {storedBooking.imageSrc ? (
                                <div className="w-full aspect-video relative flex-shrink-0">
                                    <img 
                                        src={storedBooking.imageSrc} 
                                        alt={storedBooking.property} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-video bg-gray-50 flex items-center justify-center flex-shrink-0 relative">
                                    <Home className="text-gray-300" size={32} />
                                </div>
                            )}

                            <div className="p-5 flex flex-col gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-[#0f172a] mb-1 line-clamp-1">{storedBooking.property}</h2>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} className="text-gray-400" /> {storedBooking.location}
                                    </p>
                                </div>

                                <div className="bg-dashed-border p-3 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200 text-center font-mono">
                                    <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Voucher Code</span>
                                    <span className="text-sm font-bold text-[#9a3300]">#{storedBooking.confirmationCode}</span>
                                </div>

                                <div className="flex flex-col gap-2.5 pt-3 border-t border-[#f1f5f9] text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Room Type</span>
                                        <span className="font-bold text-gray-700 text-right max-w-[150px] truncate">{storedBooking.roomName || "Standard Room"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Current Check-In</span>
                                        <span className="font-bold text-gray-700">{storedBooking.checkInFormatted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Current Check-Out</span>
                                        <span className="font-bold text-gray-700">{storedBooking.checkOutFormatted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Nights</span>
                                        <span className="font-bold text-gray-700">{storedBooking.nights} nights</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Guests Registered</span>
                                        <span className="font-bold text-gray-700">{storedBooking.guests} Adults</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Payment Method</span>
                                        <span className="font-bold text-[#9a3300] uppercase tracking-wide">
                                            {storedBooking.paymentMethod === "online" ? "Pay Online" : "Pay at Property"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* COLUMN 2: WORKSPACE (lg:col-span-5)                           */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                        
                        {/* Tab Switcher */}
                        <div className="bg-white border border-[#e2e8f0] p-1.5 rounded-2xl shadow-sm flex gap-1">
                            <button
                                onClick={() => setIsCancelMode(false)}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    !isCancelMode 
                                        ? "bg-[#9a3300]/10 text-[#9a3300]" 
                                        : "text-gray-500 hover:text-[#0f172a] hover:bg-gray-50"
                                }`}
                            >
                                <RefreshCw size={14} className={!isCancelMode ? "animate-spin-once" : ""} />
                                Modify Booking Details
                            </button>
                            <button
                                onClick={() => {
                                    setIsCancelMode(true)
                                    setCalOpen(false)
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    isCancelMode 
                                        ? "bg-red-50 text-red-600" 
                                        : "text-gray-500 hover:text-red-600 hover:bg-red-50/20"
                                }`}
                            >
                                <Trash2 size={14} />
                                Cancel Booking
                            </button>
                        </div>

                        {/* WORKSPACE SECTIONS STACKED */}
                        <div className="flex flex-col gap-6">
                            
                            {/* MODIFY SECTION */}
                            <div className={`bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm transition-all duration-300 relative ${
                                isCancelMode ? "opacity-45 pointer-events-none filter blur-[0.5px]" : ""
                            }`}>
                                {/* Overlay Prompt if Inactive */}
                                {isCancelMode && (
                                    <div 
                                        onClick={() => setIsCancelMode(false)}
                                        className="absolute inset-0 z-30 flex items-center justify-center bg-white/30 cursor-pointer rounded-3xl"
                                        title="Click to switch to Modify mode"
                                    >
                                        <div className="bg-white/95 border border-[#e2e8f0] px-4 py-2 rounded-xl text-xs font-bold text-[#9a3300] shadow-sm flex items-center gap-2">
                                            <RefreshCw size={12} /> Switch to Modify Details
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-[#f1f5f9]">
                                    <CalendarIcon className="text-[#9a3300]" size={18} />
                                    <h3 className="text-base font-bold text-[#0f172a]">2. Modify Stay Details</h3>
                                </div>

                                <div className="flex flex-col gap-5">
                                    {/* Calendar Picker Trigger */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Select Dates
                                        </label>
                                        <div className="border border-[#e2e8f0] rounded-2xl overflow-visible relative" ref={calRef}>
                                            <div
                                                onClick={() => {
                                                    if (!isCancelMode) setCalOpen(!calOpen)
                                                }}
                                                className="flex cursor-pointer hover:bg-gray-50/80 transition-colors"
                                            >
                                                <div className="flex-1 p-4 border-r border-[#e2e8f0]">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
                                                    <p className="text-sm font-bold text-[#0f172a]">
                                                        {checkIn ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                                                    </p>
                                                </div>
                                                <div className="flex-1 p-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
                                                    <p className="text-sm font-bold text-[#0f172a]">
                                                        {checkOut ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                                                    </p>
                                                </div>
                                            </div>
                                            {calOpen && !isCancelMode && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl z-50 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#e2e8f0] p-4 flex justify-center">
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

                                    {/* Guests Stepper */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Guests Staying
                                        </label>
                                        <div className="flex items-center justify-between bg-gray-50/40 border border-[#e2e8f0] rounded-2xl px-4 py-3">
                                            <span className="text-xs text-gray-500 font-semibold">Adult Guests</span>
                                            <div className="flex items-center bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                                                    className="px-3.5 py-1.5 hover:bg-gray-50 text-[#0f172a] font-bold border-r border-[#e2e8f0] transition-colors"
                                                >−</button>
                                                <span className="px-4 py-1.5 font-bold text-sm min-w-[40px] text-center text-[#0f172a]">{guests}</span>
                                                <button
                                                    onClick={() => setGuests(g => Math.min(10, g + 1))}
                                                    className="px-3.5 py-1.5 hover:bg-gray-50 text-[#0f172a] font-bold border-l border-[#e2e8f0] transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Requests */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Special Requests (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={specialRequests}
                                            onChange={e => setSpecialRequests(e.target.value)}
                                            placeholder="E.g., quiet room, late check-in request"
                                            className="w-full border border-[#e2e8f0] rounded-2xl px-4 py-3.5 text-sm text-[#0f172a] focus:outline-none focus:border-[#9a3300] transition-colors bg-[#fdfdfd]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CANCEL SECTION */}
                            <div className={`bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm transition-all duration-300 relative ${
                                !isCancelMode ? "opacity-45 pointer-events-none filter blur-[0.5px]" : ""
                            }`}>
                                {/* Overlay Prompt if Inactive */}
                                {!isCancelMode && (
                                    <div 
                                        onClick={() => setIsCancelMode(true)}
                                        className="absolute inset-0 z-30 flex items-center justify-center bg-white/30 cursor-pointer rounded-3xl"
                                        title="Click to switch to Cancellation mode"
                                    >
                                        <div className="bg-white/95 border border-[#e2e8f0] px-4 py-2 rounded-xl text-xs font-bold text-red-600 shadow-sm flex items-center gap-2">
                                            <Trash2 size={12} /> Switch to Cancel Booking
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-[#f1f5f9]">
                                    <AlertTriangle className="text-red-500" size={18} />
                                    <h3 className="text-base font-bold text-[#0f172a]">3. Cancel Booking</h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Please provide the reason why you are cancelling this booking. Your refund status will calculate automatically on the right.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {CANCEL_REASONS.map((reason) => (
                                            <label
                                                key={reason.id}
                                                className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all hover:bg-gray-50 ${
                                                    cancelReasonId === reason.id
                                                        ? "border-red-500 bg-red-50/10"
                                                        : "border-[#e2e8f0]"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="dashboardCancelReason"
                                                    checked={cancelReasonId === reason.id}
                                                    onChange={() => setCancelReasonId(reason.id)}
                                                    className="mt-1 accent-red-600"
                                                />
                                                <span className="text-xs font-bold text-gray-600">{reason.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                            Explanation (Optional)
                                        </label>
                                        <textarea
                                            value={cancelReasonText}
                                            onChange={e => setCancelReasonText(e.target.value)}
                                            placeholder="Please share any additional details about your cancellation request..."
                                            rows={2}
                                            className="w-full border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-xs text-[#0f172a] resize-none focus:outline-none focus:border-red-500 bg-gray-50/40"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* COLUMN 3: PRICE DETAILS & ACTIONS (lg:col-span-4)              */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    <div className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-24">
                        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                            
                            <div className="border-b border-[#f1f5f9] pb-3.5">
                                <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-gray-400">
                                    4. Price Details & Confirmation
                                </h3>
                            </div>

                            {!isCancelMode ? (
                                /* MODIFY BILL VIEW */
                                <div className="flex flex-col gap-4">
                                    
                                    {/* Stay Estimate visual */}
                                    <div className="bg-gray-50 border border-[#e2e8f0] rounded-2xl p-4 flex flex-col gap-2.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Stay Breakdown</span>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Original Total</span>
                                            <span className="font-bold text-gray-700">{formatLKR(storedBooking.totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">New Subtotal ({newNights} nights)</span>
                                            <span className="font-bold text-gray-700">{formatLKR(newSubtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs pb-2 border-b border-gray-200/60">
                                            <span className="text-gray-500">Estimated Taxes (10%)</span>
                                            <span className="font-bold text-gray-700">{formatLKR(newTax)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-[#0f172a] pt-1">
                                            <span>New Total</span>
                                            <span className="text-[#9a3300]">{formatLKR(newTotal)}</span>
                                        </div>
                                    </div>

                                    {/* Delta pricing alert */}
                                    {newNights > 0 && priceDiff !== 0 && (
                                        <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed ${
                                            priceDiff > 0
                                                ? "bg-amber-50 border-amber-200/70 text-amber-800"
                                                : "bg-emerald-50 border-emerald-200/70 text-emerald-800"
                                        }`}>
                                            {priceDiff > 0 ? (
                                                <ArrowUpRight size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <ArrowDownRight size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                {priceDiff > 0 ? (
                                                    <>
                                                        <p className="font-extrabold text-amber-900 mb-0.5">Payment Required</p>
                                                        <p>The updated reservation exceeds the original amount. You need to pay <strong className="font-extrabold">{formatLKR(priceDiff)}</strong> to confirm.</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-extrabold text-emerald-900 mb-0.5">Refund Balance</p>
                                                        <p>The updated stay is shorter than the original booking. A refund of <strong className="font-extrabold">{formatLKR(Math.abs(priceDiff))}</strong> will be issued.</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <button
                                        onClick={handleSaveChanges}
                                        disabled={isSaving || newNights < 1}
                                        className="w-full py-3.5 bg-[#9a3300] hover:bg-[#852900] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#9a3300]/10"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <RefreshCw size={15} />
                                                {priceDiff > 0 
                                                    ? `Pay Balance & Confirm` 
                                                    : priceDiff < 0 
                                                    ? `Refund Balance & Confirm` 
                                                    : `Confirm Modifications`
                                                }
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* CANCELLATION BILL VIEW */
                                <div className="flex flex-col gap-4">
                                    
                                    <div className="bg-red-50/50 border border-red-200/50 rounded-2xl p-4 flex flex-col gap-2.5">
                                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Refund Calculations</span>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Original Total Paid</span>
                                            <span className="font-bold text-gray-700">{formatLKR(storedBooking.totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 pb-2 border-b border-red-200/30">
                                            <span>Cancellation Penalty</span>
                                            <span className="font-bold text-emerald-600">LKR 0 (Free Cancel)</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-[#0f172a] pt-1 items-baseline">
                                            <span>Total Refund Amount</span>
                                            <span className="text-lg text-emerald-600 font-black">
                                                {isRefundable ? formatLKR(storedBooking.totalPrice) : "LKR 0"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Security badge info */}
                                    <div className="flex gap-2.5 items-start bg-gray-50 border border-[#e2e8f0] rounded-2xl p-3.5 text-[11px] text-gray-500 leading-relaxed">
                                        <Shield size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-gray-700 mb-0.5">Refund Protected</p>
                                            {isRefundable ? (
                                                <p>Funds will return to the payment card used within 5-7 business days.</p>
                                            ) : (
                                                <p>No deposit collected online. You will not be charged any cancellation fees.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {cancelReasonId ? (
                                        <button
                                            onClick={handleConfirmCancel}
                                            disabled={isSaving}
                                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/10"
                                        >
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Check size={16} />
                                                    Request Refund & Cancel
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-400 text-center border border-dashed border-gray-200">
                                            Select a cancellation reason in Section 3 to enable refund request button.
                                        </div>
                                    )}
                                </div>
                            )}

                            <Link
                                href="/guest/booking/my-bookings"
                                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold rounded-2xl transition-colors text-center text-xs"
                            >
                                Discard & Exit
                            </Link>

                        </div>
                    </div>

                </div>
            </main>

            {/* ══════════════════════════════════════════════ */}
            {/* SUCCESS MODALS */}
            {/* ══════════════════════════════════════════════ */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-5 text-center animate-in scale-in duration-200">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                            modal === "success-modify" 
                                ? "bg-emerald-100 text-emerald-600 shadow-emerald-100/30" 
                                : "bg-red-100 text-red-600 shadow-red-100/30"
                        }`}>
                            <Check size={32} />
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-bold text-[#1d1d1d] mb-2">Request Processed!</h3>
                            <p className="text-sm text-gray-500 leading-relaxed px-2">{modalMsg}</p>
                        </div>

                        <button
                            onClick={() => {
                                setModal(null)
                                router.push("/guest/booking/my-bookings")
                            }}
                            className={`w-full py-3 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md ${
                                modal === "success-modify" 
                                    ? "bg-[#9a3300] hover:bg-[#852900] shadow-[#9a3300]/10" 
                                    : "bg-red-600 hover:bg-red-700 shadow-red-600/10"
                            }`}
                        >
                            Go to My Bookings
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}


