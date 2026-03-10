import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import HeroSection from "@/components/features/guest/landing/hero-section"
import FeaturedDestinations from "@/components/features/guest/landing/featured-destinations"
import WhyChooseUs from "@/components/features/guest/landing/why-choose-us"
import StatsSection from "@/components/features/guest/landing/stats-section"
import TestimonialsSection from "@/components/features/guest/landing/testimonials-section"
import OwnerCtaSection from "@/components/features/guest/landing/owner-cta-section"
import StaffCtaSection from "@/components/features/guest/landing/staff-cta-section"

export const metadata = {
  title: "Prime Stay — Find, Book, and Stay with Confidence",
  description: "Search thousands of verified properties, enjoy secure payments, and experience stress-free travel planning across Sri Lanka.",
}

export default function HomePage() {
  return (
    <>
      <GuestTopbar />
      <main>
        <HeroSection />
        <FeaturedDestinations />
        <WhyChooseUs />
        <StatsSection />
        <TestimonialsSection />
        <OwnerCtaSection />
        <StaffCtaSection />
      </main>
      <GuestFooter />
    </>
  )
}