import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import RefundRequestPage from "@/components/features/guest/booking/refund/refund-request-page"

export const metadata = {
    title: "Refund Request — Prime Stay Sri Lanka",
    description: "Review your refundable amount and submit your refund request for your cancelled booking.",
}

export default function RefundRequestRoute() {
    return (
        <>
            <BookingTopbar />
            <main>
                <RefundRequestPage />
            </main>
            <footer className="bg-[#f4f4f4] border-t border-[#e0e0e0] py-5 text-center text-[13px] text-[#828282]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </>
    )
}
