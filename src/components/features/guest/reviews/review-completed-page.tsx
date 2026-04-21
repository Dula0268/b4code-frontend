"use client"

import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Star, Home, Search, MessageSquare, ChevronRight } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// In production, pass these values via URL search params or React context from
// the submit-review page to avoid hardcoding post-submission state
// ─────────────────────────────────────────────────────────────────────────────
const REVIEW = {
  propertyName:  "Grand Ocean Resort",
  propertyImage: "/images/room-features/resort-exterior.png",
  overallRating: 5,
  submittedAt:   "March 11, 2026",
}

const NEXT_STEPS = [
  {
    label:    "Back to My Room",
    subtitle: "Return to your current stay dashboard",
    href:     "/guest/my-room",
    icon:     Home,
  },
  {
    label:    "Explore More Properties",
    subtitle: "Find your next perfect stay",
    href:     "/guest/search",
    icon:     Search,
  },
  {
    label:    "Contact Staff",
    subtitle: "Need anything else during your stay?",
    href:     "/guest/my-room/message-staff",
    icon:     MessageSquare,
  },
]

function StaticStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={18}
          className={s <= count ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
    </div>
  )
}

export default function ReviewCompletedPage() {
  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[600px] mx-auto px-4 pt-8 flex flex-col items-center">

        {/* Success icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: "color-mix(in srgb, var(--state-success) 12%, white)", boxShadow: "0 4px 20px color-mix(in srgb, var(--state-success) 20%, transparent)" }}>
            <CheckCircle2 size={44} strokeWidth={1.8} style={{ color: "var(--state-success)" }} />
          </div>
          <h1 className="text-[1.75rem] font-black text-center leading-tight mb-2" style={{ color: "var(--fg)" }}>
            Review Submitted!
          </h1>
          <p className="text-sm text-center max-w-[380px] leading-relaxed" style={{ color: "var(--gray-3)" }}>
            Thank you for sharing your experience. Your review helps thousands of travelers make better choices.
          </p>
        </div>

        {/* Review summary card */}
        <div className="w-full ps-card overflow-hidden mb-6">
          <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
            <p className="text-[0.6875rem] font-bold uppercase tracking-widest" style={{ color: "var(--gray-3)" }}>
              Your Review Summary
            </p>
          </div>

          <div className="flex items-center gap-4 px-6 py-5">
            <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0"
              style={{ background: "var(--gray-5)" }}>
              <Image src={REVIEW.propertyImage} alt={REVIEW.propertyName} fill className="object-cover" sizes="72px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.9375rem] font-bold mb-1 truncate" style={{ color: "var(--fg)" }}>
                {REVIEW.propertyName}
              </p>
              <StaticStars count={REVIEW.overallRating} />
              <p className="text-xs mt-1.5" style={{ color: "var(--gray-4)" }}>Submitted on {REVIEW.submittedAt}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: "color-mix(in srgb, var(--state-success) 12%, white)", color: "var(--state-success)" }}>
                <CheckCircle2 size={13} /> Published
              </span>
            </div>
          </div>

          <div className="mx-6 mb-5 rounded-xl px-5 py-4 border"
            style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--gray-3)" }}>
              Your review is now <span className="font-semibold" style={{ color: "var(--gray-2)" }}>live</span> and
              visible to all future guests browsing this property. We appreciate your honest feedback!
            </p>
          </div>
        </div>

        {/* What's next card */}
        <div className="w-full ps-card overflow-hidden mb-8">
          <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--gray-5)" }}>
            <p className="text-[0.6875rem] font-bold uppercase tracking-widest" style={{ color: "var(--gray-3)" }}>
              What&apos;s Next
            </p>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--gray-5)" }}>
            {NEXT_STEPS.map(({ label, subtitle, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-4 px-6 py-4 no-underline group transition-colors"
                style={{ color: "inherit" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--brand-primary) 10%, white)" }}>
                  <Icon size={18} style={{ color: "var(--brand-primary)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold transition-colors group-hover:text-[var(--brand-primary)]"
                    style={{ color: "var(--fg)" }}>
                    {label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--gray-4)" }}>{subtitle}</p>
                </div>
                <ChevronRight size={16} className="transition-colors group-hover:text-[var(--brand-primary)]"
                  style={{ color: "var(--gray-4)" }} />
              </Link>
            ))}
          </div>
        </div>

        <p className="text-[0.6875rem] text-center max-w-[380px] leading-relaxed" style={{ color: "var(--gray-4)" }}>
          Reviews are moderated within 24 hours. To edit or remove your review, contact our support team.
        </p>

      </div>
    </div>
  )
}
