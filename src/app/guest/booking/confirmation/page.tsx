import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import { Suspense } from "react"
import BookingConfirmationPage from "@/components/features/guest/booking/confirmation/booking-confirmation-page"

export const metadata = {
    title: "Booking Confirmed — Prime Stay Sri Lanka",
    description: "Your booking is confirmed. View your check-in details, instructions, and explore nearby activities.",
}

export default function BookingConfirmationRoute() {
    return (
        <>
            <GuestTopbar />
            <main>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading confirmation...</div>}>
                    <BookingConfirmationPage />
                </Suspense>
            </main>
            <GuestFooter />
        </>
    )
}
