"use client"

import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Pencil, XCircle, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  CreditCard, Wallet,
} from "lucide-react"
import type { BookingStatus } from "@/store/guest/booking/booking.store"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface BookingCardData {
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
  bookingStatus?: string
  cancellationNote?: string
  isFromStore?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
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
// Button style constants
// ─────────────────────────────────────────────────────────────────────────────
const btnPrimary = "inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer no-underline"
const btnHost    = "inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer no-underline"
const btnOutline = "inline-flex items-center gap-2 border border-[var(--border)] hover:border-[var(--brand-primary)] text-[var(--gray-2)] hover:text-[var(--brand-primary)] text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const btnDanger  = "inline-flex items-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline"
const btnGhost   = "inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gray-3)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer ml-auto"

// ─────────────────────────────────────────────────────────────────────────────
// BookingCard — reusable card for displaying a single booking
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingCard({ booking }: { booking: BookingCardData }) {
  const isUpcoming  = booking.status === "UPCOMING"
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"

  const cancelHref = booking.isFromStore
    ? `/guest/booking/cancel?bookingId=${encodeURIComponent(booking.id)}`
    : "/guest/booking/cancel"

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

        {/* Cancellation note */}
        {isCancelled && booking.cancellationNote && (
          <p className="text-xs leading-relaxed rounded-xl px-3 py-2.5 border"
            style={{ color: "var(--gray-3)", background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)" }}>
            {booking.cancellationNote}
          </p>
        )}

        {/* Dates + status */}
        {!isCancelled && (
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div>
              <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--gray-4)" }}>Stay Dates</p>
              <p className="text-xs font-bold" style={{ color: "var(--fg)" }}>{booking.checkIn} – {booking.checkOut}</p>
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
              <Link href="/guest/my-room" className={btnPrimary} style={{ background: "var(--brand-primary)" }}>
                <BedDouble size={13} /> My Room
              </Link>
              <Link href="/guest/messages?type=host" className={`${btnHost}`}
                style={{ background: "var(--brand-primary)", color: "var(--brand-secondary)" }}>
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
              <Link href={`/guest/reviews?propertyId=${booking.propertyId}`} className={btnOutline}>
                <Star size={13} /> Rate Stay
              </Link>
              <Link href="/guest/booking/confirmation" className={btnGhost}>
                View Details <ChevronRight size={13} />
              </Link>
            </>
          )}
          {isCancelled && (
            <>
              <Link href={rebookHref} className={btnPrimary} style={{ background: "var(--brand-primary)" }}>
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
