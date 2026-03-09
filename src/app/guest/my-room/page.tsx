import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import MyRoomPage from "@/components/features/guest/my-room/my-room-page"

export const metadata = {
    title: "My Room — Prime Stay Sri Lanka",
    description: "Welcome to your room. Order food, request room service, explore hotel facilities, and more.",
}

export default function MyRoomRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <MyRoomPage />
            </main>
            <footer className="bg-[#f4f4f4] border-t border-[#e0e0e0] py-5 text-center text-[13px] text-[#828282]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </>
    )
}
