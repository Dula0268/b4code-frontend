import { Metadata } from "next"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import BookingDetailsClient from "@/components/guest/booking/booking-details-client"
import { AlertTriangle, ChevronLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cancel Booking | PrimeStay",
  description: "Cancel your booking.",
}

export default async function CancelBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <GuestTopbar />
      
      <main className="flex-1 pt-24 px-4 sm:px-6 pb-12 flex flex-col">
        <div className="max-w-7xl mx-auto w-full">
          <Link
            href="/guest/booking"
            className="inline-flex items-center gap-2 text-sm font-bold mb-4 no-underline text-[#828282] hover:text-[#1d1d1d] transition-colors"
          >
            <ChevronLeft size={16} /> Back to My Bookings
          </Link>

          {/* Header Banner */}
          <div className="bg-[#9a3300] w-full px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-6 shadow-md shrink-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-white font-bold tracking-wider text-xs uppercase mb-1.5 opacity-90">
              <AlertTriangle size={16} /> BOOKING ACTIONS
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#facc15] mb-1.5">
              Cancel Booking
            </h1>
            <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl hidden sm:block">
              We&apos;re sorry to see you cancel. Review the details and cancellation policy below before proceeding.
            </p>
          </div>

          <BookingDetailsClient id={id} initialTab="cancel" pageMode="cancel" />
        </div>
      </main>
      <GuestFooter />
    </div>
  )
}
