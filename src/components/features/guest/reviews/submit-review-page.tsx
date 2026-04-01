"use client"

import { useState, useRef } from "react"
import { Star, X, Camera } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const reviewSchema = z.object({
    overallRating: z.number().min(1, "Please select an overall rating"),
    cleanliness: z.number().min(1),
    service: z.number().min(1),
    valueForMoney: z.number().min(1),
    reviewText: z.string().min(50, "Review must be at least 50 characters long").max(1000, "Review text is too long"),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

// ─── Shared Components ────────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 32 }: { value: number; onChange: (r: number) => void; size?: number }) {
    const [hover, setHover] = useState(0)

    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 cursor-pointer"
                >
                    <Star
                        size={size}
                        className={`${star <= (hover || value)
                            ? "text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                            : "text-[var(--gray-5)] fill-[var(--gray-5)]"
                        } transition-colors`}
                    />
                </button>
            ))}
        </div>
    )
}

function SmallStarRating({ value, onChange }: { value: number; onChange: (r: number) => void }) {
    return <StarRating value={value} onChange={onChange} size={18} />
}

export default function SubmitReviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const ratingParam = Number(searchParams.get('rating')) || 5

    const [photos, setPhotos] = useState<{ url: string; name: string }[]>([
        { url: "/images/room-features/resort-exterior.png", name: "photo-1" },
        { url: "/images/room-features/food-beverage.png", name: "photo-2" },
    ])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            overallRating: ratingParam,
            cleanliness: 4,
            service: 5,
            valueForMoney: 4,
            reviewText: ""
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        Array.from(files).forEach(file => {
            const url = URL.createObjectURL(file)
            setPhotos(prev => [...prev, { url, name: file.name }])
        })
        e.target.value = ""
    }

    const removePhoto = (name: string) => {
        setPhotos(prev => prev.filter(p => p.name !== name))
    }

    const onSubmit = async (data: ReviewFormValues) => {
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500))
        console.log("Review Submitted", { data, photos })
        router.push("/guest/reviews/completed")
    }

    return (
        <div className="min-h-screen bg-[var(--gray-5)]/20 pt-20 pb-16">
            <div className="max-w-[800px] mx-auto px-4 pt-4">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--fg)] leading-tight mb-2">
                        Submit Property Review
                    </h1>
                    <p className="text-[14px] text-[var(--muted)] max-w-[500px] mx-auto leading-relaxed">
                        Your feedback helps thousands of travelers make better choices. Tell us about your stay at <span className="font-bold text-[var(--fg)]">Grand Ocean Resort</span>.
                    </p>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit(onSubmit)} className="ps-card p-6 md:p-10 mb-8">
                    
                    {/* We no longer ask for Overall Rating because it's captured previously */}

                    {/* Detailed Ratings */}
                    <div className="mb-10">
                        <h3 className="text-[15px] font-bold text-[var(--fg)] mb-5">Detailed Ratings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
                            <div>
                                <p className="text-[13px] font-semibold text-[var(--black-3)] mb-2">Cleanliness</p>
                                <Controller name="cleanliness" control={control} render={({ field }) => <SmallStarRating value={field.value} onChange={field.onChange} />} />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[var(--black-3)] mb-2">Service</p>
                                <Controller name="service" control={control} render={({ field }) => <SmallStarRating value={field.value} onChange={field.onChange} />} />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[var(--black-3)] mb-2">Value for Money</p>
                                <Controller name="valueForMoney" control={control} render={({ field }) => <SmallStarRating value={field.value} onChange={field.onChange} />} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[var(--border)] mb-8" />

                    {/* Written Review */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-bold text-[var(--fg)]">Your Written Review <span className="text-[var(--state-error)]">*</span></h3>
                            <span className="text-[11px] text-[var(--gray-4)]">Min. 50 characters</span>
                        </div>
                        <textarea
                            {...register("reviewText")}
                            placeholder="Tell us what you liked or didn't like. Was the bed comfortable? How was the location?"
                            className={`w-full h-[140px] resize-none border rounded-[var(--radius)] p-4 text-[14px] text-[var(--fg)] placeholder:text-[var(--gray-4)] outline-none transition-colors ${errors.reviewText ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'}`}
                        />
                        {errors.reviewText && <span className="text-[12px] text-[var(--state-error)] mt-1 block font-medium">{errors.reviewText.message}</span>}
                    </div>

                    {/* Photo Upload */}
                    <div className="mb-10">
                        <h3 className="text-[15px] font-bold text-[var(--fg)] mb-3">Add Photos (Optional)</h3>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-[var(--gray-4)] bg-[var(--gray-5)]/20 hover:bg-[var(--gray-5)]/40 rounded-[var(--radius)] flex flex-col items-center justify-center py-10 transition-colors cursor-pointer mb-5 text-[var(--gray-3)] hover:text-[var(--fg)]"
                        >
                            <Camera size={28} className="mb-3" />
                            <p className="text-[13px] font-medium mb-1">Drag and drop your photos here</p>
                            <p className="text-[11px]">or click to browse from your computer</p>
                        </div>
                        {photos.length > 0 && (
                            <div className="flex items-center gap-3 flex-wrap">
                                {photos.map(photo => (
                                    <div key={photo.name} className="relative w-[64px] h-[64px] rounded-lg overflow-hidden border border-[var(--border)] flex-shrink-0">
                                        <Image src={photo.url} alt={photo.name} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo.name)}
                                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)] text-white font-bold text-[14px] px-10 py-3.5 rounded-[var(--radius)] transition-colors shadow-md flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? "Submitting..." : "Submit My Review"}
                        </button>
                        <Link
                            href="/guest/my-room"
                            className="text-[14px] font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                <p className="text-[11px] text-[var(--gray-4)] text-center max-w-[420px] mx-auto leading-relaxed">
                    By submitting this review, you certify that this review is based on your own experience and is your genuine opinion of this property.
                </p>
            </div>
        </div>
    )
}
