"use client"

import { useState } from "react"
import { Star, UploadCloud, X, Camera } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

// ─── Shared Star Rating Component ─────────────────────────────────────────────
function StarRating({ rating, setRating, size = 32 }: { rating: number; setRating: (r: number) => void; size?: number }) {
    const [hover, setHover] = useState(0)

    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 cursor-pointer"
                >
                    <Star
                        size={size}
                        className={`${star <= (hover || rating)
                                ? "text-[#f0a500] fill-[#f0a500]"
                                : "text-[#d1d5db] fill-[#d1d5db]"
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    )
}

function SmallStarRating({ rating, setRating }: { rating: number; setRating: (r: number) => void }) {
    return <StarRating rating={rating} setRating={setRating} size={18} />
}


// ─── Component ────────────────────────────────────────────────────────────────
export default function SubmitReviewPage() {
    const router = useRouter()

    const [overallRating, setOverallRating] = useState(0)
    const [cleanliness, setCleanliness] = useState(4)
    const [service, setService] = useState(5)
    const [valueForMoney, setValueForMoney] = useState(4)
    const [reviewText, setReviewText] = useState("")

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
            <div className="max-w-[800px] mx-auto px-4 pt-4">

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="text-center mb-8">
                    <h1 className="text-[28px] md:text-[32px] font-bold text-[#1d1d1d] leading-tight mb-2">
                        Submit Property Review
                    </h1>
                    <p className="text-[14px] text-[#828282] max-w-[500px] mx-auto leading-relaxed">
                        Your feedback helps thousands of travelers make better choices. Tell us about your stay at <span className="font-bold text-[#1d1d1d]">Grand Ocean Resort</span>.
                    </p>
                </div>

                {/* ── Review Form Card ──────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 md:p-10 mb-8 border border-[#f0f0f0]">

                    {/* Overall Experience */}
                    <div className="flex flex-col items-center mb-10">
                        <h2 className="text-[16px] font-bold text-[#1d1d1d] mb-4">How was your overall experience?</h2>
                        <StarRating rating={overallRating} setRating={setOverallRating} size={36} />
                        <span className="text-[12px] text-[#828282] mt-3">Select a star to rate</span>
                    </div>

                    <div className="w-full h-px bg-[#f0f0f0] mb-8" />

                    {/* Detailed Ratings */}
                    <div className="mb-10">
                        <h3 className="text-[15px] font-bold text-[#1d1d1d] mb-5">Detailed Ratings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
                            <div>
                                <p className="text-[13px] font-semibold text-[#333] mb-2">Cleanliness</p>
                                <SmallStarRating rating={cleanliness} setRating={setCleanliness} />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[#333] mb-2">Service</p>
                                <SmallStarRating rating={service} setRating={setService} />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[#333] mb-2">Value for Money</p>
                                <SmallStarRating rating={valueForMoney} setRating={setValueForMoney} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[#f0f0f0] mb-8" />

                    {/* Written Review */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-bold text-[#1d1d1d]">Your Written Review</h3>
                            <span className="text-[11px] text-[#a0a0a0]">Min. 50 characters</span>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Tell us what you liked or didn't like. Was the bed comfortable? How was the location?"
                            className="w-full h-[140px] resize-none border border-[#e5e5e5] rounded-xl p-4 text-[14px] text-[#333] placeholder:text-[#a0a0a0] focus:border-[#953002] focus:ring-1 focus:ring-[#953002] transition-colors outline-none"
                        />
                    </div>

                    {/* Add Photos */}
                    <div className="mb-10">
                        <h3 className="text-[15px] font-bold text-[#1d1d1d] mb-3">Add Photos (Optional)</h3>

                        <div className="w-full border-2 border-dashed border-[#d1d5db] bg-[#fafafa] hover:bg-[#f5f5f5] rounded-xl flex flex-col items-center justify-center py-10 transition-colors cursor-pointer mb-5">
                            <Camera size={28} className="text-[#a0a0a0] mb-3" />
                            <p className="text-[13px] text-[#555] font-medium mb-1">Drag and drop your photos here</p>
                            <p className="text-[11px] text-[#a0a0a0]">or click to browse from your computer</p>
                        </div>

                        {/* Uploaded Thumbnails Mock */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-[64px] h-[64px] rounded-lg overflow-hidden border border-[#eee]">
                                <Image src="/images/room/resort-exterior.png" alt="Upload 1" fill className="object-cover" />
                                <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center">
                                    <X size={10} />
                                </button>
                            </div>
                            <div className="relative w-[64px] h-[64px] rounded-lg overflow-hidden border border-[#eee]">
                                <Image src="/images/room/food-beverage.png" alt="Upload 2" fill className="object-cover" />
                                <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center">
                                    <X size={10} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 mt-4">
                        <button
                            onClick={() => router.push("/guest/my-room")}
                            className="w-full sm:w-auto bg-[#953002] hover:bg-[#7a2701] text-white font-bold text-[14px] px-10 py-3.5 rounded-xl transition-colors shadow-md"
                        >
                            Submit My Review
                        </button>
                        <Link
                            href="/guest/my-room"
                            className="text-[14px] font-semibold text-[#666] hover:text-[#333] transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>

                </div>

                {/* ── Footer text ───────────────────────────────────────────── */}
                <p className="text-[11px] text-[#999] text-center max-w-[420px] mx-auto leading-relaxed">
                    By submitting this review, you certify that this review is based on your own experience and is your genuine opinion of this property.
                </p>

            </div>
        </div>
    )
}
