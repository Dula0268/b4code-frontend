"use client"

import { useState, useRef } from "react"
import { Star, X, Camera, ImagePlus } from "lucide-react"
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
                                ? "text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                                : "text-[var(--border)] fill-[var(--border)]"
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    )
}

function SmallStarRating({ rating, setRating }: { rating: number; setRating: (r: number) => void }) {
    return <StarRating rating={rating} setRating={setRating} size={20} />
}


// ─── Component ────────────────────────────────────────────────────────────────
export default function SubmitReviewPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [overallRating, setOverallRating] = useState(0)
    const [cleanliness, setCleanliness] = useState(0)
    const [service, setService] = useState(0)
    const [valueForMoney, setValueForMoney] = useState(0)
    const [reviewText, setReviewText] = useState("")

    // Image Upload State
    const [images, setImages] = useState<{ file: File; url: string }[]>([])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files)
            const newImages = filesArray.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }))
            setImages(prev => [...prev, ...newImages])
        }
    }

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="min-h-screen bg-[var(--gray-5)]/10 pt-20 pb-16">
            <div className="max-w-[800px] mx-auto px-4 pt-4">

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="text-center mb-8">
                    <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--fg)] leading-tight mb-2">
                        Submit Property Review
                    </h1>
                    <p className="text-[14px] text-[var(--gray-3)] max-w-[500px] mx-auto leading-relaxed">
                        Your feedback helps thousands of travelers make better choices. Tell us about your stay at <span className="font-bold text-[var(--fg)]">Luxe Horizon Resort</span>.
                    </p>
                </div>

                {/* ── Review Form Card ──────────────────────────────────────── */}
                <div className="bg-[var(--white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 md:p-10 mb-8 border border-[var(--border)]">

                    {/* Overall Experience */}
                    <div className="flex flex-col items-center mb-10">
                        <h2 className="text-[18px] font-bold text-[var(--fg)] mb-4">How was your overall experience?</h2>
                        <StarRating rating={overallRating} setRating={setOverallRating} size={36} />
                        <span className="text-[12px] text-[var(--gray-3)] mt-3">Select a star to rate</span>
                    </div>

                    <div className="w-full h-px bg-[var(--border)] mb-8" />

                    {/* Detailed Ratings */}
                    <div className="mb-10">
                        <h3 className="text-[16px] font-bold text-[var(--fg)] mb-5">Detailed Ratings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
                            <div>
                                <p className="text-[14px] font-semibold text-[var(--black-3)] mb-2">Cleanliness</p>
                                <SmallStarRating rating={cleanliness} setRating={setCleanliness} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-[var(--black-3)] mb-2">Service</p>
                                <SmallStarRating rating={service} setRating={setService} />
                            </div>
                            <div>
                                <p className="text-[14px] font-semibold text-[var(--black-3)] mb-2">Value for Money</p>
                                <SmallStarRating rating={valueForMoney} setRating={setValueForMoney} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[var(--border)] mb-8" />

                    {/* Written Review */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[16px] font-bold text-[var(--fg)]">Your Written Review</h3>
                            <span className="text-[12px] text-[var(--gray-4)]">Min. 50 characters</span>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Tell us what you liked or didn't like. Was the bed comfortable? How was the location?"
                            className="w-full h-[140px] resize-none border border-[var(--border)] rounded-[var(--radius-lg)] p-4 text-[14px] text-[var(--black-3)] placeholder:text-[var(--gray-4)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors outline-none"
                        />
                    </div>

                    {/* Add Photos (Working Version) */}
                    <div className="mb-10">
                        <h3 className="text-[16px] font-bold text-[var(--fg)] mb-3">Add Photos (Optional)</h3>
                        
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                        />

                        {images.length === 0 ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-[var(--border)] bg-[var(--gray-5)]/20 hover:bg-[var(--gray-5)]/40 hover:border-[var(--brand-secondary)]/50 rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-10 transition-colors cursor-pointer mb-5 group"
                            >
                                <Camera size={28} className="text-[var(--gray-4)] group-hover:text-[var(--brand-secondary)] mb-3 transition-colors" />
                                <p className="text-[14px] text-[var(--gray-2)] font-bold mb-1">Click to browse or drag and drop</p>
                                <p className="text-[12px] text-[var(--gray-4)]">JPG, PNG up to 5MB</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-4 mb-5">
                                {images.map((img, index) => (
                                    <div key={index} className="relative w-[80px] h-[80px] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-soft)] group">
                                        <Image src={img.url} alt={`Upload ${index + 1}`} fill className="object-cover" />
                                        <button 
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-[var(--state-error)] transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {/* Add More Button */}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-[80px] h-[80px] rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--gray-4)] hover:text-[var(--brand-secondary)] hover:border-[var(--brand-secondary)] hover:bg-[var(--gray-5)]/20 transition-colors cursor-pointer"
                                >
                                    <ImagePlus size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 mt-4">
                        <button
                            onClick={() => router.push("/guest/my-room")}
                            className="w-full sm:w-auto bg-[var(--black-2)] hover:bg-[var(--black-3)] text-[var(--brand-secondary)] font-bold text-[15px] px-10 py-4 rounded-[var(--radius-lg)] transition-colors shadow-lg cursor-pointer"
                        >
                            Submit My Review
                        </button>
                        <Link
                            href="/guest/my-room"
                            className="text-[14px] font-bold text-[var(--gray-3)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                        >
                            Cancel
                        </Link>
                    </div>

                </div>

                {/* ── Footer text ───────────────────────────────────────────── */}
                <p className="text-[12px] text-[var(--gray-4)] text-center max-w-[440px] mx-auto leading-relaxed">
                    By submitting this review, you certify that this review is based on your own experience and is your genuine opinion of this property.
                </p>

            </div>
        </div>
    )
}
