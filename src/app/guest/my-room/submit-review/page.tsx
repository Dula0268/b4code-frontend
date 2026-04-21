import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import SubmitReviewPage from "@/components/features/guest/my-room/submit-review-page"

export const metadata = {
    title: "Submit Property Review — Prime Stay Sri Lanka",
    description: "Submit a review of your recent stay.",
}

import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export default function SubmitReviewRoute() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <GuestTopbar />
            <main className="flex-1">
                <SubmitReviewPage />
            </main>
            <GuestFooter />
        </div>
    )
}
