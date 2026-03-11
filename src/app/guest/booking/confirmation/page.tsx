import { Suspense } from "react"
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
                <Suspense
                    fallback={
                        <div className="min-h-screen bg-[#f4f4f4] pt-24 pb-16">
                            <div className="max-w-[660px] mx-auto px-4">
                                <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] p-6 flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-[#953002]/30 border-t-[#953002] rounded-full animate-spin" />
                                    <p className="text-[14px] text-[#828282]">Loading your booking confirmation...</p>
                                </div>
                            </div>
                        </div>
                    }
                >
                    <BookingConfirmationPage />
                </Suspense>
            </main>
            <GuestFooter />
        </>
    )
}
