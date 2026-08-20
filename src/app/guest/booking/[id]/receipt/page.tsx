import { Metadata } from "next"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import BookingReceiptClient from "@/components/guest/booking/booking-receipt-client"

export const metadata: Metadata = {
  title: "Booking Receipt | PrimeStay",
  description: "View and print your booking receipt.",
}

export default async function BookingReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Hide Topbar when printing */}
      <div className="print:hidden">
        <GuestTopbar />
      </div>
      
      <main className="flex-1 pt-24 px-4 sm:px-6 print:pt-4">
        <BookingReceiptClient id={id} />
      </main>
      
      {/* Hide Footer when printing */}
      <div className="print:hidden">
        <GuestFooter />
      </div>
    </div>
  )
}
