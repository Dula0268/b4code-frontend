"use client"

import { useState, useEffect } from "react"
import api from "@/lib/axios"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin, Share2, Heart, Star, ChevronRight, Home, Wifi, Wind, Waves,
    Dumbbell, Car, Utensils, ShieldCheck, Coffee, Leaf, Bike, BookOpen,
    Monitor, SquareDot, Grid2X2, X, Clock, AlertTriangle, Ban, Users
} from "lucide-react"
import { RoomCard, RatingBar } from "@/components/guest/property/property-components"
import { useAuthStore } from "@/store/auth/auth.store"

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

    const [bookingStep, setBookingStep] = useState<"select" | "checkout" | "confirmation" | "failed">("select")
    const [promoCodeInput, setPromoCodeInput] = useState("")
    const [appliedPromos, setAppliedPromos] = useState<string[]>([])
    const [promoError, setPromoError] = useState("")
    const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
    const [paymentMethod, setPaymentMethod] = useState<"online" | "property">("online")
    const [nicNumber, setNicNumber] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingRef, setBookingRef] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    const { user } = useAuthStore()

    const [checkInDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
    });
    const [checkOutDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        const fetchBreakdown = async () => {
            const roomId = Object.keys(selectedRooms)[0];
            if (!roomId) {
                setPriceBreakdown(null);
                setPromoError("");
                return;
            }
            
            try {
                const qty = selectedRooms[roomId].quantity;
                let url = `/guest/bookings/price-preview?roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&roomQuantity=${qty}`;
                if (appliedPromos.length > 0) {
                    url += `&promoCodes=${appliedPromos.join(",")}`;
                }
                
                const res = await api.get(url);
                setPriceBreakdown(res.data);
                setPromoError("");
            } catch (error: any) {
                if (appliedPromos.length > 0) {
                    setPromoError(error.response?.data?.message || "Invalid promo code");
                    // Assuming the last added one was the invalid one, pop it off
                    setAppliedPromos(prev => prev.slice(0, -1)); 
                }
                console.error("Failed to fetch price preview", error);
            }
        };
        fetchBreakdown();
    }, [selectedRooms, appliedPromos, checkInDate, checkOutDate]);

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

            {/* Error Notification */}
            <div
                className={[
                    "fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-[#e53935] text-white text-[13px] font-medium",
                    "px-4 py-3 rounded-xl shadow-xl transition-all duration-300",
                    errorMsg ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
                ].join(" ")}
            >
                <span className="text-[16px]">⚠️</span>
                {errorMsg}
            </div>

            {/* Success Notification */}
            <div
                className={[
                    "fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-emerald-600 text-white text-[13px] font-medium",
                    "px-4 py-3 rounded-xl shadow-xl transition-all duration-300",
                    successMsg ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
                ].join(" ")}
            >
                <span className="text-[16px]">✅</span>
                {successMsg}
            </div>
            
            <div className="w-full max-w-[1440px] mx-auto px-6 pt-8 pb-20">
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

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Column */}
                    <div className="flex-1 min-w-0 flex flex-col gap-8">
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

                        {/* Room Types */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[20px] font-bold text-[#1d1d1d]">Room Types</h2>
                            </div>
                            {(!property.rooms || property.rooms.length === 0) ? (
                                <div className="p-8 bg-[#fff5f5] border border-[#ffe0e0] rounded-2xl text-[#d32f2f] flex flex-col items-center justify-center text-center">
                                    <AlertTriangle size={40} className="mb-3 opacity-80" />
                                    <h3 className="font-bold text-[18px] mb-1">No Rooms Available</h3>
                                    <p className="text-[14px] opacity-90 max-w-sm">Sorry, there are no rooms available at this property for your selected dates. Try changing your dates.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {property.rooms.map(room => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            propertyId={property.id}
                                            selectedQuantity={selectedRooms[room.id]?.quantity || 0}
                                            onQuantityChange={(qty) => {
                                                if (qty === 0) {
                                                    setSelectedRooms({});
                                                } else {
                                                    setSelectedRooms({
                                                        [room.id]: { quantity: qty, price: room.pricePerNight, name: room.name }
                                                    });
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ratings & Reviews */}
                        <div className="pt-8 border-t border-[#e8e8e8]">
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">Guest Ratings</h2>
                            <div className="flex items-center gap-3 mb-5">
                                <Star size={20} className="text-[var(--brand-secondary)]" fill="var(--brand-secondary)" />
                                <span className="text-[22px] font-bold text-[#1d1d1d]">{property.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex flex-col gap-2.5 mb-8 p-5 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm">
                                {(() => {
                                    const standardTypes = ["Cleanliness", "Accuracy", "Communication", "Location", "Value"];
                                    const extraTypes = (property.reviewBreakdown || [])
                                        .filter(r => !standardTypes.includes(r.label))
                                        .map(r => r.label);
                                    const allTypesToDisplay = [...standardTypes, ...extraTypes];
                                    
                                    return allTypesToDisplay.map(type => {
                                        const found = (property.reviewBreakdown || []).find(r => r.label === type);
                                        return <RatingBar key={type} label={type} score={found ? found.score : 0} />
                                    });
                                })()}
                            </div>

                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4 flex items-baseline gap-2">
                                Guest Reviews <span className="text-[15px] font-medium text-[#828282]">({property.reviewCount.toLocaleString()} reviews)</span>
                            </h2>
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
                                        
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {rev.cleanlinessRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Cleanliness: {rev.cleanlinessRating}★</span>}
                                            {rev.accuracyRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Accuracy: {rev.accuracyRating}★</span>}
                                            {rev.communicationRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Communication: {rev.communicationRating}★</span>}
                                            {rev.locationRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Location: {rev.locationRating}★</span>}
                                            {rev.valueRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Value: {rev.valueRating}★</span>}
                                        </div>

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

                        {/* Policies */}
                        <div className="pt-8 border-t border-[#e8e8e8]">
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">Property Policies</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-2 flex items-center gap-2">
                                        <Clock size={16} className="text-[var(--brand-primary)]" /> Check-in / Check-out
                                    </h3>
                                    <ul className="text-[14px] text-[#555] space-y-1.5 list-disc list-inside">
                                        <li>Check-in time: {property.checkInTime || "14:00 - 22:00"}</li>
                                        <li>Check-out time: Until {property.checkOutTime || "11:00"}</li>
                                        <li>Early check-in subject to availability</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-2 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-[var(--brand-primary)]" /> Cancellation
                                    </h3>
                                    <ul className="text-[14px] text-[#555] space-y-1.5 list-disc list-inside">
                                        {(property.cancellationPolicy || "Free cancellation until 48 hours before.\n50% refund within 48 hours.\nNo-shows will be charged full amount.").split('\n').map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-2 flex items-center gap-2">
                                        <Users size={16} className="text-[var(--brand-primary)]" /> Age & Children
                                    </h3>
                                    <ul className="text-[14px] text-[#555] space-y-1.5 list-disc list-inside">
                                        {(property.childPolicy || "Children of any age are welcome.\nNo age restriction for check-in.\nExtra beds available upon request.").split('\n').map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-2 flex items-center gap-2">
                                        <Ban size={16} className="text-[var(--brand-primary)]" /> House Rules
                                    </h3>
                                    <ul className="text-[14px] text-[#555] space-y-1.5 list-disc list-inside">
                                        {(property.houseRules || "No smoking indoors.\nNo pets allowed.\nNo parties or events.").split('\n').map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Checkout Panel) */}
                    <div className="lg:w-[420px] flex-shrink-0">
                        <div className="sticky top-28 bg-white border border-[#e8e8e8] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                            {bookingStep === "confirmation" ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={24} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#1d1d1d] mb-2">Booking Complete</h3>
                                    <p className="text-[14px] text-[#828282]">Your booking was successful. Check your email for the itinerary.</p>
                                </div>
                            ) : Object.keys(selectedRooms).length > 0 ? (
                                <>
                                    <h2 className="text-[20px] font-bold text-[#1d1d1d]">Complete Booking</h2>
                                    
                                    {/* Price Breakdown */}
                                    <div>
                                        <h3 className="font-semibold text-[#1d1d1d] mb-3 text-[16px]">Price Breakdown</h3>
                                        <div className="flex flex-col gap-2 text-[14px] text-[#555]">
                                            {Object.entries(selectedRooms).map(([id, r]) => (
                                                <div key={id} className="flex justify-between items-center group">
                                                    <span>{r.quantity}x {r.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span>LKR {(r.quantity * r.price).toLocaleString()}</span>
                                                        <button 
                                                            onClick={() => setSelectedRooms({})} 
                                                            className="text-[#aaa] hover:text-[#e53935] opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Remove room"
                                                        >
                                                            <X size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="border-t border-[#e8e8e8] pt-2 mt-2 flex justify-between font-medium">
                                                <span>Base Price</span>
                                                <span>LKR {priceBreakdown ? priceBreakdown.subtotal.toLocaleString() : "..."}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Taxes & Fees (10%)</span>
                                                <span>LKR {priceBreakdown ? priceBreakdown.taxAmount.toLocaleString() : "..."}</span>
                                            </div>
                                            {priceBreakdown && priceBreakdown.discountAmount > 0 && (
                                                <div className="flex justify-between text-[var(--state-success)] font-medium">
                                                    <span>Discounts ({priceBreakdown.promosApplied?.join(", ")})</span>
                                                    <span>- LKR {priceBreakdown.discountAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-[#e8e8e8] pt-2 mt-2 flex justify-between font-bold text-[#1d1d1d] text-[16px]">
                                                <span>Total</span>
                                                <span className="text-[var(--brand-primary)]">
                                                    LKR {priceBreakdown ? priceBreakdown.totalAmount.toLocaleString() : "..."}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div>
                                        <h3 className="font-semibold text-[#1d1d1d] mb-2 text-[14px]">Promo Code</h3>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={promoCodeInput}
                                                    onChange={(e) => setPromoCodeInput(e.target.value)}
                                                    placeholder="Enter code" 
                                                    className={`flex-1 border ${promoError ? 'border-red-400' : 'border-[#e8e8e8]'} rounded-xl px-4 py-2 text-[14px] focus:outline-none focus:border-[var(--brand-primary)]`}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const code = promoCodeInput.trim().toUpperCase();
                                                        if (code && !appliedPromos.includes(code)) {
                                                            setAppliedPromos(prev => [...prev, code]);
                                                            setPromoCodeInput("");
                                                        }
                                                    }}
                                                    disabled={!promoCodeInput.trim() || appliedPromos.includes(promoCodeInput.trim().toUpperCase())}
                                                    className="bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1d1d1d] font-semibold px-4 py-2 rounded-xl text-[14px] transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            
                                            {appliedPromos.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {appliedPromos.map(code => (
                                                        <span key={code} className="inline-flex items-center gap-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] px-3 py-1 rounded-full text-[12px] font-semibold">
                                                            {code}
                                                            <button 
                                                                onClick={() => setAppliedPromos(prev => prev.filter(c => c !== code))}
                                                                className="hover:text-red-500 transition-colors ml-1"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {promoError && <span className="text-[12px] text-red-500 font-medium ml-1">{promoError}</span>}
                                        </div>
                                    </div>

                                    {/* Payment Options */}
                                    <div>
                                        <h3 className="font-semibold text-[#1d1d1d] mb-3 text-[16px]">Payment Method</h3>
                                        <div className="flex flex-col gap-3">
                                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-[#e8e8e8] hover:border-[#ccc]'}`}>
                                                <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mt-1 cursor-pointer" />
                                                <div>
                                                    <p className="font-semibold text-[#1d1d1d] text-[14px]">Pay online now</p>
                                                    <p className="text-[12px] text-[#828282]">Securely pay the full amount instantly.</p>
                                                </div>
                                            </label>
                                            <div className="flex flex-col gap-2">
                                                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'property' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-[#e8e8e8] hover:border-[#ccc]'}`}>
                                                    <input type="radio" name="payment" checked={paymentMethod === 'property'} onChange={() => setPaymentMethod('property')} className="mt-1 cursor-pointer" />
                                                    <div>
                                                        <p className="font-semibold text-[#1d1d1d] text-[14px]">Pay at property</p>
                                                        <p className="text-[12px] text-[#828282]">Your room is held, settle the bill on arrival.</p>
                                                    </div>
                                                </label>
                                                {paymentMethod === 'property' && (
                                                    <div className="px-4 py-3 bg-[#f8f8f8] rounded-xl border border-[#e8e8e8] animate-in fade-in slide-in-from-top-2">
                                                        <label className="text-[13px] font-semibold text-[#1d1d1d] block mb-1.5">National Identity Card (NIC) <span className="text-[#e53935]">*</span></label>
                                                        <input 
                                                            type="text" 
                                                            value={nicNumber}
                                                            onChange={(e) => setNicNumber(e.target.value)}
                                                            placeholder="e.g. 199012345678 or 901234567V" 
                                                            className="w-full border border-[#d8d8d8] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--brand-primary)] bg-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={isSubmitting || (paymentMethod === 'property' && !nicNumber.trim())}
                                        onClick={async () => {
                                            setIsSubmitting(true);
                                            try {
                                                const roomId = Object.keys(selectedRooms)[0];
                                                const roomData = selectedRooms[roomId];
                                                if (!roomId) return;
                                                
                                                const payload = {
                                                    roomId: Number(roomId),
                                                    propertyId: Number(property.id),
                                                    roomQuantity: roomData.quantity,
                                                    checkIn: checkInDate,
                                                    checkOut: checkOutDate,
                                                    adults: 1,
                                                    children: 0,
                                                    guestName: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Guest User",
                                                    guestEmail: user?.email || "guest@example.com",
                                                    nicNumber: nicNumber || null,
                                                    promoCodes: appliedPromos.length > 0 ? appliedPromos : null,
                                                    paymentMethod: paymentMethod === 'property' ? 'PAY_AT_PROPERTY' : 'ONLINE_CARD'
                                                };
                                                
                                                const res = await api.post('/guest/bookings', payload);
                                                setBookingRef(res.data.confirmationCode);
                                                setBookingStep("confirmation");
                                                setSuccessMsg("Booking Confirmed Successfully!");
                                                setTimeout(() => setSuccessMsg(""), 5000);
                                            } catch (error: any) {
                                                console.error("Booking failed:", error);
                                                const msg = error.response?.data?.message || "Failed to confirm booking. Please try again.";
                                                setErrorMsg(msg);
                                                setBookingStep("failed");
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        }}
                                        className="w-full bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 disabled:opacity-70 transition-colors cursor-pointer mt-2"
                                    >
                                        {isSubmitting ? "Processing..." : "Confirm Booking"}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Home size={24} className="text-[#aaa]" />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#1d1d1d] mb-2">Ready to book?</h3>
                                    <p className="text-[14px] text-[#828282]">Select one or more rooms from the available options to view your price breakdown and proceed with booking.</p>
                                </div>
                            )}
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

            {/* Booking Confirmation Modal */}
            {bookingStep === "confirmation" && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-[28px] font-bold text-[#1d1d1d] mb-2">Booking Confirmed!</h2>
                        <p className="text-[15px] text-[#555] mb-8">Your rooms at {property.title} have been successfully reserved. An itinerary has been sent to your email.</p>
                        
                        <div className="bg-[#f8f8f8] border border-[#e8e8e8] p-5 rounded-2xl w-full mb-8">
                            <p className="text-[12px] text-[#828282] uppercase tracking-widest font-bold mb-2">Booking Reference</p>
                            <p className="text-[24px] font-mono font-black text-[var(--brand-primary)]">{bookingRef}</p>
                        </div>

                        <Link
                            href="/guest/booking"
                            className="w-full bg-[#8b4513] hover:bg-[#6d2200] text-white font-bold py-4 rounded-xl transition-colors cursor-pointer text-center text-[16px] shadow-lg shadow-[#8b4513]/20"
                        >
                            Go to My Bookings
                        </Link>
                    </div>
                </div>
            )}

            {/* Booking Failed Modal */}
            {bookingStep === "failed" && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-[28px] font-bold text-[#1d1d1d] mb-2">Booking Failed</h2>
                        <p className="text-[15px] text-[#555] mb-8">{errorMsg || "We couldn't process your booking at this time. Please try again."}</p>

                        <button
                            onClick={() => { setBookingStep("select"); setErrorMsg(""); }}
                            className="w-full bg-[#1d1d1d] hover:bg-black text-white font-bold py-4 rounded-xl transition-colors cursor-pointer text-center text-[16px] shadow-lg shadow-black/20"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}
