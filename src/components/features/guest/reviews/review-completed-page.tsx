"use client"

import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Star, Home, Search, MessageSquare } from "lucide-react"

const REVIEW = {
    propertyName: "Grand Ocean Resort",
    propertyImage: "/images/room-features/resort-exterior.png",
    overallRating: 5,
    submittedAt: "March 11, 2026",
}

function StaticStars({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={18}
                    className={s <= count ? "text-[#f0a500] fill-[#f0a500]" : "text-[#e0e0e0] fill-[#e0e0e0]"}
                />
            ))}
        </div>
    )
}

export default function ReviewCompletedPage() {
    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
            <div className="max-w-[600px] mx-auto px-4 pt-8 flex flex-col items-center">

                {/* ── Success Icon ──────────────────────────────────────────── */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-[80px] h-[80px] rounded-full bg-[#e8f5ee] flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(39,174,96,0.15)]">
                        <CheckCircle2 size={44} className="text-[#27AE60]" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-[28px] font-bold text-[#1d1d1d] text-center leading-tight mb-2">
                        Review Submitted!
                    </h1>
                    <p className="text-[14px] text-[#828282] text-center max-w-[380px] leading-relaxed">
                        Thank you for sharing your experience. Your review helps thousands of travelers make better choices.
                    </p>
                </div>

                {/* ── Review Summary Card ───────────────────────────────────── */}
                <div className="w-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#f0f0f0] overflow-hidden mb-6">
                    <div className="px-6 pt-5 pb-4 border-b border-[#f5f5f5]">
                        <p className="text-[11px] font-bold text-[#828282] uppercase tracking-widest">Your Review Summary</p>
                    </div>

                    <div className="flex items-center gap-4 px-6 py-5">
                        <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f0f0f0]">
                            <Image
                                src={REVIEW.propertyImage}
                                alt={REVIEW.propertyName}
                                fill
                                className="object-cover"
                                sizes="72px"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-bold text-[#1d1d1d] mb-1 truncate">{REVIEW.propertyName}</p>
                            <StaticStars count={REVIEW.overallRating} />
                            <p className="text-[12px] text-[#a0a0a0] mt-1.5">Submitted on {REVIEW.submittedAt}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1.5 bg-[#e8f5ee] text-[#27AE60] text-[12px] font-bold px-3 py-1.5 rounded-full">
                                <CheckCircle2 size={13} />
                                Published
                            </span>
                        </div>
                    </div>

                    <div className="mx-6 mb-5 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-5 py-4">
                        <p className="text-[12px] text-[#828282] leading-relaxed">
                            Your review is now <span className="font-semibold text-[#555]">live</span> and visible to all future guests browsing this property. We appreciate your honest feedback!
                        </p>
                    </div>
                </div>

                {/* ── What's Next Card ──────────────────────────────────────── */}
                <div className="w-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#f0f0f0] mb-8">
                    <div className="px-6 pt-5 pb-4 border-b border-[#f5f5f5]">
                        <p className="text-[11px] font-bold text-[#828282] uppercase tracking-widest">What&apos;s Next</p>
                    </div>
                    <div className="flex flex-col divide-y divide-[#f5f5f5]">
                        <Link
                            href="/guest/my-room"
                            className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors no-underline group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#f8efe8] flex items-center justify-center flex-shrink-0">
                                <Home size={18} className="text-[#953002]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-[#1d1d1d] group-hover:text-[#953002] transition-colors">Back to My Room</p>
                                <p className="text-[12px] text-[#a0a0a0]">Return to your current stay dashboard</p>
                            </div>
                            <span className="text-[#cccccc] text-lg group-hover:text-[#953002] transition-colors">›</span>
                        </Link>
                        <Link
                            href="/guest/search"
                            className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors no-underline group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#f8efe8] flex items-center justify-center flex-shrink-0">
                                <Search size={18} className="text-[#953002]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-[#1d1d1d] group-hover:text-[#953002] transition-colors">Explore More Properties</p>
                                <p className="text-[12px] text-[#a0a0a0]">Find your next perfect stay</p>
                            </div>
                            <span className="text-[#cccccc] text-lg group-hover:text-[#953002] transition-colors">›</span>
                        </Link>
                        <Link
                            href="/guest/messages/staff"
                            className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors no-underline group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#f8efe8] flex items-center justify-center flex-shrink-0">
                                <MessageSquare size={18} className="text-[#953002]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-[#1d1d1d] group-hover:text-[#953002] transition-colors">Contact Staff</p>
                                <p className="text-[12px] text-[#a0a0a0]">Need anything else during your stay?</p>
                            </div>
                            <span className="text-[#cccccc] text-lg group-hover:text-[#953002] transition-colors">›</span>
                        </Link>
                    </div>
                </div>

                <p className="text-[11px] text-[#999] text-center max-w-[380px] leading-relaxed">
                    Reviews are moderated within 24 hours. If you need to edit or remove your review, please contact our support team.
                </p>

            </div>
        </div>
    )
}
