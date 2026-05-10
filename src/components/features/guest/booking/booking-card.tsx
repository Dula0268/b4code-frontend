"use client"

import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  CreditCard, Wallet, Calendar, CheckCircle2
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface BookingCardData {
  id: string
  orderId: string
  status: "UPCOMING" | "COMPLETED" | "CANCELLED"
  property: string
  location: string
  imageSrc: string
  checkIn: string
  checkOut: string
  totalPrice: number
  nightsLabel: string
  guests?: string
  paymentMethod?: string
  paymentStatus?: string
  paidInFull?: boolean
  roomName?: string
  bookingStatus?: string
  cancellationNote?: string
  isFromStore?: boolean
  propertyId?: string
  orderNumber?: string
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UPCOMING: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    SUCCESS: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
  }
  return (
    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  )
}

function PaymentBadge({ paidInFull, method }: { paidInFull?: boolean, method?: string }) {
  const isPaid = paidInFull || method === "ONLINE_CARD";
  
  return isPaid ? (
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
const btnOutline = "inline-flex items-center gap-2 border border-[#e8ddcf] hover:border-[#9a3300] text-[#6f6254] hover:text-[#9a3300] text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer no-underline bg-white"
const btnGhost   = "inline-flex items-center gap-1.5 text-xs font-bold text-[var(--state-error)] hover:opacity-80 transition-colors cursor-pointer"

// ─────────────────────────────────────────────────────────────────────────────
// BookingCard — reusable card for displaying a single booking
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingCard({ booking }: { booking: BookingCardData }) {
  const isUpcoming  = booking.status === "UPCOMING"
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"

  const bookingContext = new URLSearchParams({
    bookingId: booking.id,
    bookingRef: booking.orderId || booking.orderNumber || booking.id,
    property: booking.property,
    location: booking.location,
    imageSrc: booking.imageSrc,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalPrice: String(booking.totalPrice || 0),
    guests: booking.guests || "",
    propertyId: booking.propertyId || "",
    isFromStore: booking.isFromStore ? "1" : "0",
  }).toString()

  const cancelHref = `/guest/booking/cancel?${bookingContext}`
  const modifyHref = `/guest/booking/modify?${bookingContext}`

  const rebookHref = booking.propertyId
    ? `/guest/property/${encodeURIComponent(booking.propertyId)}`
    : `/guest/search?property=${encodeURIComponent(booking.property)}&location=${encodeURIComponent(booking.location)}`

  const handleComplete = async () => {
    if (!window.confirm("Are you sure you want to complete this stay?")) return
    try {
      const { guestApi } = await import("@/lib/api")
      await guestApi.completeBooking(Number(booking.id))
      window.location.reload()
    } catch (err) {
      alert("Failed to complete booking")
    }
  }

  return (
    <div className="relative group overflow-hidden rounded-[24px] bg-white border border-[#eadfce] transition-all duration-300 hover:shadow-xl hover:shadow-[#cbb89e]/35 flex flex-col sm:flex-row">
      {/* Property image */}
      <div className="relative w-full sm:w-52 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
        <Image
          src={booking.imageSrc}
          alt={booking.property}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        {/* Header: Order ID + Price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-black text-[#9f8f7c] uppercase tracking-widest">
              Ref: {booking.orderId || booking.orderNumber}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <PaymentBadge paidInFull={booking.paidInFull} method={booking.paymentMethod} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-black text-[#2d2116] leading-tight">{formatLKR(booking.totalPrice)}</p>
            <p className="text-[10px] font-bold text-[#9f8f7c] uppercase tracking-tighter">{booking.nightsLabel}</p>
          </div>
        </div>

        {/* Property Info */}
        <div className="mb-6">
          <h3 className="text-[22px] font-black text-[#2d2116] mb-1 tracking-tight">{booking.property}</h3>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-[#6f6254]">
              <Calendar size={14} className="text-[#9a3300]" />
              <span className="text-[12px] font-medium">{booking.checkIn} — {booking.checkOut}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#6f6254]">
              <MapPin size={14} className="text-[#9a3300]" />
              <span className="text-[12px] font-medium">{booking.location}</span>
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-auto pt-6 border-t border-[#f2e7d9] flex-wrap">
          {isUpcoming && (
            <>
              <Link href="/guest/my-room" className={btnPrimary} style={{ background: "#9a3300" }}>
                <BedDouble size={14} /> My Room
              </Link>
              <Link href={modifyHref} className={btnOutline}>
                <RefreshCw size={14} /> Modify
              </Link>
              <Link href={`/guest/messages?type=host&bookingId=${booking.id}`} className={btnOutline}>
                <MessageSquare size={14} /> Message
              </Link>
              <button onClick={handleComplete} className={btnOutline}>
                <CheckCircle2 size={14} /> Complete
              </button>
              <Link href={cancelHref} className={`${btnGhost} sm:ml-auto`}>
                Cancel Stay
              </Link>
            </>
          )}
          {isCompleted && (
            <>
              <Link href="/guest/booking/confirmation" className={btnOutline}>
                <Download size={14} /> Invoice
              </Link>
              <Link href={`/guest/reviews?propertyId=${booking.propertyId}`} className={btnOutline}>
                <Star size={14} /> Rate Stay
              </Link>
              <Link href="/guest/booking/confirmation" className={btnGhost}>
                Details <ChevronRight size={14} />
              </Link>
            </>
          )}
          {isCancelled && (
            <>
              <Link href={rebookHref} className={btnPrimary} style={{ background: "#9a3300" }}>
                <RefreshCw size={14} /> Rebook
              </Link>
              <Link href="/guest/booking/cancel" className={btnOutline}>
                <FileText size={14} /> Policy
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
