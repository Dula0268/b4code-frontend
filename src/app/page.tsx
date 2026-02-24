import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import HeroSection from "@/components/features/guest/booking/search/hero-section"
import OwnerCtaSection from "@/components/features/guest/booking/search/owner-cta-section"
import StaffCtaSection from "@/components/features/guest/booking/search/staff-cta-section"

export const metadata = {
  title: "Prime Stay — Find, Book, and Stay with Confidence",
  description: "Search thousands of verified properties, enjoy secure payments, and experience stress-free travel planning.",
}

export default function HomePage() {
  return (
    <>
      <GuestTopbar />
      <main>
        <HeroSection />
        <OwnerCtaSection />
        <StaffCtaSection />
      </main>
      <GuestFooter />
    </>
  )
}