"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ShieldCheck, CreditCard, Hotel, ChevronRight, LogIn, User, Home } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { differenceInDays, format } from "date-fns"
import { useAuthStore } from "@/store/auth/auth.store"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { useGuestGuard } from "@/hooks/use-guest-guard"
import { guestApi } from "@/lib/api"
import { getPropertyById } from "@/lib/mock-properties"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import AccessDenied from "@/components/shared/auth/access-denied";

// ─── Zod Validation Schema ────────────────────────────────────────────────────
const checkoutSchema = z.object({
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

type BookingDetails = {
  property: {
    title: string
    roomInfo: string
    rating: number
    reviews: number
    imageSrc: string
  }
  dates: string
  price: {
    base: number
    taxes: number
    discount: number
    total: number
  }
  originalParams: string
}

function parseIsoDate(raw: string | null) {
  if (!raw) return null
  const parsed = new Date(`${raw}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

// ─── Constants removed as we use backend ──────────────────────────────────────────

function useCheckoutLogic() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { user, logout } = useAuthStore()

  useEffect(() => {
    if (!searchParams) return
    const propertyId = searchParams.get("propertyId")
    const roomId = searchParams.get("roomId")
    const checkInDate = parseIsoDate(searchParams.get("checkIn"))
    const checkOutDate = parseIsoDate(searchParams.get("checkOut"))
    const guests = searchParams.get("guests") || "2"
    const totalFromQuery = Number(searchParams.get("total") || "0")

    async function loadData() {
        let property = null as Awaited<ReturnType<typeof guestApi.getPropertyDetail>> | null
        let room = null as { id: string; name: string; pricePerNight: number } | null

        if (propertyId) {
            try {
                property = await guestApi.getPropertyDetail(propertyId)
            } catch (e) {
                const fallback = getPropertyById(propertyId)
                if (fallback) {
                    property = {
                        id: fallback.id,
                        title: fallback.title,
                        location: fallback.location,
                        fullAddress: fallback.fullAddress,
                        propertyType: fallback.propertyType,
                        pricePerNight: fallback.pricePerNight,
                        rating: fallback.rating,
                        reviewCount: fallback.reviewCount,
                        badge: fallback.badge,
                        imageSrc: fallback.imageSrc,
                        galleryImages: fallback.galleryImages,
                        hostName: fallback.hostName,
                        hostBio: fallback.hostBio,
                        hostYears: fallback.hostYears,
                        hostSuperhost: fallback.hostSuperhost,
                        description: fallback.description,
                        amenities: fallback.amenities,
                        reviewBreakdown: fallback.reviewBreakdown,
                        reviews: fallback.reviews,
                        rooms: fallback.rooms as unknown as NonNullable<typeof property>["rooms"],
                        lat: fallback.lat,
                        lng: fallback.lng,
                    }
                }
            }
        }

        if (property && roomId) {
            room = (property.rooms?.find((r) => String(r.id) === String(roomId)) as unknown as { id: string; name: string; pricePerNight: number }) || null
        }

        let priceData = null;
        if (roomId && checkInDate && checkOutDate) {
            try {
                priceData = await guestApi.getPricePreview(
                    Number(roomId),
                    format(checkInDate, "yyyy-MM-dd"),
                    format(checkOutDate, "yyyy-MM-dd"),
                    searchParams.get("promoCode") || undefined
                );
            } catch (e) {
                console.error("Failed to get price preview", e);
            }
        }

        const nights = checkInDate && checkOutDate ? Math.max(1, differenceInDays(checkOutDate, checkInDate)) : 1
        const basePrice = priceData?.subtotal ?? (room ? room.pricePerNight * nights : (property?.pricePerNight ?? 0) * nights)
        const taxes = priceData?.taxAmount ?? 0
        const discountAmount = priceData?.discountAmount ?? 0
        const total = priceData?.totalAmount ?? basePrice

        setBookingDetails({
          property: property ? {
            title: String(property.title),
            roomInfo: `${room ? room.name : "Premium Room"} • ${guests} Guests`,
            rating: Number(property.rating),
            reviews: Number(property.reviewCount),
            imageSrc: String(property.imageSrc)
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
            taxes: taxes,
            discount: discountAmount,
            total: total,
          },
          originalParams: searchParams.toString()
        })
    }

    loadData()
  }, [searchParams])

  const { register, handleSubmit, watch, formState: { errors }, setValue, reset: resetForm } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "online", promoCode: searchParams?.get("promoCode") || "", nationalId: "" }
  })

  const paymentMethod = watch("paymentMethod")
  const total = bookingDetails ? bookingDetails.price.total : 0
  const discountAmount = bookingDetails ? bookingDetails.price.discount : 0

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!bookingDetails) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await new Promise((resolve) => setTimeout(() => resolve(true), 1500))

      const confirmationCode = 'B4C-' + Math.floor(Math.random() * 1000000)
      const bookingId = 'bk-' + Date.now()
      const paidInFull = data.paymentMethod === 'online'

      const checkInRaw = searchParams?.get('checkIn') || ''
      const checkOutRaw = searchParams?.get('checkOut') || ''
      const checkInDate = checkInRaw ? new Date(`${checkInRaw}T00:00:00`) : new Date()
      const checkOutDate = checkOutRaw ? new Date(`${checkOutRaw}T00:00:00`) : new Date()
      const propertyId = searchParams?.get('propertyId') || ''
      const roomId = searchParams?.get('roomId') || ''
      const guestCount = parseInt(searchParams?.get('guests') || '2', 10)
      const nights = Math.max(1, differenceInDays(checkOutDate, checkInDate))

      let serverBookingId = bookingId;

      try {
        const guestProfile = user?.profile
        const guestName = guestProfile ? `${guestProfile.firstName} ${guestProfile.lastName}`.trim() : user?.email?.split("@")[0] ?? "Guest"
        const guestPhone = guestProfile?.phone ?? "+94 77 000 0000"
        const roomNumericId = Number(roomId)

        if (Number.isFinite(roomNumericId) && roomNumericId > 0) {
          const serverBooking = await guestApi.createBooking({
            roomId: roomNumericId,
            guestName,
            guestEmail: user?.email || "guest@primestay.com",
            guestPhone,
            checkIn: checkInRaw,
            checkOut: checkOutRaw,
            guestCount,
            promoCode: data.promoCode?.trim() || undefined,
            paymentMethod: data.paymentMethod,
          });
          if (serverBooking && (serverBooking.bookingId || serverBooking.id)) {
            serverBookingId = String(serverBooking.bookingId ?? serverBooking.id)
          }
        }
      } catch (err) {
        console.warn("Backend booking failed or unreachable, falling back to local store", err)
      }

      useGuestBookingStore.getState().addBooking({
        id: serverBookingId,
        confirmationCode,
        status: 'UPCOMING',
        property: bookingDetails.property.title,
        propertyId,
        location: 'Sri Lanka',
        imageSrc: bookingDetails.property.imageSrc,
        roomName: bookingDetails.property.roomInfo.split(" • ")[0],
        roomId,
        checkIn: checkInRaw,
        checkOut: checkOutRaw,
        checkInFormatted: format(checkInDate, 'MMM d'),
        checkOutFormatted: format(checkOutDate, 'MMM d, yyyy'),
        guests: guestCount,
        guestsLabel: `${guestCount} Guest${guestCount > 1 ? 's' : ''}`,
        nights,
        nightsLabel: `Total for ${nights} night${nights > 1 ? 's' : ''}`,
        totalPrice: Math.round(total),
        basePrice: bookingDetails.price.base,
        taxes: Math.round(bookingDetails.price.taxes),
        serviceFee: 0,
        discount: Math.round(bookingDetails.price.discount),
        paymentMethod: data.paymentMethod,
        paidInFull,
        nationalId: data.nationalId || undefined,
        bookedAt: new Date().toISOString(),
        userEmail: user?.email || '',
      })

      const returnParams = new URLSearchParams(bookingDetails.originalParams)
      returnParams.set('confirmationCode', confirmationCode)
      returnParams.set('paidInFull', paidInFull ? '1' : '0')
      
      if (data.paymentMethod === 'online') {
          returnParams.set('total', String(total))
          returnParams.set('firstName', user?.profile?.firstName || user?.email?.split('@')[0] || '')
          returnParams.set('lastName', user?.profile?.lastName || '')
          returnParams.set('email', user?.email || '')
          router.push(`/payment?${returnParams.toString()}`)
      } else {
          router.push(`/guest/booking/confirmation?${returnParams.toString()}`)
      }
    } catch (e: unknown) {
      setErrorMsg("Failed to process booking. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting, bookingDetails, errorMsg, user, logout,
    register, handleSubmit, errors, resetForm, paymentMethod, discountAmount, total, onSubmit, searchParams
  };
}


function CheckoutContent() {
  const { ready, status, userRole } = useGuestGuard();
  const logic = useCheckoutLogic();
  const { isSubmitting, bookingDetails, errorMsg, user, logout, register, handleSubmit, errors, resetForm, paymentMethod, discountAmount, total, onSubmit, searchParams } = logic;

  // 1. Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
      </div>
    )
  }

  // 2. Unauthorized state (logged in as wrong role)
  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Guest" />;
  }

  // 3. Ready but missing data
  if (!bookingDetails) {
    return <div className="min-h-screen flex items-center justify-center">Loading booking details...</div>
  }

  return (
    <div className="pb-20 pt-8 max-w-7xl mx-auto px-4">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-[13px] mb-8">
          <Link href="/" aria-label="Home" className="text-[#828282] hover:text-[var(--brand-primary)] transition-colors flex items-center"><Home size={15} /></Link>
          <ChevronRight size={13} className="text-[#bbb]" />
          <Link href="/guest/search" className="text-[#828282] hover:text-[var(--brand-primary)] transition-colors">Search</Link>
          <ChevronRight size={13} className="text-[#bbb]" />
          <Link href={`/guest/property/${searchParams?.get("propertyId")}`} className="text-[#828282] hover:text-[var(--brand-primary)] transition-colors truncate max-w-[200px]">{bookingDetails.property.title}</Link>
          <ChevronRight size={13} className="text-[#bbb]" />
          <Link href={`/guest/property/${searchParams?.get("propertyId")}/room/${searchParams?.get("roomId")}`} className="text-[#828282] hover:text-[var(--brand-primary)] transition-colors truncate max-w-[200px]">{bookingDetails.property.roomInfo.split(" • ")[0]}</Link>
          <ChevronRight size={13} className="text-[#bbb]" />
          <span className="text-[var(--brand-primary)] font-medium">Checkout</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Form */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-[var(--fg)] mb-8">Secure your booking</h1>

          {!!user ? (
            <div className="mb-6 flex items-center justify-between gap-4 bg-[var(--state-success)]/5 border border-[var(--state-success)]/20 rounded-[var(--radius-lg)] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--state-success)]/10 flex items-center justify-center">
                  <User size={18} className="text-[var(--state-success)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--fg)]">Logged in as {user?.profile?.firstName || user?.email}</p>
                  <p className="text-xs text-[var(--muted)]">Your details are pre-filled below</p>
                </div>
              </div>
              <button type="button" onClick={() => { logout(); resetForm({ paymentMethod: "online", promoCode: "", nationalId: "" }) }} className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--state-error)] transition-colors bg-transparent border-none cursor-pointer px-3 py-1.5 rounded-md hover:bg-[var(--state-error)]/5">Switch account</button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between gap-4 bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/15 rounded-[var(--radius-lg)] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <LogIn size={18} className="text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--fg)]">Booking as a guest</p>
                  <p className="text-xs text-[var(--muted)]">No account needed — we&apos;ll save your details at checkout</p>
                </div>
              </div>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section className="ps-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[var(--fg)] mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-sm">1</span>
                How would you like to pay?
              </h2>
              <div className="space-y-4">
                {/* Option: Online */}
                <label className={`block relative border rounded-[var(--radius)] p-5 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border)] hover:border-[var(--gray-3)]'}`}>
                  <div className="flex items-start gap-4">
                    <div className="pt-1"><input type="radio" value="online" {...register("paymentMethod")} className="w-4 h-4 text-[var(--brand-primary)] border-[var(--gray-3)] focus:ring-[var(--brand-primary)]" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[var(--fg)] flex items-center gap-2"><CreditCard size={18} className="text-[var(--brand-primary)]" />Pay online now</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">Securely pay the full amount now to lock in your booking instantly.</p>
                    </div>
                  </div>
                </label>
                {/* Option: Property */}
                <label className={`block relative border rounded-[var(--radius)] p-5 cursor-pointer transition-all ${paymentMethod === 'property' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border)] hover:border-[var(--gray-3)]'}`}>
                  <div className="flex items-start gap-4">
                    <div className="pt-1"><input type="radio" value="property" {...register("paymentMethod")} className="w-4 h-4 text-[var(--brand-primary)] border-[var(--gray-3)] focus:ring-[var(--brand-primary)]" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[var(--fg)] flex items-center gap-2"><Hotel size={18} className="text-[var(--brand-primary)]" />Pay at property</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">Your room is held, and you settle the bill upon arrival. Free cancellation policies apply.</p>
                    </div>
                  </div>
                  <div className={`grid transition-all duration-300 ${paymentMethod === 'property' ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="pl-8 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-[var(--fg)] block">National ID / Passport Number <span className="text-[var(--state-error)]">*</span></label>
                          <input {...register("nationalId")} type="text" className={`w-full h-11 px-4 rounded-[var(--radius)] border ${errors.nationalId ? 'border-[var(--state-error)] ring-1 ring-[var(--state-error)]/20' : 'border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'} outline-none transition-all bg-[var(--white)]`} placeholder="e.g. 199012345678 or N1234567" />
                          {errors.nationalId && <span className="text-[12px] text-[var(--state-error)]">{errors.nationalId.message}</span>}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-2">Required by the property to verify your identity upon arrival to prevent fake bookings.</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            <div className="hidden lg:block">
              {errorMsg && <p className="text-sm text-red-600 mb-2 font-semibold">{errorMsg}</p>}
              <p className="text-xs text-[var(--muted)] mb-4 text-center">By clicking complete booking, you agree to our <a href="#" className="underline">Terms and Policies</a>.</p>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-all flex items-center justify-center gap-2 relative disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer">
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</span>
                ) : (
                  <><ShieldCheck size={20} />{paymentMethod === 'online' ? `Secure Pay LKR ${Math.round(total).toLocaleString()}` : 'Complete Booking'}</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Booking Summary */}
        <div className="lg:w-[420px] flex-shrink-0">
          <div className="sticky top-28 space-y-6">
            <div className="ps-card p-6">
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

              <div className="space-y-4 mb-6 pb-6 border-b border-[var(--border)]">
                <div><h4 className="text-sm font-semibold text-[var(--fg)] mb-1">Dates</h4><p className="text-sm text-[var(--muted)]">{bookingDetails.dates}</p></div>
                <div><h4 className="text-sm font-semibold text-[var(--fg)] mb-1">Guests & Room</h4><p className="text-sm text-[var(--muted)]">{bookingDetails.property.roomInfo}</p></div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-[15px] font-bold text-[var(--fg)] mb-2">Price details</h4>
                <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Base Price</span><span className="text-[var(--fg)]">LKR {bookingDetails.price.base.toLocaleString()}</span></div>
                {bookingDetails.price.taxes > 0 && <div className="flex justify-between text-sm"><span className="text-[var(--muted)] underline decoration-dotted underline-offset-4 cursor-help" title="Local taxes and tourism levies">Taxes</span><span className="text-[var(--fg)]">LKR {Math.round(bookingDetails.price.taxes).toLocaleString()}</span></div>}
                {bookingDetails.price.discount > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-[var(--state-success)]/90">Promo Code Discount</span><span className="text-[var(--state-success)]/90">- LKR {Math.round(bookingDetails.price.discount).toLocaleString()}</span></div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center mb-4">
                <span className="font-bold text-[16px] text-[var(--fg)]">Total (LKR)</span>
                <span className="font-bold text-[18px] text-[var(--brand-primary)]">LKR {Math.round(total).toLocaleString()}</span>
              </div>

              <div className="bg-[var(--gray-5)]/50 rounded-[var(--radius)] p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="font-medium text-[var(--fg)]">Due now</span><span className="font-bold text-[var(--fg)]">LKR {paymentMethod === 'online' ? Math.round(total).toLocaleString() : "0"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Due at property</span><span className="text-[var(--muted)] font-medium">LKR {paymentMethod === 'property' ? Math.round(total).toLocaleString() : "0"}</span></div>
              </div>
            </div>

            <div className="block lg:hidden">
              <button onClick={() => { const form = document.getElementById('checkout-form') as HTMLFormElement; if (form) form.requestSubmit(); }} disabled={isSubmitting} className="w-full bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white font-semibold py-3.5 rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <ShieldCheck size={20} />{paymentMethod === 'online' ? `Pay LKR ${Math.round(total).toLocaleString()}` : 'Complete Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <GuestTopbar />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-[var(--border)] rounded-full animate-spin" /></div>}>
          <CheckoutContent />
        </Suspense>
      </main>
      <GuestFooter />
    </div>
  )
}
