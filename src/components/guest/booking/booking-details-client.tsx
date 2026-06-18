"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft, Calendar, User, MapPin, CheckCircle2,
  Clock, XCircle, Download, Star, RefreshCw, FileText,
  CreditCard, Wallet, Edit3, X, AlertTriangle, AlertCircle,
  Check, ArrowRight
} from "lucide-react"
import { useGuestBookingStore, StoredBooking } from "@/store/guest/booking/booking.store"

// ─────────────────────────────────────────────────────────────────────────────
// Format Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatLKR(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2
  }).format(amount)
}

function getDaysToStart(checkIn: string) {
  const diffTime = new Date(checkIn).getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Started";
  if (diffDays === 0) return "Starts Today";
  if (diffDays === 1) return "Starts Tomorrow";
  return `Starts in ${diffDays} days`;
}

function calculateNights(inDate: string, outDate: string) {
  const d1 = new Date(inDate);
  const d2 = new Date(outDate);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status, isModified }: { status: string, isModified?: boolean }) {
  const styles: Record<string, string> = {
    UPCOMING: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  }
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

  return (
    <div className="flex gap-2">
      <div className={`px-2.5 py-1 rounded-md text-[0.6875rem] font-bold tracking-wide uppercase border backdrop-blur-sm shadow-sm ${styles[status]}`}>
        {displayStatus}
      </div>
      {isModified && status === "UPCOMING" && (
        <div className={`px-2.5 py-1 rounded-md text-[0.6875rem] font-bold tracking-wide uppercase border backdrop-blur-sm shadow-sm bg-amber-500/20 text-amber-400 border-amber-500/30`}>
          MODIFIED
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingDetailsClient({ id }: { id: string }) {
  const { bookings, updateBookingStatus } = useGuestBookingStore()
  
  const [booking, setBooking] = useState<StoredBooking | null>(null)
  
  // UI States
  const [isEditing, setIsEditing] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  
  // Edit Form States
  const [editGuests, setEditGuests] = useState<number>(2)
  const [editCheckIn, setEditCheckIn] = useState<string>("")
  const [editCheckOut, setEditCheckOut] = useState<string>("")
  
  // Cancel Form States
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    const found = bookings.find((b) => b.id === id)
    if (found) {
      setBooking(found)
      setEditGuests(found.guests || 2)
      setEditCheckIn(found.checkIn)
      setEditCheckOut(found.checkOut)
    }
  }, [id, bookings])

  // Real-time calculation of new price when editing
  const { newPrice, diffAmount } = useMemo(() => {
    if (!booking) return { newPrice: 0, diffAmount: 0 }
    if (!isEditing) return { newPrice: booking.totalPrice, diffAmount: 0 }
    
    const origNights = booking.nights || 1;
    const origGuests = booking.guests || 2;
    const newNights = calculateNights(editCheckIn, editCheckOut);
    
    // Rough mock calculation based on original unit price
    const baseUnitPrice = booking.basePrice / origNights / origGuests;
    const newBasePrice = baseUnitPrice * newNights * editGuests;
    const newTaxes = newBasePrice * 0.2; // approx 20%
    const newTotal = newBasePrice + newTaxes - booking.discount;
    
    return {
      newPrice: newTotal,
      diffAmount: newTotal - booking.totalPrice
    }
  }, [booking, isEditing, editCheckIn, editCheckOut, editGuests])

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-[#9a3300] border-[#e8ddcf] rounded-full animate-spin mb-4" />
        <p className="text-[#828282] font-medium">Loading booking details...</p>
      </div>
    )
  }

  const isUpcoming = booking.status === "UPCOMING"
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"
  const daysToStartText = getDaysToStart(booking.checkIn)

  // ─────────────────────────────────────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveChanges = () => {
    // If diffAmount is > 0, they "paid". If < 0, they "requested refund".
    let newRefundStatus = booking.refundStatus;
    if (diffAmount < 0) newRefundStatus = "PENDING";
    
    updateBookingStatus(booking.confirmationCode, {
      guests: editGuests,
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      checkInFormatted: new Date(editCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      checkOutFormatted: new Date(editCheckOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nights: calculateNights(editCheckIn, editCheckOut),
      totalPrice: newPrice,
      isModified: true,
      refundStatus: newRefundStatus
    })
    setIsEditing(false)
  }

  const handleConfirmCancel = () => {
    updateBookingStatus(booking.confirmationCode, {
      status: "CANCELLED",
      cancelReason,
      refundStatus: "PENDING"
    })
    setIsCanceling(false)
  }

  const handleCompleteBooking = () => {
    updateBookingStatus(booking.confirmationCode, {
      status: "COMPLETED",
      paidInFull: true
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render Helpers
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStatusBanner = () => {
    if (isUpcoming) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <Clock className="text-emerald-600 mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-black text-emerald-900">Upcoming Stay ({daysToStartText})</h4>
            <p className="text-xs font-medium text-emerald-700 mt-1">Your reservation is confirmed. We look forward to hosting you!</p>
          </div>
          {/* Manual Complete Action (for testing/flow purposes) */}
          <button 
            onClick={handleCompleteBooking}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Mark Completed
          </button>
        </div>
      )
    }
    if (isCompleted) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <CheckCircle2 className="text-blue-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-blue-900">Stay Completed</h4>
            <p className="text-xs font-medium text-blue-700 mt-1">Thank you for staying with us. We hope to see you again soon.</p>
          </div>
        </div>
      )
    }
    if (isCancelled) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
          <XCircle className="text-red-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-red-900">Booking Cancelled</h4>
            <p className="text-xs font-medium text-red-700 mt-1">
              This reservation has been cancelled. {booking.cancelReason && `Reason: "${booking.cancelReason}"`}
            </p>
            {booking.refundStatus === "PENDING" && (
              <p className="text-xs font-bold text-red-800 mt-2">Refund Status: Pending review by property.</p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      <Link href="/guest/booking" className="inline-flex items-center gap-2 text-sm font-bold mb-6 no-underline text-[#828282] hover:text-[#1d1d1d] transition-colors">
        <ChevronLeft size={16} /> Back to My Bookings
      </Link>

      {/* Hero Header (Full Width of Container) */}
      <div className="relative rounded-[24px] overflow-hidden mb-6 h-[220px] sm:h-[300px] border border-[#e8ddcf] shadow-sm">
        <Image src={booking.imageSrc} alt={booking.property} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={booking.status} isModified={booking.isModified} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1 block">
            Ref: {booking.confirmationCode}
          </span>
          <h1 className="text-[2rem] font-black text-white mb-2 tracking-tight sm:text-[3rem] leading-none">
            {booking.property}
          </h1>
          {booking.roomName && (
            <p className="text-base font-medium text-white/90 flex items-center gap-2 mt-2">
              <BedDouble size={18} /> {booking.roomName}
            </p>
          )}
        </div>
      </div>

      {renderStatusBanner()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Details & Actions) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Reservation Details */}
          <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#1d1d1d]">Reservation Details</h2>
              {isUpcoming && !isEditing && !isCanceling && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-[#9a3300] hover:bg-[#9a3300]/10 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Edit3 size={16} /> Modify
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="bg-[#fdfaf6] border border-[#e8ddcf] rounded-2xl p-6 mb-6">
                <p className="text-xs font-medium text-[#828282] mb-4">Update your dates or guest count. Price changes will be reflected in the payment summary.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Check-in</label>
                    <input type="date" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Check-out</label>
                    <input type="date" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Guests</label>
                  <select value={editGuests} onChange={(e) => setEditGuests(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300]">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#fdfaf6] border border-[#e8ddcf] rounded-2xl p-5">
                  <p className="text-xs font-bold text-[#828282] uppercase tracking-wider mb-2">Check-in</p>
                  <p className="text-base font-black text-[#1d1d1d]">{booking.checkInFormatted || booking.checkIn}</p>
                  <p className="text-xs font-medium text-[#828282] mt-1">From 2:00 PM</p>
                </div>
                <div className="bg-[#fdfaf6] border border-[#e8ddcf] rounded-2xl p-5">
                  <p className="text-xs font-bold text-[#828282] uppercase tracking-wider mb-2">Check-out</p>
                  <p className="text-base font-black text-[#1d1d1d]">{booking.checkOutFormatted || booking.checkOut}</p>
                  <p className="text-xs font-medium text-[#828282] mt-1">Until 12:00 PM</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5 border-t border-[#f2e7d9] pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f2e7d9] flex items-center justify-center shrink-0">
                  <User size={20} className="text-[#9a3300]" />
                </div>
                <div>
                  <p className="text-base font-black text-[#1d1d1d]">{isEditing ? editGuests : booking.guests || 2} Guests</p>
                  <p className="text-sm font-medium text-[#828282]">{isEditing ? calculateNights(editCheckIn, editCheckOut) : booking.nights} Nights</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f2e7d9] flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#9a3300]" />
                </div>
                <div>
                  <p className="text-base font-black text-[#1d1d1d]">Location</p>
                  <p className="text-sm font-medium text-[#828282]">{booking.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Module */}
          {isUpcoming && !isEditing && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8">
              {!isCanceling ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-[#1d1d1d]">Need to cancel?</h3>
                    <p className="text-sm text-[#828282]">Review our cancellation policy and request a refund if applicable.</p>
                  </div>
                  <button onClick={() => setIsCanceling(true)} className="px-6 py-3 rounded-xl border-2 border-red-100 hover:bg-red-50 text-red-600 font-bold transition-colors">
                    Start Cancellation
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-black text-[#1d1d1d] flex items-center gap-2">
                      <AlertTriangle className="text-red-500" /> Cancel Booking
                    </h3>
                    <button onClick={() => setIsCanceling(false)} className="text-[#828282] hover:text-[#1d1d1d]">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="bg-[#fdfaf6] rounded-xl p-4 border border-[#e8ddcf]">
                    <h4 className="text-xs font-bold text-[#1d1d1d] mb-2 uppercase tracking-wider">Cancellation Policy</h4>
                    <p className="text-sm text-[#828282] leading-relaxed">
                      Cancellations made right now may be subject to a partial fee. Your base price will be fully refunded, but service fees are non-refundable. A refund request will automatically be submitted for the eligible amount: <span className="font-bold text-[#1d1d1d]">{formatLKR(booking.basePrice)}</span>.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1d1d1d]">Reason for cancellation <span className="text-red-500">*</span></label>
                    <textarea 
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please tell us why you are canceling..."
                      className="w-full p-4 rounded-xl border border-[#e8ddcf] min-h-[100px] resize-none focus:border-red-300 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setIsCanceling(false)} className="px-6 py-3 rounded-xl border border-[#e8ddcf] font-bold text-[#4f4f4f] hover:bg-[#fdfaf6]">
                      Keep Booking
                    </button>
                    <button 
                      onClick={handleConfirmCancel} 
                      disabled={!cancelReason.trim()}
                      className="px-6 py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirm Cancel & Refund
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed / Cancelled Actions */}
          {(isCompleted || isCancelled) && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 flex flex-wrap gap-4">
              {isCompleted && (
                <>
                  <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#fdfaf6] border border-[#e8ddcf] hover:bg-gray-50 text-[#1d1d1d] text-sm font-bold transition-colors">
                    <Download size={18} /> Download Invoice
                  </button>
                  <Link href={`/guest/reviews?propertyId=${booking.propertyId}`} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold transition-colors no-underline">
                    <Star size={18} /> Rate Your Stay
                  </Link>
                </>
              )}
              {isCancelled && (
                <Link href={`/guest/property/${encodeURIComponent(booking.propertyId)}`} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold transition-colors no-underline">
                  <RefreshCw size={18} /> Rebook This Property
                </Link>
              )}
            </div>
          )}
          
        </div>

        {/* Right Column (Payment & Price) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-black text-[#1d1d1d] mb-6">Payment Summary</h2>
            
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#f2e7d9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdfaf6] border border-[#e8ddcf] flex items-center justify-center">
                  {booking.paymentMethod === "online" ? (
                    <CreditCard size={18} className="text-[#828282]" />
                  ) : (
                    <Wallet size={18} className="text-[#828282]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#828282] font-medium uppercase tracking-wider">Method</span>
                  <span className="text-sm font-bold text-[#1d1d1d]">
                    {booking.paymentMethod === "online" ? "Online Card" : "Pay at Property"}
                  </span>
                </div>
              </div>
              <span className={`text-[11px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${booking.paidInFull ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {booking.paidInFull ? 'Paid' : 'Pending'}
              </span>
            </div>

            {/* Standard Price Breakdown */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#828282] font-medium">Base Price</span>
                <span className="text-[#1d1d1d] font-bold">{formatLKR(isEditing ? newPrice * 0.8 : booking.basePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#828282] font-medium">Taxes & Fees</span>
                <span className="text-[#1d1d1d] font-bold">{formatLKR(isEditing ? newPrice * 0.2 : booking.taxes)}</span>
              </div>
              {booking.discount > 0 && !isEditing && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-600 font-medium">Discount</span>
                  <span className="text-emerald-700 font-bold">-{formatLKR(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-[#f2e7d9] mt-2">
                <span className="text-lg text-[#1d1d1d] font-black">Total</span>
                <span className="text-[#9a3300] font-black text-2xl">{formatLKR(isEditing ? newPrice : booking.totalPrice)}</span>
              </div>
            </div>

            {/* Editing Action Area */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t-2 border-dashed border-[#e8ddcf] animate-in slide-in-from-bottom-4 duration-300">
                <h4 className="text-xs font-bold text-[#828282] uppercase tracking-wider mb-4">Price Difference</h4>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-[#1d1d1d]">Original Paid</span>
                  <span className="text-sm font-bold text-[#828282] line-through">{formatLKR(booking.totalPrice)}</span>
                </div>
                
                {diffAmount > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                    <p className="text-xs font-medium text-amber-800 mb-2">New total is higher. Please pay the difference to confirm modifications.</p>
                    <div className="flex justify-between items-center text-amber-900 font-black text-lg">
                      <span>Due Now</span>
                      <span>+{formatLKR(diffAmount)}</span>
                    </div>
                  </div>
                )}
                {diffAmount < 0 && (
                  <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-800 mb-2">New total is lower. A refund will be issued to your original payment method.</p>
                    <div className="flex justify-between items-center text-emerald-900 font-black text-lg">
                      <span>Refund Amount</span>
                      <span>{formatLKR(Math.abs(diffAmount))}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  <button onClick={handleSaveChanges} className="w-full py-4 rounded-xl bg-[#9a3300] text-white text-sm font-bold hover:bg-[#7a2800] transition-colors flex items-center justify-center gap-2">
                    {diffAmount > 0 ? "Pay Added Value" : diffAmount < 0 ? "Confirm & Request Refund" : "Save Changes"} <ArrowRight size={16} />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="w-full py-3.5 rounded-xl border border-[#e8ddcf] text-[#4f4f4f] text-sm font-bold hover:bg-[#fdfaf6] transition-colors">
                    Discard Changes
                  </button>
                </div>
              </div>
            )}
          </div>
          

        </div>

      </div>
    </div>
  )
}

function BedDouble({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
    </svg>
  )
}
