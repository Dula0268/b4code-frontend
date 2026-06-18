"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin, Share2, Heart, Star, ChevronRight, Home, Wifi, Wind, Waves,
    Dumbbell, Car, Utensils, ShieldCheck, Coffee, Leaf, Bike, BookOpen,
    Monitor, SquareDot, Grid2X2, X,
} from "lucide-react"
import type { PropertyDetail } from "@/lib/mock-properties"
import { RoomCard, RatingBar } from "@/components/guest/property/property-components"

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Wifi, Wind, Waves, Dumbbell, Car, Utensils, ShieldCheck, Coffee,
    Leaf, Bike, BookOpen, Monitor,
}

function AmenityIcon({ name, size = 18 }: { name: string; size?: number }) {
    const Icon = ICON_MAP[name] ?? SquareDot
    return <Icon size={size} className="text-[var(--brand-primary)] flex-shrink-0" />
}

export default function PropertyClient({ property }: { property: PropertyDetail }) {
    const [saved, setSaved] = useState(false)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0)
    const [shareToast, setShareToast] = useState<"copied" | "shared" | null>(null)
    const [selectedRooms, setSelectedRooms] = useState<Record<string, { quantity: number, price: number, name: string }>>({})

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : ""
        const text = property.title
        if (navigator.share) {
            try {
                await navigator.share({ title: text, text: `Check out ${text} on Prime Stay`, url })
                setShareToast("shared")
            } catch {
                return
            }
        } else {
            await navigator.clipboard.writeText(url)
            setShareToast("copied")
        }
        setTimeout(() => setShareToast(null), 2800)
    }

    const allImages = [property.imageSrc, ...(property.galleryImages || [])]

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Share toast */}
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
            
            <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-[13px] mb-5">
                    <Link href="/" aria-label="Home" className="text-[#828282] hover:text-[var(--brand-primary)] transition-colors flex items-center"><Home size={15} /></Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <Link href="/guest/search" className="text-[#828282] hover:text-[var(--brand-primary)] transition-colors">Search</Link>
                    <ChevronRight size={13} className="text-[#bbb]" />
                    <span className="text-[var(--brand-primary)] font-medium truncate max-w-[240px]">{property.title}</span>
                </nav>

                {/* Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-[32px] font-bold text-[#1d1d1d] leading-tight mb-2">{property.title}</h1>
                        <div className="flex items-center gap-1.5 text-[14px] text-[#555]"><MapPin size={15} className="text-[var(--brand-primary)]" /><span>{property.fullAddress}</span></div>
                    </div>
                </div>

                {/* Photo Gallery Grid */}
                <div className="relative mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-2 h-[300px] sm:h-[460px] rounded-2xl overflow-hidden">
                        <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => { setActiveGalleryIdx(0); setGalleryOpen(true) }}>
                            <Image src={property.imageSrc} alt={property.title} fill className="object-cover group-hover:brightness-90 transition" priority sizes="(max-width: 768px) 100vw, 600px" />
                        </div>
                        {(property.galleryImages || []).slice(0, 4).map((img, i) => (
                            <div key={i} className="relative cursor-pointer group" onClick={() => { setActiveGalleryIdx(i + 1); setGalleryOpen(true) }}>
                                <Image src={img} alt={`${property.title} photo ${i + 2}`} fill className="object-cover group-hover:brightness-90 transition" sizes="(max-width: 768px) 50vw, 300px" />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setActiveGalleryIdx(0); setGalleryOpen(true) }} className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#e0e0e0] rounded-xl px-4 py-2 text-[13px] font-semibold text-[#1d1d1d] shadow-sm hover:bg-white transition-colors cursor-pointer"><Grid2X2 size={14} />Show all photos</button>
                </div>

                <div className="flex flex-col gap-8 w-full max-w-[900px]">
                    {/* About */}
                    <div>
                        <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-3">About this property</h2>
                        <div className="text-[14px] text-[#555] leading-relaxed whitespace-pre-line">{property.description}</div>
                    </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">What this place offers</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(property.amenities || []).map(a => (
                                    <div key={a.label} className="flex items-center gap-2.5 text-[13px] text-[#333]">
                                        <AmenityIcon name={a.icon} /><span>{a.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Available Rooms */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[20px] font-bold text-[#1d1d1d]">Available Rooms</h2>
                            </div>
                            <div className="flex flex-col gap-3">
                                {(property.rooms || []).map(room => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        propertyId={property.id}
                                        selectedQuantity={selectedRooms[room.id]?.quantity || 0}
                                        onQuantityChange={(qty) => {
                                            setSelectedRooms(prev => {
                                                const newRooms = { ...prev };
                                                if (qty === 0) {
                                                    delete newRooms[room.id];
                                                } else {
                                                    newRooms[room.id] = { quantity: qty, price: room.pricePerNight, name: room.name };
                                                }
                                                return newRooms;
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Reviews summary */}
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <Star size={20} className="text-[var(--brand-secondary)]" fill="var(--brand-secondary)" />
                                <span className="text-[22px] font-bold text-[#1d1d1d]">{property.rating.toFixed(1)}</span>
                                <span className="text-[14px] text-[#828282]">{property.reviewCount.toLocaleString()} Reviews</span>
                            </div>
                            <div className="flex flex-col gap-2.5 mb-6 p-4 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm">
                                {(property.reviewBreakdown || []).map(r => <RatingBar key={r.label} label={r.label} score={r.score} />)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(property.reviews || []).map(rev => (
                                    <div key={rev.id} className="p-4 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0" style={{ background: rev.avatarColor }}>{rev.avatarInitials}</div>
                                            <div>
                                                <p className="text-[13px] font-semibold text-[#1d1d1d]">{rev.author}</p>
                                                <p className="text-[11px] text-[#aaa]">{rev.date}</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-0.5">
                                                {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={10} className="text-[var(--brand-secondary)]" fill="var(--brand-secondary)" />)}
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-[#555] leading-relaxed mb-3">&quot;{rev.text}&quot;</p>
                                        {rev.ownerReply && (
                                            <div className="mt-2 p-3 bg-[#f8f8f8] rounded-xl border border-[#ebebeb]">
                                                <p className="text-[11px] font-bold text-[#1d1d1d] mb-1">Response from {property.hostName.split(' ')[0]}</p>
                                                <p className="text-[12px] text-[#666] leading-relaxed">{rev.ownerReply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location / Map */}
                        <div>
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">Location</h2>
                            <p className="text-[14px] text-[#555] mb-4">{property.fullAddress}</p>
                            <div className="relative h-[400px] bg-[#e8f4f8] rounded-2xl overflow-hidden border border-[#e8e8e8]">
                                <iframe
                                    title="Property location map"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.05},${property.lat - 0.05},${property.lng + 0.05},${property.lat + 0.05}&layer=mapnik&marker=${property.lat},${property.lng}`}
                                    className="w-full h-full border-none"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
            </div>

            {/* Fullscreen Gallery Modal */}
            {galleryOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
                    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                        <p className="text-white text-[14px] font-semibold">{activeGalleryIdx + 1} / {allImages.length}</p>
                        <button onClick={() => setGalleryOpen(false)} className="text-white hover:text-white/70 cursor-pointer" aria-label="Close gallery"><X size={26} /></button>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center">
                        <div className="relative w-full max-w-4xl h-full max-h-[70vh]">
                            <Image src={allImages[activeGalleryIdx]} alt={`Gallery image ${activeGalleryIdx + 1}`} fill className="object-contain" sizes="100vw" />
                        </div>
                    </div>
                    <div className="flex-shrink-0 px-6 py-4 flex gap-2 overflow-x-auto justify-center">
                        {allImages.map((img, i) => (
                            <button key={i} onClick={() => setActiveGalleryIdx(i)} className={["relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer", i === activeGalleryIdx ? "border-[var(--brand-primary)]" : "border-transparent opacity-60 hover:opacity-100"].join(" ")}>
                                <Image src={img} alt={`thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Booking Action Bar */}
            {Object.keys(selectedRooms).length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 p-4">
                    <div className="max-w-[900px] mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-[16px] font-bold text-[#1d1d1d]">
                                {Object.values(selectedRooms).reduce((acc, r) => acc + r.quantity, 0)} Room(s) Selected
                            </p>
                            <p className="text-[13px] text-[#555]">
                                Total: LKR {Object.values(selectedRooms).reduce((acc, r) => acc + r.quantity * r.price, 0).toLocaleString()} / night
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const selectedRoomId = Object.keys(selectedRooms)[0];
                                const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
                                searchParams.set("propertyId", property.id);
                                searchParams.set("roomId", selectedRoomId);
                                searchParams.set("multiRoomData", JSON.stringify(selectedRooms));
                                window.location.href = `/guest/checkout?${searchParams.toString()}`;
                            }}
                            className="bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white px-8 py-3 rounded-xl font-bold text-[15px] transition-colors cursor-pointer"
                        >
                            Reserve
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
