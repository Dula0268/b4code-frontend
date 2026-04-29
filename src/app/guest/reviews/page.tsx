import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import SubmitReviewPage from "@/components/features/guest/reviews/submit-review-page"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"

export const metadata = {
    title: "Submit Property Review — Prime Stay",
    description: "Submit a review of your recent stay.",
}

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
