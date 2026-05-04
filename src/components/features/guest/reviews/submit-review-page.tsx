"use client"

import { useState, useRef } from "react"
import { Star, X, Camera, ImagePlus, ChevronLeft, CheckCircle2, ThumbsUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface UploadedPhoto {
  id: string
  url: string    // object URL — revoked on unmount
  name: string
}

interface RatingCategory {
  key: string
  label: string
  description: string
}

const APP_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Review categories — structured so adding a new one only needs an array entry
// ─────────────────────────────────────────────────────────────────────────────
const RATING_CATEGORIES: RatingCategory[] = [
  { key: "cleanliness", label: "Cleanliness",       description: "How clean was the room and property?" },
  { key: "comfort",     label: "Comfort & Sleep",   description: "Bed, pillows and overall rest quality."  },
  { key: "service",     label: "Staff & Service",   description: "Helpfulness and responsiveness of staff." },
  { key: "dining",      label: "Dining & Food",     description: "Quality of in-room dining and restaurants." },
  { key: "location",    label: "Location & Access", description: "Proximity to local attractions and transport." },
  { key: "value",       label: "Value for Money",   description: "Did the stay meet your expectations for the price?" },
]

const MAX_REVIEW_LENGTH = 1000
const MAX_PHOTOS        = 6

// ─────────────────────────────────────────────────────────────────────────────
// StarRating sub-component
// ─────────────────────────────────────────────────────────────────────────────
function StarRating({
  rating, onChange, size = 32, id,
}: {
  rating: number
  onChange: (r: number) => void
  size?: number
  id: string
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          id={`${id}-star-${star}`}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={size}
            className={`transition-colors ${(hover || rating) >= star ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
          />
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Business Logic Hook
// ─────────────────────────────────────────────────────────────────────────────
function useReviewLogic() {
  const [overallRating, setOverallRating]         = useState(0)
  const [categoryRatings, setCategoryRatings]     = useState<Record<string, number>>({})
  const [reviewText, setReviewText]               = useState("")
  const [photos, setPhotos]                       = useState<UploadedPhoto[]>([])
  const [submitted, setSubmitted]                 = useState(false)
  const [isSubmitting, setIsSubmitting]           = useState(false)
  const [errorMsg, setErrorMsg]                   = useState<string | null>(null)

  const isFormValid = overallRating > 0 && reviewText.trim().length >= 20

  const setCategoryRating = (key: string, value: number) =>
    setCategoryRatings(prev => ({ ...prev, [key]: value }))

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) return

    const newPhotos: UploadedPhoto[] = files.slice(0, remaining).map(file => ({
      id:   `${Date.now()}-${file.name}`,
      url:  URL.createObjectURL(file),
      name: file.name,
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }

  // Release object URLs to avoid memory leaks
  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const target = prev.find(p => p.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter(p => p.id !== id)
    })
  }

  const searchParams = useSearchParams()
  const propertyId = searchParams?.get("propertyId") || "1"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    setIsSubmitting(true)
    setErrorMsg(null)
    
    const guest = useAuthStore.getState().user;
    const guestName = guest?.profile?.firstName ? `${guest.profile.firstName} ${guest.profile.lastName}` : "Guest";
    const guestId = guest?.id ?? 1;

    try {
      const res = await fetch(`${APP_CONFIG.apiBaseUrl}/guest/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: Number(propertyId),
          guestId: guestId,
          guestName: guestName,
          reviewText: reviewText,
          rating: overallRating
        })
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true)
    } catch(err) {
      setErrorMsg("Failed to submit review.");
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false); setOverallRating(0); setCategoryRatings({}); setReviewText(""); setPhotos([]);
  }

  return { overallRating, setOverallRating, categoryRatings, setCategoryRating, reviewText, setReviewText, photos, submitted, isSubmitting, errorMsg, isFormValid, handlePhotoUpload, removePhoto, handleSubmit, resetForm }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function SubmitReviewPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const logic = useReviewLogic()
  const { overallRating, setOverallRating, categoryRatings, setCategoryRating, reviewText, setReviewText, photos, submitted, isSubmitting, errorMsg, isFormValid, handlePhotoUpload, removePhoto, handleSubmit, resetForm } = logic

  // ── Confirmation screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20"
        style={{ background: "transparent" }}>
        <div className="ps-card max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "color-mix(in srgb, var(--state-success) 12%, white)", border: "1px solid color-mix(in srgb, var(--state-success) 25%, transparent)" }}>
            <CheckCircle2 size={38} style={{ color: "var(--state-success)" }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: "var(--fg)" }}>Review Submitted!</h2>
          <div className="flex justify-center gap-0.5 mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={24}
                className={s <= overallRating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
            ))}
          </div>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--gray-3)" }}>
            Thank you for your feedback! Your review has been submitted and will be published after a brief review.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/guest/my-room"
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 no-underline"
              style={{ background: "var(--brand-primary)", color: "white" }}>
              Back to Dashboard
            </Link>
            <button
              onClick={resetForm}
              className="text-sm font-bold cursor-pointer transition-colors"
              style={{ color: "var(--gray-3)" }}>
              Submit another review
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Review form ──
  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "transparent" }}>
      <div className="max-w-[820px] mx-auto px-4 pt-6">

        <Link href="/guest/my-room"
          className="inline-flex items-center gap-2 text-sm font-bold mb-6 no-underline"
          style={{ color: "var(--gray-3)" }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        {/* Hero banner */}
        <div className="relative rounded-[1.5rem] overflow-hidden mb-8 h-[180px] sm:h-[200px]">
          <Image src="/images/room/review-stay.png" alt="Your stay" fill className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.8), transparent)" }} />
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wide mb-3 w-fit border"
              style={{
                background:  "color-mix(in srgb, var(--brand-secondary) 20%, transparent)",
                borderColor: "color-mix(in srgb, var(--brand-secondary) 30%, transparent)",
                color:       "var(--brand-secondary)",
              }}>
              <ThumbsUp size={11} /> Post-Stay Review
            </div>
            <h1 className="text-[1.75rem] font-black text-white mb-1 tracking-tight" style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}>
              How was your stay?
            </h1>
            <p className="text-sm text-white/60">Luxe Horizon Resort · Suite 402 · Oct 12–16, 2024</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Overall rating — the most important field, shown first */}
          <div className="ps-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--brand-secondary) 15%, white)", border: "1px solid color-mix(in srgb, var(--brand-secondary) 20%, transparent)" }}>
                <Star size={18} style={{ color: "var(--brand-secondary)" }} />
              </div>
              <div>
                <h2 className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Overall Rating</h2>
                <p className="text-xs" style={{ color: "var(--gray-3)" }}>How would you rate your overall experience?</p>
              </div>
            </div>

            <div className="flex flex-col items-center py-4">
              <StarRating id="overall" rating={overallRating} onChange={setOverallRating} size={40} />
              {overallRating > 0 && (
                <p className="text-sm font-bold mt-3" style={{ color: "var(--brand-secondary)" }}>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][overallRating]}
                </p>
              )}
              {overallRating === 0 && (
                <p className="text-xs mt-3" style={{ color: "var(--gray-4)" }}>Tap a star to rate</p>
              )}
            </div>
          </div>

          {/* Category ratings — grouped so the form feels structured rather than overwhelming */}
          <div className="ps-card p-5 sm:p-6">
            <h2 className="text-[0.9375rem] font-black mb-1" style={{ color: "var(--fg)" }}>Rate Categories</h2>
            <p className="text-xs mb-5" style={{ color: "var(--gray-3)" }}>Help future guests with detailed ratings.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {RATING_CATEGORIES.map(({ key, label, description }) => (
                <div key={key}>
                  <p className="text-[0.8125rem] font-black mb-0.5" style={{ color: "var(--fg)" }}>{label}</p>
                  <p className="text-[0.625rem] mb-2" style={{ color: "var(--gray-4)" }}>{description}</p>
                  <StarRating id={key} rating={categoryRatings[key] ?? 0} onChange={v => setCategoryRating(key, v)} size={22} />
                </div>
              ))}
            </div>
          </div>

          {/* Written review */}
          <div className="ps-card p-5 sm:p-6">
            <h2 className="text-[0.9375rem] font-black mb-1" style={{ color: "var(--fg)" }}>Your Review</h2>
            <p className="text-xs mb-4" style={{ color: "var(--gray-3)" }}>
              Share what made your stay special (or areas to improve). Minimum 20 characters.
            </p>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={e => setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
              placeholder="Describe your experience: the room, the service, the ambiance…"
              rows={5}
              className="w-full rounded-xl border text-sm resize-none p-4 outline-none transition focus:border-[var(--fg)]"
              style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)", color: "var(--fg)" }}
            />
            <div className="flex justify-between items-center mt-2">
              {reviewText.length > 0 && reviewText.length < 20 && (
                <p className="text-[0.625rem] font-semibold" style={{ color: "var(--state-warning)" }}>
                  {20 - reviewText.length} more characters needed
                </p>
              )}
              <span className="text-[0.625rem] ml-auto font-medium" style={{ color: "var(--gray-4)" }}>
                {reviewText.length} / {MAX_REVIEW_LENGTH}
              </span>
            </div>
          </div>

          {/* Photo upload */}
          <div className="ps-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Add Photos</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--gray-3)" }}>
                  Up to {MAX_PHOTOS} photos (optional — photos boost your review&apos;s helpfulness)
                </p>
              </div>
              <span className="text-[0.625rem] font-black px-2.5 py-1 rounded-full border"
                style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)", color: "var(--gray-3)" }}>
                {photos.length} / {MAX_PHOTOS}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {photos.map(photo => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border group"
                  style={{ borderColor: "var(--border)" }}>
                  <Image src={photo.url} alt={photo.name} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ background: "rgba(0,0,0,0.6)" }}>
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}

              {/* Upload button — only shown when under the limit */}
              {photos.length < MAX_PHOTOS && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                  style={{ borderColor: "var(--border)" }}>
                  <ImagePlus size={20} style={{ color: "var(--gray-4)" }} />
                  <span className="text-[0.5625rem] font-bold" style={{ color: "var(--gray-4)" }}>Add</span>
                </button>
              )}
            </div>

            {/* Hidden inputs — Camera and file picker */}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--gray-2)", background: "color-mix(in srgb, var(--gray-5) 40%, white)" }}>
                <Camera size={14} /> Take Photo
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--gray-2)", background: "color-mix(in srgb, var(--gray-5) 40%, white)" }}>
                <ImagePlus size={14} /> Upload Photos
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Submit */}
          <div className="pb-4">
            {errorMsg && (
              <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200">
                 <p className="text-sm font-semibold">{errorMsg}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full py-4 rounded-xl text-[0.9375rem] font-black text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: "var(--brand-primary)" }}>
              {isSubmitting ? <><RefreshCw size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
            </button>
            <p className="text-[0.6875rem] text-center mt-3 leading-relaxed" style={{ color: "var(--gray-4)" }}>
              By submitting, you certify this review is based on your genuine experience at this property.
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}
