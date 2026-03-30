import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import AboutHero from "@/components/features/guest/about/about-hero"
import OurStory from "@/components/features/guest/about/our-story"
import MissionVision from "@/components/features/guest/about/mission-vision"
import WhatSetsUsApart from "@/components/features/guest/about/what-sets-us-apart"
import Timeline from "@/components/features/guest/about/timeline"
import AboutCta from "@/components/features/guest/about/about-cta"

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
        <AboutHero />
        <OurStory />
        <MissionVision />
        <WhatSetsUsApart />
        <Timeline />
        <AboutCta />
      </main>
      <GuestFooter variant="full" />
    </>
  )
}
