"use client"

import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Users, CreditCard, Receipt } from "lucide-react"
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { useEffect, useState } from "react"

export default function BookingConfirmationPage() {
    const searchParams = useSearchParams()
    const bookingRef = searchParams?.get("bookingRef") || ""
    const propertyId = searchParams?.get("propertyId") || ""
    
    // Attempt to load from store if available
    const getBookingByCode = useGuestBookingStore(s => s.getBookingByCode)
    const storedBooking = getBookingByCode(bookingRef)
    
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fafafa]">
                <GuestTopbar />
                <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-10 mt-16 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#9a3300] border-t-transparent rounded-full animate-spin"></div>
                </main>
                <GuestFooter />
            </div>
        )
    }

    // Fallback to URL params if not in store
    const property = storedBooking?.property || searchParams?.get("property") || "Property"
    const location = storedBooking?.location || searchParams?.get("location") || "Location"
    const imageSrc = storedBooking?.imageSrc || searchParams?.get("imageSrc") || "/images/placeholder.jpg"
    const checkIn = storedBooking?.checkInFormatted || searchParams?.get("checkIn") || "-"
    const checkOut = storedBooking?.checkOutFormatted || searchParams?.get("checkOut") || "-"
    const guests = storedBooking?.guestsLabel || searchParams?.get("guests") || "Guests"
    const nights = storedBooking?.nightsLabel || "-"
    const totalPrice = storedBooking?.totalPrice || Number(searchParams?.get("totalPrice")) || 0
    const paymentMethod = storedBooking?.paymentMethod === 'card' ? 'Online Card' : 'Pay at Property'
    const status = storedBooking?.status || "UPCOMING"
    const bookingId = storedBooking?.id || searchParams?.get("bookingId") || "-"
    const roomName = storedBooking?.roomName || "Selected Room"

    return (
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
            <GuestTopbar />
            <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-10 mt-16">
                <div className="mb-6">
                    <Link href="/guest/booking/my-bookings" className="inline-flex items-center gap-2 text-[#555] hover:text-[#9a3300] font-medium transition-colors">
                        <ArrowLeft size={16} /> Back to My Bookings
                    </Link>
                </div>
                
                <h1 className="text-[32px] font-bold text-[#1d1d1d] mb-8">Booking Details</h1>

                <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-sm">
                    {/* Header Image */}
                    <div className="relative w-full h-64 bg-[#f3ede8]">
                        <Image src={imageSrc} alt={property} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <h2 className="text-white text-2xl font-bold mb-1">{property}</h2>
                            <p className="text-white/80 flex items-center gap-1.5 text-sm">
                                <MapPin size={14} /> {location}
                            </p>
                        </div>
                        <div className="absolute top-6 right-6">
                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1d1d1d] uppercase tracking-wider shadow-md">
                                {status}
                            </span>
                        </div>
                    </div>

                    {/* Details Body */}
                    <div className="p-6 sm:p-8 flex flex-col gap-8">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} /> Check-in
                                </span>
                                <span className="font-semibold text-[#1d1d1d]">{checkIn}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} /> Check-out
                                </span>
                                <span className="font-semibold text-[#1d1d1d]">{checkOut}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                                    <Users size={12} /> Guests
                                </span>
                                <span className="font-semibold text-[#1d1d1d]">{guests}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                                    <Receipt size={12} /> Ref Code
                                </span>
                                <span className="font-semibold text-[#1d1d1d]">{bookingRef}</span>
                            </div>
                        </div>

                        {/* Room Info */}
                        <div className="border-t border-[#f0f0f0] pt-6">
                            <h3 className="text-[14px] font-bold text-[#1d1d1d] mb-3 uppercase tracking-wider">Room Information</h3>
                            <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-xl p-4">
                                <p className="font-semibold text-[#1d1d1d]">{roomName}</p>
                                <p className="text-sm text-[#555] mt-1">{nights}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="border-t border-[#f0f0f0] pt-6">
                            <h3 className="text-[14px] font-bold text-[#1d1d1d] mb-4 uppercase tracking-wider">Payment Details</h3>
                            
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#555]">Total Amount</span>
                                    <span className="font-bold text-[#1d1d1d]">LKR {totalPrice.toLocaleString("en-US")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#555]">Payment Method</span>
                                    <span className="flex items-center gap-1.5 font-medium text-[#1d1d1d]">
                                        <CreditCard size={14} /> {paymentMethod}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#f0faeb] border border-[#c3e6b3] rounded-xl p-4 flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#52a333] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    ✓
                                </div>
                                <div>
                                    <p className="font-bold text-[#2a5917] text-sm">Booking Confirmed</p>
                                    <p className="text-[#3b7324] text-xs mt-0.5">Your booking is fully confirmed. You can show this page at the reception upon arrival.</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-[#f0f0f0] pt-6 flex flex-wrap gap-3">
                            <Link href={`/guest/booking/modify?${searchParams?.toString() || ''}`} className="px-6 py-2.5 bg-[#9a3300] hover:bg-[#852900] text-white font-bold rounded-xl transition-colors">
                                Modify Booking
                            </Link>
                            <button onClick={() => window.print()} className="px-6 py-2.5 border border-[#e0e0e0] hover:bg-[#f5f5f5] text-[#1d1d1d] font-bold rounded-xl transition-colors">
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <GuestFooter variant="full" />
        </div>
    )
}
