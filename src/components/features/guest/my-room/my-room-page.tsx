"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Zap, Compass, Star, QrCode, MessageSquare, MapPin, CheckCircle, XCircle, FileText, ChevronRight, Loader2, Wifi, Wind, Tv, Lock, Coffee, Sparkles } from "lucide-react"

type Cta = {
    label: string
    icon: LucideIcon
    href: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const GUEST = { name: "Mr. Smith", room: "Room 402", type: "Deluxe Ocean Suite", wifi: "LuxeHorizon_Guest (5G)" }

const HOTEL_NAME = "Sunset Villa"
const GUEST_FIRST = "Alex"

const QUICK_ACTIONS = [
    {
        id: "food",
        badge: "Order Now",
        title: "Food & Beverage",
        imageSrc: "/images/room/food-beverage.png",
        cta: { label: "Scan QR Code", icon: QrCode, href: "/guest/my-room/qr-scanner" },
    },
    {
        id: "service",
        badge: "Gourmet Selection",
        title: "Room Service",
        imageSrc: "/images/room/room-service.png",
        cta: { label: "Message Staff", icon: MessageSquare, href: "/guest/my-room/message-staff" },
    },
]

const HOTEL_FACILITIES = [
    {
        id: "pool",
        name: "Pool & Spa",
        desc: "Heated indoor pool & luxury massage treatments.",
        imageSrc: "/images/room/pool-spa.png",
    },
    {
        id: "gym",
        name: "Gym",
        desc: "State-of-the-art equipment available 24/7.",
        imageSrc: "/images/room/gym.png",
    },
    {
        id: "biz",
        name: "Business Center",
        desc: "Quiet coworking spaces and meeting rooms.",
        imageSrc: "/images/room/business-center.png",
    },
]

const ROOM_AMENITIES = [
    { id: 'wifi', title: 'High-Speed WiFi', icon: Wifi },
    { id: 'ac', title: 'Air Conditioning', icon: Wind },
    { id: 'tv', title: 'Smart TV', icon: Tv },
    { id: 'safe', title: 'In-Room Safe', icon: Lock },
    { id: 'coffee', title: 'Coffee Maker', icon: Coffee },
    { id: 'clean', title: 'Daily Housekeeping', icon: Sparkles },
]

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
    const [hover, setHover] = useState(0)
    return (
        <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="cursor-pointer transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                >
                    <Star
                        size={32}
                        className={`transition-colors ${(hover || rating) >= star ? "text-[#f0a500] fill-[#f0a500]" : "text-[#d0a050]"}`}
                    />
                </button>
            ))}
        </div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MyRoomPage() {
    const router = useRouter()
    const [rating, setRating] = useState(0)

    const handleWriteReview = () => {
        if (rating > 0) {
            router.push(`/guest/my-room/submit-review?rating=${rating}`)
        }
        setError("")
        setVerificationStatus('verified')
        sessionStorage.setItem('my_room_verified', 'true')
    }

    const handleReviewSubmit = (selectedRating: number) => {
        setRating(selectedRating)
        router.push(`/guest/reviews/submit?rating=${selectedRating}`)
    }

    if (verificationStatus !== 'verified') {
        return (
            <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4 pt-20">
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-w-md w-full p-8 text-center border border-[#e8e8e8] animate-in slide-in-from-bottom-4 duration-500">

                    {verificationStatus === 'checking' && (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-[#953002]/10 rounded-full flex items-center justify-center mb-6 relative">
                                <MapPin size={36} className="text-[#953002]" />
                                <span className="absolute inset-0 rounded-full border-4 border-[#953002] animate-ping opacity-20" />
                            </div>
                            <h2 className="text-[24px] font-bold text-[#1d1d1d] mb-2">Verifying Location</h2>
                            <p className="text-[14px] text-[#555] mb-6">Please wait while we trace your location to confirm your presence at {HOTEL_NAME}...</p>
                            <div className="flex items-center justify-center gap-2 text-[#953002] font-semibold text-[14px]">
                                <Loader2 size={18} className="animate-spin" /> Tracing Location...
                            </div>
                        </div>
                    )}

                    {verificationStatus === 'location_verified' && (
                        <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-[#27AE60]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <CheckCircle size={40} className="text-[#27AE60]" />
                            </div>
                            <h2 className="text-[24px] font-bold text-[#1d1d1d] mb-2 mx-auto">Location Confirmed!</h2>
                            <p className="text-[14px] text-[#555] mb-6 mx-auto">We&apos;ve verified you are at {HOTEL_NAME}. Please select your payment method and provide your receipt to access My Room.</p>

                            {!paymentType ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setPaymentType('online')}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#e0e0e0] hover:border-[#953002] hover:bg-[#953002]/5 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white shadow-sm border border-[#e8e8e8] group-hover:border-[#953002]/30 rounded-lg flex items-center justify-center transition-colors">
                                                <FileText size={22} className="text-[#4f4f4f] group-hover:text-[#953002]" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-[#1d1d1d] text-[16px] leading-tight">Paid Online</p>
                                                <p className="text-[#828282] text-[13px] mt-0.5">I have an online receipt number</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-[#bbb] group-hover:text-[#953002] transform group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => setPaymentType('physical')}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#e0e0e0] hover:border-[#953002] hover:bg-[#953002]/5 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white shadow-sm border border-[#e8e8e8] group-hover:border-[#953002]/30 rounded-lg flex items-center justify-center transition-colors">
                                                <FileText size={22} className="text-[#4f4f4f] group-hover:text-[#953002]" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-[#1d1d1d] text-[16px] leading-tight">Pay at Property</p>
                                                <p className="text-[#828282] text-[13px] mt-0.5">I have a physical receipt from hotel</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-[#bbb] group-hover:text-[#953002] transform group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleVerifyReceipt} className="space-y-4 text-left animate-in slide-in-from-bottom-4 duration-300">
                                    <div>
                                        <label className="block text-[14px] font-bold text-[#4f4f4f] mb-2">
                                            {paymentType === 'online' ? 'Online Receipt Number' : 'Physical Receipt Number'}
                                        </label>
                                        <input
                                            type="text"
                                            value={receiptNumber}
                                            onChange={(e) => setReceiptNumber(e.target.value)}
                                            placeholder={paymentType === 'online' ? 'e.g. REC-12345678' : 'e.g. 008923'}
                                            className="w-full px-4 py-3.5 bg-[#f8f8f8] border border-[#e0e0e0] rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] transition-all"
                                            autoFocus
                                        />
                                        {error && <p className="text-red-500 text-[13px] font-medium mt-2 flex items-center gap-1.5"><XCircle size={14} /> {error}</p>}
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentType(null)
                                                setReceiptNumber('')
                                                setError('')
                                            }}
                                            className="flex-1 px-4 py-3.5 bg-white border-2 border-[#e0e0e0] text-[#4f4f4f] text-[15px] font-bold rounded-xl hover:bg-[#f8f8f8] hover:border-[#d0d0d0] transition-colors cursor-pointer"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] px-4 py-3.5 bg-[#953002] text-white text-[15px] font-bold rounded-xl hover:bg-[#6d2200] transition-colors shadow-[0_4px_14px_rgba(149,48,2,0.3)] cursor-pointer"
                                        >
                                            Verify & Access
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {verificationStatus === 'location_failed' && (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <XCircle size={40} className="text-red-500" />
                            </div>
                            <h2 className="text-[24px] font-bold text-[#1d1d1d] mb-2">Verification Failed</h2>
                            <p className="text-[14px] text-[#555] mb-8">We could not verify that you are currently at {HOTEL_NAME}. Please ensure your location services are enabled and you are on the property.</p>
                            <button
                                onClick={() => setVerificationStatus('checking')}
                                className="w-full py-4 bg-[#953002] text-white text-[15px] font-bold rounded-xl hover:bg-[#6d2200] transition-colors shadow-[0_4px_14px_rgba(149,48,2,0.3)] cursor-pointer"
                            >
                                Try Locating Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16 animate-in fade-in duration-500">
            <div className="max-w-[900px] mx-auto px-4 pt-8">

                {/* ── Welcome Header ────────────────────────────────────────── */}
                <div className="mb-8">
                    <h1 className="text-[32px] font-bold text-[#1d1d1d] leading-tight mb-2">
                        Welcome, {GUEST.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#555]">
                        <span className="flex items-center gap-1.5">
                            🚪 <span className="font-semibold">{GUEST.room}</span> • {GUEST.type}
                        </span>
                        <span className="text-[#e0e0e0]">•</span>
                        <span className="flex items-center gap-1.5">
                            📶 <span className="font-mono font-semibold text-[#1d1d1d]">{GUEST.wifi}</span>
                        </span>
                    </div>
                </div>

                {/* ── Quick Actions ─────────────────────────────────────────── */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={18} className="text-[#953002]" />
                        <h2 className="text-[18px] font-bold text-[#1d1d1d]">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {QUICK_ACTIONS.map(action => {
                            // Render standard card content
                            const renderCardContent = (ctaObj: Cta) => (
                                <>
                                    <Image
                                        src={action.imageSrc}
                                        alt={action.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 600px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
                                        <span className="self-start text-[10px] font-bold uppercase tracking-widest text-white bg-[#953002] px-2.5 py-1 rounded-full">
                                            {action.badge}
                                        </span>
                                        <div className="flex items-end justify-between">
                                            <p className="text-[22px] font-black text-white drop-shadow">{action.title}</p>
                                            <span className="inline-flex items-center gap-1.5 bg-[#f0a500] group-hover:bg-[#d49000] text-black text-[12px] font-bold px-3.5 py-2 rounded-xl transition-colors shadow-lg">
                                                <ctaObj.icon size={14} />
                                                {ctaObj.label}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )

                            // If a desktop-specific CTA is provided, render both (hidden/shown by CSS)
                            if (action.desktopCta) {
                                return (
                                    <div key={action.id} className="relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] group h-[240px] cursor-pointer">
                                        {/* Desktop Version */}
                                        <Link href={action.desktopCta.href} className="hidden md:block absolute inset-0 no-underline">
                                            {renderCardContent(action.desktopCta)}
                                        </Link>
                                        {/* Mobile Version */}
                                        <Link href={action.cta.href} className="block md:hidden absolute inset-0 no-underline">
                                            {renderCardContent(action.cta)}
                                        </Link>
                                    </div>
                                )
                            }

                            // Standard wrapper for actions that are the same on both views
                            const CardWrapper = action.cta.href ? Link : "div"
                            return (
                                <CardWrapper
                                    key={action.id}
                                    href={action.cta.href || "#"}
                                    className="relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] group h-[240px] block no-underline cursor-pointer"
                                >
                                    {renderCardContent(action.cta)}
                                </CardWrapper>
                            )
                        })}
                    </div>
                </section>

                {/* ── Explore the Hotel ─────────────────────────────────────── */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Compass size={18} className="text-[#953002]" />
                        <h2 className="text-[18px] font-bold text-[#1d1d1d]">Explore the Hotel</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {HOTEL_FACILITIES.map(facility => (
                            <div key={facility.id} className="group cursor-pointer">
                                {/* Image card */}
                                <div className="relative h-[150px] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.10)] mb-2.5 group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.16)] transition-shadow">
                                    <Image
                                        src={facility.imageSrc}
                                        alt={facility.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="33vw"
                                    />
                                    {/* Label overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <p className="absolute bottom-3 left-3 text-white text-[14px] font-bold drop-shadow">
                                        {facility.name}
                                    </p>
                                </div>
                                <p className="text-[12px] text-[#828282] leading-relaxed px-0.5">{facility.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Standard Room Amenities ───────────────────────────────── */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-5 px-1">
                        <CheckCircle size={18} className="text-[#953002]" />
                        <h2 className="text-[18px] font-bold text-[#1d1d1d]">Your Room Amenities</h2>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#f0f0f0] relative overflow-hidden">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#953002]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-7 gap-x-4 sm:gap-x-8 relative z-10">
                            {ROOM_AMENITIES.map((amenity) => (
                                <div key={amenity.id} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 group cursor-default">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#f8f8f8] flex items-center justify-center text-[#953002] transition-all duration-300 group-hover:bg-[#953002] group-hover:text-white group-hover:shadow-[0_4px_14px_rgba(149,48,2,0.25)] border border-[#e0e0e0] group-hover:border-[#953002]">
                                        <amenity.icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                    <div className="pt-0.5">
                                        <span className="block text-[14px] sm:text-[15px] font-bold text-[#1d1d1d] group-hover:text-[#953002] transition-colors leading-tight mb-1">{amenity.title}</span>
                                        <span className="block text-[11px] sm:text-[12px] text-[#828282] font-medium leading-tight">Standard in {GUEST.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Review Section ────────────────────────────────────────── */}
                <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-8 text-center">
                    <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-2">
                        How was your stay at{" "}
                        <span className="text-[#953002]">{HOTEL_NAME}?</span>
                    </h2>
                    <p className="text-[13px] text-[#828282] leading-relaxed mb-6 max-w-[420px] mx-auto">
                        Hi {GUEST_FIRST}, we hope you&apos;re settling back in. Your feedback helps us improve
                        and helps future travelers find their perfect stay.
                    </p>
                    <StarRating rating={rating} onRate={setRating} />
                    <button
                        id="write-review-btn"
                        onClick={handleWriteReview}
                        disabled={rating === 0}
                        className="mt-6 inline-flex items-center gap-2 bg-[#953002] hover:bg-[#6d2200] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] px-8 py-3.5 rounded-xl transition-colors cursor-pointer"
                    >
                        Write a Review <Send size={15} />
                    </button>
                    {rating === 0 && (
                        <p className="mt-3 text-[12px] text-[#bbb]">Click a star above to rate your stay first</p>
                    )}
                </section>
            </div>
        </div>
    )
}
