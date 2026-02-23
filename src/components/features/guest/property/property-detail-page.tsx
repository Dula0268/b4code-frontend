"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin, Share2, Heart, Star, ChevronRight, Home, Wifi, Wind, Waves,
    Dumbbell, Car, Utensils, ShieldCheck, Coffee, Leaf, Bike, BookOpen,
    Monitor, Users, BedDouble, SquareDot, CheckCircle2, Grid2X2, X,
} from "lucide-react"
import type { PropertyDetail, Room } from "@/lib/mock-properties"

// ─── Icon lookup ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Wifi, Wind, Waves, Dumbbell, Car, Utensils, ShieldCheck, Coffee,
    Leaf, Bike, BookOpen, Monitor,
}

function AmenityIcon({ name, size = 18 }: { name: string; size?: number }) {
    const Icon = ICON_MAP[name] ?? SquareDot
    return <Icon size={size} className="text-[#953002] flex-shrink-0" />
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatLKR(n: number) {
    return `LKR ${n.toLocaleString("en-US")}`
}

function RatingBar({ label, score }: { label: string; score: number }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#555] w-28 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#953002] rounded-full transition-all"
                    style={{ width: `${(score / 5) * 100}%` }}
                />
            </div>
            <span className="text-[13px] font-semibold text-[#1d1d1d] w-8 text-right">{score.toFixed(1)}</span>
        </div>
    )
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room }: { room: Room }) {
    const tagStyle =
        room.tag === "Refundable"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : room.tag === "Popular"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"

    return (
        <div className="flex gap-4 p-4 border border-[#e8e8e8] rounded-2xl hover:border-[#953002]/30 hover:shadow-md transition-all bg-white">
            {/* Room image */}
            <div className="relative w-[140px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f3ede8]">
                <Image src={room.imageSrc} alt={room.name} fill className="object-cover" sizes="140px" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-[#1d1d1d] leading-snug">{room.name}</h3>
                    {room.tag && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${tagStyle}`}>
                            {room.tag}
                        </span>
                    )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#828282]">
                    <span className="flex items-center gap-1"><Users size={12} /> {room.maxGuests} Guests</span>
                    <span className="flex items-center gap-1"><BedDouble size={12} /> {room.bedType}</span>
                    <span className="flex items-center gap-1"><SquareDot size={12} /> {room.sqft} sq ft</span>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {room.features.map(f => (
                        <span key={f} className="text-[12px] text-[#555] flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-[#953002]" /> {f}
                        </span>
                    ))}
                </div>
            </div>

            {/* Price + CTA */}
            <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2">
                <div className="text-right">
                    {room.originalPrice && (
                        <p className="text-[12px] text-[#aaa] line-through">{formatLKR(room.originalPrice)}</p>
                    )}
                    <p className="text-[18px] font-bold text-[#1d1d1d]">{formatLKR(room.pricePerNight)}</p>
                    <p className="text-[11px] text-[#828282]">per night</p>
                </div>
                <button
                    id={`select-room-${room.id}`}
                    className="px-4 py-2 bg-[#953002] hover:bg-[#6d2200] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                    Select Room
                </button>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PropertyDetailPage({ property }: { property: PropertyDetail }) {
    const [saved, setSaved] = useState(false)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0)
    const [descExpanded, setDescExpanded] = useState(false)
    const [shareToast, setShareToast] = useState<"copied" | "shared" | null>(null)

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : ""
        const text = property.title
        if (navigator.share) {
            try {
                await navigator.share({ title: text, text: `Check out ${text} on Prime Stay`, url })
                setShareToast("shared")
            } catch {
                // user cancelled — no toast
                return
            }
        } else {
            await navigator.clipboard.writeText(url)
            setShareToast("copied")
        }
        setTimeout(() => setShareToast(null), 2800)
    }

    const allImages = [property.imageSrc, ...property.galleryImages]

    return (
        <div className="min-h-screen bg-[#fafafa]">

            {/* ── Share toast ───────────────────────────────────────────────── */}
            <div
                className={[
                    "fixed top-20 right-6 z-[60] flex items-center gap-2.5 bg-[#1d1d1d] text-white text-[13px] font-medium",
                    "px-4 py-3 rounded-xl shadow-xl transition-all duration-300",
                    shareToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
                ].join(" ")}
            >
                <span className="text-[16px]">{shareToast === "shared" ? "🎉" : "🔗"}</span>
                {shareToast === "shared" ? "Shared successfully!" : "Link copied to clipboard"}
            </div>
            <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-20">

                {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
                <nav className="flex items-center gap-1.5 text-[13px] mb-5">
                    <Link
                        href="/"
                        aria-label="Home"
                        className="text-[#828282] hover:text-[#953002] transition-colors flex items-center"
                    >
                        <Home size={15} />
                    </Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <Link
                        href="/guest/search"
                        className="text-[#828282] hover:text-[#953002] transition-colors"
                    >
                        Search
                    </Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <span className="text-[#953002] font-medium truncate max-w-[240px]">{property.title}</span>
                </nav>

                {/* ── Photo Gallery Grid ──────────────────────────────────────────────── */}
                <div className="relative mb-8">
                    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[460px] rounded-2xl overflow-hidden">
                        {/* Primary large image */}
                        <div
                            className="col-span-2 row-span-2 relative cursor-pointer group"
                            onClick={() => { setActiveGalleryIdx(0); setGalleryOpen(true) }}
                        >
                            <Image
                                src={property.imageSrc}
                                alt={property.title}
                                fill
                                className="object-cover group-hover:brightness-90 transition"
                                priority
                                sizes="(max-width: 768px) 100vw, 600px"
                            />
                        </div>

                        {/* Four smaller images */}
                        {property.galleryImages.slice(0, 4).map((img, i) => (
                            <div
                                key={i}
                                className="relative cursor-pointer group"
                                onClick={() => { setActiveGalleryIdx(i + 1); setGalleryOpen(true) }}
                            >
                                <Image
                                    src={img}
                                    alt={`${property.title} photo ${i + 2}`}
                                    fill
                                    className="object-cover group-hover:brightness-90 transition"
                                    sizes="(max-width: 768px) 50vw, 300px"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Show all photos button */}
                    <button
                        onClick={() => { setActiveGalleryIdx(0); setGalleryOpen(true) }}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#e0e0e0] rounded-xl px-4 py-2 text-[13px] font-semibold text-[#1d1d1d] shadow-sm hover:bg-white transition-colors cursor-pointer"
                    >
                        <Grid2X2 size={14} />
                        Show all photos
                    </button>

                    {/* Badge */}
                    {property.badge && (
                        <span className="absolute top-4 left-4 bg-white text-[#1d1d1d] text-[12px] font-semibold px-3 py-1 rounded-full shadow-sm">
                            {property.badge}
                        </span>
                    )}
                </div>

                {/* ── Title Row ──────────────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <p className="text-[12px] font-semibold text-[#953002] uppercase tracking-wider mb-1">
                            {property.propertyType}
                        </p>
                        <h1 className="text-[32px] font-bold text-[#1d1d1d] leading-tight mb-2">
                            {property.title}
                        </h1>
                        <div className="flex items-center gap-1.5 text-[14px] text-[#555]">
                            <MapPin size={15} className="text-[#953002]" />
                            <span>{property.fullAddress}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            id="share-property"
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 border border-[#e0e0e0] rounded-xl text-[13px] font-medium text-[#333] hover:border-[#953002]/40 hover:text-[#953002] transition-colors bg-white shadow-sm cursor-pointer"
                        >
                            <Share2 size={15} />
                            Share
                        </button>
                        <button
                            id="save-property"
                            onClick={() => setSaved(s => !s)}
                            className={[
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all shadow-sm cursor-pointer border-2",
                                saved
                                    ? "bg-[#953002] text-white border-[#953002]"
                                    : "bg-white text-[#333] border-[#e0e0e0] hover:border-[#953002]/40",
                            ].join(" ")}
                        >
                            <Heart size={15} fill={saved ? "currentColor" : "none"} />
                            {saved ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>

                {/* ── Two-column layout ───────────────────────────────────────────────── */}
                <div className="flex gap-8 items-start">

                    {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-8">

                        {/* Host */}
                        <div className="flex items-center gap-4 p-5 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #953002, #d4520a)" }}
                            >
                                {property.hostName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <p className="text-[15px] font-semibold text-[#1d1d1d]">
                                    Hosted by {property.hostName}
                                </p>
                                <p className="text-[13px] text-[#828282]">{property.hostBio}</p>
                            </div>
                            {property.hostSuperhost && (
                                <span className="ml-auto text-[11px] font-semibold bg-[#953002]/10 text-[#953002] px-3 py-1 rounded-full">
                                    Superhost
                                </span>
                            )}
                        </div>

                        {/* About */}
                        <div>
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-3">About this property</h2>
                            <div className={`text-[14px] text-[#555] leading-relaxed ${!descExpanded ? "line-clamp-4" : ""}`}>
                                {property.description}
                            </div>
                            <button
                                onClick={() => setDescExpanded(e => !e)}
                                className="mt-2 text-[14px] font-semibold text-[#953002] hover:underline cursor-pointer bg-transparent border-none p-0"
                            >
                                {descExpanded ? "Show less" : "Read more →"}
                            </button>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">What this place offers</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {property.amenities.map(a => (
                                    <div key={a.label} className="flex items-center gap-2.5 text-[13px] text-[#333]">
                                        <AmenityIcon name={a.icon} />
                                        <span>{a.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews summary */}
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <Star size={20} className="text-[#ffb401]" fill="#ffb401" />
                                <span className="text-[22px] font-bold text-[#1d1d1d]">{property.rating.toFixed(1)}</span>
                                <span className="text-[14px] text-[#828282]">{property.reviewCount.toLocaleString()} Reviews</span>
                            </div>

                            {/* Rating breakdown */}
                            <div className="flex flex-col gap-2.5 mb-6 p-4 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm">
                                {property.reviewBreakdown.map(r => (
                                    <RatingBar key={r.label} label={r.label} score={r.score} />
                                ))}
                            </div>

                            {/* Review cards */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {property.reviews.map(rev => (
                                    <div
                                        key={rev.id}
                                        className="p-4 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                                                style={{ background: rev.avatarColor }}
                                            >
                                                {rev.avatarInitials}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-semibold text-[#1d1d1d]">{rev.author}</p>
                                                <p className="text-[11px] text-[#aaa]">{rev.date}</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-0.5">
                                                {Array.from({ length: rev.rating }).map((_, i) => (
                                                    <Star key={i} size={10} className="text-[#ffb401]" fill="#ffb401" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-[#555] leading-relaxed">"{rev.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Available Rooms */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[20px] font-bold text-[#1d1d1d]">Available Rooms</h2>
                                <p className="text-[12px] text-[#828282]">☑ Prices include taxes and fees</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {property.rooms.map(room => (
                                    <RoomCard key={room.id} room={room} />
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT COLUMN — Map + Location ───────────────────────────────── */}
                    <div className="w-[300px] flex-shrink-0 sticky top-24">
                        {/* Reviews panel */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-sm p-5 mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-semibold text-[#1d1d1d]">
                                    Excellent · {property.reviewCount.toLocaleString()} verified reviews
                                </span>
                                <span className="text-[18px] font-bold text-[#953002]">
                                    {property.rating.toFixed(1)} / 5
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 mt-3">
                                {property.reviewBreakdown.map(r => (
                                    <RatingBar key={r.label} label={r.label} score={r.score} />
                                ))}
                            </div>
                        </div>

                        {/* Map embed */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-sm overflow-hidden">
                            <div className="relative h-[200px] bg-[#e8f4f8]">
                                <iframe
                                    title="Property location map"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.05},${property.lat - 0.05},${property.lng + 0.05},${property.lat + 0.05}&layer=mapnik&marker=${property.lat},${property.lng}`}
                                    className="w-full h-full border-none"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-4">
                                <p className="text-[13px] font-semibold text-[#1d1d1d] mb-1">Location</p>
                                <p className="text-[12px] text-[#828282] mb-2">{property.fullAddress}</p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[13px] font-semibold text-[#953002] hover:underline"
                                >
                                    Get Directions →
                                </a>
                            </div>
                        </div>

                        {/* Starting price */}
                        <div className="mt-4 bg-[#953002] text-white rounded-2xl p-5">
                            <p className="text-[12px] text-white/70 mb-0.5">Starting from</p>
                            <p className="text-[26px] font-bold leading-tight">{formatLKR(property.pricePerNight)}</p>
                            <p className="text-[12px] text-white/70 mb-4">per night · incl. taxes</p>
                            <button
                                id="book-now-btn"
                                className="w-full bg-white text-[#953002] font-bold rounded-xl py-2.5 text-[14px] hover:bg-[#fff5f0] transition-colors cursor-pointer"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Fullscreen Gallery Modal ─────────────────────────────────────────── */}
            {galleryOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                        <p className="text-white text-[14px] font-semibold">
                            {activeGalleryIdx + 1} / {allImages.length}
                        </p>
                        <button
                            onClick={() => setGalleryOpen(false)}
                            className="text-white hover:text-white/70 cursor-pointer"
                            aria-label="Close gallery"
                        >
                            <X size={26} />
                        </button>
                    </div>

                    {/* Main image */}
                    <div className="flex-1 relative flex items-center justify-center">
                        <div className="relative w-full max-w-4xl h-full max-h-[70vh]">
                            <Image
                                src={allImages[activeGalleryIdx]}
                                alt={`Gallery image ${activeGalleryIdx + 1}`}
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex-shrink-0 px-6 py-4 flex gap-2 overflow-x-auto justify-center">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveGalleryIdx(i)}
                                className={[
                                    "relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                                    i === activeGalleryIdx ? "border-[#953002]" : "border-transparent opacity-60 hover:opacity-100",
                                ].join(" ")}
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
