"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Zap, Compass, Star, QrCode, MessageSquare, Send } from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────
const GUEST = { name: "Mr. Smith", room: "Room 402", type: "Deluxe Ocean Suite", wifi: "LuxeHorizon_Guest (5G)" }

const HOTEL_NAME = "Sunset Villa"
const GUEST_FIRST = "Alex"

const QUICK_ACTIONS = [
    {
        id: "food",
        badge: "Gourmet Selection",
        title: "Food & Beverage",
        imageSrc: "/images/room/food-beverage.png",
        cta: { label: "Scan QR Code", icon: QrCode, href: "/guest/my-room/qr-scanner" },
    },
    {
        id: "service",
        badge: "Gourmet Selection",
        title: "Room Service",
        imageSrc: "/images/room/room-service.png",
        cta: { label: "Message Staff", icon: MessageSquare, secondary: false },
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
    const [rating, setRating] = useState(0)
    const [reviewSubmitted, setReviewSubmitted] = useState(false)

    const handleWriteReview = () => {
        if (rating > 0) setReviewSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-16">
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
                            const CardWrapper = action.cta.href ? Link : "div"
                            return (
                                <CardWrapper
                                    key={action.id}
                                    href={action.cta.href || "#"}
                                    className="relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] group h-[240px] block no-underline cursor-pointer"
                                >
                                    {/* Background image */}
                                    <Image
                                        src={action.imageSrc}
                                        alt={action.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 600px) 100vw, 50vw"
                                    />
                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
                                        {/* Badge */}
                                        <span className="self-start text-[10px] font-bold uppercase tracking-widest text-white bg-[#953002] px-2.5 py-1 rounded-full">
                                            {action.badge}
                                        </span>
                                        {/* Title + CTA */}
                                        <div className="flex items-end justify-between">
                                            <p className="text-[22px] font-black text-white drop-shadow">{action.title}</p>
                                            <span className="inline-flex items-center gap-1.5 bg-[#f0a500] group-hover:bg-[#d49000] text-black text-[12px] font-bold px-3.5 py-2 rounded-xl transition-colors shadow-lg">
                                                <action.cta.icon size={14} />
                                                {action.cta.label}
                                            </span>
                                        </div>
                                    </div>
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

                {/* ── Review Section ────────────────────────────────────────── */}
                <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-8 text-center">
                    {reviewSubmitted ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto">
                                <Star size={26} className="text-[#27AE60] fill-[#27AE60]" />
                            </div>
                            <h3 className="text-[18px] font-bold text-[#1d1d1d]">Thank you for your review!</h3>
                            <p className="text-[13px] text-[#828282]">
                                Your {rating}-star feedback helps future travelers find their perfect stay.
                            </p>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </section>
            </div>
        </div>
    )
}
