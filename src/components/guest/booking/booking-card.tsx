"use client"

import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  CreditCard, Wallet, Calendar, User, Clock, Utensils, CheckCircle2, XCircle, Info
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
  cancelledDate?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-US")}`
}

function getDaysToStart(checkIn: string): string {
  if (!checkIn) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(checkIn);
  if (isNaN(checkInDate.getTime())) return checkIn;
  const diffTime = checkInDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Starts today";
  if (diffDays === 1) return "Starts tomorrow";
  if (diffDays > 1) return `Starts in ${diffDays} days`;
  if (diffDays < 0) return "Already started";
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
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
const btnGhost   = "inline-flex items-center gap-1.5 text-xs font-bold text-[#8b7d6d] hover:text-[#9a3300] transition-colors cursor-pointer"

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

  const rebookHref = booking.propertyId
    ? `/guest/property/${encodeURIComponent(booking.propertyId)}`
    : `/guest/search?property=${encodeURIComponent(booking.property)}&location=${encodeURIComponent(booking.location)}`

  const daysToStartText = getDaysToStart(booking.checkIn);

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
        <div className="flex flex-col mb-4 gap-2 sm:gap-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-black text-[#9f8f7c] uppercase tracking-widest">
              Ref: {booking.orderId || booking.orderNumber}
            </span>
             <h3 className="text-[22px] font-black text-[#2d2116] mb-1 tracking-tight">{booking.property}</h3>
             {booking.roomName && (
               <p className="text-[14px] font-semibold text-[#6f6254] flex items-center gap-1">
                 <BedDouble size={14} className="text-[#9a3300]" /> {booking.roomName}
               </p>
             )}
             <div className="mt-1">
               <PaymentBadge paidInFull={booking.paidInFull} method={booking.paymentMethod} />
             </div>
          </div>
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end mt-2 sm:mt-0">
            <p className="text-[20px] font-black text-[#2d2116] leading-tight">{formatLKR(booking.totalPrice)}</p>
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Clock size={12} /> {daysToStartText}
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 size={12} /> Completed on {booking.checkOut}
              </span>
            ) : isCancelled ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                <XCircle size={12} /> Cancelled {booking.cancelledDate ? `on ${booking.cancelledDate}` : ""}
              </span>
            ) : (
              <p className="text-[10px] font-bold text-[#9f8f7c] uppercase tracking-tighter mt-1">{booking.nightsLabel}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2 mb-6">
          <div className="flex items-center gap-1.5 text-[#6f6254]">
            <Calendar size={14} className="text-[#9a3300]" />
            <span className="text-[12px] font-medium">{booking.checkIn} — {booking.checkOut}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6f6254]">
            <User size={14} className="text-[#9a3300]" />
            <span className="text-[12px] font-medium">{booking.guests || "2 Guests"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6f6254]">
            <MapPin size={14} className="text-[#9a3300]" />
            <span className="text-[12px] font-medium truncate max-w-[150px]" title={booking.location}>{booking.location}</span>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-auto pt-6 border-t border-[#f2e7d9] flex-wrap">
          {isUpcoming && (
            <>
              <Link href={`/guest/booking/${booking.orderId}`} className={btnPrimary} style={{ background: "#9a3300" }}>
                <Info size={14} /> More Info
              </Link>
              <Link href="/guest/order" className={btnOutline}>
                <Utensils size={14} /> Order Food
              </Link>
              <button className={btnOutline}>
                <MessageSquare size={14} /> Message
              </button>
              <Link href={`/guest/reviews?propertyId=${booking.propertyId}`} className={btnOutline}>
                <Star size={14} /> Keep Review
              </Link>
            </>
          )}
          {isCompleted && (
            <>
              <Link href={`/guest/booking/${booking.orderId}`} className={btnPrimary} style={{ background: "#9a3300" }}>
                <Info size={14} /> More Info
              </Link>
              <Link href="/guest/booking/confirmation" className={btnOutline}>
                <Download size={14} /> Invoice
              </Link>
              <Link href={`/guest/reviews?propertyId=${booking.propertyId}`} className={btnOutline}>
                <Star size={14} /> Keep Review
              </Link>
            </>
          )}
          {isCancelled && (
            <>
              <Link href={rebookHref} className={btnPrimary} style={{ background: "#9a3300" }}>
                <RefreshCw size={14} /> Rebook
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
