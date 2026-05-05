import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import MessagingPage from "@/components/features/guest/messages/messaging-page"

export const metadata = {
    title: "Messaging — Prime Stay",
    description: "Contact the property owner or hotel staff easily.",
}

export default function MessagesRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
            <GuestTopbar />
            <main className="flex-1 pb-10">
                <Suspense fallback={<div className="p-20 text-center text-[#888]">Loading messages...</div>}>
                    <MessagingPage />
                </Suspense>
            </main>
        </div>
    )
}
