"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    CalendarDays, BedDouble, AlertTriangle, ChevronRight,
    Home, HelpCircle, CheckCircle2, ArrowRight, Settings2,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const BOOKING_ID = "#RES-882910"
const ORIGINAL_CHECK_IN = "2024-06-12"
const ORIGINAL_CHECK_OUT = "2024-06-15"
const ORIGINAL_NIGHTS = 3
const ORIGINAL_TOTAL = 15_000
const PRICE_PER_NIGHT = 5_000   // base rate per night
const GUEST_FEE = 5_000   // extra fee per additional guest
const ORIGINAL_GUESTS = 2

// Room upgrade extra per-night cost in LKR
const EXECUTIVE_EXTRA_PER_NIGHT = 20_000

interface RoomOption {
    id: string
    name: string
    details: string
    imageSrc: string
    isBase: boolean            // true = base (Deluxe) room, no surcharge
    extraPerNight?: number     // LKR extra per night if upgraded
}

const ROOM_OPTIONS: RoomOption[] = [
    {
        id: "deluxe",
        name: "Deluxe Suite",
        details: "King Bed • 45sqm • City View",
        imageSrc: "/images/booking/room-deluxe.png",
        isBase: true,
    },
    {
        id: "executive",
        name: "Executive Suite",
        details: "King Bed • 55sqm • Ocean View",
        imageSrc: "/images/booking/room-executive.png",
        isBase: false,
        extraPerNight: EXECUTIVE_EXTRA_PER_NIGHT,
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

/** ISO date string → "June 14" */
function fmtDate(iso: string) {
    if (!iso) return ""
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

/** ISO date string → "June 14, 2024" */
function fmtDateFull(iso: string) {
    if (!iso) return ""
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

/** Count nights between two ISO date strings */
function nightsBetween(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ModifyReservationPage() {
    const router = useRouter()

    // Editable dates (ISO strings for <input type="date">)
    const [checkIn, setCheckIn] = useState("2024-06-14")
    const [checkOut, setCheckOut] = useState("2024-06-18")

    // Guests
    const [newGuests, setNewGuests] = useState(3)

    // Room selection
    const [selectedRoom, setSelectedRoom] = useState("deluxe")

    // --- Derived price calculations ---
    const newNights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])

    const baseNewTotal = PRICE_PER_NIGHT * newNights
    const roomUpgrade = selectedRoom === "executive" ? EXECUTIVE_EXTRA_PER_NIGHT * newNights : 0
    const newTotal = baseNewTotal + roomUpgrade
    const guestFeeTotal = newGuests > ORIGINAL_GUESTS ? GUEST_FEE * (newGuests - ORIGINAL_GUESTS) : 0
    const additionalDue = Math.max(0, newTotal - ORIGINAL_TOTAL + guestFeeTotal)

    // Validation: checkout must be after checkin
    const dateValid = checkOut > checkIn

    // Handle check-in change: if checkout becomes invalid, push checkout forward
    const handleCheckIn = (val: string) => {
        setCheckIn(val)
        if (checkOut <= val) {
            // Set checkout to at least 1 day after
            const next = new Date(val + "T00:00:00")
            next.setDate(next.getDate() + 1)
            setCheckOut(next.toISOString().split("T")[0])
        }
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-12">
            <div className="max-w-[1020px] mx-auto px-4 pt-6">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[12px] text-[#828282] mb-5">
                    <Link href="/" className="flex items-center gap-1 hover:text-[#953002] transition-colors no-underline">
                        <Home size={13} /> Home
                    </Link>
                    <ChevronRight size={12} />
                    <Link href="/guest/booking/my-bookings" className="hover:text-[#953002] transition-colors no-underline">
                        Reservations
                    </Link>
                    <ChevronRight size={12} />
                    <span className="text-[#1d1d1d] font-medium">Modify Booking</span>
                </nav>

                {/* Title row */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-[#1d1d1d] leading-tight">Modify Your Reservation</h1>
                        <p className="text-[13px] text-[#828282] mt-1">
                            Booking ID: <span className="font-semibold text-[#1d1d1d]">{BOOKING_ID}</span>
                            {" "}|{" "}
                            <span className="text-[#27AE60] font-semibold">Confirmed</span>
                        </p>
                    </div>
                    <button className="inline-flex items-center gap-2 border border-[#e0e0e0] rounded-xl px-4 py-2 text-[13px] text-[#555] hover:border-[#953002] hover:text-[#953002] transition-colors bg-white shadow-sm cursor-pointer">
                        <HelpCircle size={15} /> Need assistance?
                    </button>
                </div>

                <div className="flex gap-6 items-start">

                    {/* ── LEFT: Edit sections ──────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5">

                        {/* Section 1: Edit Stay Details */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#f5f5f5]">
                                <CalendarDays size={18} className="text-[#953002]" />
                                <h2 className="text-[15px] font-bold text-[#1d1d1d]">1. Edit Stay Details</h2>
                            </div>
                            <div className="px-6 py-5 flex flex-col gap-5">

                                {/* Stay Dates */}
                                <div>
                                    <p className="text-[12px] font-semibold text-[#828282] uppercase tracking-wide mb-3">Stay Dates</p>

                                    {/* Original row */}
                                    <div className="grid grid-cols-2 gap-0 border border-[#e8e8e8] rounded-xl overflow-hidden mb-3">
                                        <div className="px-4 py-3 bg-[#fafafa] border-r border-[#e8e8e8]">
                                            <p className="text-[10px] font-bold text-[#828282] uppercase tracking-widest mb-1">Original</p>
                                            <p className="text-[13px] font-semibold text-[#555]">
                                                {fmtDate(ORIGINAL_CHECK_IN)} – {fmtDateFull(ORIGINAL_CHECK_OUT)}
                                            </p>
                                        </div>
                                        <div className="px-4 py-3 bg-white">
                                            <p className="text-[10px] font-bold text-[#953002] uppercase tracking-widest mb-1">New Selection</p>
                                            <p className="text-[13px] font-semibold text-[#1d1d1d]">
                                                {fmtDate(checkIn)} – {fmtDateFull(checkOut)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Editable date pickers */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Check-in */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#828282] uppercase tracking-wide mb-1.5">
                                                Check-in
                                            </label>
                                            <div className="relative">
                                                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#953002] pointer-events-none" />
                                                <input
                                                    id="modify-checkin"
                                                    type="date"
                                                    value={checkIn}
                                                    min={ORIGINAL_CHECK_IN}
                                                    onChange={(e) => handleCheckIn(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold text-[#1d1d1d] border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#953002] focus:ring-1 focus:ring-[#953002]/30 bg-white cursor-pointer transition-colors"
                                                />
                                            </div>
                                        </div>
                                        {/* Check-out */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#828282] uppercase tracking-wide mb-1.5">
                                                Check-out
                                            </label>
                                            <div className="relative">
                                                <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#953002] pointer-events-none" />
                                                <input
                                                    id="modify-checkout"
                                                    type="date"
                                                    value={checkOut}
                                                    min={checkIn}
                                                    onChange={(e) => setCheckOut(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold text-[#1d1d1d] border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#953002] focus:ring-1 focus:ring-[#953002]/30 bg-white cursor-pointer transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Validation feedback */}
                                    {dateValid ? (
                                        <p className="text-[12px] text-[#27AE60] font-medium mt-2.5 flex items-center gap-1">
                                            <CheckCircle2 size={13} />
                                            {newNights} night{newNights !== 1 ? "s" : ""} selected — Availability confirmed for those dates.
                                        </p>
                                    ) : (
                                        <p className="text-[12px] text-red-500 font-medium mt-2.5 flex items-center gap-1">
                                            <AlertTriangle size={13} /> Check-out must be after check-in.
                                        </p>
                                    )}
                                </div>

                                {/* Guests */}
                                <div>
                                    <p className="text-[12px] font-semibold text-[#828282] uppercase tracking-wide mb-3">Guests</p>
                                    <div className="grid grid-cols-2 gap-0 border border-[#e8e8e8] rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 bg-[#fafafa] border-r border-[#e8e8e8]">
                                            <p className="text-[10px] font-bold text-[#828282] uppercase tracking-widest mb-1">Original</p>
                                            <p className="text-[13px] font-semibold text-[#555]">{ORIGINAL_GUESTS} Adults</p>
                                        </div>
                                        <div className="px-4 py-3 bg-white">
                                            <p className="text-[10px] font-bold text-[#953002] uppercase tracking-widest mb-1">New Selection</p>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setNewGuests(g => Math.max(1, g - 1))}
                                                    className="w-7 h-7 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#555] text-[14px] hover:border-[#953002] hover:text-[#953002] transition-colors cursor-pointer font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-[13px] font-bold text-[#1d1d1d] min-w-[60px] text-center">{newGuests} Adults</span>
                                                <button
                                                    onClick={() => setNewGuests(g => Math.min(8, g + 1))}
                                                    className="w-7 h-7 rounded-full border border-[#e0e0e0] flex items-center justify-center text-[#555] text-[14px] hover:border-[#953002] hover:text-[#953002] transition-colors cursor-pointer font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Room Category */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#f5f5f5]">
                                <BedDouble size={18} className="text-[#953002]" />
                                <h2 className="text-[15px] font-bold text-[#1d1d1d]">2. Room Category</h2>
                            </div>
                            <div className="px-6 py-5 flex flex-col gap-4">

                                {/* Limited availability */}
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[13px] font-bold text-amber-700">Limited Availability</p>
                                        <p className="text-[12px] text-amber-600">Only 2 rooms left for the Executive Suite on your selected dates.</p>
                                    </div>
                                </div>

                                {/* Room cards */}
                                {ROOM_OPTIONS.map(room => {
                                    const isSelected = selectedRoom === room.id
                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => setSelectedRoom(room.id)}
                                            className={[
                                                "flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                isSelected
                                                    ? "border-[#953002] bg-[rgba(149,48,2,0.02)]"
                                                    : "border-[#e8e8e8] hover:border-[#953002]/40 bg-white",
                                            ].join(" ")}
                                        >
                                            <div className="relative w-[90px] h-[65px] rounded-lg overflow-hidden flex-shrink-0 bg-[#f3ede8]">
                                                <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="90px" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-bold text-[#1d1d1d]">{room.name}</p>
                                                <p className="text-[12px] text-[#828282]">{room.details}</p>
                                            </div>
                                            {/* Badge or price tag */}
                                            {isSelected && room.isBase ? (
                                                <span className="flex-shrink-0 text-[11px] font-bold text-white bg-[#953002] px-3 py-1.5 rounded-full">
                                                    CURRENT CHOICE
                                                </span>
                                            ) : !room.isBase ? (
                                                <span className={`flex-shrink-0 text-[13px] font-bold ${isSelected ? "text-[#953002]" : "text-[#828282]"}`}>
                                                    +{formatLKR(room.extraPerNight!)} / night
                                                </span>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Price Adjustment + Policy ─────────────────────────── */}
                    <div className="w-[280px] flex-shrink-0 sticky top-24 flex flex-col gap-5">

                        {/* Price Adjustment */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5">
                            <h3 className="text-[15px] font-bold text-[#1d1d1d] mb-4">Price Adjustment</h3>

                            <div className="flex flex-col gap-2.5 mb-4">
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-[#828282]">Original Total ({ORIGINAL_NIGHTS} nights)</span>
                                    <span className="text-[#828282]">{formatLKR(ORIGINAL_TOTAL)}</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-[#555]">New Total ({newNights} night{newNights !== 1 ? "s" : ""})</span>
                                    <span className="font-semibold text-[#1d1d1d]">{formatLKR(newTotal)}</span>
                                </div>
                                {roomUpgrade > 0 && (
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#555]">Room Upgrade</span>
                                        <span className="font-semibold text-[#1d1d1d]">{formatLKR(roomUpgrade)}</span>
                                    </div>
                                )}
                                {guestFeeTotal > 0 && (
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#555]">Guest Addition Fee</span>
                                        <span className="font-semibold text-[#1d1d1d]">{formatLKR(guestFeeTotal)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[#f0f0f0] pt-4 mb-5">
                                <p className="text-[12px] text-[#828282] mb-1">Additional Amount to Pay</p>
                                <p className="text-[28px] font-black text-[#953002] leading-tight">{formatLKR(additionalDue)}</p>
                                <p className="text-[11px] text-[#828282] mt-0.5">Tax & fees included</p>
                            </div>

                            <button
                                onClick={() => router.push("/guest/booking/confirmation")}
                                disabled={!dateValid || newNights === 0}
                                className="w-full flex items-center justify-center gap-2 bg-[#953002] hover:bg-[#6d2200] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] py-3.5 rounded-xl transition-colors cursor-pointer mb-3"
                            >
                                Confirm & Pay Changes <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="w-full text-center text-[13px] text-[#828282] hover:text-[#953002] transition-colors cursor-pointer"
                            >
                                Cancel Modifications
                            </button>
                            <p className="text-[11px] text-[#bbb] mt-3 text-center leading-relaxed">
                                By confirming, you agree to our 24-hour modification policy. Additional charges are non-refundable.
                            </p>
                        </div>

                        {/* Modification Policy */}
                        <div className="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings2 size={15} className="text-[#953002]" />
                                <h3 className="text-[13px] font-bold text-[#1d1d1d]">Modification Policy</h3>
                            </div>
                            <ul className="flex flex-col gap-2">
                                {[
                                    "Changes subject to room availability.",
                                    "Price difference is calculated based on current rates.",
                                    "Cancellations within 48h of arrival may incur fees.",
                                ].map(point => (
                                    <li key={point} className="flex items-start gap-2 text-[12px] text-[#555]">
                                        <span className="text-[#953002] mt-0.5 flex-shrink-0">•</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
