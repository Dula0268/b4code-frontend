"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import CalendarPicker from "@/components/shared/forms/calendar-picker"
import {
  ChevronLeft, Calendar, User, MapPin, CheckCircle2,
  Clock, XCircle, Download, Star, RefreshCw, FileText,
  CreditCard, Wallet, Edit3, X, AlertTriangle, AlertCircle,
  Check, ArrowRight, Info
} from "lucide-react"
import { guestApi } from "@/api/guest/guest.api"

export interface StoredBooking {
  id: string
  propertyId: string
  roomId: string
  userEmail: string
  property: string
  location: string
  imageSrc: string
  checkIn: string
  checkOut: string
  checkInFormatted?: string
  checkOutFormatted?: string
  guestsLabel?: string
  guests?: number
  totalPrice: number
  basePrice: number
  taxes: number
  discount: number
  nightsLabel: string
  nights?: number
  paymentMethod: string
  paidInFull: boolean
  status: "UPCOMING" | "CHECKED_IN" | "COMPLETED" | "CANCELLED"
  roomName: string
  roomQuantity: number
  confirmationCode: string
  isModified?: boolean
  cancelReason?: string
  disputeStatus?: string
  disputeAmount?: number
}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Format Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sub-components
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusBadge({ status, isModified }: { status: string, isModified?: boolean }) {
  const styles: Record<string, string> = {
    UPCOMING: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    CHECKED_IN: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    COMPLETED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  }
  const labels: Record<string, string> = {
    UPCOMING: "Upcoming",
    CHECKED_IN: "Currently Staying",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }
  const displayStatus = labels[status] ?? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase())

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Client Component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function BookingDetailsClient({ id, initialTab = "modify", pageMode = "view" }: { id: string, initialTab?: "modify" | "cancel" | "refund", pageMode?: "view" | "modify" | "cancel" }) {
  const [booking, setBooking] = useState<StoredBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // UI States
  const [activeTab, setActiveTab] = useState<"modify" | "cancel" | "refund" | "none">(initialTab)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  
  const [cancelReasonCategory, setCancelReasonCategory] = useState<string>("Change of plans")
  
  // Edit Form States
  const [propertyDetail, setPropertyDetail] = useState<any>(null)
  const [editRoomId, setEditRoomId] = useState<string>("")
  const [editGuests, setEditGuests] = useState<number>(2)
  const [editRoomQuantity, setEditRoomQuantity] = useState<number>(1)
  const [editCheckIn, setEditCheckIn] = useState<string>("")
  const [editCheckOut, setEditCheckOut] = useState<string>("")
  const [calOpen, setCalOpen] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)
  
  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Fetch property details when booking loads
  useEffect(() => {
    if (booking && !propertyDetail) {
      guestApi.getPropertyDetail(booking.propertyId).then(setPropertyDetail).catch(console.error)
    }
  }, [booking, propertyDetail])

  // Cancel Form States
  const [cancelReason, setCancelReason] = useState("")
  const [cancelAck, setCancelAck] = useState(false)

  // Reset the cancellation acknowledgement whenever the guest leaves the cancel tab,
  // so a stale confirmation can't silently carry over to a later visit.
  useEffect(() => {
    if (activeTab !== "cancel") setCancelAck(false)
  }, [activeTab])

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true)
        const b = await guestApi.getBookingByConfirmation(id)
        
        // Map API response to local state structure
        const checkInDate = new Date(b.checkIn)
        const checkOutDate = new Date(b.checkOut)
        const diffDays = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000))
        
        const mappedBooking: StoredBooking = {
          id: String(b.id),
          propertyId: String(b.propertyId),
          roomId: String(b.roomId),
          userEmail: b.guestEmail || "",
          property: b.propertyName || "Property",
          location: b.propertyAddress || "Location",
          imageSrc: b.propertyImage || "/images/placeholder-property.jpg",
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          checkInFormatted: checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          checkOutFormatted: checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          guests: b.adults || 1,
          totalPrice: b.totalAmount || 0,
          basePrice: b.totalAmount || 0, // Placeholder, real implementation should use price breakdown
          taxes: 0,
          discount: 0,
          nights: diffDays,
          nightsLabel: `${diffDays} Night(s)`,
          paymentMethod: b.paymentMethod === "PAY_AT_PROPERTY" ? "property" : "online",
          paidInFull: b.paymentMethod !== "PAY_AT_PROPERTY",
          status: (b.status === "COMPLETED" ? "COMPLETED" : b.status === "CANCELLED" ? "CANCELLED" : b.status === "CHECKED_IN" ? "CHECKED_IN" : "UPCOMING") as any,
          roomName: b.roomName || "Room",
          roomQuantity: b.roomQuantity || 1,
          confirmationCode: b.confirmationCode,
          disputeStatus: b.disputeStatus,
          disputeAmount: b.disputeAmount,
        }

        setBooking(mappedBooking)
        setEditGuests(mappedBooking.guests || 2)
        setEditRoomQuantity(mappedBooking.roomQuantity || 1)
        setEditCheckIn(mappedBooking.checkIn)
        setEditCheckOut(mappedBooking.checkOut)
      } catch (error) {
        console.error("Failed to load booking details:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [id])

  // Once the real status is known, make sure the active tab can't be stuck on
  // "modify"/"cancel" for a booking that isn't UPCOMING (e.g. CHECKED_IN via a
  // stale route param or the default initialTab) — those actions are only
  // ever valid for UPCOMING bookings.
  useEffect(() => {
    if (!booking || pageMode !== "view") return
    if (booking.status === "UPCOMING") return
    if (booking.status === "CANCELLED" && booking.disputeStatus) {
      setActiveTab("refund")
      return
    }
    setActiveTab("none")
  }, [booking, pageMode])

  // Real-time calculation of new price when editing
  const { newPrice, diffAmount, hasChanges, newBasePrice, newTaxes, origBasePrice, origTaxes, pricePerNight, newNights } = useMemo(() => {
    if (!booking) return { newPrice: 0, diffAmount: 0, hasChanges: false, newBasePrice: 0, newTaxes: 0, origBasePrice: 0, origTaxes: 0, pricePerNight: 0, newNights: 1 }
    
    const origNights = booking.nights || 1;
    const newNights = calculateNights(editCheckIn, editCheckOut) || 1; // prevent 0 nights
    
    const origBasePrice = booking.totalPrice + booking.discount;
    const origTaxes = 0;
    
    const changes = editCheckIn !== booking.checkIn || 
                    editCheckOut !== booking.checkOut || 
                    editGuests !== (booking.guests || 2) || 
                    editRoomQuantity !== (booking.roomQuantity || 1) ||
                    (editRoomId && editRoomId !== booking.roomId);

    if (!changes) return { newPrice: booking.totalPrice, diffAmount: 0, hasChanges: false, newBasePrice: origBasePrice, newTaxes: origTaxes, origBasePrice, origTaxes }

    // Use actual room data from backend
    const currentRoomId = editRoomId || booking.roomId;
    const room = propertyDetail?.roomTypes?.find((r: any) => String(r.id) === String(currentRoomId));
    
    // Fallback if property details haven't loaded yet
    const fallbackPricePerNight = origBasePrice / origNights;
    const pricePerNight = room?.pricePerNight || fallbackPricePerNight;

    // Price is now calculated solely on Room Price * Nights * Room Quantity
    const newBasePriceMock = pricePerNight * newNights * (editRoomQuantity || 1);
    const newTaxesMock = 0;
    
    const newTotalBeforeDiscount = newBasePriceMock;
    const newTotal = newTotalBeforeDiscount - booking.discount;
    
    return {
      newPrice: newTotal,
      diffAmount: newTotal - booking.totalPrice,
      hasChanges: true,
      newBasePrice: newBasePriceMock,
      newTaxes: newTaxesMock,
      origBasePrice,
      origTaxes,
      pricePerNight,
      newNights
    }
  }, [booking, editCheckIn, editCheckOut, editGuests, editRoomId, editRoomQuantity, propertyDetail])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (!booking) {
      return (
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-100 rounded-xl mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      )
    }

  const isUpcoming = booking.status === "UPCOMING"
  const isCheckedIn = booking.status === "CHECKED_IN"
  const isCompleted = booking.status === "COMPLETED"
  const isCancelled = booking.status === "CANCELLED"
  const daysToStartText = getDaysToStart(booking.checkIn)

  // Guard the dedicated /modify and /cancel routes: those actions are only
  // ever valid while a booking is still UPCOMING. If a guest lands here via a
  // stale link/bookmark after checking in (or after the stay has completed or
  // been cancelled), show a clear explanation instead of a broken/empty form.
  if ((pageMode === "modify" || pageMode === "cancel") && !isUpcoming) {
    const reasonText = isCheckedIn
      ? "You've already checked in, so this booking's room and dates are locked in. Please speak to our front desk for any changes."
      : isCompleted
      ? "This stay has already been completed, so it can no longer be modified or cancelled."
      : "This booking has already been cancelled."
    return (
      <div className="max-w-3xl mx-auto pb-16">
        <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-8 sm:p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
            <AlertCircle className="text-amber-500" size={26} />
          </div>
          <StatusBadge status={booking.status} isModified={booking.isModified} />
          <h2 className="text-xl font-black text-[#1d1d1d]">
            {pageMode === "modify" ? "Modification unavailable" : "Cancellation unavailable"}
          </h2>
          <p className="text-sm text-[#6f6254] max-w-md">{reasonText}</p>
          <Link
            href="/guest/booking"
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold no-underline transition-colors"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    )
  }

  // Calculate cancellation fee based on property's freeCancellation policy
  const isFreeCancellationProperty = propertyDetail?.freeCancellation ?? false;
  const checkInDateForPolicy = booking ? new Date(booking.checkIn) : new Date();
  const freeCancellationDeadline = new Date(checkInDateForPolicy);
  freeCancellationDeadline.setDate(freeCancellationDeadline.getDate() - 3);
  freeCancellationDeadline.setHours(23, 59, 59, 999);
  
  const now = new Date();
  const isWithinFreeWindow = isFreeCancellationProperty && now <= freeCancellationDeadline;
  
  // If payment method is PAY_AT_PROPERTY, there is no cancellation fee
  const isPayAtProperty = booking?.paymentMethod === "property" || !booking?.paidInFull;
  const isFreeCancellation = isPayAtProperty || isWithinFreeWindow;
  const cancellationFee = isFreeCancellation ? 0 : (booking?.totalPrice || 0) * 0.10;
  const eligibleRefund = Math.max(0, (booking?.totalPrice || 0) - cancellationFee);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Action Handlers
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSaveChanges = async () => {
    if (!booking) return;
    setErrorMessage("");
    
    try {
      setLoading(true);

      // Calculate the amount due client-side first to decide what to do.
      const amountDue = !booking.paidInFull ? newPrice : (diffAmount > 0 ? diffAmount : 0);

      if (amountDue > 0) {
        // Payment is required BEFORE modifying the booking.
        // Store the pending modification in sessionStorage so the payment
        // success handler can pick it up and commit the change.
        const pendingModification = {
          bookingId: booking.id,
          confirmationCode: booking.confirmationCode,
          roomId: Number(editRoomId || booking.roomId),
          propertyId: Number(booking.propertyId),
          checkInDate: editCheckIn,
          checkOutDate: editCheckOut,
          guests: editGuests,
          roomQuantity: editRoomQuantity,
        };
        localStorage.setItem("pendingBookingModification", JSON.stringify(pendingModification));

        const params = new URLSearchParams();
        params.set("total", amountDue.toFixed(2));
        params.set("confirmationCode", booking.confirmationCode);
        params.set("bookingId", booking.id);
        params.set("email", booking.userEmail);
        params.set("firstName", booking.userEmail.split("@")[0] || "Guest");
        params.set("lastName", "");
        params.set("type", "modification");
        router.push(`/payment?${params.toString()}`);
        return;
      }

      // No payment required â€“ commit the modification immediately.
      const res = await guestApi.modifyBooking(booking.id, {
        roomId: Number(editRoomId || booking.roomId),
        propertyId: Number(booking.propertyId),
        checkInDate: editCheckIn,
        checkOutDate: editCheckOut,
        guests: editGuests,
        roomQuantity: editRoomQuantity
      });

      // Re-fetch booking from backend
      const updated = await guestApi.getBookingByConfirmation(id);
      
      const checkInDate = new Date(updated.checkIn);
      const checkOutDate = new Date(updated.checkOut);
      const diffDays = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000));
      
      const mappedBooking: StoredBooking = {
        ...booking,
        roomId: String(updated.roomId),
        roomName: updated.roomName || booking.roomName,
        roomQuantity: updated.roomQuantity || booking.roomQuantity,
        checkIn: updated.checkIn,
        checkOut: updated.checkOut,
        checkInFormatted: checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        checkOutFormatted: checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        guests: updated.adults || booking.guests,
        totalPrice: updated.totalAmount || booking.totalPrice,
        nights: diffDays,
        nightsLabel: `${diffDays} Night(s)`,
        isModified: true,
        disputeStatus: updated.disputeStatus,
        disputeAmount: updated.disputeAmount,
      };
      
      setBooking(mappedBooking);
      setEditCheckIn(updated.checkIn);
      setEditCheckOut(updated.checkOut);
      setEditGuests(updated.adults || 2);

      if (res.refundAmount > 0) {
        
      } else {
        
      }

      import("sonner").then(({ toast }) => {
        toast.success("Booking modified successfully!");
      });
      router.push("/guest/booking");

    } catch (error: any) {
      console.error("Failed to modify booking:", error);
      setErrorMessage(error.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmCancel = async () => {
    setErrorMessage("");
    
    try {
      setLoading(true);
      const fullReason = cancelReason.trim() ? `${cancelReasonCategory}: ${cancelReason}` : cancelReasonCategory;
      const res = await guestApi.cancelBooking(booking.id, fullReason)
      
      const mappedBooking: StoredBooking = {
        ...booking,
        status: res.status,
        cancelReason: res.cancellationReason || cancelReason,
        disputeStatus: res.disputeStatus,
        disputeAmount: res.disputeAmount
      }

      setBooking(mappedBooking)
      
      import("sonner").then(({ toast }) => {
        toast.success("Booking cancelled successfully!");
      });
      router.push("/guest/booking");
      
    } catch (error: any) {
      console.error("Failed to cancel booking:", error)
      setErrorMessage(error.response?.data?.message || "Failed to cancel booking. Please try again.")
    } finally {
      setLoading(false);
    }
  }

  const handleCompleteBooking = async () => {
    setErrorMessage("");
    try {
      await guestApi.completeBooking(booking.id)
      router.push('/guest/booking')
    } catch (error: any) {
      console.error("Failed to complete booking:", error)
      setErrorMessage(error.response?.data?.message || "Failed to complete booking.")
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Render Helpers

  return (
    <div className="max-w-7xl mx-auto pb-16 relative">
      {/* Error Notification */}
      <div
        className={[
          "fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#e53935] text-white text-[13px] font-medium",
          "px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 whitespace-nowrap",
          errorMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <span className="text-[16px]">⚠️</span>
        {errorMessage}
      </div>


      {pageMode === "view" && (
        <>
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
                <div className="flex items-center gap-2 mt-3 text-[16px] font-medium text-[#2d2116] bg-white/50 w-fit px-4 py-2 rounded-xl border border-[#eadfce]">
                  <BedDouble size={18} /> {booking.roomQuantity && booking.roomQuantity > 1 ? `${booking.roomQuantity}x ` : ""}{booking.roomName}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {(isUpcoming || (isCancelled && booking.disputeStatus)) && pageMode === "view" && (
        <div className="flex bg-white rounded-[20px] border border-[#e8ddcf] p-2 mb-6 gap-2 overflow-x-auto">
          {isUpcoming && (
            <>
              <button 
                onClick={() => setActiveTab("modify")}
                className={`whitespace-nowrap flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-colors ${activeTab === "modify" ? "bg-[#9a3300] text-white shadow-md" : "text-[#828282] hover:bg-[#fdfaf6]"}`}
              >
                Modify Booking
              </button>
              <button 
                onClick={() => setActiveTab("cancel")}
                className={`whitespace-nowrap flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-colors ${activeTab === "cancel" ? "bg-[#9a3300] text-white shadow-md" : "text-[#828282] hover:bg-[#fdfaf6]"}`}
              >
                Cancel Booking
              </button>
              <button 
                onClick={handleCompleteBooking}
                className={`whitespace-nowrap flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-colors text-emerald-600 border border-emerald-200 hover:bg-emerald-50`}
              >
                Complete Stay (Test)
              </button>
            </>
          )}
          {booking.disputeStatus && pageMode === "view" && (
            <button 
              onClick={() => setActiveTab("refund" as any)}
              className={`whitespace-nowrap flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-colors ${activeTab === "refund" ? "bg-[#9a3300] text-white shadow-md" : "text-[#828282] hover:bg-[#fdfaf6]"}`}
            >
              Refund Status
            </button>
          )}
        </div>
      )}

      {isCheckedIn && pageMode === "view" && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <CheckCircle2 className="text-teal-600 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-teal-900">Currently Staying</h4>
            <p className="text-xs font-medium text-teal-700 mt-1">Modifications aren&apos;t available once you&apos;ve checked in — please speak to our front desk for changes.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Details & Actions) */}
        <div className={`flex flex-col gap-8 ${activeTab === "refund" ? "lg:col-span-3" : "lg:col-span-2"}`}>
          
          {/* Context Header for Modify and Cancel Mode */}
          {(pageMode === "modify" || pageMode === "cancel") && (
            <div className="bg-[#fdfaf6] border border-[#e8ddcf] rounded-[24px] p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-[#9f8f7c] uppercase tracking-widest block mb-1">
                    Ref: {booking.confirmationCode}
                  </span>
                  <h3 className="text-xl font-black text-[#1d1d1d]">{booking.property}</h3>
                  {booking.roomName && (
                    <p className="text-sm font-medium text-[#6f6254] flex items-center gap-1 mt-1">
                      <BedDouble size={16} className="text-[#9a3300]" /> 
                      {booking.roomQuantity && booking.roomQuantity > 1 ? `${booking.roomQuantity}x ` : ""}{booking.roomName}
                    </p>
                  )}
                </div>
                <StatusBadge status={booking.status} isModified={booking.isModified} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#eadfce]">
                 <div>
                   <p className="text-[10px] font-bold text-[#828282] uppercase tracking-wider mb-1">Original Check-in</p>
                   <p className="text-sm font-bold text-[#1d1d1d]">{booking.checkInFormatted}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-[#828282] uppercase tracking-wider mb-1">Original Check-out</p>
                   <p className="text-sm font-bold text-[#1d1d1d]">{booking.checkOutFormatted}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-[#828282] uppercase tracking-wider mb-1">Original Guests</p>
                   <p className="text-sm font-bold text-[#1d1d1d]">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                 </div>
              </div>
            </div>
          )}

          {/* Reservation Details */}
          {(!isUpcoming || activeTab === "modify") && activeTab !== "refund" && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-[#1d1d1d]">{pageMode === "modify" ? "What you can modify" : "Reservation Details"}</h2>
              </div>
              
              {isUpcoming ? (
                <div className="flex flex-col gap-6">
                  {pageMode === "modify" && (
                    <p className="text-sm text-[#828282]">
                      Update your dates, room type, or guest count. Changes to the total price will be reflected in the payment summary.
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative" ref={calRef}>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Dates <span className="text-[10px] font-medium text-amber-600 normal-case ml-1">(Live Availability)</span></label>
                      <div 
                        onClick={() => setCalOpen(!calOpen)}
                        className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium cursor-pointer flex justify-between items-center hover:border-[#9a3300] transition-colors"
                      >
                        <span>{editCheckIn && editCheckOut ? `${new Date(editCheckIn + "T00:00:00").toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${new Date(editCheckOut + "T00:00:00").toLocaleDateString('en-US', {month:'short', day:'numeric'})}` : 'Select Dates'}</span>
                        <Calendar size={16} className="text-[#9a3300]" />
                      </div>
                      {calOpen && (
                        <div className="absolute top-[70px] left-0 z-[100] bg-white shadow-2xl border border-[#e8ddcf] rounded-xl">
                          <CalendarPicker
                            checkIn={editCheckIn ? new Date(editCheckIn + "T00:00:00") : null}
                            checkOut={editCheckOut ? new Date(editCheckOut + "T00:00:00") : null}
                            onChange={(ci, co) => {
                              setEditCheckIn(ci ? ci.toISOString().split("T")[0] : "");
                              setEditCheckOut(co ? co.toISOString().split("T")[0] : "");
                            }}
                            onComplete={() => setCalOpen(false)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Room Type</label>
                      <select value={editRoomId || booking.roomId} onChange={(e) => setEditRoomId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300]">
                        {propertyDetail?.roomTypes?.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        )) || <option value={booking.roomId}>{booking.roomName}</option>}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Guests</label>
                      <select value={editGuests} onChange={(e) => setEditGuests(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300]">
                        {Array.from({ length: (propertyDetail?.roomTypes?.find((r: any) => String(r.id) === String(editRoomId || booking.roomId))?.maxGuests || 6) * editRoomQuantity }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">No of Rooms</label>
                      <select value={editRoomQuantity} onChange={(e) => setEditRoomQuantity(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300]">
                        {Array.from({ length: Math.max(1, (propertyDetail?.roomTypes?.find((r: any) => String(r.id) === String(editRoomId || booking.roomId))?.availableCount || 1) + (String(editRoomId || booking.roomId) === String(booking.roomId) ? booking.roomQuantity : 0)) }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d1d1d] uppercase tracking-wide">Special Requests / Notes</label>
                    <textarea 
                      placeholder="Any special requests? (Note: Subject to property availability)"
                      className="w-full px-4 py-3 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:outline-none focus:border-[#9a3300] resize-none h-[100px]"
                    />
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
            </div>
          )}

          {/* Cancellation Module */}
          {isUpcoming && activeTab === "cancel" && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black text-[#1d1d1d] flex items-center gap-2">
                    <AlertTriangle className="text-red-500" /> Cancel Booking
                  </h3>
                </div>
                
                {/* Cancellation Policy Summary */}
                <div className="bg-[#fdfaf6] rounded-xl p-5 border border-[#e8ddcf]">
                  <h4 className="text-sm font-bold text-[#1d1d1d] mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Info size={16} className="text-[#828282]"/> Cancellation Policy
                  </h4>
                  {propertyDetail?.cancellationPolicy && (
                    <p className="text-sm text-[#4f4f4f] mb-4 whitespace-pre-wrap">
                      {propertyDetail.cancellationPolicy}
                    </p>
                  )}
                  {isPayAtProperty ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-[#1d1d1d]">
                        You chose to pay at the property. No cancellation fee applies.
                      </p>
                      <p className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
                        ✓ Free to cancel.
                      </p>
                    </div>
                  ) : isFreeCancellationProperty ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-[#1d1d1d]">
                        Free cancellation until {freeCancellationDeadline.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, 11:59 PM.
                      </p>
                      {isWithinFreeWindow ? (
                        <p className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
                          ✓ You are within the free cancellation window. No fees apply.
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg w-fit border border-red-100">
                          ⚠️ The free cancellation window has passed. A 10% cancellation fee applies.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-[#1d1d1d]">
                        This property does not offer free cancellation.
                      </p>
                      <p className="text-sm text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg w-fit border border-red-100">
                        ⚠️ A 10% cancellation fee applies immediately upon booking.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm font-bold text-[#1d1d1d]">Reason for cancellation <span className="text-red-500">*</span></label>
                  <select 
                    value={cancelReasonCategory}
                    onChange={(e) => setCancelReasonCategory(e.target.value)}
                    className="w-full p-4 rounded-xl border border-[#e8ddcf] bg-white text-sm font-medium focus:border-red-300 focus:outline-none mb-2"
                  >
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found another property">Found another property</option>
                    <option value="Property issue">Property issue</option>
                    <option value="Other">Other</option>
                  </select>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Additional details (optional)..."
                    className="w-full p-4 rounded-xl border border-[#e8ddcf] min-h-[100px] resize-none focus:border-red-300 focus:outline-none"
                  />
                </div>

                {/* Button moved to Payment Summary */}
              </div>
            </div>
          )}

          {/* Complete Stay Module Removed */}

          {/* Refund Status Module */}
          {booking.disputeStatus && activeTab === "refund" && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black text-[#1d1d1d] flex items-center gap-2">
                    <Wallet className="text-[#9a3300]" /> Refund Details
                  </h3>
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-md ${
                    booking.disputeStatus === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {booking.disputeStatus === 'RESOLVED' ? 'Processed' : 'Pending'}
                  </span>
                </div>
                
                <div className="bg-[#fdfaf6] rounded-xl p-4 border border-[#e8ddcf]">
                  <p className="text-sm text-[#828282] leading-relaxed mb-4">
                    You have requested a refund of <span className="font-bold text-[#1d1d1d]">{formatLKR(booking.disputeAmount || 0)}</span> due to a booking modification or cancellation.
                  </p>
                  
                  {booking.disputeStatus !== 'RESOLVED' ? (
                    <div className="flex gap-3 items-start bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-xs text-amber-800">
                        <strong>Pending Admin Review:</strong> Your request has been received and is currently being reviewed by our moderation team. You will be notified once it is processed.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-start bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-xs text-emerald-800">
                        <strong>Refund Approved & Processed:</strong> Your refund has been approved by the admin and processed. It may take a few business days to reflect in your original payment method.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Completed / Cancelled Actions */}
          {(isCompleted || isCancelled) && activeTab !== "refund" && (
            <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 flex flex-wrap gap-4">
              {isCompleted && (
                  <Link href={`/guest/booking/${booking.confirmationCode || booking.id}/review`} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-sm font-bold transition-colors no-underline">
                    <Star size={18} /> Leave Review
                  </Link>
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
        <div className={`flex flex-col gap-6 ${activeTab === "refund" ? "hidden" : ""}`}>
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
                  <span className="text-xs text-[#828282] font-medium uppercase tracking-wider">Payment Status</span>
                  <span className="text-sm font-bold text-[#1d1d1d]">
                    {booking.paidInFull ? "Fully Paid" : "Pending Payment"}
                  </span>
                </div>
              </div>
              <span className={`text-[11px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${booking.paidInFull ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {booking.paidInFull ? 'Paid' : 'Pending'}
              </span>
            </div>

            {/* Original Price Breakdown (Always shown for modify & cancel) */}
            {(activeTab === "modify" || activeTab === "cancel") && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-[#1d1d1d] font-black">Original Total</span>
                  <span className="text-[#1d1d1d] font-black text-lg">{formatLKR(booking.totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Cancel Section specific logic */}
            {activeTab === "cancel" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300 border-t border-[#f2e7d9] pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#828282] font-medium">Cancellation Fee</span>
                  <span className={`font-bold ${isFreeCancellation ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isFreeCancellation ? 'Free' : formatLKR(cancellationFee)}
                  </span>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#4f4f4f] font-medium bg-[#fdfaf6] border border-[#e8ddcf] rounded-xl p-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cancelAck}
                    onChange={(e) => setCancelAck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#9a3300] cursor-pointer shrink-0"
                  />
                  I understand this cancellation is final and cannot be undone.
                </label>

                {!booking.paidInFull ? (
                  <div className="bg-amber-50 rounded-xl p-4 mt-2 border border-amber-200">
                    <p className="text-sm font-bold text-amber-900 mb-1">Amount to Pay</p>
                    <p className="text-xl font-black text-amber-700">{formatLKR(cancellationFee)}</p>
                    <p className="text-xs text-amber-800/80 mt-2">You need to pay this amount to cancel the booking.</p>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={!cancelReasonCategory || !cancelAck || loading}
                      className="w-full mt-4 py-3 rounded-xl bg-[#9a3300] text-white text-sm font-bold hover:bg-[#7a2800] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Cancellation"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-xl p-4 mt-2 border border-emerald-200">
                    <p className="text-sm font-bold text-emerald-900 mb-1">Eligible Refund</p>
                    <p className="text-xl font-black text-emerald-700">{formatLKR(eligibleRefund)}</p>
                    <p className="text-xs text-emerald-800/80 mt-2">You can request a refund for this amount.</p>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={!cancelReasonCategory || !cancelAck || loading}
                      className="w-full mt-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Cancel & Send Refund Request"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Modify Section specific logic */}
            {activeTab === "modify" && hasChanges && (
              <div className="animate-in fade-in duration-300 border-t border-[#f2e7d9] pt-4">
                <div className="flex flex-col gap-4 mb-6">

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#1d1d1d] font-black">New Total Price</span>
                    <span className="text-[#9a3300] font-black text-lg">{formatLKR(newPrice)}</span>
                  </div>
                </div>

                {diffAmount < 0 && booking.paidInFull ? (
                  <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
                    <p className="text-sm font-bold text-emerald-900 mb-1">Refund Amount</p>
                    <p className="text-xl font-black text-emerald-700">{formatLKR(Math.abs(diffAmount))}</p>
                    <p className="text-xs text-emerald-800/80 mt-2">You can request a refund for this difference.</p>
                    <div className="flex flex-col gap-3 mt-4">
                      <button onClick={handleSaveChanges} disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Modify & Send Refund Request"}
                      </button>
                      <button onClick={() => { setEditCheckIn(booking.checkIn); setEditCheckOut(booking.checkOut); setEditGuests(booking.guests || 2); setEditRoomId(booking.roomId); setEditRoomQuantity(booking.roomQuantity || 1); }} className="w-full py-3 rounded-xl border border-[#e8ddcf] text-[#4f4f4f] text-sm font-bold hover:bg-[#fdfaf6] transition-colors">Discard Changes</button>
                    </div>
                  </div>
                ) : diffAmount > 0 || !booking.paidInFull ? (
                  <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                    <p className="text-sm font-bold text-amber-900 mb-1">Amount to Pay</p>
                    <p className="text-xl font-black text-amber-700">{formatLKR(!booking.paidInFull ? newPrice : diffAmount)}</p>
                    <p className="text-xs text-amber-800/80 mt-2">You need to pay for these changes.</p>
                    <div className="flex flex-col gap-3 mt-4">
                      <button onClick={handleSaveChanges} disabled={loading} className="w-full py-3 rounded-xl bg-[#9a3300] text-white text-sm font-bold hover:bg-[#7a2800] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Modification"}
                      </button>
                      <button onClick={() => { setEditCheckIn(booking.checkIn); setEditCheckOut(booking.checkOut); setEditGuests(booking.guests || 2); setEditRoomId(booking.roomId); setEditRoomQuantity(booking.roomQuantity || 1); }} className="w-full py-3 rounded-xl border border-[#e8ddcf] text-[#4f4f4f] text-sm font-bold hover:bg-[#fdfaf6] transition-colors">Discard Changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-1">No price difference</p>
                    <div className="flex flex-col gap-3 mt-4">
                      <button onClick={handleSaveChanges} disabled={loading} className="w-full py-3 rounded-xl bg-[#9a3300] text-white text-sm font-bold hover:bg-[#7a2800] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirm Modification"}
                      </button>
                      <button onClick={() => { setEditCheckIn(booking.checkIn); setEditCheckOut(booking.checkOut); setEditGuests(booking.guests || 2); setEditRoomId(booking.roomId); setEditRoomQuantity(booking.roomQuantity || 1); }} className="w-full py-3 rounded-xl border border-[#e8ddcf] text-[#4f4f4f] text-sm font-bold hover:bg-[#fdfaf6] transition-colors">Discard Changes</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Digital Receipt & Payment History Card */}
          <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-[#9a3300]" size={20} />
                <h3 className="text-base font-black text-[#1d1d1d]">Digital Receipt</h3>
              </div>
              <span className="text-[10px] font-black text-[#828282] uppercase tracking-wider bg-[#fdfaf6] px-2.5 py-1 rounded-md border border-[#e8ddcf]">
                REC-{booking.confirmationCode}
              </span>
            </div>

            <p className="text-xs text-[#828282] leading-relaxed">
              Official tax invoice & payment record for this booking. You can view or print your digital receipt anytime.
            </p>

            <div className="bg-[#fdfaf6] rounded-xl p-4 border border-[#e8ddcf] flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#828282] font-medium">Receipt No:</span>
                <span className="font-bold text-[#1d1d1d]">REC-PS-{booking.confirmationCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#828282] font-medium">Payment Gateway:</span>
                <span className="font-bold text-[#1d1d1d]">{booking.paymentMethod === "online" ? "PayHere (Card / Wallet)" : "Pay at Property"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#828282] font-medium">Transaction Status:</span>
                <span className={`font-bold ${booking.paidInFull ? "text-emerald-600" : "text-amber-600"}`}>
                  {booking.paidInFull ? "✓ SUCCESSFUL" : "PENDING"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <FileText size={14} /> View Receipt
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(true);
                  setTimeout(() => window.print(), 300);
                }}
                className="py-3 px-4 rounded-xl border border-[#e8ddcf] hover:bg-[#fdfaf6] text-[#1d1d1d] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} /> Save PDF
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          DIGITAL RECEIPT MODAL (PRINTABLE TAX INVOICE)
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[600px] rounded-[28px] p-6 sm:p-10 shadow-2xl relative border border-[#e8ddcf] text-[#1d1d1d]">
            
            {/* Modal Header Controls */}
            <div className="flex items-center justify-between mb-8 print:hidden">
              <span className="text-xs font-black uppercase tracking-widest text-[#9a3300]">Official Digital Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#9a3300] text-white rounded-xl text-xs font-bold hover:bg-[#7a2800] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="space-y-6">
              
              {/* Brand Header */}
              <div className="flex justify-between items-start border-b border-[#e8ddcf] pb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#9a3300] tracking-tight">PrimeStay</h2>
                  <p className="text-xs font-semibold text-[#828282]">Hospitality & Resort Services</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider block mb-1">
                    {booking.paidInFull ? "âœ“ PAID IN FULL" : "PAYMENT PENDING"}
                  </span>
                  <p className="text-[11px] text-[#828282]">Receipt #: <strong className="text-[#1d1d1d]">REC-PS-{booking.confirmationCode}</strong></p>
                  <p className="text-[11px] text-[#828282]">Date: <strong className="text-[#1d1d1d]">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</strong></p>
                </div>
              </div>

              {/* Guest & Property Details */}
              <div className="grid grid-cols-2 gap-4 bg-[#fdfaf6] p-4 rounded-2xl border border-[#e8ddcf] text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#828282] uppercase tracking-wider mb-1">Billed To</p>
                  <p className="font-bold text-[#1d1d1d]">{booking.userEmail}</p>
                  <p className="text-[#828282] mt-0.5">Confirmation: <strong>{booking.confirmationCode}</strong></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#828282] uppercase tracking-wider mb-1">Property</p>
                  <p className="font-bold text-[#1d1d1d]">{booking.property}</p>
                  <p className="text-[#828282] mt-0.5">{booking.roomName} â€¢ {booking.nightsLabel}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#828282] border-b border-[#e8ddcf] pb-2">
                  <span>Description</span>
                  <span>Amount</span>
                </div>

                <div className="flex justify-between text-xs py-1">
                  <span>Accommodation ({booking.roomName} - {booking.nightsLabel})</span>
                  <span className="font-bold">{formatLKR(origBasePrice)}</span>
                </div>

                <div className="flex justify-between text-xs py-1 text-[#828282]">
                  <span>Government Taxes & Service Fees</span>
                  <span>{formatLKR(origTaxes)}</span>
                </div>

                {booking.discount > 0 && (
                  <div className="flex justify-between text-xs py-1 text-emerald-600">
                    <span>Promotional Discount</span>
                    <span className="font-bold">-{formatLKR(booking.discount)}</span>
                  </div>
                )}

                <div className="border-t-2 border-[#1d1d1d] pt-3 flex justify-between items-center text-sm font-black">
                  <span>Total Amount Paid</span>
                  <span className="text-[#9a3300] text-lg">{formatLKR(booking.totalPrice)}</span>
                </div>
              </div>

              {/* Payment Details Footer */}
              <div className="pt-4 border-t border-[#e8ddcf] flex justify-between items-center text-[11px] text-[#828282]">
                <div className="flex items-center gap-1.5">
                  <CreditCard size={14} className="text-[#9a3300]" />
                  <span>Paid via <strong>{booking.paymentMethod === "online" ? "PayHere Online Checkout" : "Pay at Property"}</strong></span>
                </div>
                <span>ðŸ”’ SSL Encrypted & Verified</span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

function BedDouble({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
    </svg>
  )
}
