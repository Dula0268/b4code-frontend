import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import ModifyReservationPage from "@/components/features/guest/booking/modify/modify-reservation-page"

export const metadata = {
    title: "Modify Your Reservation — Prime Stay Sri Lanka",
    description: "Edit your stay dates, guest count, or room category for your upcoming booking.",
}

export default function ModifyReservationRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <ModifyReservationPage />
            </main>
            <footer className="bg-[#f4f4f4] border-t border-[#e0e0e0] py-5 text-center text-[13px] text-[#828282]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </>
    )
}
