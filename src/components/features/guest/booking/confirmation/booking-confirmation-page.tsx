"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    CheckCircle,
    MapPin,
    Map,
    Printer,
    Share2,
    CalendarDays,
    Users,
    CreditCard,
    Copy,
    ChevronRight,
    Info,
    Clock,
    AlertTriangle,
    Hotel,
    Wallet,
} from "lucide-react"
import { getPropertyById } from "@/lib/mock-properties"
import { useGuestBookingStore, type StoredBooking } from "@/store/guest/booking/booking.store"
import { differenceInDays, format } from "date-fns"

const NEARBY_ACTIVITIES = [
    {
        id: "1",
        title: "Colombo City Surf",
        subtitle: "From LKR 8,500/person",
        imageSrc: "/images/booking/activity-surf.png",
    },
    {
        id: "2",
        title: "Vineyard Wine Tasting",
        subtitle: "From LKR 12,000/person",
        imageSrc: "/images/booking/activity-wine.png",
    },
    {
        id: "3",
        title: "Sunset Coastal Hike",
        subtitle: "From LKR 4,500/person",
        imageSrc: "/images/booking/activity-hike.png",
    },
]

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

function parseIsoDate(raw: string | null) {
    if (!raw) return null
    const parsed = new Date(`${raw}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingConfirmationPage() {
    const searchParams = useSearchParams()
    const [copied, setCopied] = useState(false)
    const [booking, setBooking] = useState<StoredBooking | null>(null)

    // Fallback data from URL params if booking not in store
    const [fallbackData, setFallbackData] = useState<{
        confirmationCode: string
        paidInFull: boolean
        propertyName: string
        propertyLocation: string
        propertyImage: string
        roomName: string
        checkIn: string
        checkOut: string
        checkInDate: Date | null
        checkOutDate: Date | null
        guests: number
        nights: number
        totalPrice: number
    } | null>(null)

    useEffect(() => {
        if (!searchParams) return

        const code = searchParams.get("confirmationCode") || ""

        // Try to find booking in store
        const storedBooking = useGuestBookingStore.getState().getBookingByCode(code)

        if (storedBooking) {
            setBooking(storedBooking)
        } else {
            // Fallback: build from URL params
            const propertyId = searchParams.get("propertyId") || ""
            const roomId = searchParams.get("roomId") || ""
            const paidInFull = searchParams.get("paidInFull") === "1"
            const checkInDate = parseIsoDate(searchParams.get("checkIn"))
            const checkOutDate = parseIsoDate(searchParams.get("checkOut"))
            const guests = parseInt(searchParams.get("guests") || "2", 10)
            const totalFromQuery = Number(searchParams.get("total") || "0")
            const nights = checkInDate && checkOutDate ? Math.max(1, differenceInDays(checkOutDate, checkInDate)) : 1

            const property = propertyId ? getPropertyById(propertyId) : null
            const room = property && roomId ? property.rooms.find(r => r.id === roomId) : null

            setFallbackData({
                confirmationCode: code,
                paidInFull,
                propertyName: property?.title || "Your Property",
                propertyLocation: property ? `${property.location}, Sri Lanka` : "Sri Lanka",
                propertyImage: property?.imageSrc || "/images/properties/property-1.jpg",
                roomName: room?.name || "Premium Room",
                checkIn: checkInDate ? format(checkInDate, "EEE, MMM d") : "—",
                checkOut: checkOutDate ? format(checkOutDate, "EEE, MMM d") : "—",
                checkInDate,
                checkOutDate,
                guests,
                nights,
                totalPrice: totalFromQuery > 0 ? totalFromQuery : (room ? room.pricePerNight * nights : 0),
            })
        }
    }, [searchParams])

    const handleCopy = () => {
        const code = booking?.confirmationCode || fallbackData?.confirmationCode || ""
        navigator.clipboard.writeText(`#${code}`).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handlePrint = () => window.print()

    // Derive display values from either booking store or fallback
    const confirmationCode = booking?.confirmationCode || fallbackData?.confirmationCode || "—"
    const paidInFull = booking?.paidInFull ?? fallbackData?.paidInFull ?? true
    const paymentMethod = booking?.paymentMethod || (paidInFull ? "online" : "property")
    const propertyName = booking?.property || fallbackData?.propertyName || "Your Property"
    const propertyLocation = booking?.location ? `${booking.location}, Sri Lanka` : fallbackData?.propertyLocation || "Sri Lanka"
    const propertyImage = booking?.imageSrc || fallbackData?.propertyImage || "/images/properties/property-1.jpg"
    const roomName = booking?.roomName || fallbackData?.roomName || "Premium Room"
    const checkInDisplay = booking?.checkInFormatted || fallbackData?.checkIn || "—"
    const checkOutDisplay = booking?.checkOutFormatted || fallbackData?.checkOut || "—"
    const guestCount = booking?.guests || fallbackData?.guests || 2
    const totalPrice = booking?.totalPrice || fallbackData?.totalPrice || 0
    const nights = booking?.nights || fallbackData?.nights || 1

    if (!booking && !fallbackData) {
        return <div className="min-h-screen flex items-center justify-center">Loading confirmation...</div>
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
            <div className="max-w-[660px] mx-auto px-4 flex flex-col gap-6">

                {/* ── Success Header ────────────────────────────────────────── */}
                <div className="flex flex-col items-center text-center pt-6 pb-2">
                    {/* Animated checkmark */}
                    <div className="relative w-[60px] h-[60px] mb-4">
                        <div className="absolute inset-0 rounded-full bg-[#d4edda] animate-ping opacity-40" />
                        <div className="relative w-[60px] h-[60px] rounded-full bg-[#d4edda] flex items-center justify-center">
                            <CheckCircle size={30} className="text-[#27AE60]" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h1 className="text-[28px] font-bold text-[#1d1d1d] leading-tight mb-2">
                        Booking Confirmed
                    </h1>
                    <p className="text-[15px] text-[#828282] max-w-[380px]">
                        {paidInFull ? (
                            <>Pack your bags! Your stay at{" "}
                            <span className="font-semibold text-[#333]">{propertyName}</span>
                            {" "}is confirmed and fully paid.</>
                        ) : (
                            <>Your reservation at{" "}
                            <span className="font-semibold text-[#333]">{propertyName}</span>
                            {" "}is confirmed. Payment will be collected at check-in.</>
                        )}
                    </p>
                </div>

                {/* ── Payment Status Banner ────────────────────────────────── */}
                {paidInFull ? (
                    <div className="bg-[#e8f5e9] border border-[#27AE60]/20 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                            <CreditCard size={20} className="text-[#27AE60]" />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[#1d1d1d]">Payment Complete</p>
                            <p className="text-[12px] text-[#555]">
                                {formatLKR(totalPrice)} has been charged to your card. No payment needed at check-in.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#fff8e1] border border-[#f0a500]/25 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f0a500]/10 flex items-center justify-center flex-shrink-0">
                            <Wallet size={20} className="text-[#c97c2e]" />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[#1d1d1d]">Pay at Property</p>
                            <p className="text-[12px] text-[#555]">
                                {formatLKR(totalPrice)} is due at check-in. Please bring a valid ID and your confirmation code.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Confirmation Card ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] overflow-hidden">

                    {/* Card header — confirmation code */}
                    <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
                        <p className="text-[10px] font-semibold text-[#953002] uppercase tracking-widest mb-1">
                            Confirmation Details
                        </p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[22px] font-bold text-[#1d1d1d] tracking-tight">
                                    #{confirmationCode}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    aria-label="Copy confirmation code"
                                    className="flex items-center gap-1 text-[#953002] hover:text-[#6d2200] transition-colors text-[13px] font-medium cursor-pointer"
                                >
                                    <Copy size={13} />
                                    <span>{copied ? "Copied!" : "Copy"}</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-[#828282]">
                                <button
                                    onClick={handlePrint}
                                    aria-label="Print booking"
                                    className="hover:text-[#1d1d1d] transition-colors cursor-pointer"
                                >
                                    <Printer size={18} />
                                </button>
                                <button
                                    aria-label="Share booking"
                                    className="hover:text-[#1d1d1d] transition-colors cursor-pointer"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Property info */}
                    <div className="p-5 flex gap-4 border-b border-[#f0f0f0]">
                        <div className="relative w-[140px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f3ede8]">
                            <Image
                                src={propertyImage}
                                alt={propertyName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1.5">
                            <h2 className="text-[17px] font-bold text-[#1d1d1d] leading-snug">
                                {propertyName}
                            </h2>
                            <p className="text-[13px] font-medium text-[#555]">{roomName}</p>
                            <div className="flex items-start gap-1.5">
                                <MapPin size={13} className="text-[#828282] mt-0.5 flex-shrink-0" />
                                <p className="text-[13px] text-[#828282] leading-snug">
                                    {propertyLocation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stay details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-[#f0f0f0]">
                        {[
                            {
                                icon: CalendarDays,
                                label: "Check-In",
                                value: checkInDisplay,
                                sub: "After 3:00 PM",
                            },
                            {
                                icon: CalendarDays,
                                label: "Check-Out",
                                value: checkOutDisplay,
                                sub: "Before 11:00 AM",
                            },
                            {
                                icon: Users,
                                label: "Guests",
                                value: `${guestCount} Guest${guestCount > 1 ? 's' : ''}`,
                                sub: `${nights} night${nights > 1 ? 's' : ''}`,
                            },
                            {
                                icon: CreditCard,
                                label: "Total Price",
                                value: formatLKR(totalPrice),
                                sub: paidInFull ? "Paid in full" : "Pay at property",
                                valueClass: "text-[#1d1d1d]",
                                subClass: paidInFull ? "text-[#27AE60] font-semibold" : "text-[#c97c2e] font-semibold",
                            },
                        ].map(({ icon: Icon, label, value, sub, valueClass, subClass }, i) => (
                            <div
                                key={label}
                                className={[
                                    "p-4 flex flex-col gap-1",
                                    i < 3 ? "border-r border-[#f0f0f0]" : "",
                                ].join(" ")}
                            >
                                <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className={`text-[14px] font-bold text-[#1d1d1d] leading-tight ${valueClass ?? ""}`}>
                                    {value}
                                </p>
                                <p className={`text-[12px] leading-tight ${subClass ?? "text-[#828282]"}`}>
                                    {sub}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Payment-specific instructions */}
                    {paidInFull ? (
                        <div className="mx-5 my-4 bg-[#fffbf5] border border-[#f5d9b5] rounded-xl p-4 flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <Info size={16} className="text-[#c97c2e]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[#1d1d1d] mb-1">Check-in Instructions</p>
                                <p className="text-[12px] text-[#4f4f4f] leading-relaxed">
                                    This property offers self check-in via a smart keypad. Your unique access code will be sent to your email and Prime Stay messages 24 hours before your stay. The code will become active at 3:00 PM on your check-in date.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mx-5 mt-4 bg-[#fff8e1] border border-[#f0a500]/20 rounded-xl p-4 flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <AlertTriangle size={16} className="text-[#c97c2e]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-[#1d1d1d] mb-1">Payment Required at Check-in</p>
                                    <p className="text-[12px] text-[#4f4f4f] leading-relaxed">
                                        Please present your <strong>confirmation code #{confirmationCode}</strong> and a valid <strong>National ID or Passport</strong> at the reception desk. Payment of <strong>{formatLKR(totalPrice)}</strong> will be collected upon arrival. Accepted methods: Cash, Credit/Debit card.
                                    </p>
                                </div>
                            </div>
                            <div className="mx-5 my-3 bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl p-4 flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <Clock size={16} className="text-[#828282]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-[#1d1d1d] mb-1">Free Cancellation</p>
                                    <p className="text-[12px] text-[#4f4f4f] leading-relaxed">
                                        Since you selected &quot;Pay at Property&quot;, you can cancel this booking free of charge up to 48 hours before your check-in date. No charges will apply.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Price Breakdown */}
                    {booking && (
                        <div className="mx-5 mb-4 mt-2 border border-[#f0f0f0] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
                                <p className="text-[12px] font-bold text-[#828282] uppercase tracking-wider">Price Breakdown</p>
                            </div>
                            <div className="px-4 py-3 space-y-2.5">
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-[#828282]">Room ({booking.nights} night{booking.nights > 1 ? 's' : ''})</span>
                                    <span className="text-[#1d1d1d] font-medium">{formatLKR(booking.basePrice)}</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-[#828282]">Taxes</span>
                                    <span className="text-[#1d1d1d] font-medium">{formatLKR(booking.taxes)}</span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-[#828282]">Service Fee</span>
                                    <span className="text-[#1d1d1d] font-medium">{formatLKR(booking.serviceFee)}</span>
                                </div>
                                {booking.discount > 0 && (
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#27AE60]">Online Discount</span>
                                        <span className="text-[#27AE60] font-medium">-{formatLKR(booking.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[14px] pt-2 border-t border-[#f0f0f0]">
                                    <span className="font-bold text-[#1d1d1d]">Total</span>
                                    <span className="font-bold text-[#953002]">{formatLKR(booking.totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-[12px] pt-1">
                                    <span className="text-[#828282]">
                                        {paidInFull ? "Charged to card" : "Due at check-in"}
                                    </span>
                                    <span className={`font-semibold ${paidInFull ? "text-[#27AE60]" : "text-[#c97c2e]"}`}>
                                        {formatLKR(booking.totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA button */}
                    <div className="px-5 pb-5">
                        <Link
                            href="/guest/booking/my-bookings"
                            className="w-full flex items-center justify-center gap-2 bg-[#953002] text-white rounded-xl px-5 py-3 text-[14px] font-semibold hover:bg-[#6d2200] transition-colors no-underline"
                        >
                            <CalendarDays size={16} />
                            My Bookings
                        </Link>
                    </div>
                </div>

                {/* ── Popular things nearby ─────────────────────────────────── */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[17px] font-bold text-[#1d1d1d]">
                            Popular things to do nearby
                        </h3>
                        <button className="text-[13px] font-semibold text-[#953002] hover:text-[#6d2200] transition-colors flex items-center gap-0.5 cursor-pointer">
                            See all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {NEARBY_ACTIVITIES.map((activity) => (
                            <div
                                key={activity.id}
                                className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-[#f3ede8]">
                                    <Image
                                        src={activity.imageSrc}
                                        alt={activity.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-2.5">
                                    <p className="text-[13px] font-semibold text-[#1d1d1d] leading-tight">
                                        {activity.title}
                                    </p>
                                    <p className="text-[11px] text-[#828282] mt-0.5">
                                        {activity.subtitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
