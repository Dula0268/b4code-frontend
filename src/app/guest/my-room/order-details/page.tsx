import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import OrderDetailsPageClient from "./page-client"

export const metadata = {
    title: "Order Details — Prime Stay Sri Lanka",
    description: "View your current room service order details, timeline, and delivery status.",
}

export default function OrderDetailsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <OrderDetailsPageClient />
            </main>
            <GuestFooter />
        </div>
    )
}
