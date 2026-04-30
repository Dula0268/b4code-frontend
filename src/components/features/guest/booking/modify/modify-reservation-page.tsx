"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import {
  CalendarDays, BedDouble, AlertTriangle, ChevronRight,
  Home, HelpCircle, CheckCircle2, ArrowRight, Settings2,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Configuration & Constants
// ─────────────────────────────────────────────────────────────────────────────
const APP_CONFIG = {
  pricePerNight: 5000,
  guestFee: 5000,
  executiveExtra: 20000,
  defaultCurrency: "LKR",
} as const

interface RoomOption {
  id: string
  name: string
  details: string
  imageSrc: string
  isBase: boolean
  extraPerNight?: number
}

const ROOM_OPTIONS: RoomOption[] = [
  {
    id: "deluxe",
    name: "Deluxe Suite",
    details: "King Bed · 45 sqm · City View",
    imageSrc: "/images/booking/room-deluxe.png",
    isBase: true,
  },
  {
    id: "executive",
    name: "Executive Suite",
    details: "King Bed · 55 sqm · Ocean View",
    imageSrc: "/images/booking/room-executive.png",
    isBase: false,
    extraPerNight: APP_CONFIG.executiveExtra,
  },
]

const ORIGINAL_DATA = {
  bookingId: "#RES-882910",
  checkIn: "2024-06-12",
  checkOut: "2024-06-15",
  nights: 3,
  total: 15000,
  guests: 2,
}

const MODIFICATION_POLICY = [
  "Changes subject to room availability.",
  "Price difference is calculated based on current rates.",
  "Cancellations within 48 h of arrival may incur a fee.",
]

function formatCurrency(amount: number) {
  return `${APP_CONFIG.defaultCurrency} ${amount.toLocaleString("en-US")}`
}

function fmtShort(iso: string) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

function fmtLong(iso: string) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function nightsBetween(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(0, Math.round(diff / 86_400_000))
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook for State & Business Logic 
// ─────────────────────────────────────────────────────────────────────────────

import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { useAuthStore } from "@/store/auth/auth.store"
import { useSearchParams } from "next/navigation"

function useModifyReservationLogic() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingIdParam = searchParams.get("bookingId")

  const bookings = useGuestBookingStore((s) => s.bookings)
  const storeBooking = useMemo(
    () => (bookingIdParam ? bookings.find((b) => b.id === bookingIdParam) : undefined),
    [bookings, bookingIdParam]
  )

  const originalData = storeBooking ? {
    bookingId: storeBooking.confirmationCode,
    checkIn: storeBooking.checkIn,
    checkOut: storeBooking.checkOut,
    nights: storeBooking.nights,
    total: storeBooking.totalPrice,
    guests: storeBooking.guests,
  } : ORIGINAL_DATA

  const [checkIn, setCheckIn] = useState(originalData.checkIn || "2024-06-14")
  const [checkOut, setCheckOut] = useState(originalData.checkOut || "2024-06-18")
  const [guests, setGuests] = useState(originalData.guests || 3)
  const [roomId, setRoomId] = useState("deluxe")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const newNights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const dateValid = checkOut > checkIn

  const roomUpgrade = roomId === "executive" ? APP_CONFIG.executiveExtra * newNights : 0
  const newTotal = APP_CONFIG.pricePerNight * newNights + roomUpgrade
  const guestFeeTotal = guests > originalData.guests ? APP_CONFIG.guestFee * (guests - originalData.guests) : 0
  const additionalDue = Math.max(0, newTotal - originalData.total + guestFeeTotal)

  const handleCheckIn = (val: string) => {
    setCheckIn(val)
    if (checkOut <= val) {
      const next = new Date(`${val}T00:00:00`)
      next.setDate(next.getDate() + 1)
      setCheckOut(next.toISOString().split("T")[0])
    }
  }

  const handleIncrementGuests = () => setGuests(g => Math.min(8, g + 1))
  const handleDecrementGuests = () => setGuests(g => Math.max(1, g - 1))

  const handleConfirmChanges = async () => {
    if (!dateValid || newNights === 0) return
    setErrorMsg(null)
    setSubmitting(true)
    
    try {
      if (storeBooking && !storeBooking.id.startsWith("bk-")) {
        const guestIdToUse = (useAuthStore.getState().user as any)?.id || 1;
        
        const payload = {
            propertyId: parseInt(storeBooking.propertyId) || 1,
            roomId: parseInt(roomId) || 1, // Fallback if roomId is string
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guests: guests,
            specialRequests: "Modified booking",
            paymentMethod: "CARD",
            totalPrice: newTotal
        };

        const res = await fetch(`http://localhost:8080/api/guest/bookings/${storeBooking.id}?guestId=${guestIdToUse}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            throw new Error("Failed to modify booking on server.");
        }
      }

      router.push("/guest/booking/confirmation")
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to modify the reservation. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelModifications = () => {
    router.back()
  }

  return {
    originalData,
    checkIn, handleCheckIn,
    checkOut, setCheckOut,
    guests, handleIncrementGuests, handleDecrementGuests,
    roomId, setRoomId,
    newNights, dateValid,
    submitting, errorMsg,
    additionalDue, newTotal, roomUpgrade, guestFeeTotal,
    handleConfirmChanges, handleCancelModifications
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Presentational Component
// ─────────────────────────────────────────────────────────────────────────────

function ModifyReservationUI() {
  const logic = useModifyReservationLogic()

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[1020px] mx-auto px-4 pt-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "var(--gray-3)" }}>
          <Link href="/" className="flex items-center gap-1 no-underline hover:text-[var(--brand-primary)] transition-colors">
            <Home size={13} /> Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/guest/booking/my-bookings" className="no-underline hover:text-[var(--brand-primary)] transition-colors">
            Reservations
          </Link>
          <ChevronRight size={12} />
          <span className="font-medium" style={{ color: "var(--fg)" }}>Modify Booking</span>
        </nav>

        {logic.errorMsg && (
          <div className="mb-5 p-4 rounded-xl flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle size={18} />
            <p className="text-sm font-semibold">{logic.errorMsg}</p>
          </div>
        )}

        {/* Title row */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-[1.75rem] font-black leading-tight" style={{ color: "var(--fg)" }}>
              Modify Your Reservation
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--gray-3)" }}>
              Booking {logic.originalData.bookingId} ·{" "}
              <span className="font-semibold" style={{ color: "var(--state-success)" }}>Confirmed</span>
            </p>
          </div>
          <button className="self-start inline-flex items-center gap-2 border rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer"
            style={{ borderColor: "var(--border)", background: "white", color: "var(--gray-2)" }}>
            <HelpCircle size={15} /> Need assistance?
          </button>
        </header>

        {/* Two-column layout — stacks on mobile */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Edit Sections ─────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Section 1 — Stay Details */}
            <div className="ps-card overflow-hidden">
              <header className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
                <CalendarDays size={18} style={{ color: "var(--brand-primary)" }} />
                <h2 className="text-[0.9375rem] font-bold" style={{ color: "var(--fg)" }}>1. Edit Stay Details</h2>
              </header>
              <div className="px-6 py-5 flex flex-col gap-5">

                {/* Date comparison row */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gray-3)" }}>Stay Dates</p>

                  <div className="grid grid-cols-2 gap-0 border rounded-xl overflow-hidden mb-3" style={{ borderColor: "var(--border)" }}>
                    <div className="px-4 py-3 border-r" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)", borderColor: "var(--border)" }}>
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gray-4)" }}>Original</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--gray-2)" }}>
                        {fmtShort(logic.originalData.checkIn)} – {fmtLong(logic.originalData.checkOut)}
                      </p>
                    </div>
                    <div className="px-4 py-3 bg-white">
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand-primary)" }}>New Selection</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                        {fmtShort(logic.checkIn)} – {fmtLong(logic.checkOut)}
                      </p>
                    </div>
                  </div>

                  {/* Date pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "modify-checkin",  label: "Check-in",  value: logic.checkIn,  min: logic.originalData.checkIn, onChange: logic.handleCheckIn },
                      { id: "modify-checkout", label: "Check-out", value: logic.checkOut, min: logic.checkIn,         onChange: logic.setCheckOut },
                    ].map(({ id, label, value, min, onChange }) => (
                      <div key={id}>
                        <label className="block text-[0.6875rem] font-semibold uppercase tracking-wide mb-1.5"
                          style={{ color: "var(--gray-3)" }}>
                          {label}
                        </label>
                        <div className="relative">
                          <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--brand-primary)" }} />
                          <input
                            id={id}
                            type="date"
                            value={value}
                            min={min}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border rounded-xl outline-none transition-colors cursor-pointer"
                            style={{ background: "white", borderColor: "var(--border)", color: "var(--fg)" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {logic.dateValid ? (
                    <p className="text-xs font-medium mt-2.5 flex items-center gap-1" style={{ color: "var(--state-success)" }}>
                      <CheckCircle2 size={13} />
                      {logic.newNights} night{logic.newNights !== 1 ? "s" : ""} selected — availability confirmed.
                    </p>
                  ) : (
                    <p className="text-xs font-medium mt-2.5 flex items-center gap-1" style={{ color: "var(--state-error)" }}>
                      <AlertTriangle size={13} /> Check-out must be after check-in.
                    </p>
                  )}
                </div>

                {/* Guest count */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gray-3)" }}>Guests</p>
                  <div className="grid grid-cols-2 gap-0 border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <div className="px-4 py-3 border-r" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)", borderColor: "var(--border)" }}>
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gray-4)" }}>Original</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--gray-2)" }}>{logic.originalData.guests} Adults</p>
                    </div>
                    <div className="px-4 py-3 bg-white flex items-center gap-3">
                      <div>
                        <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand-primary)" }}>New Selection</p>
                        <div className="flex items-center gap-3">
                          <button onClick={logic.handleDecrementGuests}
                            className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                            style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>−</button>
                          <span className="text-sm font-bold min-w-[64px] text-center" style={{ color: "var(--fg)" }}>
                            {logic.guests} Adults
                          </span>
                          <button onClick={logic.handleIncrementGuests}
                            className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                            style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 — Room category */}
            <div className="ps-card overflow-hidden">
              <header className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
                <BedDouble size={18} style={{ color: "var(--brand-primary)" }} />
                <h2 className="text-[0.9375rem] font-bold" style={{ color: "var(--fg)" }}>2. Room Category</h2>
              </header>
              <div className="px-6 py-5 flex flex-col gap-4">

                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">Limited Availability</p>
                    <p className="text-xs text-amber-600">Only 2 Executive Suites left on your selected dates.</p>
                  </div>
                </div>

                {ROOM_OPTIONS.map((room) => {
                  const selected = logic.roomId === room.id
                  return (
                    <div key={room.id} onClick={() => logic.setRoomId(room.id)}
                      className="flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: selected ? "var(--brand-primary)" : "var(--border)",
                        background:  selected ? "color-mix(in srgb, var(--brand-primary) 3%, white)" : "white",
                      }}>
                      <div className="relative w-[90px] h-[65px] rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "var(--gray-5)" }}>
                        <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="90px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>{room.name}</p>
                        <p className="text-xs" style={{ color: "var(--gray-3)" }}>{room.details}</p>
                      </div>
                      {selected && room.isBase ? (
                        <span className="flex-shrink-0 text-[0.6875rem] font-bold text-white px-3 py-1.5 rounded-full"
                          style={{ background: "var(--brand-primary)" }}>
                          CURRENT
                        </span>
                      ) : !room.isBase ? (
                        <span className="flex-shrink-0 text-sm font-bold"
                          style={{ color: selected ? "var(--brand-primary)" : "var(--gray-3)" }}>
                          +{formatCurrency(room.extraPerNight!)} / night
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Price Adjustment + Policy ─────────────────────── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-24 flex flex-col gap-5">

            <div className="ps-card p-5">
              <h3 className="text-[0.9375rem] font-bold mb-4" style={{ color: "var(--fg)" }}>Price Adjustment</h3>

              <div className="flex flex-col gap-2.5 mb-4">
                {[
                  { label: `Original (${logic.originalData.nights} nights)`, value: formatCurrency(logic.originalData.total),  muted: true  },
                  { label: `New (${logic.newNights} night${logic.newNights !== 1 ? "s" : ""})`, value: formatCurrency(logic.newTotal), muted: false },
                  ...(logic.roomUpgrade > 0   ? [{ label: "Room Upgrade",       value: formatCurrency(logic.roomUpgrade),   muted: false }] : []),
                  ...(logic.guestFeeTotal > 0 ? [{ label: "Guest Addition Fee", value: formatCurrency(logic.guestFeeTotal), muted: false }] : []),
                ].map(({ label, value, muted }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: muted ? "var(--gray-3)" : "var(--gray-2)" }}>{label}</span>
                    <span className="font-semibold" style={{ color: muted ? "var(--gray-3)" : "var(--fg)" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-5" style={{ borderColor: "var(--gray-5)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--gray-3)" }}>Additional Amount to Pay</p>
                <p className="text-[1.75rem] font-black leading-tight" style={{ color: "var(--brand-primary)" }}>
                  {formatCurrency(logic.additionalDue)}
                </p>
                <p className="text-[0.6875rem] mt-0.5" style={{ color: "var(--gray-4)" }}>Tax & fees included</p>
              </div>

              <button
                onClick={logic.handleConfirmChanges}
                disabled={!logic.dateValid || logic.newNights === 0 || logic.submitting}
                className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--brand-primary)" }}>
                {logic.submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>Confirm & Pay Changes <ArrowRight size={15} /></>
                )}
              </button>
              <button
                onClick={logic.handleCancelModifications}
                disabled={logic.submitting}
                className="w-full text-center text-sm transition-colors cursor-pointer"
                style={{ color: "var(--gray-3)" }}>
                Cancel Modifications
              </button>
              <p className="text-[0.6875rem] mt-3 text-center leading-relaxed" style={{ color: "var(--gray-4)" }}>
                By confirming, you agree to our 24-hour modification policy. Additional charges are non-refundable.
              </p>
            </div>

            {/* Policy card */}
            <div className="ps-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 size={15} style={{ color: "var(--brand-primary)" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--fg)" }}>Modification Policy</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {MODIFICATION_POLICY.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs" style={{ color: "var(--gray-2)" }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--brand-primary)" }}>•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

/**
 * Main wrapper with Suspense for router logic
 */
export default function ModifyReservationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
      </div>
    }>
      <ModifyReservationUI />
    </Suspense>
  )
}
