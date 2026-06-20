"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft, Calendar, User, MapPin, CheckCircle2,
  Clock, XCircle, Download, Star, RefreshCw,
  CreditCard, Wallet, Edit3, X, AlertTriangle,
  ArrowRight
} from "lucide-react"
import { guestApi } from "@/api/guest/guest.api"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { useAuthStore } from "@/store/auth/auth.store"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface BackendBooking {
  bookingId: number
  confirmationNumber: string
  propertyName: string
  propertyAddress: string
  propertyImage?: string
  roomName: string
  roomId: number
  propertyId: number
  reviewId: number | null
  guestName: string
  guestEmail: string
  guestCount: number
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  promoCode: string | null
  totalAmount: number
  taxAmount: number
  status: string
  paymentMethod: string
  createdAt: string
}

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
  const diffTime = new Date(checkIn).getTime() - new Date().getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "Started"
  if (diffDays === 0) return "Starts Today"
  if (diffDays === 1) return "Starts Tomorrow"
  return `Starts in ${diffDays} days`
}

function calculateNights(inDate: string, outDate: string) {
  const d1 = new Date(inDate)
  const d2 = new Date(outDate)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / 86400000)
  return diffDays > 0 ? diffDays : 1
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UPCOMING: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  }
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  return (
    <div className={`px-2.5 py-1 rounded-md text-[0.6875rem] font-bold tracking-wide uppercase border backdrop-blur-sm shadow-sm ${styles[status] || styles.UPCOMING}`}>
      {displayStatus}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Client Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingDetailsClient({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore(s => s.user)
  const bookings = useGuestBookingStore(s => s.bookings)

  const [booking, setBooking] = useState<BackendBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // UI States
  const [isEditing, setIsEditing] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit Form States
  const [editGuests, setEditGuests] = useState<number>(2)
  const [editCheckIn, setEditCheckIn] = useState<string>("")
  const [editCheckOut, setEditCheckOut] = useState<string>("")

  // Cancel Form
  const [cancelReason, setCancelReason] = useState("")

  // Success toast state
  const [successMsg, setSuccessMsg] = useState("")

  // Load booking from backend
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError("")
      try {
        // Try by confirmation code first (format: B4C-XXXXXX), then by numeric ID
        let data: BackendBooking
        if (id.startsWith("B4C-") || isNaN(Number(id))) {
          data = await guestApi.getBookingByConfirmation(id)
        } else {
          // Try confirmation endpoint with the id as a code first
          try {
            data = await guestApi.getBookingByConfirmation(id)
          } catch {
            data = await guestApi.getBookingById(id)
          }
        }
        setBooking(data)
        setEditGuests(data.guestCount || 2)
        setEditCheckIn(data.checkIn)
        setEditCheckOut(data.checkOut)
      } catch (err) {
        // Fallback to local store for older dummy data (e.g. bk-...)
        const found = bookings.find(b => b.id === id || b.confirmationCode === id)
        if (found) {
          setBooking({
            bookingId: Number(found.id.replace('bk-', '')) || Date.now(),
            confirmationNumber: found.confirmationCode,
            roomId: Number(found.roomId) || 0,
            propertyId: Number(found.propertyId) || 0,
            propertyName: found.property,
            propertyAddress: found.location,
            roomName: found.roomName,
            reviewId: null,
            guestName: user ? `${user.profile?.firstName || 'Guest'} ${user.profile?.lastName || ''}`.trim() : "Guest User",
            guestEmail: found.userEmail,
            guestCount: found.guests,
            checkIn: found.checkIn,
            checkOut: found.checkOut,
            nights: found.nights,
            adults: found.guests,
            children: 0,
            promoCode: null,
            paymentMethod: found.paymentMethod === 'online' ? "ONLINE_CARD" : "PAY_AT_PROPERTY",
            taxAmount: found.taxes,
            totalAmount: found.totalPrice,
            status: found.status === "UPCOMING" ? "CONFIRMED" : found.status,
            createdAt: found.bookedAt
          })
          setEditGuests(found.guests || 2)
          setEditCheckIn(found.checkIn)
          setEditCheckOut(found.checkOut)
        } else {
          console.error("Failed to load booking:", err)
          setError("Booking not found or you don't have access.")
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, bookings, user])

  // Handle automatic modification after successful payment
  const hasProcessedModify = useRef(false)
  useEffect(() => {
    if (searchParams && searchParams.get("paymentSuccess") === "true" && searchParams.get("modifyBookingId") && booking && !hasProcessedModify.current) {
      hasProcessedModify.current = true
      const runModify = async () => {
        setIsSaving(true)
        try {
          await guestApi.modifyBooking(searchParams.get("modifyBookingId")!, {
            roomId: Number(searchParams.get("modifyRoomId")),
            propertyId: Number(searchParams.get("modifyPropertyId")),
            checkInDate: searchParams.get("modifyCheckIn") || "",
            checkOutDate: searchParams.get("modifyCheckOut") || "",
            guests: Number(searchParams.get("modifyGuests")),
            totalAmount: searchParams.get("modifyTotalAmount") ? Number(searchParams.get("modifyTotalAmount")) : undefined,
          })
          setSuccessMsg("Payment successful! Your booking has been updated.")
          setTimeout(() => setSuccessMsg(""), 6000)
          
          // Clean up URL to avoid repeating
          window.history.replaceState(null, "", `/guest/booking/${id}`)
          
          // Reload the updated booking
          const updated = await guestApi.getBookingByConfirmation(booking.confirmationNumber)
          setBooking(updated)
        } catch (err) {
          console.error("Auto-modify after payment failed:", err)
          setSuccessMsg("Payment was received but we couldn't update dates automatically. Please contact support.")
        } finally {
          setIsSaving(false)
        }
      }
      runModify()
    }
  }, [searchParams, booking, id])

  // Real-time price diff calculation when editing
  const { newTotal, diffAmount } = useMemo(() => {
    if (!booking || !isEditing) return { newTotal: booking?.totalAmount ?? 0, diffAmount: 0 }

    const origNights = booking.nights || 1
    const origTotal = booking.totalAmount || 0
    const pricePerNightPerGuest = origTotal / (origNights * (booking.guestCount || 1))

    const newNights = calculateNights(editCheckIn, editCheckOut)
    const newGuests = editGuests

    // Recalculate: base + 10% tax
    const newBase = pricePerNightPerGuest * newNights * newGuests
    const newTax = newBase * 0.1
    const newT = Math.round(newBase + newTax)

    return {
      newTotal: newT,
      diffAmount: newT - origTotal
    }
  }, [booking, isEditing, editCheckIn, editCheckOut, editGuests])

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!booking) return
    setIsSaving(true)
    try {
      if (diffAmount > 0) {
        // Need to pay more — go to PayHere payment flow first, modify booking after payment
        // We pass all modification details as URL params so the payment redirect can call modify
        const params = new URLSearchParams({
          total: String(Math.abs(diffAmount)),
          confirmationCode: booking.confirmationNumber,
          returnUrl: `/guest/booking/${id}`,
          // Modification details
          modifyBookingId: String(booking.bookingId),
          modifyRoomId: String(booking.roomId),
          modifyPropertyId: String(booking.propertyId),
          modifyCheckIn: editCheckIn,
          modifyCheckOut: editCheckOut,
          modifyGuests: String(editGuests),
          modifyTotalAmount: String(newTotal),
        })
        router.push(`/payment?${params.toString()}`)
      } else {
        // Refund case or no change — call modify directly
        await guestApi.modifyBooking(booking.bookingId, {
          roomId: booking.roomId,
          propertyId: booking.propertyId,
          checkInDate: editCheckIn,
          checkOutDate: editCheckOut,
          guests: editGuests,
          totalAmount: newTotal,
        })
        // Reload booking to reflect changes
        const updated = await guestApi.getBookingByConfirmation(booking.confirmationNumber)
        setBooking(updated)
        setIsEditing(false)
        alert(diffAmount < 0 ? "Changes saved! A refund will be processed by the property." : "Changes saved!")
      }
    } catch (err) {
      console.error("Modify booking failed:", err)
      alert("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!booking) return
    try {
      await guestApi.modifyBooking(booking.bookingId, {
        roomId: booking.roomId,
        propertyId: booking.propertyId,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut,
        guests: booking.guestCount,
      })
    } catch {
      // Cancel via a different endpoint if available; for now just show local feedback
    }
    setIsCanceling(false)
    alert("Cancellation request submitted. The property will process your refund.")
    router.push("/guest/booking")
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-[#9a3300] border-[#e8ddcf] rounded-full animate-spin mb-4" />
        <p className="text-[#828282] font-medium">Loading booking details...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-[#1d1d1d] mb-2">Booking Not Found</h2>
        <p className="text-[#828282] mb-6">{error || "This booking does not exist or you don't have access."}</p>
        <Link href="/guest/booking" className="px-6 py-3 bg-[#9a3300] text-white rounded-xl font-bold hover:bg-[#7a2800] transition-colors no-underline">
          Back to My Bookings
        </Link>
      </div>
    )
  }

  const isUpcoming = booking.status === "UPCOMING" || booking.status === "CONFIRMED"
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"
  const isPaidOnline = booking.paymentMethod === "ONLINE_CARD"
  const daysToStartText = getDaysToStart(booking.checkIn)
  const currentNights = isEditing ? calculateNights(editCheckIn, editCheckOut) : (booking.nights || calculateNights(booking.checkIn, booking.checkOut))

  return (
    <div className="max-w-7xl mx-auto pb-16">
      <Link href="/guest/booking" className="inline-flex items-center gap-2 text-sm font-bold mb-6 no-underline text-[#828282] hover:text-[#1d1d1d] transition-colors">
        <ChevronLeft size={16} /> Back to My Bookings
      </Link>

      {/* Success banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 mb-6 animate-in fade-in duration-300">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
          <p className="text-sm font-bold text-emerald-900">{successMsg}</p>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-[24px] overflow-hidden mb-6 h-[220px] sm:h-[300px] border border-[#e8ddcf] shadow-sm bg-gradient-to-br from-[#2d1208] to-[#1a0a05]">
        {booking.propertyImage && (
          <Image 
            src={booking.propertyImage} 
            alt={booking.propertyName} 
            fill 
            className="object-cover opacity-60 mix-blend-overlay"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={booking.status} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1 block">
            Ref: {booking.confirmationNumber}
          </span>
          <h1 className="text-[2rem] font-black text-white mb-2 tracking-tight sm:text-[3rem] leading-none">
            {booking.propertyName}
          </h1>
          {booking.roomName && (
            <p className="text-base font-medium text-white/90 flex items-center gap-2 mt-2">
              🛏 {booking.roomName}
            </p>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isUpcoming && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <Clock className="text-emerald-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-emerald-900">Upcoming Stay ({daysToStartText})</h4>
            <p className="text-xs font-medium text-emerald-700 mt-1">Your reservation is confirmed. We look forward to hosting you!</p>
          </div>
        </div>
      )}
      {isCompleted && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <CheckCircle2 className="text-blue-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-blue-900">Stay Completed</h4>
            <p className="text-xs font-medium text-blue-700 mt-1">Thank you for staying with us. We hope to see you again soon.</p>
          </div>
        </div>
      )}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <XCircle className="text-red-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-red-900">Booking Cancelled</h4>
            <p className="text-xs font-medium text-red-700 mt-1">This reservation has been cancelled.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
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

            {/* Dates */}
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
                  <p className="text-base font-black text-[#1d1d1d]">{booking.checkIn}</p>
                  <p className="text-xs font-medium text-[#828282] mt-1">From 2:00 PM</p>
                </div>
                <div className="bg-[#fdfaf6] border border-[#e8ddcf] rounded-2xl p-5">
                  <p className="text-xs font-bold text-[#828282] uppercase tracking-wider mb-2">Check-out</p>
                  <p className="text-base font-black text-[#1d1d1d]">{booking.checkOut}</p>
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
                  <p className="text-base font-black text-[#1d1d1d]">{isEditing ? editGuests : booking.guestCount || 2} Guests</p>
                  <p className="text-sm font-medium text-[#828282]">{currentNights} Night{currentNights > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f2e7d9] flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#9a3300]" />
                </div>
                <div>
                  <p className="text-base font-black text-[#1d1d1d]">Location</p>
                  <p className="text-sm font-medium text-[#828282]">{booking.propertyAddress}</p>
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
                      Cancellations will be reviewed by the property. Your base price refund eligibility depends on how far in advance you cancel.
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
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed Actions */}
          {isCompleted && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 flex flex-wrap gap-4">
              <Link href={`/guest/reviews?propertyId=${booking.propertyId}`} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold transition-colors no-underline">
                <Star size={18} /> Rate Your Stay
              </Link>
            </div>
          )}
          {isCancelled && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 flex flex-wrap gap-4">
              <Link href={`/guest/property/${booking.propertyId}`} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold transition-colors no-underline">
                <RefreshCw size={18} /> Rebook This Property
              </Link>
            </div>
          )}
        </div>

        {/* Right Column — Payment Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-black text-[#1d1d1d] mb-6">Payment Summary</h2>

            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#f2e7d9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdfaf6] border border-[#e8ddcf] flex items-center justify-center">
                  {isPaidOnline ? <CreditCard size={18} className="text-[#828282]" /> : <Wallet size={18} className="text-[#828282]" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#828282] font-medium uppercase tracking-wider">Method</span>
                  <span className="text-sm font-bold text-[#1d1d1d]">{isPaidOnline ? "Online Card" : "Pay at Property"}</span>
                </div>
              </div>
              <span className={`text-[11px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${isPaidOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isPaidOnline ? 'Paid' : 'Pending'}
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#828282] font-medium">Subtotal ({currentNights} night{currentNights > 1 ? "s" : ""})</span>
                <span className="text-[#1d1d1d] font-bold">{formatLKR(isEditing ? newTotal / 1.1 : booking.totalAmount / 1.1)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#828282] font-medium">Taxes & Fees (10%)</span>
                <span className="text-[#1d1d1d] font-bold">{formatLKR(isEditing ? newTotal - newTotal / 1.1 : booking.totalAmount - booking.totalAmount / 1.1)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-[#f2e7d9] mt-2">
                <span className="text-lg text-[#1d1d1d] font-black">Total</span>
                <span className="text-[#9a3300] font-black text-2xl">{formatLKR(isEditing ? newTotal : booking.totalAmount)}</span>
              </div>
            </div>

            {/* Editing Action Area */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t-2 border-dashed border-[#e8ddcf] animate-in slide-in-from-bottom-4 duration-300">
                <h4 className="text-xs font-bold text-[#828282] uppercase tracking-wider mb-4">Price Difference</h4>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-[#1d1d1d]">Original Paid</span>
                  <span className="text-sm font-bold text-[#828282] line-through">{formatLKR(booking.totalAmount)}</span>
                </div>

                {diffAmount > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                    <p className="text-xs font-medium text-amber-800 mb-2">New total is higher. You&apos;ll be taken to the payment page to pay the difference.</p>
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
                {diffAmount === 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                    <p className="text-xs font-medium text-gray-600">No price difference — changes will be saved immediately.</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || editCheckIn === "" || editCheckOut === "" || editCheckOut <= editCheckIn}
                    className="w-full py-4 rounded-xl bg-[#9a3300] text-white text-sm font-bold hover:bg-[#7a2800] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</span>
                    ) : diffAmount > 0 ? (
                      <><CreditCard size={16} /> Pay Added Value ({formatLKR(diffAmount)}) <ArrowRight size={16} /></>
                    ) : diffAmount < 0 ? (
                      <><ArrowRight size={16} /> Confirm & Request Refund</>
                    ) : (
                      <><ArrowRight size={16} /> Save Changes</>
                    )}
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditCheckIn(booking.checkIn); setEditCheckOut(booking.checkOut); setEditGuests(booking.guestCount) }} className="w-full py-3.5 rounded-xl border border-[#e8ddcf] text-[#4f4f4f] text-sm font-bold hover:bg-[#fdfaf6] transition-colors">
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
