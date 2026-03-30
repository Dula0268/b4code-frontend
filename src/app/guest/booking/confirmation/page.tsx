import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import BookingConfirmationPage from "@/components/features/guest/booking/confirmation/booking-confirmation-page"

export const metadata = {
    title: "Booking Confirmed — Prime Stay Sri Lanka",
    description: "Your booking is confirmed. View your check-in details, instructions, and explore nearby activities.",
}

export default function BookingConfirmationRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <BookingConfirmationPage />
            </main>
            <GuestFooter />
        </>
    )
}
