import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import MyBookingsPage from "@/components/features/guest/booking/my-bookings/my-bookings-page"

export const metadata = {
    title: "My Bookings — Prime Stay Sri Lanka",
    description: "View and manage all your property bookings. Track upcoming stays, completed trips, and cancellations.",
}

export default function MyBookingsRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <MyBookingsPage />
            </main>
            <footer className="bg-[#f4f4f4] border-t border-[#e0e0e0] py-5 text-center text-[13px] text-[#828282]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </>
    )
}
