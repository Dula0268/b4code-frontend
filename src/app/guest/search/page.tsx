import { Suspense } from "react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import SearchResultsPage from "@/components/features/guest/booking/search/search-results-page"

export const metadata = {
    title: "Search Stays — Prime Stay Sri Lanka",
    description:
        "Browse and filter luxury stays, villas, apartments, and guesthouses across Sri Lanka. Sort by price, rating, or recommendation.",
}

export default function SearchPage() {
    return (
        <>
            <GuestTopbar />
            <main>
                <Suspense fallback={
                    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-[#953002]/30 border-t-[#953002] rounded-full animate-spin" />
                            <p className="text-[14px] text-[#828282]">Finding the perfect stays…</p>
                        </div>
                    </div>
                }>
                    <SearchResultsPage />
                </Suspense>
            </main>
            <GuestFooter />
        </>
    )
}
