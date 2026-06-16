"use client"

import { useState, useRef, Suspense } from "react"
import { Star, X, Camera, ImagePlus, ChevronLeft, CheckCircle2, RefreshCw, MapPin, Home, AlertCircle, ShieldCheck, PenTool } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { guestApi } from "@/api/guest/guest.api"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import { useGuestGuard } from "@/hooks/use-guest-guard"

interface UploadedPhoto {
  id: string
  url: string
  name: string
}

interface RatingCategory {
  key: string
  label: string
  description: string
}

const RATING_CATEGORIES: RatingCategory[] = [
  { key: "cleanliness", label: "Cleanliness",       description: "How clean was the room and property?" },
  { key: "comfort",     label: "Comfort & Accuracy", description: "Bed comfort, room setup and description accuracy." },
  { key: "service",     label: "Staff & Service",   description: "Helpfulness, responsiveness and hospitality of staff." },
  { key: "location",    label: "Location & Access", description: "Convenience of location and transport access." },
  { key: "value",       label: "Value for Money",   description: "Did the stay meet expectations for the price paid?" },
]

const MAX_REVIEW_LENGTH = 1000
const MAX_PHOTOS = 6

function StarRating({ 
  rating, 
  onChange, 
  size = 28, 
  id 
}: { 
  rating: number
  onChange: (r: number) => void
  size?: number
  id: string 
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const isActive = (hover || rating) >= star
        return (
          <button
            key={star}
            id={`${id}-star-${star}`}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="cursor-pointer transition-transform hover:scale-120 active:scale-90 p-0.5"
            aria-label={`Rate ${star} stars out of 5`}
          >
            <Star
              size={size}
              className={`transition-all duration-200 ${
                isActive 
                  ? "text-amber-400 fill-amber-400 drop-shadow-sm" 
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

function SubmitReviewContent() {
  const { ready } = useGuestGuard()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const propertyId = searchParams?.get("propertyId") || ""
  const bookingRef = searchParams?.get("bookingRef") || ""

  const getBookingByCode = useGuestBookingStore(s => s.getBookingByCode)

  const storedBooking = getBookingByCode(bookingRef) || useGuestBookingStore.getState().bookings.find(b => b.propertyId === propertyId)

  // Form State
  const [overallRating, setOverallRating] = useState(0)
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    cleanliness: 0,
    comfort: 0,
    service: 0,
    location: 0,
    value: 0
  })
  const [reviewText, setReviewText] = useState("")
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  
  // Submit States
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isFormValid = overallRating > 0 && 
                      reviewText.trim().length >= 20 && 
                      Object.values(categoryRatings).every(r => r > 0)

  const handleCategoryRatingChange = (key: string, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [key]: rating
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) return

    const newPhotos: UploadedPhoto[] = files.slice(0, remaining).map(file => ({
      id: `${Date.now()}-${file.name}`,
      url: URL.createObjectURL(file),
      name: file.name,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || !storedBooking) return
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await guestApi.createReview({
        bookingId: Number(storedBooking.id),
        overallRating,
        cleanlinessRating: categoryRatings.cleanliness,
        accuracyRating: categoryRatings.comfort,
        communicationRating: categoryRatings.service,
        locationRating: categoryRatings.location,
        valueRating: categoryRatings.value,
        comment: reviewText,
        photoUrls: photos.map(p => p.url)
      })
      setSubmitted(true)
    } catch {
      setErrorMsg("Failed to submit your review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setOverallRating(0)
    setCategoryRatings({ cleanliness: 0, comfort: 0, service: 0, location: 0, value: 0 })
    setReviewText("")
    setPhotos([])
    setErrorMsg(null)
  }

  if (!ready) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
      </div>
    )
  }

  if (!storedBooking) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
        <AlertCircle size={44} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">Booking Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">
          To leave a review, you must have a completed or past stay booking in your record.
        </p>
        <Link href="/guest/booking/my-bookings" className="inline-block px-6 py-2.5 bg-[#9a3300] hover:bg-[#852900] text-white font-bold rounded-xl text-sm transition-colors">
          View My Bookings
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-md animate-in scale-in duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-100/20">
          <CheckCircle2 size={32} />
        </div>
        
        <h2 className="text-xl font-black text-[#0f172a] mb-2">Review Submitted!</h2>
        <div className="flex justify-center gap-0.5 mb-4">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={20} className={s <= overallRating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
          ))}
        </div>
        
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Thank you for sharing your experience at <strong>{storedBooking.property}</strong>! Your review helps other travellers make better decisions.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/guest/booking/my-bookings" className="w-full py-3 bg-[#9a3300] hover:bg-[#852900] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#9a3300]/10 no-underline">
            Back to My Bookings
          </Link>
          <button onClick={resetForm} className="text-xs font-bold text-gray-400 hover:text-[#9a3300] cursor-pointer transition-colors pt-2">
            Submit another review
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-6 xl:px-12 flex flex-col gap-6">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
        <div>
          <div className="mb-2">
            <Link href="/guest/booking/my-bookings" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#9a3300] font-bold no-underline transition-colors">
              <ChevronLeft size={14} /> Back to My Bookings
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0f172a] mb-1">
            Submit Stay Feedback
          </h1>
          <p className="text-sm text-gray-500">
            Tell us about your experience during your visit to {storedBooking.property}.
          </p>
        </div>
      </div>

      {/* FULL SCREEN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN 1: STAY DETAILS VOUCHER & INSTRUCTIONS (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-24">
          
          {/* Stay Info Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-[#f1f5f9] bg-[#f8fafc]">
              <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-gray-400">
                Booking Reference
              </h3>
            </div>

            {storedBooking.imageSrc ? (
              <div className="w-full aspect-video relative flex-shrink-0">
                <img src={storedBooking.imageSrc} alt={storedBooking.property} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-50 flex items-center justify-center flex-shrink-0 relative">
                <Home className="text-gray-300" size={32} />
              </div>
            )}

            <div className="p-5 flex flex-col gap-4">
              <div>
                <h2 className="text-base font-bold text-[#0f172a] mb-0.5 line-clamp-1">{storedBooking.property}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={12} /> {storedBooking.location}
                </p>
              </div>

              <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center font-mono">
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">Confirmation Code</span>
                <span className="text-sm font-bold text-[#9a3300]">#{storedBooking.confirmationCode}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#f1f5f9] text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Room Selection</span>
                  <strong className="text-gray-700">{storedBooking.roomName || "Standard Room"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Checked In</span>
                  <strong className="text-gray-700">{storedBooking.checkInFormatted}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Checked Out</span>
                  <strong className="text-gray-700">{storedBooking.checkOutFormatted}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Length of Stay</span>
                  <strong className="text-gray-700">{storedBooking.nights} Nights</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Review Guidelines info block */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={16} /> Guest Review Policy
            </h4>
            <ul className="text-xs text-gray-400 flex flex-col gap-2 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Your review will help other guests make choices and help hosts improve their hospitality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Keep your written comment constructive, honest, and respectful.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Upload genuine photos of the room setup or property layout to back up your notes.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COLUMN 2: INTERACTIVE FEEDBACK WORKSPACE (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            


            {/* Overall Experience */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#f1f5f9]">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star size={16} className="fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0f172a]">Overall Experience</h3>
                  <p className="text-[11px] text-gray-400">Rate your overall stay satisfaction</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center py-4">
                <StarRating id="overall" rating={overallRating} onChange={setOverallRating} size={38} />
                {overallRating > 0 && (
                  <span className="text-xs font-bold text-amber-500 mt-3 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/50">
                    {["", "Poor Stay", "Fair Stay", "Good Stay", "Very Good Stay", "Excellent Stay"][overallRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Category Scores */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="pb-3 border-b border-[#f1f5f9]">
                <h3 className="text-sm font-extrabold text-[#0f172a]">Detailed Categories</h3>
                <p className="text-[11px] text-gray-400">Rate individual dimensions of your hotel experience</p>
              </div>
              
              <div className="flex flex-col gap-4">
                {RATING_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-0.5">{cat.label}</h4>
                      <p className="text-[11px] text-gray-400">{cat.description}</p>
                    </div>
                    <div className="self-start sm:self-auto flex-shrink-0">
                      <StarRating 
                        id={cat.key} 
                        rating={categoryRatings[cat.key] || 0} 
                        onChange={(r) => handleCategoryRatingChange(cat.key, r)} 
                        size={24}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Written Comment */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#f1f5f9]">
                <PenTool size={16} className="text-[#9a3300]" />
                <h3 className="text-sm font-extrabold text-[#0f172a]">Write Your Review</h3>
              </div>
              <textarea
                id="review-text"
                value={reviewText}
                onChange={e => setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
                placeholder="Share specific details about what you liked or disliked: room comfort, staff attitude, dining quality, location convenience..."
                rows={6}
                className="w-full rounded-2xl border border-[#e2e8f0] text-sm resize-none p-4 outline-none transition focus:border-[#9a3300] bg-gray-50/25"
              />
              <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
                {reviewText.length > 0 && reviewText.length < 20 && (
                  <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/50">
                    {20 - reviewText.length} more characters required
                  </span>
                )}
                <span className="ml-auto">{reviewText.length} / {MAX_REVIEW_LENGTH}</span>
              </div>
            </div>

            {/* Photo Gallery Upload */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0f172a] mb-0.5">Stay Photos</h3>
                  <p className="text-[11px] text-gray-400">Add up to {MAX_PHOTOS} photos of the hotel or room (optional)</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-400">
                  {photos.length} / {MAX_PHOTOS}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(photo.id)} 
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {photos.length < MAX_PHOTOS && (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#9a3300]/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-gray-400 hover:text-[#9a3300]"
                  >
                    <ImagePlus size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Add</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-[#0f172a] rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
                >
                  <Camera size={14} /> Take Photo
                </button>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-[#0f172a] rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
                >
                  <ImagePlus size={14} /> Upload Photos
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {/* Submission triggers */}
            <div className="pb-8">
              {errorMsg && (
                <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-2xl border border-red-200/50 flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={!isFormValid || isSubmitting} 
                className="w-full py-4 bg-[#9a3300] hover:bg-[#852900] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-[15px] rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#9a3300]/10"
              >
                {isSubmitting ? (
                  <><RefreshCw size={16} className="animate-spin" /> Submitting Review...</>
                ) : (
                  "Submit Review"
                )}
              </button>
              
              <p className="text-[10px] text-center text-gray-400 mt-3 leading-relaxed max-w-md mx-auto">
                By submitting this review, you certify that it accurately represents your personal experience during your reservation stay.
              </p>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  )
}

export default function SubmitReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <GuestTopbar />
      <main className="flex-1 pt-20 pb-16">
        <Suspense fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
          </div>
        }>
          <SubmitReviewContent />
        </Suspense>
      </main>
    </div>
  )
}


