import BookingTopbar from "@/components/shared/layout/guest-shell/booking-topbar"
import ReviewCompletedPage from "@/components/features/guest/reviews/review-completed-page"

export const metadata = {
    title: "Review Submitted — Prime Stay Sri Lanka",
    description: "Your property review has been submitted successfully.",
}

export default function ReviewCompletedRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
            <BookingTopbar />
            <main className="flex-1">
                <ReviewCompletedPage />
            </main>
            <footer className="bg-[#e9e6e0] py-5 text-center text-[13px] text-[#6b6762]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </div>
    )
}
