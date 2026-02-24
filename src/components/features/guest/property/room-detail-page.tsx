"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    ChevronRight, Home, Users, BedDouble, SquareDot, CheckCircle2,
    Star, ArrowRight, Grid2X2, MapPin
} from "lucide-react"
import type { PropertyDetail, Room } from "@/lib/mock-properties"
import { Calendar } from "@/components/ui/calendar"
import { addDays, differenceInDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

export default function RoomDetailPage({ property, room }: { property: PropertyDetail; room: Room }) {
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0)
    const [descExpanded, setDescExpanded] = useState(false)

    // Default checked payment option
    const [payNow, setPayNow] = useState(true)

    const allImages = [room.imageSrc, ...(property.galleryImages || [])]

    // Calendar & Booking State setup
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2024, 9, 10), // Oct 10 2024
        to: new Date(2024, 9, 14),   // Oct 14 2024
    })

    // Mock booked dates
    const bgBooked = [
        new Date(2024, 9, 5),
        new Date(2024, 9, 6),
        new Date(2024, 9, 7),
        new Date(2024, 9, 18),
        new Date(2024, 9, 19),
    ]

    const nights = date?.from && date?.to ? Math.max(1, differenceInDays(date.to, date.from)) : 1
    const totalRoomPrice = room.pricePerNight * nights
    const serviceFee = 1000
    const taxes = 500
    const finalTotal = totalRoomPrice + serviceFee + taxes

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-20">

                {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
                <nav className="flex items-center gap-1.5 text-[13px] mb-5">
                    <Link href="/" aria-label="Home" className="text-[#828282] hover:text-[#953002] transition-colors flex items-center">
                        <Home size={15} />
                    </Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <Link href="/guest/search" className="text-[#828282] hover:text-[#953002] transition-colors">
                        Search
                    </Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <Link href={`/guest/property/${property.id}`} className="text-[#828282] hover:text-[#953002] transition-colors truncate max-w-[200px]">
                        {property.title}
                    </Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <span className="text-[#953002] font-medium truncate max-w-[240px]">{room.name}</span>
                </nav>

                {/* ── Title & Meta ────────────────────────────────────────────────────── */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#fff4eb] text-[#953002] text-[11px] font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase">
                            Premium Selection
                        </span>
                        <div className="flex items-center text-[#ffb401]">
                            {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
                        </div>
                    </div>
                    <h1 className="text-[32px] font-bold text-[#1d1d1d] leading-tight mb-2">
                        {room.name}
                    </h1>
                    <div className="flex items-center gap-4 text-[14px] text-[#555]">
                        <span className="flex items-center gap-1.5"><MapPin size={15} className="text-[#953002]" /> {property.location}, Sri Lanka</span>
                        <span className="flex items-center gap-1.5"><SquareDot size={15} /> {room.sqft} sq ft</span>
                        <span className="flex items-center gap-1.5"><Users size={15} /> Up to {room.maxGuests} Guests</span>
                    </div>
                </div>

                {/* ── Photo Gallery Grid ──────────────────────────────────────────────── */}
                <div className="relative mb-10 h-[460px] rounded-2xl overflow-hidden flex gap-2">
                    {/* Left primary image */}
                    <div
                        className="w-[50%] h-full relative cursor-pointer group"
                        onClick={() => { setActiveGalleryIdx(0); setGalleryOpen(true) }}
                    >
                        <Image
                            src={room.imageSrc}
                            alt={room.name}
                            fill
                            className="object-cover group-hover:brightness-90 transition"
                            priority
                            sizes="(max-width: 768px) 100vw, 600px"
                        />
                    </div>

                    {/* Right 4 smaller images */}
                    <div className="w-[50%] grid grid-cols-2 grid-rows-2 gap-2 h-full">
                        {property.galleryImages.slice(0, 4).map((img, i) => (
                            <div
                                key={i}
                                className="relative h-full cursor-pointer group"
                                onClick={() => { setActiveGalleryIdx(i + 1); setGalleryOpen(true) }}
                            >
                                <Image
                                    src={img}
                                    alt={`${room.name} photo ${i + 2}`}
                                    fill
                                    className="object-cover group-hover:brightness-90 transition"
                                    sizes="(max-width: 768px) 50vw, 300px"
                                />
                                {/* Overlay button on 4th image */}
                                {i === 3 && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/20 transition-colors">
                                        <button className="flex items-center gap-2 text-white font-medium text-[14px] border border-white/40 bg-black/40 px-5 py-2.5 rounded-xl backdrop-blur-sm">
                                            <Grid2X2 size={16} /> View all {allImages.length} photos
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main Layout ────────────────────────────────────────────────────── */}
                <div className="flex gap-10 items-start">

                    {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-10">

                        {/* About this room */}
                        <div>
                            <h2 className="text-[22px] font-bold text-[#1d1d1d] mb-4">About this room</h2>
                            <p className={`text-[15px] text-[#555] leading-[1.7] ${!descExpanded ? "line-clamp-4" : ""}`}>
                                Experience ultimate luxury in our {room.name}. This masterfully designed room offers floor-to-ceiling windows that frame the breathtaking coastline. Relax in a king-sized plush bed or enjoy the sunset from your private balcony. The suite features modern minimalist decor, premium linen, and a spa-inspired bathroom with a rain shower and soaking tub.
                            </p>
                            <button
                                onClick={() => setDescExpanded(!descExpanded)}
                                className="mt-3 text-[14px] font-bold text-[#953002] inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none p-0"
                            >
                                Read more description <ChevronRight size={14} className={descExpanded ? "-rotate-90 transition-transform" : "rotate-90 transition-transform"} />
                            </button>
                        </div>

                        {/* Room Amenities */}
                        <div>
                            <h2 className="text-[22px] font-bold text-[#1d1d1d] mb-5">Room Amenities</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                                {/* Merge property base amenities and room features mentally */}
                                <div className="flex items-center gap-3 text-[14px] font-medium text-[#333]">
                                    <div className="w-10 h-10 rounded-xl bg-[#fff4eb] flex items-center justify-center text-[#953002]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                                    </div>
                                    Free High-speed Wi-Fi
                                </div>
                                <div className="flex items-center gap-3 text-[14px] font-medium text-[#333]">
                                    <div className="w-10 h-10 rounded-xl bg-[#fff4eb] flex items-center justify-center text-[#953002]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2" /><path d="M12 20v2" /><path d="M5 5l1.5 1.5" /><path d="M17.5 17.5L19 19" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M5 19l1.5-1.5" /><path d="M17.5 6.5L19 5" /><circle cx="12" cy="12" r="3" /></svg>
                                    </div>
                                    Climate Control
                                </div>
                                <div className="flex items-center gap-3 text-[14px] font-medium text-[#333]">
                                    <div className="w-10 h-10 rounded-xl bg-[#fff4eb] flex items-center justify-center text-[#953002]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                    </div>
                                    55&quot; Smart TV
                                </div>
                                <div className="flex items-center gap-3 text-[14px] font-medium text-[#333]">
                                    <div className="w-10 h-10 rounded-xl bg-[#fff4eb] flex items-center justify-center text-[#953002]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="9" y1="2" x2="9" y2="4" /><line x1="15" y1="2" x2="15" y2="4" /></svg>
                                    </div>
                                    Nespresso Machine
                                </div>
                                <div className="flex items-center gap-3 text-[14px] font-medium text-[#333]">
                                    <div className="w-10 h-10 rounded-xl bg-[#fff4eb] flex items-center justify-center text-[#953002]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2v20" /><path d="M19 2v20" /><path d="M5 8h14" /><path d="M5 14h14" /><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /></svg>
                                    </div>
                                    Mini Bar
                                </div>
                                <div className="flex items-center gap-3 text-[14px] font-medium text-[#333]">
                                    <div className="w-10 h-10 rounded-xl bg-[#fff4eb] flex items-center justify-center text-[#953002]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    </div>
                                    Digital Safe
                                </div>
                            </div>
                        </div>

                        {/* Availability */}
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-[22px] font-bold text-[#1d1d1d]">Availability</h2>
                                <div className="flex items-center gap-4 text-[13px] font-medium text-[#555]">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-[#953002]"></span> Selected
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-[#E07070]"></span> Booked
                                    </span>
                                </div>
                            </div>

                            {/* Calendar Block */}
                            <div className="bg-white border border-[#e8e8e8] rounded-2xl p-4 sm:p-6 shadow-sm w-full overflow-x-auto" style={{ '--primary': '14 96% 30%', '--primary-foreground': '0 0% 100%', '--accent': '28 100% 96%', '--accent-foreground': '14 96% 30%', '--ring': '14 96% 30%' } as React.CSSProperties}>
                                <div className="min-w-[550px] flex justify-center">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={new Date(2024, 9, 1)}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                        disabled={bgBooked}
                                        modifiers={{ booked: bgBooked }}
                                        modifiersClassNames={{ booked: "line-through !text-[#E07070] opacity-70 !bg-[#E07070]/10" }}
                                        className="p-0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN (Sidebar) ──────────────────────────────────────── */}
                    <div className="w-[360px] flex-shrink-0 sticky top-24 flex flex-col gap-6">

                        {/* Payment Options */}
                        <div className="flex flex-col gap-3">
                            <label
                                className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${payNow ? "border-[#953002] bg-[#fffcfb]" : "border-[#e0e0e0] bg-white hover:border-[#bbb]"}`}
                                onClick={() => setPayNow(true)}
                            >
                                <div className="mt-0.5 relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#953002]">
                                    {payNow && <div className="w-2.5 h-2.5 rounded-full bg-[#953002]" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#953002" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                                        <span className="font-bold text-[#1d1d1d]">Pay Now</span>
                                    </div>
                                    <p className="text-[12px] text-[#555] leading-snug">Safe and secure digital payment. Includes 5% discount.</p>
                                </div>
                            </label>

                            <label
                                className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${!payNow ? "border-[#953002] bg-[#fffcfb]" : "border-[#e0e0e0] bg-white hover:border-[#bbb]"}`}
                                onClick={() => setPayNow(false)}
                            >
                                <div className="mt-0.5 relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#bbb]">
                                    {!payNow && <div className="w-2.5 h-2.5 rounded-full bg-[#953002]" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M7 8v-2a5 5 0 0 1 10 0v2" /></svg>
                                        <span className="font-bold text-[#1d1d1d]">Pay at Property</span>
                                    </div>
                                    <p className="text-[12px] text-[#555] leading-snug">No charge today. Pay directly when you arrive.</p>
                                </div>
                            </label>
                        </div>

                        {/* Price Summary Card */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 shadow-xl shadow-black/[0.03]">
                            <div className="flex items-baseline gap-1 mb-5">
                                <span className="text-[24px] font-bold text-[#1d1d1d]">{formatLKR(room.pricePerNight)}</span>
                                <span className="text-[14px] text-[#828282] font-medium">/ night</span>
                            </div>

                            <div className="border border-[#e0e0e0] rounded-xl overflow-hidden mb-5">
                                <div className="flex border-b border-[#e0e0e0]">
                                    <div className="flex-1 p-3 border-r border-[#e0e0e0]">
                                        <div className="text-[10px] font-bold text-[#828282] uppercase mb-1">Check-in</div>
                                        <div className="text-[14px] font-semibold text-[#1d1d1d]">{date?.from ? format(date.from, "MMM d, yyyy") : "Select date"}</div>
                                    </div>
                                    <div className="flex-1 p-3">
                                        <div className="text-[10px] font-bold text-[#828282] uppercase mb-1">Check-out</div>
                                        <div className="text-[14px] font-semibold text-[#1d1d1d]">{date?.to ? format(date.to, "MMM d, yyyy") : "Select date"}</div>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <div className="text-[10px] font-bold text-[#828282] uppercase mb-1">Guests</div>
                                    <div className="text-[14px] font-semibold text-[#1d1d1d]">2 Adults, 1 Child</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mb-5 border-b border-[#f0f0f0] pb-5">
                                <div className="flex justify-between text-[14px] text-[#555]">
                                    <span>{formatLKR(room.pricePerNight)} x {nights} nights</span>
                                    <span className="font-semibold text-[#1d1d1d]">{formatLKR(totalRoomPrice)}</span>
                                </div>
                                <div className="flex justify-between text-[14px] text-[#555]">
                                    <span>Service Fee</span>
                                    <span className="font-semibold text-[#1d1d1d]">{formatLKR(serviceFee)}</span>
                                </div>
                                <div className="flex justify-between text-[14px] text-[#555]">
                                    <span>Taxes & Fees</span>
                                    <span className="font-semibold text-[#1d1d1d]">{formatLKR(taxes)}</span>
                                </div>
                            </div>

                            <div className="mb-5 pb-5 border-b border-[#f0f0f0]">
                                <button className="text-[14px] font-semibold text-[#953002] hover:underline bg-transparent border-none p-0 cursor-pointer text-left w-full flex items-center justify-between">
                                    <span>Have a promo code?</span>
                                </button>
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        className="flex-1 w-full px-3 py-2 border border-[#e0e0e0] rounded-xl text-[14px] outline-none focus:border-[#953002] transition-colors bg-[#fafafa]"
                                    />
                                    <button className="px-4 py-2 bg-[#1d1d1d] hover:bg-[#333] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[18px] font-bold text-[#1d1d1d]">Total</span>
                                <span className="text-[20px] font-bold text-[#953002]">{formatLKR(finalTotal)}</span>
                            </div>

                            <button className="w-full bg-[#953002] hover:bg-[#6d2200] text-white font-bold text-[15px] py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4">
                                Confirm & Book <ArrowRight size={18} />
                            </button>

                            <div className="text-center text-[13px] text-[#828282] mb-6">You won&apos;t be charged yet</div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-2 text-[12px] font-medium text-[#2E7D32]">
                                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>Free cancellation until Oct 7</span>
                                </div>
                                <div className="flex items-start gap-2 text-[12px] font-medium text-[#1976D2]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                    <span>Best price guaranteed</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* ── Fullscreen Gallery Modal ─────────────────────────────────────────── */}
            {galleryOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                        <p className="text-white text-[14px] font-semibold">
                            {activeGalleryIdx + 1} / {allImages.length}
                        </p>
                        <button
                            onClick={() => setGalleryOpen(false)}
                            className="text-white hover:text-white/70 cursor-pointer p-2"
                            aria-label="Close gallery"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center p-4">
                        <div className="relative w-full max-w-5xl h-full">
                            <Image
                                src={allImages[activeGalleryIdx]}
                                alt={`Gallery image ${activeGalleryIdx + 1}`}
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />
                        </div>
                    </div>
                    <div className="flex-shrink-0 px-6 py-4 flex gap-2 overflow-x-auto justify-center">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveGalleryIdx(i)}
                                className={
                                    `relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ` +
                                    (i === activeGalleryIdx ? "border-[#953002]" : "border-transparent opacity-60 hover:opacity-100")
                                }
                            >
                                <Image src={img} alt={`thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
