"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { guestApi } from "@/api/guest/guest.api"
import { toast } from "sonner"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle, ImagePlus, X, CalendarIcon, MapPinIcon, HashIcon, BedDoubleIcon, Star, CheckCircle2 } from "lucide-react"

const STAR_CATEGORIES = [
  { key: 'cleanlinessRating', label: 'Cleanliness', required: false },
  { key: 'comfortRating', label: 'Comfort', required: false },
  { key: 'serviceRating', label: 'Service', required: false },
  { key: 'diningRating', label: 'Dining', required: false },
  { key: 'locationRating', label: 'Location', required: false },
  { key: 'valueRating', label: 'Value for Money', required: false },
]

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const confirmationNumber = params.id as string
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [ratings, setRatings] = useState<Record<string, number>>({
    overallRating: 5,
  })
  const [comment, setComment] = useState("")
  
  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const data = await guestApi.getBookingByConfirmation(confirmationNumber)
      setBooking(data)
    } catch (error) {
      toast.error("Failed to load booking details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    try {
      setUploadingImage(true)
      const res = await guestApi.uploadImage(file, "reviews")
      if (res.url) {
        setPhotoUrls((prev) => [...prev, res.url])
        setPhotos((prev) => [...prev, file])
      }
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }
  
  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index))
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRatingChange = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ratings.overallRating) {
      toast.error("Please provide an overall rating")
      return
    }

    try {
      setSubmitting(true)
      await guestApi.createReview({
        bookingId: booking.id,
        propertyId: booking.propertyId,
        overallRating: ratings.overallRating,
        cleanlinessRating: ratings.cleanlinessRating,
        comfortRating: ratings.comfortRating,
        serviceRating: ratings.serviceRating,
        diningRating: ratings.diningRating,
        locationRating: ratings.locationRating,
        valueRating: ratings.valueRating,
        comment: comment.trim() || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      })
      
      toast.success("Review submitted successfully")
      router.push(`/guest/booking`) 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <GuestTopbar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500 font-medium animate-pulse">Loading booking details...</p>
        </main>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <GuestTopbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Booking Not Found</h2>
          <p className="text-slate-500 mb-8">We couldn&apos;t find the booking you&apos;re trying to submit a review for. It may have been removed or the reference is incorrect.</p>
          <Button onClick={() => router.push("/guest/booking")} className="w-full h-12 text-md">
            Return to My Bookings
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <GuestTopbar />
      
      {/* Header Banner */}
      <div className="bg-[#1e293b] text-white py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold tracking-wider uppercase text-white/90">Guest Feedback</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-yellow-400">
              Write a Review
            </h1>
            <p className="text-white/80 max-w-lg text-lg">
              Share your experience at {booking.propertyName} to help other guests make informed decisions.
            </p>
          </div>
          <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => router.back()}>
            Cancel & Return
          </Button>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto py-8 px-4 sm:px-6 -mt-8">
        <div className="space-y-6">
          
          {/* Context Card */}
          <Card className="border-0 shadow-md overflow-hidden bg-white">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <CheckCircle2 className="text-slate-600 w-5 h-5" />
              <h3 className="font-semibold text-slate-800">Booking Context</h3>
            </div>
            <CardContent className="p-0">
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-5 flex items-start gap-4">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500">
                    <HashIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Booking Ref</span>
                    <span className="font-medium text-slate-900">{booking.confirmationCode}</span>
                  </div>
                </div>
                <div className="p-5 flex items-start gap-4">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Property</span>
                    <span className="font-medium text-slate-900">{booking.propertyName}</span>
                  </div>
                </div>
                <div className="p-5 flex items-start gap-4 sm:border-t border-slate-100">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500">
                    <BedDoubleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Room Type</span>
                    <span className="font-medium text-slate-900">{booking.roomName}</span>
                  </div>
                </div>
                <div className="p-5 flex items-start gap-4 sm:border-t border-slate-100">
                  <div className="bg-slate-100 p-2.5 rounded-lg text-slate-500">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Stay Dates</span>
                    <span className="font-medium text-slate-900">
                      {booking.checkIn} — {booking.checkOut}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Your Ratings</CardTitle>
                <CardDescription className="text-base">
                  Click the stars to rate your experience across different categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                
                {/* Overall Rating - Bigger & Separated */}
                <div className="flex flex-col items-center justify-center space-y-3 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                  <Label className="text-lg font-bold text-slate-800">
                    Overall Experience <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange('overallRating', star)}
                        className="p-1 focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${
                            (ratings['overallRating'] || 0) >= star 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-slate-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {STAR_CATEGORIES.map(cat => (
                    <div key={cat.key} className={`flex flex-col space-y-2 p-3 rounded-lg ${cat.required ? 'bg-slate-50 border border-slate-100' : ''}`}>
                      <Label className="text-sm font-semibold text-slate-700">
                        {cat.label} {cat.required && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(cat.key, star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${
                                (ratings[cat.key] || 0) >= star 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-slate-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Written Review (Optional)</Label>
                  <Textarea
                    placeholder="Tell others what you loved about your stay, or what could be improved..."
                    className="min-h-[160px] resize-none text-base p-4 focus-visible:ring-slate-400"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Photos (Optional)</Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Share some photos of the property, your room, or the amenities.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 min-h-[140px] items-center">
                    {photoUrls.map((url, i) => (
                      <div key={i} className="group relative h-24 w-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-1 ring-black/5">
                        <img src={url} alt={`Review photo ${i+1}`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="bg-white/20 hover:bg-red-500 rounded-full p-2 text-white backdrop-blur-sm transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <Label
                      htmlFor="photo-upload"
                      className="h-24 w-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-700 shadow-sm"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="w-6 h-6 mb-2" />
                          <span className="text-[11px] font-semibold tracking-wide uppercase">Add Photo</span>
                        </>
                      )}
                    </Label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>

                <div className="pt-4 mt-8 border-t border-slate-200">
                  <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[200px] h-12 text-base font-semibold shadow-md bg-slate-900 hover:bg-slate-800 text-yellow-400" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
      <GuestFooter />
    </div>
  )
}
