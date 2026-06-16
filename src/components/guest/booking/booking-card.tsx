"use client"

import Image from "next/image"
import Link from "next/link"
import {
  MapPin, MessageSquare, Download,
  Star, ChevronRight, RefreshCw, FileText, BedDouble,
  CreditCard, Wallet, Calendar
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
const btnGhost   = "inline-flex items-center gap-1.5 text-xs font-bold text-[#8b7d6d] hover:text-[#9a3300] transition-colors cursor-pointer"

// ─────────────────────────────────────────────────────────────────────────────
// BookingCard — reusable card for displaying a single booking
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingCard({ booking }: { booking: BookingCardData }) {
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

  const paymentText = booking.paidInFull || booking.paymentMethod === "online" || booking.paymentMethod === "ONLINE_CARD" 
    ? "Pay Online (Paid)" 
    : "Pay at Property"

  // Attempt to parse guests if needed, though usually just a number or string
  // If we only have a total number of guests, we'll format it nicely.
  const guestText = booking.guests ? booking.guests : "2 Adults, 0 Children"

  return (
    <div className="flex flex-col sm:flex-row bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Property image */}
      <div className="relative w-full sm:w-[30%] sm:min-w-[240px] aspect-[4/3] sm:aspect-auto bg-[#f3ede8] shrink-0">
        <Image
          src={booking.imageSrc}
          alt={booking.property}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 30vw"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[18px] font-bold text-[#1d1d1d] leading-snug">{booking.property}</h3>
            <p className="text-[#555] text-[14px] mt-1 flex items-center gap-1">
              <MapPin size={14} className="text-[#9a3300]" />
              {booking.location}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
             <PaymentBadge paidInFull={booking.paidInFull} method={booking.paymentMethod} />
             {/* Removed StatusBadge */}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-[13px] text-[#666] mt-2 mb-2">
          {booking.roomName && (
             <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3 py-1.5 rounded-lg w-full sm:w-auto">
               <BedDouble size={14} className="text-[#9a3300]" />
               <span className="font-medium">1 Room - {booking.roomName}</span>
             </div>
          )}
          <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3 py-1.5 rounded-lg">
            <Calendar size={14} className="text-[#9a3300]" />
            <span className="font-medium">{booking.checkIn} — {booking.checkOut}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3 py-1.5 rounded-lg">
            <span className="font-medium text-[#9a3300]">🌙</span>
            <span className="font-medium">{booking.nightsLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#f8f7f5] px-3 py-1.5 rounded-lg">
            <span className="font-medium text-[#9a3300]">👤</span>
            <span className="font-medium">{guestText}</span>
          </div>
        </div>

        <div className="text-[16px] font-bold text-[#1d1d1d] mt-1 mb-2">
          Total Price: {formatLKR(booking.totalPrice)}
        </div>

        {/* Action row */}
        <div className="mt-auto pt-4 border-t border-[#e8e8e8] flex flex-col sm:flex-row sm:justify-end gap-2">
          <Link href={`/guest/booking/modify?${bookingContext}`} className={`${btnPrimary} bg-[#9a3300] hover:bg-[#852900] justify-center`}>
            <RefreshCw size={14} /> Edit Booking
          </Link>
          <Link href="/guest/messages?type=host" className={`${btnOutline} justify-center`}>
            <MessageSquare size={14} /> Message
          </Link>
          <Link href={`/guest/reviews?propertyId=${booking.propertyId || ""}&bookingId=${booking.id}`} className={`${btnOutline} justify-center`}>
            <Star size={14} /> Keep Review
          </Link>
          <Link href="/guest/order/menu" className={`${btnOutline} justify-center`}>
            <Calendar size={14} /> Order Food
          </Link>
        </div>
      </div>
    </div>
  )
}

