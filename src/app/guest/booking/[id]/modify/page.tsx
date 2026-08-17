import { Metadata } from "next"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import BookingDetailsClient from "@/components/guest/booking/booking-details-client"
import { Edit3 } from "lucide-react"

export const metadata: Metadata = {
  title: "Modify Booking | PrimeStay",
  description: "Modify your booking details.",
}

export default async function ModifyBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <GuestTopbar />
      
      {/* Header Banner */}
      <div className="bg-[#1e293b] text-white pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <Edit3 className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold tracking-wider uppercase text-white/90">Booking Actions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-yellow-400">
              Modify Booking
            </h1>
            <p className="text-white/80 max-w-lg text-lg">
              Change your dates, guests, or room preferences. Price differences will be calculated instantly.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 px-4 sm:px-6">
        <BookingDetailsClient id={id} initialTab="modify" pageMode="modify" />
      </main>
      <GuestFooter />
    </div>
  )
}
