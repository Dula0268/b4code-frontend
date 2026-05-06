import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import OrderDetailsPage from "@/components/features/guest/my-room/order-details-page"

export const metadata = {
    title: "Order Details — Prime Stay Sri Lanka",
    description: "View your current room service order details, timeline, and delivery status.",
}

import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export default function OrderDetailsRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <OrderDetailsPage />
            </main>
            <GuestFooter />
        </div>
    )
}
