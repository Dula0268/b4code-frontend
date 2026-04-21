"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays, BedDouble, AlertTriangle, ChevronRight,
  Home, HelpCircle, CheckCircle2, ArrowRight, Settings2,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Booking constants — replace with router params + API call in production
// ─────────────────────────────────────────────────────────────────────────────
const ORIGINAL = {
  bookingId:  "#RES-882910",
  checkIn:    "2024-06-12",
  checkOut:   "2024-06-15",
  nights:     3,
  total:      15_000,
  guests:     2,
}

const PRICE_PER_NIGHT   = 5_000   // base nightly rate
const GUEST_FEE         = 5_000   // surcharge per extra guest beyond original count
const EXECUTIVE_EXTRA   = 20_000  // extra per-night cost for the executive upgrade

interface RoomOption {
  id:             string
  name:           string
  details:        string
  imageSrc:       string
  isBase:         boolean         // when true = current selection, no surcharge
  extraPerNight?: number
}

const ROOM_OPTIONS: RoomOption[] = [
  {
    id:       "deluxe",
    name:     "Deluxe Suite",
    details:  "King Bed · 45 sqm · City View",
    imageSrc: "/images/booking/room-deluxe.png",
    isBase:   true,
  },
  {
    id:           "executive",
    name:         "Executive Suite",
    details:      "King Bed · 55 sqm · Ocean View",
    imageSrc:     "/images/booking/room-executive.png",
    isBase:       false,
    extraPerNight: EXECUTIVE_EXTRA,
  },
]

const MODIFICATION_POLICY = [
  "Changes subject to room availability.",
  "Price difference is calculated based on current rates.",
  "Cancellations within 48 h of arrival may incur a fee.",
]

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

/** ISO date string → "June 14" */
function fmtShort(iso: string) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

/** ISO date string → "June 14, 2024" */
function fmtLong(iso: string) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function nightsBetween(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(0, Math.round(diff / 86_400_000))
}

export default function ModifyReservationPage() {
  const router = useRouter()

  const [checkIn,  setCheckIn]  = useState("2024-06-14")
  const [checkOut, setCheckOut] = useState("2024-06-18")
  const [guests,   setGuests]   = useState(3)
  const [roomId,   setRoomId]   = useState("deluxe")

  const newNights  = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const dateValid  = checkOut > checkIn

  const roomUpgrade   = roomId === "executive" ? EXECUTIVE_EXTRA * newNights : 0
  const newTotal      = PRICE_PER_NIGHT * newNights + roomUpgrade
  const guestFeeTotal = guests > ORIGINAL.guests ? GUEST_FEE * (guests - ORIGINAL.guests) : 0
  const additionalDue = Math.max(0, newTotal - ORIGINAL.total + guestFeeTotal)

  // Push checkout forward when check-in would make it invalid
  const handleCheckIn = (val: string) => {
    setCheckIn(val)
    if (checkOut <= val) {
      const next = new Date(`${val}T00:00:00`)
      next.setDate(next.getDate() + 1)
      setCheckOut(next.toISOString().split("T")[0])
    }
  }

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

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="text-[1.75rem] font-black leading-tight" style={{ color: "var(--fg)" }}>
              Modify Your Reservation
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--gray-3)" }}>
              Booking {ORIGINAL.bookingId} ·{" "}
              <span className="font-semibold" style={{ color: "var(--state-success)" }}>Confirmed</span>
            </p>
          </div>
          <button className="self-start inline-flex items-center gap-2 border rounded-xl px-4 py-2 text-sm transition-colors cursor-pointer"
            style={{ borderColor: "var(--border)", background: "white", color: "var(--gray-2)" }}>
            <HelpCircle size={15} /> Need assistance?
          </button>
        </div>

        {/* Two-column layout — stacks on mobile */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: edit sections ─────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Section 1 — Stay details */}
            <div className="ps-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
                <CalendarDays size={18} style={{ color: "var(--brand-primary)" }} />
                <h2 className="text-[0.9375rem] font-bold" style={{ color: "var(--fg)" }}>1. Edit Stay Details</h2>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">

                {/* Date comparison row */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gray-3)" }}>Stay Dates</p>

                  {/* Original vs new — visual diff so the guest can instantly see the change */}
                  <div className="grid grid-cols-2 gap-0 border rounded-xl overflow-hidden mb-3" style={{ borderColor: "var(--border)" }}>
                    <div className="px-4 py-3 border-r" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)", borderColor: "var(--border)" }}>
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gray-4)" }}>Original</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--gray-2)" }}>
                        {fmtShort(ORIGINAL.checkIn)} – {fmtLong(ORIGINAL.checkOut)}
                      </p>
                    </div>
                    <div className="px-4 py-3 bg-white">
                      <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand-primary)" }}>New Selection</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                        {fmtShort(checkIn)} – {fmtLong(checkOut)}
                      </p>
                    </div>
                  </div>

                  {/* Date pickers — side-by-side on sm+, stacked on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "modify-checkin",  label: "Check-in",  value: checkIn,  min: ORIGINAL.checkIn, onChange: (v: string) => handleCheckIn(v) },
                      { id: "modify-checkout", label: "Check-out", value: checkOut, min: checkIn,            onChange: (v: string) => setCheckOut(v) },
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
                            onChange={e => onChange(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 text-sm font-semibold border rounded-xl outline-none transition-colors cursor-pointer"
                            style={{ background: "white", borderColor: "var(--border)", color: "var(--fg)" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inline validation feedback */}
                  {dateValid ? (
                    <p className="text-xs font-medium mt-2.5 flex items-center gap-1" style={{ color: "var(--state-success)" }}>
                      <CheckCircle2 size={13} />
                      {newNights} night{newNights !== 1 ? "s" : ""} selected — availability confirmed.
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
                      <p className="text-sm font-semibold" style={{ color: "var(--gray-2)" }}>{ORIGINAL.guests} Adults</p>
                    </div>
                    <div className="px-4 py-3 bg-white flex items-center gap-3">
                      <div>
                        <p className="text-[0.625rem] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand-primary)" }}>New Selection</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                            className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                            style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>−</button>
                          <span className="text-sm font-bold min-w-[64px] text-center" style={{ color: "var(--fg)" }}>
                            {guests} Adults
                          </span>
                          <button onClick={() => setGuests(g => Math.min(8, g + 1))}
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
              <div className="flex items-center gap-2.5 px-6 py-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
                <BedDouble size={18} style={{ color: "var(--brand-primary)" }} />
                <h2 className="text-[0.9375rem] font-bold" style={{ color: "var(--fg)" }}>2. Room Category</h2>
              </div>
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Scarcity notice — motivates faster decision-making */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">Limited Availability</p>
                    <p className="text-xs text-amber-600">Only 2 Executive Suites left on your selected dates.</p>
                  </div>
                </div>

                {ROOM_OPTIONS.map(room => {
                  const selected = roomId === room.id
                  return (
                    <div key={room.id} onClick={() => setRoomId(room.id)}
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
                          +{formatLKR(room.extraPerNight!)} / night
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right: price adjustment + policy ─────────────────────── */}
          <div className="w-full lg:w-[280px] flex-shrink-0 lg:sticky lg:top-24 flex flex-col gap-5">

            <div className="ps-card p-5">
              <h3 className="text-[0.9375rem] font-bold mb-4" style={{ color: "var(--fg)" }}>Price Adjustment</h3>

              <div className="flex flex-col gap-2.5 mb-4">
                {[
                  { label: `Original (${ORIGINAL.nights} nights)`, value: formatLKR(ORIGINAL.total),  muted: true  },
                  { label: `New (${newNights} night${newNights !== 1 ? "s" : ""})`, value: formatLKR(newTotal), muted: false },
                  ...(roomUpgrade > 0   ? [{ label: "Room Upgrade",       value: formatLKR(roomUpgrade),   muted: false }] : []),
                  ...(guestFeeTotal > 0 ? [{ label: "Guest Addition Fee", value: formatLKR(guestFeeTotal), muted: false }] : []),
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
                  {formatLKR(additionalDue)}
                </p>
                <p className="text-[0.6875rem] mt-0.5" style={{ color: "var(--gray-4)" }}>Tax & fees included</p>
              </div>

              <button
                onClick={() => router.push("/guest/booking/confirmation")}
                disabled={!dateValid || newNights === 0}
                className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--brand-primary)" }}>
                Confirm & Pay Changes <ArrowRight size={15} />
              </button>
              <button
                onClick={() => router.back()}
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
                {MODIFICATION_POLICY.map(point => (
                  <li key={point} className="flex items-start gap-2 text-xs" style={{ color: "var(--gray-2)" }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--brand-primary)" }}>•</span>
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
