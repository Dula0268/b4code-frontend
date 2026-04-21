import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import MyRoomPage from "@/components/features/guest/my-room/my-room-page"

export const metadata = {
    title: "My Room — Prime Stay Sri Lanka",
    description: "Welcome to your room. Order food, request room service, explore hotel facilities, and more.",
}

import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export default function MyRoomRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <MyRoomPage />
            </main>
            <GuestFooter />
        </div>
    )
}
