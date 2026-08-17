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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle, ImagePlus, X, CalendarIcon, MapPinIcon, HashIcon, BedDoubleIcon, ShieldAlertIcon, CheckCircle2 } from "lucide-react"

export default function ComplainPage() {
  const router = useRouter()
  const params = useParams()
  const confirmationNumber = params.id as string
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [category, setCategory] = useState("Room condition")
  const [severity, setSeverity] = useState("General feedback")
  const [description, setDescription] = useState("")
  const [relatedOrderRef, setRelatedOrderRef] = useState("")
  
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
      const res = await guestApi.uploadImage(file, "complaints")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error("Please provide a description of the issue")
      return
    }

    try {
      setSubmitting(true)
      await guestApi.createComplaint({
        bookingId: booking.id,
        propertyId: booking.propertyId,
        category,
        severity,
        description,
        relatedOrderRef: relatedOrderRef.trim() || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      })
      
      toast.success("Complaint submitted successfully")
      router.push(`/guest/booking`) 
    } catch (error) {
      toast.error("Failed to submit complaint")
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
          <p className="text-slate-500 mb-8">We couldn't find the booking you're trying to submit a complaint for. It may have been removed or the reference is incorrect.</p>
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
              <ShieldAlertIcon className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase text-white/90">Support Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-yellow-400">
              File a Complaint
            </h1>
            <p className="text-white/80 max-w-lg text-lg">
              We're sorry your experience wasn't perfect. Please provide details so our team can investigate and resolve the issue.
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
            <div className="bg-[#fdfaf6] px-6 py-4 border-b border-[#e8ddcf] flex items-center gap-3">
              <CheckCircle2 className="text-[#9a3300] w-5 h-5" />
              <h3 className="font-semibold text-slate-800">Booking Context</h3>
            </div>
            <CardContent className="p-0">
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#e8ddcf]">
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
                <CardTitle className="text-xl">Complaint Details</CardTitle>
                <CardDescription className="text-base">
                  Help us categorize and route your complaint to the right team for the fastest resolution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-2">
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Room condition">Room condition</SelectItem>
                        <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="Staff behavior">Staff behavior</SelectItem>
                        <SelectItem value="Billing/overcharge">Billing/overcharge</SelectItem>
                        <SelectItem value="F&B order issue">F&B order issue</SelectItem>
                        <SelectItem value="Safety concern">Safety concern</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Severity <span className="text-red-500">*</span></Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General feedback">General Feedback</SelectItem>
                        <SelectItem value="Needs immediate attention">Needs Immediate Attention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {category === "F&B order issue" && (
                  <div className="space-y-3 p-5 rounded-lg border border-amber-200 bg-amber-50/50">
                    <Label className="text-sm font-semibold text-amber-900">Related Order Reference (Optional)</Label>
                    <Input 
                      className="h-11 bg-white border-amber-200 focus-visible:ring-amber-500"
                      placeholder="e.g. ORD-12345" 
                      value={relatedOrderRef}
                      onChange={(e) => setRelatedOrderRef(e.target.value)}
                    />
                    <p className="text-xs text-amber-700/80">
                      Providing the order reference helps our Food & Beverage team resolve the issue faster.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="Please explain what happened in detail, including dates or times if relevant..."
                    className="min-h-[160px] resize-none text-base p-4 focus-visible:ring-[#9a3300]/20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Evidence (Photos/Videos)</Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload photos of damages, incorrect items, or anything that supports your complaint.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 min-h-[140px] items-center">
                    {photoUrls.map((url, i) => (
                      <div key={i} className="group relative h-24 w-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm ring-1 ring-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Evidence ${i+1}`} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
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
                      className="h-24 w-24 rounded-lg border-2 border-dashed border-[#9a3300]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#9a3300] hover:bg-[#9a3300]/5 transition-all text-[#9a3300]/70 hover:text-[#9a3300] shadow-sm"
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

                <div className="pt-4 mt-8 border-t border-[#e8ddcf]">
                  <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[200px] h-12 text-base font-semibold shadow-md bg-slate-900 hover:bg-slate-800 text-yellow-400" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
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
