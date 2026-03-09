import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import CancelBookingPage from "@/components/features/guest/booking/cancel/cancel-booking-page"

export const metadata = {
    title: "Cancel Your Booking — Prime Stay Sri Lanka",
    description: "Review your refund calculation and confirm the cancellation of your booking.",
}

export default function CancelBookingRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <CancelBookingPage />
            </main>
            <footer className="bg-[#f4f4f4] border-t border-[#e0e0e0] py-5 text-center text-[13px] text-[#828282]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </>
    )
}
