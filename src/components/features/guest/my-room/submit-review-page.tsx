"use client"

import { useState, useRef } from "react"
import { Star, X, Camera, ImagePlus, ChevronLeft, CheckCircle2, ThumbsUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"



// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, setRating, size = 32 }: { rating: number; setRating: (r: number) => void; size?: number }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-all hover:scale-115 cursor-pointer active:scale-95"
        >
          <Star
            size={size}
            className={`transition-colors ${star <= (hover || rating)
              ? "text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
              : "text-[var(--border)] fill-[var(--border)]"
              }`}
          />
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"]

// ─── Category Rating Row ──────────────────────────────────────────────────────
function RatingRow({ label, rating, setRating, emoji }: { label: string; rating: number; setRating: (r: number) => void; emoji: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="text-[18px]">{emoji}</span>
        <span className="text-[14px] font-semibold text-[var(--fg)]">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {rating > 0 && (
          <span className="text-[12px] font-bold text-[var(--brand-secondary)] hidden sm:block">
            {RATING_LABELS[rating]}
          </span>
        )}
        <StarRating rating={rating} setRating={setRating} size={20} />
      </div>
    </div>
  )
}

export default function SubmitReviewPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [overallRating, setOverallRating] = useState(0)
  const [cleanliness, setCleanliness] = useState(0)
  const [service, setService] = useState(0)
  const [valueForMoney, setValueForMoney] = useState(0)
  const [location, setLocation] = useState(0)
  const [amenities, setAmenities] = useState(0)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [images, setImages] = useState<{ file: File; url: string }[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Highlights
  const [highlights, setHighlights] = useState<string[]>([])
  const HIGHLIGHT_OPTIONS = ["Great view", "Comfortable bed", "Friendly staff", "Clean room", "Perfect location", "Excellent food", "Quiet & peaceful", "Great value"]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({ file, url: URL.createObjectURL(file) }))
      setImages(prev => [...prev, ...newImages])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (overallRating === 0) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1800)
  }

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4 pt-20 font-sans">
        <div className="bg-white rounded-[32px] border border-[var(--border)] shadow-lg max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={26} className={s <= overallRating ? "text-[var(--brand-secondary)] fill-[var(--brand-secondary)]" : "text-[var(--border)] fill-[var(--border)]"} />
            ))}
          </div>
          <h2 className="text-[26px] font-black text-[var(--fg)] mb-2 tracking-tight">Thank You!</h2>
          <p className="text-[14px] text-[var(--gray-3)] mb-8 leading-relaxed max-w-[280px] mx-auto">
            Your review has been submitted. It helps thousands of travelers make better decisions.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/guest/my-room" className="w-full py-4 bg-[var(--black-2)] hover:bg-[var(--black-3)] text-white font-black text-[15px] rounded-2xl transition-colors no-underline flex items-center justify-center">
              Back to My Room
            </Link>
            <button onClick={() => { setSubmitted(false); setOverallRating(0); setReviewText(""); setImages([]) }}
              className="text-[13px] text-[var(--gray-3)] hover:text-[var(--fg)] font-semibold transition-colors cursor-pointer">
              Submit another review
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-20 pb-16 font-sans">
      <div className="max-w-[820px] mx-auto px-4 pt-6">

        {/* ── Hero banner ───────────────────────────────────────────────── */}
        <div className="relative rounded-[28px] overflow-hidden mb-8 h-[200px]">
          <Image src="/images/room/review-stay.png" alt="Your stay" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--brand-secondary)]/20 border border-[var(--brand-secondary)]/30 rounded-full text-[11px] font-bold text-[var(--brand-secondary)] uppercase tracking-wide mb-3 w-fit">
              <ThumbsUp size={11} /> Post-Stay Review
            </div>
            <h1 className="text-[28px] font-black text-white mb-1 tracking-tight">How was your stay?</h1>
            <p className="text-[13px] text-white/60">Luxe Horizon Resort · Suite 402 · Oct 12–16, 2024</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Overall Rating ────────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm p-8 mb-5 text-center">
            <h2 className="text-[18px] font-black text-[var(--fg)] mb-1">Overall Experience</h2>
            <p className="text-[13px] text-[var(--gray-3)] mb-6">Tap a star to rate your stay</p>
            <div className="flex justify-center mb-3">
              <StarRating rating={overallRating} setRating={setOverallRating} size={44} />
            </div>
            {overallRating > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--brand-secondary)]/10 rounded-full text-[14px] font-black text-[var(--brand-secondary)] mt-2">
                <Star size={14} className="fill-[var(--brand-secondary)]" />
                {RATING_LABELS[overallRating]}
              </div>
            )}
          </div>

          {/* ── Detailed Ratings ─────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm p-8 mb-5">
            <h2 className="text-[16px] font-black text-[var(--fg)] mb-4">Detailed Ratings</h2>
            <RatingRow label="Cleanliness" rating={cleanliness} setRating={setCleanliness} emoji="✨" />
            <RatingRow label="Service" rating={service} setRating={setService} emoji="🛎️" />
            <RatingRow label="Value for Money" rating={valueForMoney} setRating={setValueForMoney} emoji="💰" />
            <RatingRow label="Location" rating={location} setRating={setLocation} emoji="📍" />
            <RatingRow label="Amenities" rating={amenities} setRating={setAmenities} emoji="🏊" />
          </div>

          {/* ── Highlights ───────────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm p-8 mb-5">
            <h2 className="text-[16px] font-black text-[var(--fg)] mb-1">Highlights</h2>
            <p className="text-[12px] text-[var(--gray-3)] mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2.5">
              {HIGHLIGHT_OPTIONS.map(h => {
                const selected = highlights.includes(h)
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHighlights(prev => selected ? prev.filter(x => x !== h) : [...prev, h])}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all cursor-pointer ${selected
                      ? "bg-[var(--black-2)] border-[var(--black-2)] text-white"
                      : "bg-white border-[var(--border)] text-[var(--fg)] hover:border-[var(--gray-3)]"
                      }`}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Written Review ────────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm p-8 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-black text-[var(--fg)]">Your Review</h2>
              <span className={`text-[12px] font-bold ${reviewText.length >= 50 ? "text-green-600" : "text-[var(--gray-4)]"}`}>
                {reviewText.length}/50 min.
              </span>
            </div>
            <input
              type="text"
              value={reviewTitle}
              onChange={e => setReviewTitle(e.target.value)}
              placeholder="Review title (e.g. 'Perfect romantic getaway')"
              className="w-full px-4 py-3 border border-[var(--border)] rounded-xl text-[14px] text-[var(--fg)] placeholder:text-[var(--gray-4)] focus:border-[var(--black-2)] focus:outline-none transition-colors mb-3 font-semibold"
            />
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Tell us about your stay — the bed, the view, the food, the staff. Your honest opinion helps future guests!"
              className="w-full h-[140px] resize-none border border-[var(--border)] rounded-xl p-4 text-[14px] text-[var(--fg)] placeholder:text-[var(--gray-4)] focus:border-[var(--black-2)] focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* ── Add Photos ──────────────────────────────────────────── */}
          <div className="bg-white rounded-[24px] border border-[var(--border)] shadow-sm p-8 mb-8">
            <h2 className="text-[16px] font-black text-[var(--fg)] mb-1">Add Photos</h2>
            <p className="text-[12px] text-[var(--gray-3)] mb-5">Optional — reviews with photos get 3× more views</p>

            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative w-[90px] h-[90px] rounded-2xl overflow-hidden border border-[var(--border)] group shadow-sm">
                  <Image src={img.url} alt={`Upload ${i + 1}`} fill className="object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                    <X size={11} />
                  </button>
                </div>
              ))}
              {images.length < 8 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className={`w-[90px] h-[90px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${images.length === 0 ? "border-[var(--border)] hover:border-[var(--brand-secondary)]" : "border-[var(--border)] hover:border-[var(--brand-secondary)]"}`}>
                  {images.length === 0 ? (
                    <>
                      <Camera size={22} className="text-[var(--gray-4)] group-hover:text-[var(--brand-secondary)] transition-colors" />
                      <span className="text-[10px] font-bold text-[var(--gray-4)] group-hover:text-[var(--brand-secondary)] transition-colors text-center leading-tight">Add<br />Photos</span>
                    </>
                  ) : (
                    <ImagePlus size={22} className="text-[var(--gray-4)] group-hover:text-[var(--brand-secondary)] transition-colors" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={overallRating === 0 || submitting}
              className="flex-1 py-4 bg-[var(--black-2)] hover:bg-[var(--black-3)] disabled:opacity-40 text-[var(--brand-secondary)] font-black text-[15px] rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-[var(--brand-secondary)]/30 border-t-[var(--brand-secondary)] rounded-full animate-spin" /> Submitting…</>
              ) : (
                "Submit My Review"
              )}
            </button>
            <Link href="/guest/my-room" className="sm:w-auto px-8 py-4 border border-[var(--border)] hover:bg-[var(--gray-5)]/30 text-[var(--gray-2)] font-bold text-[14px] rounded-2xl transition-colors text-center no-underline">
              Cancel
            </Link>
          </div>

          {overallRating === 0 && (
            <p className="text-[12px] text-[var(--gray-4)] text-center mt-3">Please select an overall star rating to submit.</p>
          )}

          <p className="text-[11px] text-[var(--gray-4)] text-center mt-4 leading-relaxed max-w-[440px] mx-auto">
            By submitting, you certify this review is based on your genuine experience at this property.
          </p>
        </form>
      </div>
    </div>
  )
}
