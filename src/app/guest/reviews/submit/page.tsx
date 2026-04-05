import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import { Suspense } from "react"
import SubmitReviewPage from "@/components/features/guest/reviews/submit-review-page"

export const metadata = {
    title: "Submit Property Review — Prime Stay Sri Lanka",
    description: "Submit a review of your recent stay.",
}

export default function SubmitReviewRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
            <GuestTopbar />
            <main className="flex-1">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading review form...</div>}>
                    <SubmitReviewPage />
                </Suspense>
            </main>
            <footer className="bg-[#e9e6e0] py-5 text-center text-[13px] text-[#6b6762]">
                © 2026 PRIME STAY. All Rights Reserved.
            </footer>
        </div>
    )
}
