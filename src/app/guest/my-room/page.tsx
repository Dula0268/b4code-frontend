import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import MyRoomPageClient from "./page-client"

export const metadata = {
    title: "My Room — Prime Stay Sri Lanka",
    description: "Welcome to your room. Order food, request room service, explore hotel facilities, and more.",
}

export default function MyRoomPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <MyRoomPageClient />
            </main>
            <GuestFooter />
        </div>
    )
}
