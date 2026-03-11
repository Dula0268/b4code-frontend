import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import CheckoutPage from "@/components/features/guest/booking/checkout/checkout-page"

export const metadata = {
    title: "Booking Checkout — Prime Stay Sri Lanka",
    description: "Complete guest details and finish your booking securely.",
}

export default function BookingCheckoutRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <CheckoutPage />
            </main>
            <GuestFooter />
        </>
    )
}
