import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import LandingContent from "@/components/features/landing/landing-content"

export const metadata = {
  title: "Prime Stay — Find, Book, and Stay with Confidence",
  description: "Search thousands of verified properties, enjoy secure payments, and experience stress-free travel planning across Sri Lanka.",
}

export default function HomePage() {
  return (
    <>
      <GuestTopbar />
      <main>
        <LandingContent />
      </main>
      <GuestFooter variant="full" />
    </>
  )
}