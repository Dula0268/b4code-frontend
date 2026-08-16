import { Metadata } from "next"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import BookingDetailsClient from "@/components/guest/booking/booking-details-client"

export const metadata: Metadata = {
  title: "Booking Details | PrimeStay",
  description: "View and manage your booking details.",
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <GuestTopbar />
      <main className="flex-1 pt-24 px-4 sm:px-6">
        <BookingDetailsClient id={id} />
      </main>
      <GuestFooter />
    </div>
  )
}
