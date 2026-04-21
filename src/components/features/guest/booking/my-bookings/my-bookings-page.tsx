"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Pencil, XCircle, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  Bell, CreditCard, Wallet,
} from "lucide-react"
import { useAuthStore } from "@/store/auth/auth.store"
import { useGuestBookingStore, type StoredBooking, type BookingStatus } from "@/store/guest/booking/booking.store"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Booking {
  id: string
  propertyId?: string
  orderNumber: string
  status: BookingStatus
  property: string
  location: string
  imageSrc: string
  checkIn: string
  checkOut: string
  guests: string
  totalPrice: number
  nightsLabel: string
  paymentMethod?: "online" | "property"
  paidInFull?: boolean
  roomName?: string
  bookingStatus?: string      // only for COMPLETED
  cancellationNote?: string   // only for CANCELLED
  isFromStore?: boolean       // false = mock/demo data
}

type Tab = BookingStatus   // reuse the same union — no separate type needed

// ─────────────────────────────────────────────────────────────────────────────
// Demo data — replace with API response when backend is ready
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_BOOKINGS: Booking[] = [
  {
    id: "demo-1",
    propertyId: "1",
    orderNumber: "BK-88291",
    status: "UPCOMING",
    property: "Oceanview Luxury Retreat",
    location: "Maui, Hawaii",
    imageSrc: "/images/booking/resort-maui.png",
    checkIn: "Oct 12",
    checkOut: "Oct 15, 2023",
    guests: "2 Adults, 1 Child",
    totalPrice: 25_000,
    nightsLabel: "Total for 3 nights",
    paymentMethod: "online",
    paidInFull: true,
  },
  {
    id: "demo-2",
    propertyId: "2",
    orderNumber: "BK-77210",
    status: "COMPLETED",
    property: "Mountain Peaks Chalet",
    location: "Aspen, Colorado",
    imageSrc: "/images/booking/mountain-chalet.png",
    checkIn: "Sep 05",
    checkOut: "Sep 08, 2023",
    guests: "2 Adults",
    totalPrice: 30_000,
    nightsLabel: "Total for 3 nights",
    bookingStatus: "Checked Out",
    paymentMethod: "online",
    paidInFull: true,
  },
  {
    id: "demo-3",
    propertyId: "3",
    orderNumber: "BK-10293",
    status: "CANCELLED",
    property: "Skyline Loft Apartments",
    location: "New York, NY",
    imageSrc: "/images/booking/city-apartment.png",
    checkIn: "Nov 01",
    checkOut: "Nov 05, 2023",
    guests: "2 Adults",
    totalPrice: 45_000,
    nightsLabel: "Total for 4 nights",
    cancellationNote:
      "Cancelled on Aug 20, 2023. Refund of $450.00 processed to your original payment method.",
    paymentMethod: "property",
    paidInFull: false,
  },
]

const TABS: Tab[] = ["UPCOMING", "COMPLETED", "CANCELLED"]

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge — colour-coded pill matching design-system state tokens
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  UPCOMING:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  COMPLETED: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  CANCELLED: { bg: "bg-gray-100",   text: "text-gray-500",    border: "border-gray-200"    },
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={`text-[0.625rem] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${s.bg} ${s.text} ${s.border}`}>
      {status}
    </span>
  )
}

function PaymentBadge({ paidInFull }: { paidInFull: boolean }) {
  return paidInFull ? (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
      <CreditCard size={10} /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
      <Wallet size={10} /> Pay at Property
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared button classes — defined once to keep cards consistent
// ─────────────────────────────────────────────────────────────────────────────
const btnPrimary = "inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer no-underline"
const btnHost    = "inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer no-underline"
const btnOutline = "inline-flex items-center gap-2 border border-[var(--border)] hover:border-[var(--black-2)] text-[var(--gray-2)] hover:text-[var(--black-2)] text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const btnDanger  = "inline-flex items-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const btnGhost   = "inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gray-3)] hover:text-[var(--black-2)] transition-colors cursor-pointer ml-auto"

// ─────────────────────────────────────────────────────────────────────────────
// Booking card
// ─────────────────────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: Booking }) {
  const isUpcoming  = booking.status === "UPCOMING"
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"

  // Per-booking cancel href keeps the cancel page pre-populated for store bookings
  const cancelHref = booking.isFromStore
    ? `/guest/booking/cancel?bookingId=${encodeURIComponent(booking.id)}`
    : "/guest/booking/cancel"

  // Prefer deep-linking to the property; fall back to search
  const rebookHref = booking.propertyId
    ? `/guest/property/${encodeURIComponent(booking.propertyId)}`
    : `/guest/search?property=${encodeURIComponent(booking.property)}&location=${encodeURIComponent(booking.location)}`

  return (
    <div className="ps-card overflow-hidden flex flex-col sm:flex-row hover:shadow-[var(--shadow-card)] transition-shadow">

      {/* Property image */}
      <div className="relative w-full sm:w-52 h-44 sm:h-auto flex-shrink-0">
        <Image
          src={booking.imageSrc}
          alt={booking.property}
          fill
          sizes="(max-width: 640px) 100vw, 208px"
          className={`object-cover ${isCancelled ? "grayscale opacity-60" : ""}`}
        />
        {/* Status pill floated over the image so the card body stays clean */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex-1 p-5 flex flex-col gap-3">

        {/* Order number + price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {booking.paidInFull !== undefined && !isCancelled && (
              <PaymentBadge paidInFull={booking.paidInFull} />
            )}
            <span className="text-[0.6875rem] font-semibold" style={{ color: "var(--gray-3)" }}>
              #{booking.orderNumber}
            </span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[1.1875rem] font-black leading-tight"
              style={{ color: isCancelled ? "var(--gray-4)" : "var(--fg)" }}>
              {formatLKR(booking.totalPrice)}
            </p>
            <p className="text-[0.625rem] font-semibold" style={{ color: "var(--gray-4)" }}>
              {booking.nightsLabel}
            </p>
          </div>
        </div>

        {/* Property name + room + location */}
        <div>
          <h3 className="text-base font-black leading-snug" style={{ color: "var(--fg)" }}>
            {booking.property}
          </h3>
          {booking.roomName && (
            <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--gray-2)" }}>
              {booking.roomName}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} style={{ color: "var(--gray-4)" }} />
            <p className="text-xs" style={{ color: "var(--gray-3)" }}>{booking.location}</p>
          </div>
        </div>

        {/* Cancellation note — only for cancelled bookings */}
        {isCancelled && booking.cancellationNote && (
          <p className="text-xs leading-relaxed rounded-xl px-3 py-2.5 border"
            style={{ color: "var(--gray-3)", background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)" }}>
            {booking.cancellationNote}
          </p>
        )}

        {/* Dates + status (hidden for cancelled — shown in the note above) */}
        {!isCancelled && (
          <div className="flex gap-6">
            <div>
              <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--gray-4)" }}>
                Stay Dates
              </p>
              <p className="text-xs font-bold" style={{ color: "var(--fg)" }}>
                {booking.checkIn} – {booking.checkOut}
              </p>
            </div>
            <div>
              <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--gray-4)" }}>
                {isCompleted ? "Status" : "Guests"}
              </p>
              <p className="text-xs font-bold" style={{ color: isCompleted ? "var(--state-success)" : "var(--fg)" }}>
                {isCompleted ? booking.bookingStatus : booking.guests}
              </p>
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">

          {isUpcoming && (
            <>
              <Link href="/guest/my-room" className={btnPrimary} style={{ background: "var(--black-2)" }}>
                <BedDouble size={13} /> My Room
              </Link>
              {/* Amber accent on Message Host to visually distinguish it from the plain primary action */}
              <Link href="/guest/booking/message-host"
                className={`${btnHost}`}
                style={{ background: "var(--black-2)", color: "var(--brand-secondary)" }}>
                <MessageSquare size={13} /> Message Host
              </Link>
              <Link href="/guest/booking/modify" className={btnOutline}>
                <Pencil size={12} /> Modify
              </Link>
              <Link href={cancelHref} className={btnDanger}>
                <XCircle size={13} /> Cancel
              </Link>
            </>
          )}

          {isCompleted && (
            <>
              <Link href="/guest/booking/confirmation" className={btnOutline}>
                <Download size={13} /> Download Invoice
              </Link>
              <Link href="/guest/my-room/submit-review" className={btnOutline}>
                <Star size={13} /> Rate Stay
              </Link>
              <Link href="/guest/booking/confirmation" className={btnGhost}>
                View Details <ChevronRight size={13} />
              </Link>
            </>
          )}

          {isCancelled && (
            <>
              <Link href={rebookHref} className={btnPrimary} style={{ background: "var(--black-2)" }}>
                <RefreshCw size={13} /> Rebook Property
              </Link>
              <Link href="/guest/booking/cancel" className={btnOutline}>
                <FileText size={13} /> Cancellation Policy
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Map from the booking store shape to the local Booking interface
// ─────────────────────────────────────────────────────────────────────────────
function fromStore(b: StoredBooking): Booking {
  return {
    id:            b.id,
    propertyId:    b.propertyId,
    orderNumber:   b.confirmationCode,
    status:        b.status,
    property:      b.property,
    location:      b.location ? `${b.location}, Sri Lanka` : "Sri Lanka",
    imageSrc:      b.imageSrc,
    checkIn:       b.checkInFormatted,
    checkOut:      b.checkOutFormatted,
    guests:        b.guestsLabel,
    totalPrice:    b.totalPrice,
    nightsLabel:   b.nightsLabel,
    paymentMethod: b.paymentMethod,
    paidInFull:    b.paidInFull,
    roomName:      b.roomName,
    isFromStore:   true,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("UPCOMING")

  const user          = useAuthStore(s => s.user)
  const storeBookings = useGuestBookingStore(s => s.bookings)
  const [bookings, setBookings] = useState<Booking[]>(DEMO_BOOKINGS)

  // Merge real bookings (front of list) with demo data on user/store change
  useEffect(() => {
    const userBookings = user?.email
      ? storeBookings.filter(b => b.userEmail.toLowerCase() === user.email.toLowerCase())
      : storeBookings
    setBookings([...userBookings.map(fromStore), ...DEMO_BOOKINGS])
  }, [storeBookings, user])

  const visible         = bookings.filter(b => b.status === activeTab)
  const nextUpcoming    = bookings.find(b => b.status === "UPCOMING") ?? null

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[860px] mx-auto px-4">

        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="text-[1.875rem] font-black leading-tight" style={{ color: "var(--fg)", fontSize: "1.875rem" }}>
            My Bookings
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: "var(--gray-3)" }}>
            Track your stays and manage upcoming travel plans.
          </p>
        </div>

        {/* Tab toggle — pill style keeps it compact on mobile */}
        <div className="flex items-center gap-1 mb-6 ps-card w-fit p-1">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 text-[0.75rem] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? "var(--black-2)" : "transparent",
                color:      activeTab === tab ? "white"          : "var(--gray-3)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Upcoming reminder — only shown on the UPCOMING tab */}
        {activeTab === "UPCOMING" && nextUpcoming && (
          <div className="mb-6 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-4 border border-amber-200 bg-amber-50">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Bell size={17} className="text-amber-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black" style={{ color: "var(--fg)" }}>Upcoming stay!</h3>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--gray-2)" }}>
                Your trip to <strong>{nextUpcoming.property}</strong> is coming up ({nextUpcoming.checkIn} – {nextUpcoming.checkOut}).
                {nextUpcoming.paidInFull === false && " Bring a valid ID for payment at check-in."}
              </p>
            </div>
            <Link href="/guest/my-room"
              className="hidden sm:inline-flex text-xs font-black whitespace-nowrap no-underline transition-colors"
              style={{ color: "var(--fg)" }}>
              View Room →
            </Link>
          </div>
        )}

        {/* Booking list */}
        <div className="flex flex-col gap-4">
          {visible.length === 0 ? (
            <div className="ps-card p-12 text-center">
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--gray-4)" }}>
                No {activeTab.toLowerCase()} bookings.
              </p>
              <Link href="/guest/search"
                className="inline-flex items-center gap-1.5 text-sm font-bold no-underline transition-colors"
                style={{ color: "var(--fg)" }}>
                Browse Properties <ChevronRight size={13} />
              </Link>
            </div>
          ) : (
            visible.map(booking => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>

      </div>
    </div>
  )
}
