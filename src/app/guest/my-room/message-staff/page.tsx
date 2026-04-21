import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import MessageStaffPage from "@/components/features/guest/my-room/message-staff-page"

export const metadata = {
    title: "Message Staff — Prime Stay Sri Lanka",
    description: "Send a message to the property staff for room service, cleaning, maintenance, or assistance.",
}

import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export default function MessageStaffRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1 pb-10">
                <MessageStaffPage />
            </main>
            <GuestFooter />
        </div>
    )
}
