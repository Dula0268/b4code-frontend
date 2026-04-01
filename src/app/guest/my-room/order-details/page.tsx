import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import OrderDetailsPage from "@/components/features/guest/my-room/order-details-page"

export const metadata = {
    title: "Order Details — Prime Stay Sri Lanka",
    description: "View your current room service order details, timeline, and delivery status.",
}

export default function OrderDetailsRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--gray-5)]/10">
            <GuestTopbar />
            <main className="flex-1">
                <OrderDetailsPage />
            </main>
            <footer className="bg-[var(--gray-5)]/30 py-5 text-center text-[13px] text-[var(--gray-3)]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </div>
    )
}
