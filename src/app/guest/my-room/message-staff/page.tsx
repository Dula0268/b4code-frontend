import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import MessageStaffPage from "@/components/features/guest/my-room/message-staff-page"

export const metadata = {
    title: "Message Staff — Prime Stay Sri Lanka",
    description: "Send a message to the property staff for room service, cleaning, maintenance, or assistance.",
}

export default function MessageStaffRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
            <BookingTopbar />
            <main className="flex-1 pb-10">
                <MessageStaffPage />
            </main>
        </div>
    )
}
