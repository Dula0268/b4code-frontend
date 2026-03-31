"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Check, ShieldCheck, CreditCard, Hotel, ChevronRight, LogIn, User } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { getPropertyById } from "@/lib/mock-properties"
import { differenceInDays, format } from "date-fns"
import { useAuthStore } from "@/store/auth/auth.store"
import CheckoutAuthModal from "./checkout-auth-modal"

// ─── Zod Validation Schema ────────────────────────────────────────────────────
const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  specialRequests: z.string().optional(),
  promoCode: z.string().optional(),
  paymentMethod: z.enum(["online", "property"]),
  nationalId: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod === 'property') {
    return !!data.nationalId && data.nationalId.trim().length >= 5;
  }
  return true;
}, {
  message: "NIC or Passport number is required",
  path: ["nationalId"]
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

function parseIsoDate(raw: string | null) {
  if (!raw) return null
  const parsed = new Date(`${raw}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  // ─── Auth state ──────────────────────────────────────────────────────────
  const { user, checkEmailExists, logout } = useAuthStore()
  const isLoggedIn = !!user

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login")
  const [pendingFormData, setPendingFormData] = useState<CheckoutFormValues | null>(null)

  useEffect(() => {
    if (!searchParams) return
    const propertyId = searchParams.get("propertyId")
    const roomId = searchParams.get("roomId")
    const checkInDate = parseIsoDate(searchParams.get("checkIn"))
    const checkOutDate = parseIsoDate(searchParams.get("checkOut"))
    const guests = searchParams.get("guests") || "2"
    
    // Total from query if previously computed
    const totalFromQuery = Number(searchParams.get("total") || "0")

    const property = propertyId ? getPropertyById(propertyId) : null
    const room = property && roomId ? property.rooms.find(r => r.id === roomId) : null

    const nights = checkInDate && checkOutDate ? Math.max(1, differenceInDays(checkOutDate, checkInDate)) : 1
    const basePrice = room ? room.pricePerNight * nights : 0

    // Try to get taxes/fees from total
    const computedTotal = totalFromQuery > 0 ? totalFromQuery : (basePrice + basePrice * 0.11 + 3500)
    const taxes = totalFromQuery > 0 ? (totalFromQuery - basePrice - 3500) : (basePrice * 0.11)

    setBookingDetails({
      property: property ? {
        title: property.title,
        roomInfo: `${room ? room.name : "Premium Room"} • ${guests} Guests`,
        rating: property.rating,
        reviews: property.reviewCount,
        imageSrc: property.imageSrc
      } : {
        title: "Unknown Property",
        roomInfo: "Unknown Room • 2 Guests",
        rating: 0,
        reviews: 0,
        imageSrc: "/images/properties/property-1.jpg"
      },
      dates: checkInDate && checkOutDate ? `${format(checkInDate, 'MMM d')} - ${format(checkOutDate, 'MMM d')} (${nights} nights)` : "Select dates",
      price: {
        base: basePrice,
        taxes: taxes > 0 ? taxes : 0,
        serviceFee: 3500,
        discount: 0,
      },
      originalParams: searchParams.toString()
    })
  }, [searchParams])

  // Initialize React Hook Form with Zod schema
  const { register, handleSubmit, watch, formState: { errors }, setValue, reset: resetForm } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "online", specialRequests: "", promoCode: "", nationalId: "" }
  })

  // ─── Auto-fill when user is logged in ───────────────────────────────────
  useEffect(() => {
    if (user?.profile) {
      setValue("firstName", user.profile.firstName)
      setValue("lastName", user.profile.lastName)
      setValue("email", user.email)
      setValue("phone", user.profile.phone)
    }
  }, [user, setValue])

  const paymentMethod = watch("paymentMethod")

  if (!bookingDetails) {
    return <div className="min-h-screen flex items-center justify-center">Loading booking details...</div>
  }

  const discountAmount = paymentMethod === 'online' ? bookingDetails.price.base * 0.05 : 0
  const total = bookingDetails.price.base + bookingDetails.price.taxes + bookingDetails.price.serviceFee - discountAmount

  // ─── Smart submit handler ───────────────────────────────────────────────
  const onSubmit = async (data: CheckoutFormValues) => {
    // If already logged in → proceed directly
    if (isLoggedIn) {
      await completeBooking(data)
      return
    }

    // Not logged in → check if email exists
    const emailExists = checkEmailExists(data.email)

    if (emailExists) {
      // Existing user → ask to login
      setPendingFormData(data)
      setAuthModalMode("login")
      setShowAuthModal(true)
    } else {
      // New user → ask to create password (auto-register)
      setPendingFormData(data)
      setAuthModalMode("register")
      setShowAuthModal(true)
    }
  }

  const completeBooking = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const returnParams = new URLSearchParams(bookingDetails.originalParams)
    returnParams.set('confirmationCode', 'B4C-' + Math.floor(Math.random() * 1000000))
    returnParams.set('paidInFull', data.paymentMethod === 'online' ? '1' : '0')
    router.push(`/guest/booking/confirmation?${returnParams.toString()}`)
  }

  // Called after successful auth from the modal
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    if (pendingFormData) {
      completeBooking(pendingFormData)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--gray-5)]/20 pb-20 pt-28">
      <div className="ps-container-md">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-[var(--muted)] mb-8">
          <a href="#" className="hover:text-[var(--brand-primary)] transition-colors">Search Results</a>
          <ChevronRight size={14} />
          <a href="#" className="hover:text-[var(--brand-primary)] transition-colors">{bookingDetails.property.title}</a>
          <ChevronRight size={14} />
          <span className="text-[var(--fg)] font-medium">Checkout</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* ── Left Column: Form ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-[var(--fg)] mb-8">Secure your booking</h1>

            {/* ── Auth Status Banner ────────────────────────────────────────────── */}
            {isLoggedIn ? (
              <div className="mb-6 flex items-center justify-between gap-4 bg-[var(--state-success)]/5 border border-[var(--state-success)]/20 rounded-[var(--radius-lg)] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--state-success)]/10 flex items-center justify-center">
                    <User size={18} className="text-[var(--state-success)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--fg)]">
                      Logged in as {user?.profile?.firstName || user?.email}
                    </p>
                    <p className="text-xs text-[var(--muted)]">Your details are pre-filled below</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    resetForm({ paymentMethod: "online", specialRequests: "", promoCode: "", nationalId: "", firstName: "", lastName: "", email: "", phone: "" })
                  }}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--state-error)] transition-colors bg-transparent border-none cursor-pointer px-3 py-1.5 rounded-md hover:bg-[var(--state-error)]/5"
                >
                  Switch account
                </button>
              </div>
            ) : (
              <div className="mb-6 flex items-center justify-between gap-4 bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/15 rounded-[var(--radius-lg)] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                    <LogIn size={18} className="text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--fg)]">
                      Booking as a guest
                    </p>
                    <p className="text-xs text-[var(--muted)]">No account needed — we&apos;ll save your details at checkout</p>
                  </div>
                </div>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* 1. Guest Details */}
              <section className="ps-card p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--fg)] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-sm">1</span>
                  Guest Information
                  {isLoggedIn && (
                    <span className="ml-auto text-xs font-medium text-[var(--state-success)] bg-[var(--state-success)]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Auto-filled
                    </span>
                  )}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--fg)] block">First Name <span className="text-[var(--state-error)]">*</span></label>
                    <input
                      {...register("firstName")}
                      type="text"
                      readOnly={isLoggedIn}
                      className={`w-full h-11 px-4 rounded-[var(--radius)] border ${errors.firstName ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'} outline-none transition-all ${isLoggedIn ? 'bg-[var(--gray-5)]/50 cursor-not-allowed text-[var(--muted)]' : 'bg-[var(--white)]'}`}
                      placeholder="e.g. John"
                    />
                    {errors.firstName && <span className="text-[12px] text-[var(--state-error)]">{errors.firstName.message}</span>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--fg)] block">Last Name <span className="text-[var(--state-error)]">*</span></label>
                    <input
                      {...register("lastName")}
                      type="text"
                      readOnly={isLoggedIn}
                      className={`w-full h-11 px-4 rounded-[var(--radius)] border ${errors.lastName ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'} outline-none transition-all ${isLoggedIn ? 'bg-[var(--gray-5)]/50 cursor-not-allowed text-[var(--muted)]' : 'bg-[var(--white)]'}`}
                      placeholder="e.g. Doe"
                    />
                    {errors.lastName && <span className="text-[12px] text-[var(--state-error)]">{errors.lastName.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--fg)] block">Email Address <span className="text-[var(--state-error)]">*</span></label>
                    <input
                      {...register("email")}
                      type="email"
                      readOnly={isLoggedIn}
                      className={`w-full h-11 px-4 rounded-[var(--radius)] border ${errors.email ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'} outline-none transition-all ${isLoggedIn ? 'bg-[var(--gray-5)]/50 cursor-not-allowed text-[var(--muted)]' : 'bg-[var(--white)]'}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="text-[12px] text-[var(--state-error)]">{errors.email.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--fg)] block">Phone Number <span className="text-[var(--state-error)]">*</span></label>
                    <input
                      {...register("phone")}
                      type="tel"
                      readOnly={isLoggedIn}
                      className={`w-full h-11 px-4 rounded-[var(--radius)] border ${errors.phone ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'} outline-none transition-all ${isLoggedIn ? 'bg-[var(--gray-5)]/50 cursor-not-allowed text-[var(--muted)]' : 'bg-[var(--white)]'}`}
                      placeholder="+94 77 123 4567"
                    />
                    {errors.phone && <span className="text-[12px] text-[var(--state-error)]">{errors.phone.message}</span>}
                  </div>
                </div>

                <div className="mt-5 space-y-1.5">
                  <label className="text-sm font-medium text-[var(--fg)] block">Special Requests (Optional)</label>
                  <textarea
                    {...register("specialRequests")}
                    rows={3}
                    className="w-full p-4 rounded-[var(--radius)] border border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all bg-[var(--white)] resize-none"
                    placeholder="e.g. Late check-in, dietary requirements..."
                  />
                </div>
              </section>

              {/* 2. Payment Rules */}
              <section className="ps-card p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--fg)] mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-sm">2</span>
                  How would you like to pay?
                </h2>

                <div className="space-y-4">
                  {/* Option: Online */}
                  <label className={`block relative border rounded-[var(--radius)] p-5 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border)] hover:border-[var(--gray-3)]'}`}>
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <input
                          type="radio"
                          value="online"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[var(--brand-primary)] border-[var(--gray-3)] focus:ring-[var(--brand-primary)]"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[var(--fg)] flex items-center gap-2">
                            <CreditCard size={18} className="text-[var(--brand-primary)]" />
                            Pay online now
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)]">Securely pay the full amount now to lock in your booking instantly.</p>
                      </div>
                    </div>
                  </label>

                  {/* Option: Property */}
                  <label className={`block relative border rounded-[var(--radius)] p-5 cursor-pointer transition-all ${paymentMethod === 'property' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border)] hover:border-[var(--gray-3)]'}`}>
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <input
                          type="radio"
                          value="property"
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-[var(--brand-primary)] border-[var(--gray-3)] focus:ring-[var(--brand-primary)]"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[var(--fg)] flex items-center gap-2">
                            <Hotel size={18} className="text-[var(--brand-primary)]" />
                            Pay at property
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)]">Your room is held, and you settle the bill upon arrival. Free cancellation policies apply.</p>
                      </div>
                    </div>
                    
                    {/* Expandable NIC Field for Pay at Property */}
                    <div className={`grid transition-all duration-300 ${paymentMethod === 'property' ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="pl-8 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[var(--fg)] block">
                              National ID / Passport Number <span className="text-[var(--state-error)]">*</span>
                            </label>
                            <input
                              {...register("nationalId")}
                              type="text"
                              className={`w-full h-11 px-4 rounded-[var(--radius)] border ${errors.nationalId ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'} outline-none transition-all bg-[var(--white)]`}
                              placeholder="e.g. 199012345678 or N1234567"
                            />
                            {errors.nationalId && <span className="text-[12px] text-[var(--state-error)]">{errors.nationalId.message}</span>}
                          </div>
                          <p className="text-xs text-[var(--muted)] mt-2">Required by the property to verify your identity upon arrival to prevent fake bookings.</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Action Buttons (Desktop) */}
              <div className="hidden lg:block">
                <p className="text-xs text-[var(--muted)] mb-4 text-center">
                  By clicking complete booking, you agree to our <a href="#" className="underline">Terms and Policies</a>.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-all flex items-center justify-center gap-2 relative disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      {paymentMethod === 'online' ? `Secure Pay LKR ${Math.round(total).toLocaleString()}` : 'Complete Booking'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
          
          {/* ── Right Column: Booking Summary ────────────────────────────────────── */}
          <div className="lg:w-[420px] flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              
              {/* Summary Card */}
              <div className="ps-card p-6">
                
                {/* Property Header */}
                <div className="flex gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                  <div className="w-[100px] h-[100px] rounded-[var(--radius)] overflow-hidden bg-[var(--gray-5)] flex-shrink-0 relative">
                    <img src={bookingDetails.property.imageSrc} alt={bookingDetails.property.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">Entire Property</p>
                    <h3 className="font-semibold text-[var(--fg)] leading-snug mb-1 text-[15px]">{bookingDetails.property.title}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold">{bookingDetails.property.rating}</span>
                      <span className="text-xs text-[var(--muted)]">({bookingDetails.property.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Booking Rules */}
                <div className="space-y-4 mb-6 pb-6 border-b border-[var(--border)]">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--fg)] mb-1">Dates</h4>
                    <p className="text-sm text-[var(--muted)]">{bookingDetails.dates}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--fg)] mb-1">Guests & Room</h4>
                    <p className="text-sm text-[var(--muted)]">{bookingDetails.property.roomInfo}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-[15px] font-bold text-[var(--fg)] mb-2">Price details</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Base Price</span>
                    <span className="text-[var(--fg)]">LKR {bookingDetails.price.base.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)] underline decoration-dotted underline-offset-4 cursor-help" title="Local taxes and tourism levies">Taxes</span>
                    <span className="text-[var(--fg)]">LKR {Math.round(bookingDetails.price.taxes).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)] underline decoration-dotted underline-offset-4 cursor-help" title="Platform booking fee">Service fee</span>
                    <span className="text-[var(--fg)]">LKR {bookingDetails.price.serviceFee.toLocaleString()}</span>
                  </div>
                  {paymentMethod === 'online' && discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--state-success)]/90">Online Discount (5%)</span>
                      <span className="text-[var(--state-success)]/90">- LKR {Math.round(discountAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center mb-4">
                  <span className="font-bold text-[16px] text-[var(--fg)]">Total (LKR)</span>
                  <span className="font-bold text-[18px] text-[var(--brand-primary)]">LKR {Math.round(total).toLocaleString()}</span>
                </div>

                <div className="bg-[var(--gray-5)]/50 rounded-[var(--radius)] p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[var(--fg)]">Due now</span>
                    <span className="font-bold text-[var(--fg)]">
                      LKR {paymentMethod === 'online' ? Math.round(total).toLocaleString() : "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Due at property</span>
                    <span className="text-[var(--muted)] font-medium">
                      LKR {paymentMethod === 'property' ? Math.round(total).toLocaleString() : "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Submit Button */}
              <div className="block lg:hidden">
                <button
                  onClick={() => {
                    const form = document.getElementById('checkout-form') as HTMLFormElement
                    if (form) form.requestSubmit()
                  }}
                  disabled={isSubmitting}
                  className="w-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-3.5 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={20} />
                  {paymentMethod === 'online' ? `Pay LKR ${Math.round(total).toLocaleString()}` : 'Complete Booking'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Auth Modal ───────────────────────────────────────────────────────── */}
      {showAuthModal && pendingFormData && (
        <CheckoutAuthModal
          email={pendingFormData.email}
          firstName={pendingFormData.firstName}
          lastName={pendingFormData.lastName}
          phone={pendingFormData.phone}
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
