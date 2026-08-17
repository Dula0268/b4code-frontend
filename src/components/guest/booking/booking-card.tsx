"use client"

import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  CreditCard, Wallet, Calendar, User, Clock, CheckCircle2, XCircle, Info, Edit3
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface BookingCardData {
  id: string
  orderId: string
  status: "UPCOMING" | "COMPLETED" | "CANCELLED" | "PENDING"
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
  roomQuantity?: number
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
  const labels: Record<string, string> = {
    PENDING: "Pending Payment",
  }
  return (
    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${styles[status] || styles.PENDING}`}>
      {labels[status] ?? status}
    </span>
  )
}

function PaymentBadge({ paidInFull, method, status }: { paidInFull?: boolean, method?: string, status?: string }) {
  // Online card booking that hasn't been paid yet
  if (status === "PENDING" && method === "online") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
        <CreditCard size={10} /> Payment Pending
      </span>
    )
  }

  const isPaid = paidInFull || method === "ONLINE_CARD";
  
  return isPaid ? (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
      <CreditCard size={10} /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
      <Wallet size={10} /> Pay at Property
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Button style constants
// ─────────────────────────────────────────────────────────────────────────────
const btnPrimary = "inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer no-underline"
const btnOutline = "inline-flex items-center gap-1.5 border border-[#e8ddcf] hover:border-[#9a3300] text-[#6f6254] hover:text-[#9a3300] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer no-underline bg-white"
const btnGhost   = "inline-flex items-center gap-1 text-[11px] font-bold text-[#8b7d6d] hover:text-[#9a3300] transition-colors cursor-pointer"

// ─────────────────────────────────────────────────────────────────────────────
// BookingCard — reusable card for displaying a single booking
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingCard({ booking }: { booking: BookingCardData }) {
  const isUpcoming  = booking.status === "UPCOMING"
  const isPending   = booking.status === "PENDING"
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
    roomQuantity: String(booking.roomQuantity || 1),
    isFromStore: booking.isFromStore ? "1" : "0",
  }).toString()

  const rebookHref = booking.propertyId
    ? `/guest/property/${encodeURIComponent(booking.propertyId)}`
    : `/guest/search?property=${encodeURIComponent(booking.property)}&location=${encodeURIComponent(booking.location)}`

  const daysToStartText = getDaysToStart(booking.checkIn);

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white border border-[#eadfce] transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row h-auto items-stretch">
      {/* Property image */}
      <div className="relative w-full sm:w-[160px] min-h-[130px] flex-shrink-0 overflow-hidden">
        <Image
          src={booking.imageSrc}
          alt={booking.property}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60" />

      </div>

      {/* Card body */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
          <div className="flex flex-col min-w-0 pr-0 sm:pr-4">
             <span className="text-[10px] font-black text-[#9f8f7c] uppercase tracking-widest mb-0.5">
              Ref: {booking.orderId || booking.orderNumber}
            </span>
             <h3 className="text-[16px] font-bold text-[#2d2116] truncate">{booking.property}</h3>
             {booking.roomName && (
               <p className="text-[12px] font-medium text-[#6f6254] flex items-center gap-1 truncate mt-0.5">
                 <BedDouble size={12} className="text-[#9a3300]" /> 
                 {booking.roomQuantity && booking.roomQuantity > 1 ? `${booking.roomQuantity}x ` : ""}{booking.roomName}
               </p>
             )}
          </div>
          <div className="text-left sm:text-right flex-shrink-0 flex flex-col items-start sm:items-end">
            <p className="text-[16px] font-black text-[#2d2116] leading-tight">{formatLKR(booking.totalPrice)}</p>
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Clock size={10} /> {daysToStartText}
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 size={10} /> Completed on {booking.checkOut}
              </span>
            ) : isCancelled ? (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                <XCircle size={10} /> Cancelled {booking.cancelledDate ? `on ${booking.cancelledDate}` : ""}
              </span>
            ) : (
              <p className="text-[10px] font-bold text-[#9f8f7c] uppercase tracking-tighter mt-1">{booking.nightsLabel}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-auto pt-3 sm:pt-0 gap-3 sm:gap-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[#6f6254] text-[11px] font-medium">
            <PaymentBadge paidInFull={booking.paidInFull} method={booking.paymentMethod} status={booking.status} />
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isPending && booking.paymentMethod === "online" && (
              <Link
                href={`/payment?total=${Number(booking.totalPrice).toFixed(2)}&confirmationCode=${booking.orderId}&bookingId=${booking.id}`}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
              >
                ⏳ Complete Payment
              </Link>
            )}
            {isUpcoming && (
              <>
                <Link href={`/guest/booking/${booking.orderId}/modify`} className={btnOutline}>
                  <Edit3 size={12} /> Modify
                </Link>
                <Link href={`/guest/booking/${booking.orderId}/cancel`} className={btnOutline}>
                  <XCircle size={12} /> Cancel
                </Link>
              </>
            )}
            
            {isCompleted ? (
              <>
                <Link href={`/guest/booking/${booking.orderId}/review`} className={btnPrimary} style={{ background: "#9a3300" }}>
                  <Star size={12} /> Leave Review
                </Link>
                <Link href={`/guest/booking/${booking.orderId}/complain`} className={btnOutline}>
                  <MessageSquare size={12} /> File a Complaint
                </Link>
              </>
            ) : isCancelled ? (
              <Link href={rebookHref} className={btnPrimary} style={{ background: "#9a3300" }}>
                <RefreshCw size={12} /> Rebook
              </Link>
            ) : (
              <Link href={`/guest/booking/${booking.orderId}/receipt`} className={btnPrimary} style={{ background: "#9a3300" }}>
                <Download size={12} /> Receipt
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
