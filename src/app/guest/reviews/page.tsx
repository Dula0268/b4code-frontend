"use client"

import { useState, useRef, Suspense } from "react"
import { Star, X, Camera, ImagePlus, ChevronLeft, CheckCircle2, ThumbsUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { guestApi } from "@/api/guest/guest.api";
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import { useGuestGuard } from "@/hooks/use-guest-guard"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface UploadedPhoto {
  id: string
  url: string    // object URL — revoked on unmount
  name: string
  file: File
}

interface RatingCategory {
  key: string
  label: string
  description: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Review categories
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
function StarRating({ rating, onChange, size = 32, id }: { rating: number, onChange: (r: number) => void, size?: number, id: string }) {
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
  const [successMsg, setSuccessMsg]               = useState<string | null>(null)
  const router = useRouter()

  const isFormValid = overallRating > 0 && reviewText.trim().length >= 20

  const setCategoryRating = (key: string, value: number) => setCategoryRatings(prev => ({ ...prev, [key]: value }))

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) return

    const newPhotos: UploadedPhoto[] = files.slice(0, remaining).map(file => ({
      id:   `${Date.now()}-${file.name}`,
      url:  URL.createObjectURL(file),
      name: file.name,
      file: file,
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const target = prev.find(p => p.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter(p => p.id !== id)
    })
  }

  const searchParams = useSearchParams()
  const propertyId = searchParams?.get("propertyId") || "1"
  const bookingId = searchParams?.get("bookingId") || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    setIsSubmitting(true)
    setErrorMsg(null)
    
    const guest = useAuthStore.getState().user
    const guestName = guest?.profile?.firstName ? `${guest.profile.firstName} ${guest.profile.lastName}` : "Guest"
    const bookingStore = useGuestBookingStore.getState()
    const booking = bookingStore.bookings.find((item) => item.propertyId === propertyId) ?? bookingStore.bookings[0]

    if (!booking) {
      setErrorMsg("You need a completed booking before leaving a review.")
      setIsSubmitting(false)
      setTimeout(() => setErrorMsg(null), 3500)
      return
    }

    try {
      // 1. Upload photos if any
      const photoUrls: string[] = []
      for (const photo of photos) {
        try {
          const res = await guestApi.uploadImage(photo.file, "reviews")
          if (res.url) photoUrls.push(res.url)
        } catch (uploadErr) {
          console.error("Failed to upload photo", photo.name, uploadErr)
        }
      }

      // 2. Submit the full review
      await guestApi.createReview({ 
        bookingId: Number(bookingId), 
        propertyId: Number(propertyId) || undefined,
        overallRating, 
        cleanlinessRating: categoryRatings.cleanliness,
        comfortRating: categoryRatings.comfort,
        serviceRating: categoryRatings.service,
        diningRating: categoryRatings.dining,
        locationRating: categoryRatings.location,
        valueRating: categoryRatings.value,
        comment: reviewText,
        photoUrls 
      })
      setSuccessMsg("Review submitted successfully! Redirecting...")
      setTimeout(() => {
        router.push(`/guest/property/${propertyId}`)
      }, 2000)
    } catch (err: any) {
      console.error("Submission error:", err.response?.data || err);
      const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setErrorMsg(`Failed to submit review: ${backendMsg}`);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false); setOverallRating(0); setCategoryRatings({}); setReviewText(""); setPhotos([]);
  }

  return { overallRating, setOverallRating, categoryRatings, setCategoryRating, reviewText, setReviewText, photos, submitted, isSubmitting, errorMsg, successMsg, isFormValid, handlePhotoUpload, removePhoto, handleSubmit, resetForm }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Content
// ─────────────────────────────────────────────────────────────────────────────
function SubmitReviewContent() {
  const { ready } = useGuestGuard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logic = useReviewLogic()
  const { overallRating, setOverallRating, categoryRatings, setCategoryRating, reviewText, setReviewText, photos, submitted, isSubmitting, errorMsg, successMsg, isFormValid, handlePhotoUpload, removePhoto, handleSubmit, resetForm } = logic
  const searchParams = useSearchParams()
  const propertyId = searchParams?.get("propertyId") || "1"

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      {/* ── Success Notification ── */}
      <div
        className={[
          "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-emerald-500 text-white text-[13px] font-medium",
          "px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-300 whitespace-nowrap",
          successMsg ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <span className="text-[16px]">✓</span>
        {successMsg}
      </div>
      {/* ── Error Notification ── */}
      <div
        className={[
          "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#e53935] text-white text-[13px] font-medium",
          "px-4 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(229,57,53,0.3)] transition-all duration-300 whitespace-nowrap",
          errorMsg ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <span className="text-[16px]">⚠️</span>
        {errorMsg}
      </div>

      <div className="max-w-[820px] mx-auto px-4 pt-6">
        <Link href="/guest/booking" className="inline-flex items-center gap-2 text-sm font-bold mb-6 no-underline text-[#828282] hover:text-[#1d1d1d] transition-colors">
          <ChevronLeft size={16} /> Back to My Bookings
        </Link>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#9a3300]/10 border border-[#9a3300]/20">
              <Star size={18} className="text-[#9a3300]" />
            </div>
            <div>
              <h2 className="text-[0.9375rem] font-black text-[#1d1d1d]">Overall Rating</h2>
              <p className="text-xs text-[#828282]">How would you rate your overall experience?</p>
            </div>
          </div>
          <div className="flex flex-col items-center py-4">
            <StarRating id="overall" rating={overallRating} onChange={setOverallRating} size={40} />
            {overallRating > 0 && (
              <p className="text-sm font-bold mt-3 text-[#9a3300]">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][overallRating]}
              </p>
            )}
            {overallRating === 0 && <p className="text-xs mt-3 text-[#a0a0a0]">Tap a star to rate</p>}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-5 sm:p-6">
          <h2 className="text-[0.9375rem] font-black mb-1 text-[#1d1d1d]">Rate Categories</h2>
          <p className="text-xs mb-5 text-[#828282]">Help future guests with detailed ratings.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {RATING_CATEGORIES.map(({ key, label, description }) => (
              <div key={key}>
                <p className="text-[0.8125rem] font-black mb-0.5 text-[#1d1d1d]">{label}</p>
                <p className="text-[0.625rem] mb-2 text-[#a0a0a0]">{description}</p>
                <StarRating id={key} rating={categoryRatings[key] ?? 0} onChange={v => setCategoryRating(key, v)} size={22} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-5 sm:p-6">
          <h2 className="text-[0.9375rem] font-black mb-1 text-[#1d1d1d]">Your Review</h2>
          <p className="text-xs mb-4 text-[#828282]">Share what made your stay special (or areas to improve). Minimum 20 characters.</p>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={e => setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
            placeholder="Describe your experience: the room, the service, the ambiance…"
            rows={5}
            className="w-full rounded-xl border border-[#e8ddcf] bg-[#fdfaf6] text-sm resize-none p-4 outline-none transition focus:border-[#9a3300] text-[#1d1d1d]"
          />
          <div className="flex justify-between items-center mt-2">
            {reviewText.length > 0 && reviewText.length < 20 && <p className="text-[0.625rem] font-semibold text-amber-600">{20 - reviewText.length} more characters needed</p>}
            <span className="text-[0.625rem] ml-auto font-medium text-[#a0a0a0]">{reviewText.length} / {MAX_REVIEW_LENGTH}</span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#e8ddcf] shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[0.9375rem] font-black text-[#1d1d1d]">Add Photos</h2>
              <p className="text-xs mt-0.5 text-[#828282]">Up to {MAX_PHOTOS} photos (optional)</p>
            </div>
            <span className="text-[0.625rem] font-black px-2.5 py-1 rounded-full border border-[#e8ddcf] bg-[#fdfaf6] text-[#828282]">
              {photos.length} / {MAX_PHOTOS}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {photos.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-[#e8ddcf] group">
                <Image src={photo.url} alt={photo.name} fill className="object-cover" />
                <button type="button" onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/60"><X size={12} className="text-white" /></button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-[#e8ddcf] hover:border-[#9a3300]/50 hover:bg-[#9a3300]/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <ImagePlus size={20} className="text-[#a0a0a0]" />
                <span className="text-[0.5625rem] font-bold text-[#a0a0a0]">Add</span>
              </button>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border border-[#e8ddcf] rounded-xl text-xs font-bold transition-colors cursor-pointer text-[#4f4f4f] bg-[#fdfaf6] hover:bg-[#f2e7d9]"><Camera size={14} /> Take Photo</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 border border-[#e8ddcf] rounded-xl text-xs font-bold transition-colors cursor-pointer text-[#4f4f4f] bg-[#fdfaf6] hover:bg-[#f2e7d9]"><ImagePlus size={14} /> Upload Photos</button>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

        <div className="pb-4">
          <button type="submit" disabled={!isFormValid || isSubmitting} className="w-full py-4 rounded-xl text-[0.9375rem] font-black text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#9a3300] hover:bg-[#7a2800]">
            {isSubmitting ? <><RefreshCw size={16} className="animate-spin" /> Submitting...</> : "Submit Review"}
          </button>
          <p className="text-[0.6875rem] text-center mt-3 leading-relaxed text-[#a0a0a0]">By submitting, you certify this review is based on your genuine experience at this property.</p>
        </div>
        </form>
      </div>
    </>
  )
}

export default function SubmitReviewPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 relative">
      <GuestTopbar />
      <main className="max-w-[700px] mx-auto px-4 pt-8 md:pt-12">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-[#9a3300] border-[#e8ddcf] rounded-full animate-spin" /></div>}>
          <SubmitReviewContent />
        </Suspense>
      </main>
      <GuestFooter />
    </div>
  )
}
