import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import MyBookingsPage from "@/components/features/guest/booking/my-bookings/my-bookings-page"

export const metadata = {
    title: "My Bookings — Prime Stay Sri Lanka",
    description: "View and manage all your property bookings. Track upcoming stays, completed trips, and cancellations.",
}

import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export default function MyBookingsRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <MyBookingsPage />
            </main>
            <GuestFooter />
        </div>
    )
}
