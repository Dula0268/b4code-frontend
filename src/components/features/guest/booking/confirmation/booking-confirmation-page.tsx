"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle, MapPin, Printer, Share2,
  CalendarDays, Users, CreditCard, Copy,
  ChevronRight, Info, Clock, AlertTriangle, Wallet,
} from "lucide-react"
import { getPropertyById } from "@/lib/mock-properties"
import { useGuestBookingStore, type StoredBooking } from "@/store/guest/booking/booking.store"
import { differenceInDays, format } from "date-fns"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface FallbackData {
  confirmationCode: string
  paidInFull:       boolean
  propertyName:     string
  propertyLocation: string
  propertyImage:    string
  roomName:         string
  checkIn:          string
  checkOut:         string
  guests:           number
  nights:           number
  totalPrice:       number
}

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

function parseIsoDate(raw: string | null) {
  if (!raw) return null
  const d = new Date(`${raw}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

// ─────────────────────────────────────────────────────────────────────────────
// Business Logic Hook
// ─────────────────────────────────────────────────────────────────────────────
function useBookingConfirmationLogic() {
  const searchParams = useSearchParams()
  const [copied,       setCopied]      = useState(false)
  const [booking,      setBooking]     = useState<StoredBooking | null>(null)
  const [fallback,     setFallback]    = useState<FallbackData | null>(null)
  const [errorMsg,     setErrorMsg]    = useState<string | null>(null)

  useEffect(() => {
    if (!searchParams) return
    try {
      const code = searchParams.get("confirmationCode") ?? ""

      // Prefer data from the booking store (authoritative post-checkout source)
      const stored = useGuestBookingStore.getState().getBookingByCode(code)
      if (stored) { setBooking(stored); return }

      // Fall back to URL query params for deep-linked or shared confirmation pages
      const propertyId    = searchParams.get("propertyId") ?? ""
      const roomId        = searchParams.get("roomId")     ?? ""
      const paidInFull    = searchParams.get("paidInFull") === "1"
      const checkInDate   = parseIsoDate(searchParams.get("checkIn"))
      const checkOutDate  = parseIsoDate(searchParams.get("checkOut"))
      const guestCount    = parseInt(searchParams.get("guests") ?? "2", 10)
      const totalFromUrl  = Number(searchParams.get("total") ?? "0")
      const nights        = checkInDate && checkOutDate
        ? Math.max(1, differenceInDays(checkOutDate, checkInDate)) : 1

      const property = propertyId ? getPropertyById(propertyId) : null
      const room     = property && roomId ? property.rooms.find(r => r.id === roomId || r.id.replace(/-/g, " ") === roomId) : null

      setFallback({
        confirmationCode: code,
        paidInFull,
        propertyName:     property?.title        ?? "Your Property",
        propertyLocation: property ? `${property.location}, Sri Lanka` : "Sri Lanka",
        propertyImage:    property?.imageSrc     ?? "/images/properties/property-1.jpg",
        roomName:         room?.name             ?? "Premium Room",
        checkIn:          checkInDate  ? format(checkInDate,  "EEE, MMM d") : "—",
        checkOut:         checkOutDate ? format(checkOutDate, "EEE, MMM d") : "—",
        guests:           guestCount,
        nights,
        totalPrice:       totalFromUrl > 0 ? totalFromUrl : (room ? room.pricePerNight * nights : 0),
      })
    } catch(err) {
      setErrorMsg("Failed to read confirmation data.");
    }
  }, [searchParams])

  const handleCopy = () => {
    const code = booking?.confirmationCode ?? fallback?.confirmationCode ?? ""
    try {
        navigator.clipboard.writeText(`#${code}`).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    } catch(err) {
        // Fallback for older browsers
        console.error("Clipboard write failed", err)
    }
  }

  // Derived display values — store data takes priority over URL fallback
  const code             = booking?.confirmationCode ?? fallback?.confirmationCode ?? "—"
  const paidInFull       = booking?.paidInFull       ?? fallback?.paidInFull       ?? true
  const propertyName     = booking?.property         ?? fallback?.propertyName     ?? "Your Property"
  const propertyLocation = booking?.location ? `${booking.location}, Sri Lanka` : (fallback?.propertyLocation ?? "Sri Lanka")
  const propertyImage    = booking?.imageSrc         ?? fallback?.propertyImage    ?? "/images/properties/property-1.jpg"
  const roomName         = booking?.roomName         ?? fallback?.roomName         ?? "Premium Room"
  const checkInDisplay   = booking?.checkInFormatted ?? fallback?.checkIn          ?? "—"
  const checkOutDisplay  = booking?.checkOutFormatted ?? fallback?.checkOut        ?? "—"
  const guestCount       = booking?.guests           ?? fallback?.guests           ?? 2
  const totalPrice       = booking?.totalPrice       ?? fallback?.totalPrice       ?? 0
  const nights           = booking?.nights           ?? fallback?.nights           ?? 1

  return {
    booking, fallback, code, paidInFull, propertyName, propertyLocation, propertyImage, roomName,
    checkInDisplay, checkOutDisplay, guestCount, totalPrice, nights, copied, handleCopy, errorMsg
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — separated so Suspense can wrap useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
function BookingConfirmationInner() {
  const logic = useBookingConfirmationLogic()
  const { booking, fallback, code, paidInFull, propertyName, propertyLocation, propertyImage, roomName, checkInDisplay, checkOutDisplay, guestCount, totalPrice, nights, copied, handleCopy, errorMsg } = logic

  if (!booking && !fallback) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--gray-3)" }}>
        Loading confirmation…
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[660px] mx-auto px-4 flex flex-col gap-6">

        {/* Success header */}
        <div className="flex flex-col items-center text-center pt-6 pb-2">
          <div className="relative w-15 h-15 mb-4">
            <div className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: "color-mix(in srgb, var(--state-success) 30%, transparent)" }} />
            <div className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--state-success) 12%, white)" }}>
              <CheckCircle size={30} strokeWidth={2.5} style={{ color: "var(--state-success)" }} />
            </div>
          </div>
          <h1 className="text-[1.75rem] font-black leading-tight mb-2" style={{ color: "var(--fg)" }}>
            Booking Confirmed
          </h1>
          <p className="text-[0.9375rem] max-w-[380px] leading-relaxed" style={{ color: "var(--gray-3)" }}>
            {paidInFull ? (
              <>Pack your bags! Your stay at <strong style={{ color: "var(--gray-1)" }}>{propertyName}</strong> is confirmed and fully paid.</>
            ) : (
              <>Your reservation at <strong style={{ color: "var(--gray-1)" }}>{propertyName}</strong> is confirmed. Payment will be collected at check-in.</>
            )}
          </p>
        </div>

        {/* Payment status banner */}
        {paidInFull ? (
          <div className="rounded-2xl p-4 flex items-center gap-3 border"
            style={{ background: "color-mix(in srgb, var(--state-success) 8%, white)", borderColor: "color-mix(in srgb, var(--state-success) 20%, transparent)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "color-mix(in srgb, var(--state-success) 12%, white)" }}>
              <CreditCard size={20} style={{ color: "var(--state-success)" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>Payment Complete</p>
              <p className="text-xs" style={{ color: "var(--gray-2)" }}>
                {formatLKR(totalPrice)} has been charged. No payment needed at check-in.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 flex items-center gap-3 border border-amber-200 bg-amber-50">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Wallet size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--fg)" }}>Pay at Property</p>
              <p className="text-xs" style={{ color: "var(--gray-2)" }}>
                {formatLKR(totalPrice)} is due at check-in. Bring a valid ID and your confirmation code.
              </p>
            </div>
          </div>
        )}

        {/* Confirmation card */}
        <div className="ps-card overflow-hidden">

          {/* Card header — confirmation code + action icons */}
          <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between gap-4"
            style={{ borderColor: "var(--gray-5)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[1.375rem] font-bold" style={{ color: "var(--fg)" }}>#{code}</span>
              <button onClick={handleCopy} aria-label="Copy confirmation code"
                className="flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer"
                style={{ color: "var(--brand-primary)" }}>
                <Copy size={13} />{copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex items-center gap-3" style={{ color: "var(--gray-3)" }}>
              <button onClick={() => window.print()} aria-label="Print booking"
                className="hover:text-[var(--fg)] transition-colors cursor-pointer">
                <Printer size={18} />
              </button>
              <button aria-label="Share booking" className="hover:text-[var(--fg)] transition-colors cursor-pointer">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Property image + info */}
          <div className="p-5 flex gap-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
            <div className="relative w-36 h-[100px] flex-shrink-0 rounded-xl overflow-hidden"
              style={{ background: "var(--gray-5)" }}>
              <Image src={propertyImage} alt={propertyName} fill className="object-cover" />
            </div>
            <div className="flex flex-col justify-center gap-1.5">
              <h2 className="text-[1.0625rem] font-bold leading-snug" style={{ color: "var(--fg)" }}>{propertyName}</h2>
              <p className="text-sm font-medium" style={{ color: "var(--gray-2)" }}>{roomName}</p>
              <div className="flex items-start gap-1.5">
                <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--gray-3)" }} />
                <p className="text-sm leading-snug" style={{ color: "var(--gray-3)" }}>{propertyLocation}</p>
              </div>
            </div>
          </div>

          {/* Stay details grid — 2-col on mobile, 4-col on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
            {[
              { icon: CalendarDays, label: "Check-In",    value: checkInDisplay,  sub: "After 3:00 PM",   subStyle: {} },
              { icon: CalendarDays, label: "Check-Out",   value: checkOutDisplay, sub: "Before 11:00 AM", subStyle: {} },
              { icon: Users,        label: "Guests",      value: `${guestCount} Guest${guestCount > 1 ? "s" : ""}`, sub: `${nights} night${nights > 1 ? "s" : ""}`, subStyle: {} },
              {
                icon: CreditCard,
                label: "Total Price",
                value: formatLKR(totalPrice),
                sub: paidInFull ? "Paid in full" : "Pay at property",
                subStyle: { color: paidInFull ? "var(--state-success)" : "var(--state-warning)", fontWeight: "600" },
              },
            ].map(({ icon: Icon, label, value, sub, subStyle }, i) => (
              <div key={label} className={`p-4 flex flex-col gap-1 ${i < 3 ? "border-r" : ""}`}
                style={{ borderColor: "var(--gray-5)" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={12} style={{ color: "var(--gray-4)" }} />
                  <p className="text-[0.5625rem] font-semibold uppercase tracking-wider" style={{ color: "var(--gray-3)" }}>
                    {label}
                  </p>
                </div>
                <p className="text-sm font-bold leading-tight" style={{ color: "var(--fg)" }}>{value}</p>
                <p className="text-xs leading-tight" style={{ color: "var(--gray-3)", ...subStyle }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Instructions — differ based on payment method */}
          <div className="p-5 flex flex-col gap-3">
            {paidInFull ? (
              <div className="rounded-xl p-4 flex gap-3 border border-amber-200 bg-amber-50">
                <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--fg)" }}>Check-in Instructions</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--gray-2)" }}>
                    Self check-in via smart keypad. Your unique access code will be sent to your email 24 hours before arrival. Active from 3:00 PM on your check-in date.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-xl p-4 flex gap-3 border border-amber-200 bg-amber-50">
                  <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--fg)" }}>Payment Required at Check-in</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--gray-2)" }}>
                      Present your confirmation code <strong>#{code}</strong> and a valid National ID or Passport at reception.
                      Payment of <strong>{formatLKR(totalPrice)}</strong> is due on arrival (Cash or Card accepted).
                    </p>
                  </div>
                </div>
                <div className="rounded-xl p-4 flex gap-3 border" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--gray-5) 40%, white)" }}>
                  <Clock size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--gray-3)" }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--fg)" }}>Free Cancellation</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--gray-2)" }}>
                      As a pay-at-property booking, you can cancel free of charge up to 48 hours before check-in. No charges will apply.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Price breakdown — only when store data is available */}
            {booking && (
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <div className="px-4 py-3 border-b" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)", borderColor: "var(--border)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--gray-3)" }}>Price Breakdown</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label: `Room (${booking.nights} night${booking.nights > 1 ? "s" : ""})`, value: formatLKR(booking.basePrice),   style: {} },
                    { label: "Taxes",      value: formatLKR(booking.taxes),      style: {} },
                    { label: "Service Fee", value: formatLKR(booking.serviceFee), style: {} },
                    ...(booking.discount > 0 ? [{ label: "Online Discount", value: `–${formatLKR(booking.discount)}`, style: { color: "var(--state-success)" } }] : []),
                  ].map(({ label, value, style }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span style={{ color: "var(--gray-3)", ...style }}>{label}</span>
                      <span className="font-medium" style={{ color: "var(--fg)", ...style }}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t font-bold" style={{ borderColor: "var(--gray-5)" }}>
                    <span style={{ color: "var(--fg)" }}>Total</span>
                    <span style={{ color: "var(--brand-primary)" }}>{formatLKR(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <Link href="/guest/booking/my-bookings"
              className="w-full flex items-center justify-center gap-2 text-white rounded-xl px-5 py-3 text-sm font-semibold no-underline transition-colors"
              style={{ background: "var(--brand-primary)" }}>
              <CalendarDays size={16} /> My Bookings
            </Link>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "View My Room",   href: "/guest/my-room",                   icon: ChevronRight },
                { label: "Message Host",   href: "/guest/messages?type=host",       icon: ChevronRight },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href}
                  className="flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-semibold no-underline transition-colors"
                  style={{ borderColor: "var(--border)", color: "var(--gray-2)", background: "color-mix(in srgb, var(--gray-5) 30%, white)" }}>
                  {label} <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" />
      </div>
    }>
      <BookingConfirmationInner />
    </Suspense>
  )
}
