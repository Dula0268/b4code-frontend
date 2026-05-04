import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import AboutContent from "@/components/features/about/about-content"

export const metadata = {
  title: "About Us — Prime Stay | Sri Lanka's Premier Booking Platform",
  description:
    "Learn about Prime Stay's mission to make every stay in Sri Lanka unforgettable. Discover our story, values, and what sets us apart as the most trusted hospitality platform.",
}

export default function AboutPage() {
  return (
    <>
      <GuestTopbar />
      <main className="pt-16">
        <AboutContent />
      </main>
      <GuestFooter variant="full" />
    </>
  )
}
