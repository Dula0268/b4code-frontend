"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { guestApi } from "@/lib/api"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

// ─────────────────────────────────────────────────────────────────────────────
// Review Page Content
// ─────────────────────────────────────────────────────────────────────────────
function ReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const bookingRef = searchParams.get("bookingRef")
  const property = searchParams.get("property")
  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCompleteBooking = async () => {
    if (!bookingId) {
      setError("Missing booking information")
      return
    }

    if (!window.confirm("Are you sure you want to complete this stay?")) return

    setIsSubmitting(true)
    setError(null)

    try {
      await guestApi.completeBooking(Number(bookingId))
      setSuccess(true)
      // Redirect to bookings after 2 seconds
      setTimeout(() => {
        router.push("/guest/booking/my-bookings")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete booking. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f9f5f0] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-[#2d2116] mb-3">Stay Completed!</h1>
          <p className="text-[#6f6254] mb-8">Your stay has been marked as completed. Redirecting to your bookings...</p>
          <Link href="/guest/booking/my-bookings" className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-colors" style={{ background: "#9a3300" }}>
            Go to Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f9f5f0] flex flex-col">
      <GuestTopbar />
      
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <Link href="/guest/booking/my-bookings" className="inline-flex items-center gap-2 text-[#6f6254] hover:text-[#9a3300] mb-8 transition-colors">
            <ChevronLeft size={20} />
            Back to Bookings
          </Link>

          {/* Card */}
          <div className="bg-white rounded-[24px] border border-[#eadfce] p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-black text-[#2d2116] mb-2">Complete Your Stay</h1>
            <p className="text-[#6f6254] mb-8">Review your booking details and confirm the completion of your stay.</p>

            {/* Booking Details */}
            {property && (
              <div className="bg-[#f9f5f0] rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-[#2d2116] mb-4">Booking Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[#6f6254] font-medium">Property:</span>
                    <span className="font-bold text-[#2d2116]">{property}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#6f6254] font-medium">Booking Reference:</span>
                    <span className="font-bold text-[#2d2116] font-mono">{bookingRef}</span>
                  </div>
                  {checkIn && checkOut && (
                    <div className="flex justify-between items-start">
                      <span className="text-[#6f6254] font-medium">Dates:</span>
                      <span className="font-bold text-[#2d2116]">{checkIn} — {checkOut}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex gap-4">
              <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Confirm Your Stay</h3>
                <p className="text-sm text-blue-800">By completing this stay, you confirm that you have checked out and your visit is finished. You will be able to leave a review and rate your experience.</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex gap-4">
                <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleCompleteBooking}
                disabled={isSubmitting}
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#9a3300" }}
              >
                <CheckCircle2 size={18} />
                {isSubmitting ? "Processing..." : "Complete Stay"}
              </button>
              <Link href="/guest/booking/my-bookings" className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 border border-[#e8ddcf] hover:border-[#9a3300] text-[#6f6254] hover:text-[#9a3300] font-bold px-6 py-3 rounded-xl transition-all bg-white">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </main>

      <GuestFooter />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component with Suspense
// ─────────────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-[#f9f5f0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6f6254]">Loading...</p>
        </div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  )
}
