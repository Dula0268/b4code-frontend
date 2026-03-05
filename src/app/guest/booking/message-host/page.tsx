import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import MessageHostPage from "@/components/features/guest/booking/message-host/message-host-page"

export const metadata = {
    title: "Contact Property Owner — Prime Stay Sri Lanka",
    description: "Message the property owner for booking details, special requests, or questions before your arrival.",
}

export default function MessageHostRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <MessageHostPage />
            </main>
            <footer className="bg-[#f4f4f4] border-t border-[#e0e0e0] py-5 text-center text-[13px] text-[#828282]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </>
    )
}
