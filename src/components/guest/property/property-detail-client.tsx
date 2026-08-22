"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import api from "@/lib/axios"
import { guestApi } from "@/api/guest/guest.api"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin, Share2, Heart, Star, ChevronRight, Home, Wifi, Wind, Waves,
    Dumbbell, Car, Utensils, ShieldCheck, Coffee, Leaf, Bike, BookOpen,
    Monitor, SquareDot, Grid2X2, X, Clock, AlertTriangle, Ban, Users,
    Calendar, Edit3, User, Dog
} from "lucide-react"
import { RoomCard, RatingBar } from "@/components/guest/property/property-components"
import CalendarPicker from "@/components/shared/forms/calendar-picker"
import { useAuthStore } from "@/store/auth/auth.store"

const AMENITY_LABEL_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    "Wifi": Wifi,
    "Free WiFi": Wifi,
    "Air Conditioning": Wind,
    "Swimming Pool": Waves,
    "Pool": Waves,
    "Gym": Dumbbell,
    "Parking": Car,
    "Kitchen": Utensils,
    "Spa and Wellness": Leaf,
    "Pet Friendly": Dog,
    "Pet-Friendly": Dog,
    "Smart TV": Monitor,
    "Breakfast Included": Coffee,
    "Free Cancellation": ShieldCheck,
}

function AmenityIcon({ label, size = 18 }: { label: string; size?: number }) {
    const Icon = AMENITY_LABEL_ICON_MAP[label] ?? SquareDot
    return <Icon size={size} className="text-[var(--brand-primary)] flex-shrink-0" />
}

export default function PropertyClient({ property }: { property: any }) {
    const [saved, setSaved] = useState(false)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0)
    const [shareToast, setShareToast] = useState<"copied" | "shared" | null>(null)
    const [selectedRooms, setSelectedRooms] = useState<Record<string, { quantity: number, price: number, name: string }>>({})

    const [bookingStep, setBookingStep] = useState<"select" | "checkout" | "confirmation" | "failed">("select")
    const [promoCodeInput, setPromoCodeInput] = useState("")
    const [appliedPromos, setAppliedPromos] = useState<string[]>([])
    const [promoError, setPromoError] = useState("")
    const [isApplyingPromo, setIsApplyingPromo] = useState(false)
    const [priceBreakdown, setPriceBreakdown] = useState<any>(null)
    const [paymentMethod, setPaymentMethod] = useState<"online" | "property">("online")
    const [hasActivePayAtProperty, setHasActivePayAtProperty] = useState(false)
    const [nicNumber, setNicNumber] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookingRef, setBookingRef] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    // OTP Verification State
    const [otpStep, setOtpStep] = useState<"none" | "sending" | "entering" | "verifying">("none")
    const [otpCode, setOtpCode] = useState("")
    const [otpError, setOtpError] = useState("")

    const { user } = useAuthStore()
    const searchParams = useSearchParams()
    const router = useRouter()

    // Use dates from URL search params (passed from search bar), fallback to tomorrow/day-after
    const checkInDate = searchParams.get("checkIn") || (() => {
        const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0];
    })();
    const checkOutDate = searchParams.get("checkOut") || (() => {
        const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0];
    })();
    const guestsFromSearch = Number(searchParams.get("guests")) || 1;

    // Trip Edit States
    const calRef = React.useRef<HTMLDivElement>(null);
    const [calOpen, setCalOpen] = useState(false);
    const [editCheckIn, setEditCheckIn] = useState<string>(checkInDate);
    const [editCheckOut, setEditCheckOut] = useState<string>(checkOutDate);
    const [editGuests, setEditGuests] = useState<number>(guestsFromSearch);

    useEffect(() => {
        setEditCheckIn(checkInDate);
        setEditCheckOut(checkOutDate);
        setEditGuests(guestsFromSearch);
    }, [checkInDate, checkOutDate, guestsFromSearch]);

    useEffect(() => {
        const totalRooms = Object.values(selectedRooms).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
        if (totalRooms > 2 && paymentMethod === 'property') {
            setPaymentMethod('online');
        }
    }, [selectedRooms, paymentMethod]);

    useEffect(() => {
        if (user?.email) {
            guestApi.getGuestBookings(user.email)
                .then((bookings: any[]) => {
                    const hasActive = bookings.some((b: any) => 
                        b.paymentMethod === 'PAY_AT_PROPERTY' && 
                        (b.status === 'PENDING' || b.status === 'CONFIRMED')
                    );
                    setHasActivePayAtProperty(hasActive);
                    if (hasActive && paymentMethod === 'property') {
                        setPaymentMethod('online');
                    }
                })
                .catch(e => console.error("Failed to fetch guest bookings for validation", e));
        }
    }, [user, paymentMethod]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("checkIn", editCheckIn);
        params.set("checkOut", editCheckOut);
        params.set("guests", editGuests.toString());
        router.replace(`?${params.toString()}`);
        setSelectedRooms({});
    };

    useEffect(() => {
        const pending = sessionStorage.getItem("pendingBookingRooms");
        if (pending) {
            try {
                setSelectedRooms(JSON.parse(pending));
                sessionStorage.removeItem("pendingBookingRooms");
                
                // Also scroll down to the booking section
                setTimeout(() => {
                    document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" });
                }, 500);
            } catch (e) {}
        }
    }, []);

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

    const executeBooking = async () => {
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
                adults: guestsFromSearch,
                guestName: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Guest User",
                guestEmail: user?.email || "guest@example.com",
                nicNumber: null, // No longer used for custom passkey, backend will generate it
                promoCodes: appliedPromos.length > 0 ? appliedPromos : null,
                paymentMethod: paymentMethod === 'property' ? 'PAY_AT_PROPERTY' : 'ONLINE_CARD'
            };
            
            const res = await api.post('/guest/bookings', payload);
            
            if (paymentMethod === 'online') {
                const params = new URLSearchParams();
                params.set("total", Number(priceBreakdown.totalAmount).toFixed(2));
                params.set("confirmationCode", res.data.confirmationCode);
                params.set("bookingId", String(res.data.id));
                if (user?.profile) {
                    params.set("firstName", user.profile.firstName);
                    params.set("lastName", user.profile.lastName);
                }
                if (user?.email) {
                    params.set("email", user.email);
                }
                router.push(`/payment?${params.toString()}`);
                return;
            }

            router.push("/guest/booking");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to confirm booking. Please try again.";
            setErrorMsg(msg);
            setBookingStep("failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode || !user?.email) return;
        setOtpStep("verifying");
        setOtpError("");
        try {
            await guestApi.verifyGuestOTP(user.email, otpCode);
            setOtpStep("none");
            await executeBooking();
        } catch (error: any) {
            setOtpStep("entering");
            setOtpError(error.response?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    const handleApplyPromo = async () => {
        const code = promoCodeInput.trim().toUpperCase();
        if (!code || appliedPromos.includes(code)) return;
        
        setIsApplyingPromo(true);
        setPromoError("");
        
        const roomId = Object.keys(selectedRooms)[0];
        if (!roomId) {
            setIsApplyingPromo(false);
            return;
        }
        
        try {
            const qty = selectedRooms[roomId].quantity;
            const tempPromos = [...appliedPromos, code];
            let url = `/guest/bookings/price-preview?roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&roomQuantity=${qty}`;
            url += `&promoCodes=${tempPromos.join(",")}`;
            
            const res = await api.get(url);
            setPriceBreakdown(res.data);
            setAppliedPromos(tempPromos);
            setPromoCodeInput("");
        } catch (error: any) {
            setPromoError(error.response?.data?.message || "Invalid promo code");
        } finally {
            setIsApplyingPromo(false);
        }
    };

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

    const filteredGallery = (property.galleryImages || []).filter((img: string) => img !== property.imageSrc)
    const allImages = [property.imageSrc, ...filteredGallery]

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
                        {filteredGallery.slice(0, 4).map((img: string, i: number) => (
                            <div key={i} className="relative cursor-pointer group" onClick={() => { setActiveGalleryIdx(i + 1); setGalleryOpen(true) }}>
                                <Image src={img} alt={`${property.title} photo ${i + 2}`} fill className="object-cover group-hover:brightness-90 transition" sizes="(max-width: 768px) 50vw, 300px" />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setActiveGalleryIdx(0); setGalleryOpen(true) }} className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#e0e0e0] rounded-xl px-4 py-2 text-[13px] font-semibold text-[#1d1d1d] shadow-sm hover:bg-white transition-colors cursor-pointer"><Grid2X2 size={14} />Show all photos</button>
                </div>

                <div className="flex flex-col gap-8 lg:gap-12">
                    {/* Main Content */}
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
                                {(property.amenities || []).map((a: any) => (
                                    <div key={a.label} className="flex items-center gap-2.5 text-[13px] text-[#333]">
                                        <AmenityIcon label={a.label} /><span>{a.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>



                        {/* Room Types moved to bottom */}
                        {/* Ratings & Reviews */}
                        <div className="pt-8 border-t border-[#e8e8e8]">
                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">Guest Ratings</h2>
                            <div className="flex items-center gap-3 mb-5">
                                <Star size={20} className="text-[var(--brand-secondary)]" fill="var(--brand-secondary)" />
                                <span className="text-[22px] font-bold text-[#1d1d1d]">{property.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex flex-col gap-2.5 mb-8 p-5 bg-white border border-[#e8e8e8] rounded-2xl shadow-sm">
                                {(() => {
                                    if (!property.reviewBreakdown || property.reviewBreakdown.length === 0) {
                                        return <div className="text-[#888] text-sm text-center py-2">No reviews yet.</div>;
                                    }

                                    const standardTypes = ["Cleanliness", "Comfort", "Service", "Dining", "Location", "Value"];
                                    const extraTypes = property.reviewBreakdown
                                        .filter((r: any) => !standardTypes.includes(r.label))
                                        .map((r: any) => r.label);
                                    const allTypesToDisplay = [...standardTypes, ...extraTypes];
                                    
                                    return allTypesToDisplay.map(type => {
                                        const found = property.reviewBreakdown.find((r: any) => r.label === type);
                                        return <RatingBar key={type} label={type} score={found ? found.score : 0} />
                                    });
                                })()}
                            </div>

                            <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4 flex items-baseline gap-2">
                                Guest Reviews <span className="text-[15px] font-medium text-[#828282]">({property.reviewCount.toLocaleString()} reviews)</span>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(property.reviews || []).map((rev: any) => (
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
                                            {rev.comfortRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Comfort: {rev.comfortRating}★</span>}
                                            {rev.serviceRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Service: {rev.serviceRating}★</span>}
                                            {rev.diningRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Dining: {rev.diningRating}★</span>}
                                            {rev.locationRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Location: {rev.locationRating}★</span>}
                                            {rev.valueRating != null && <span className="text-[10px] bg-[#f0f0f0] text-[#555] px-2 py-0.5 rounded-full font-medium">Value: {rev.valueRating}★</span>}
                                        </div>

                                        {(rev.photoUrls && rev.photoUrls.length > 0) && (
                                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                                {rev.photoUrls.map((url: string, idx: number) => (
                                                    <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[#e8e8e8]">
                                                        <Image src={url} alt="Review photo" fill className="object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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

 
                    </div>
                </div>

                {/* New Dedicated Booking Section */}
                <div id="booking-section" className="mt-12 bg-white border border-[#e8e8e8] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e8e8e8] pb-6">
                        <h2 className="text-[24px] font-bold text-[#1d1d1d]">Book Your Stay</h2>
                        
                        {/* SECTION 1: Availability (Inline Search Bar) */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 bg-[#f8f8f8] p-1.5 rounded-2xl border border-[#e8e8e8]">
                            {/* Date Picker */}
                            <div className="relative w-full sm:w-auto">
                                <div 
                                    className="h-[42px] px-4 flex items-center gap-2 text-[14px] cursor-pointer bg-white rounded-xl border border-[#d8d8d8] hover:border-[#aaa] transition-colors"
                                    onClick={() => setCalOpen(!calOpen)}
                                >
                                    <Calendar size={16} className="text-[#828282]" />
                                    <span className="font-medium whitespace-nowrap text-[#1d1d1d]">
                                        {editCheckIn ? new Date(editCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Check-in'} - {editCheckOut ? new Date(editCheckOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Check-out'}
                                    </span>
                                </div>
                                {calOpen && (
                                    <div ref={calRef} className="absolute top-[48px] right-0 z-[100] bg-white border border-[#e0e0e0] rounded-2xl shadow-xl overflow-hidden p-2">
                                        <CalendarPicker 
                                            checkIn={editCheckIn ? new Date(editCheckIn) : null} 
                                            checkOut={editCheckOut ? new Date(editCheckOut) : null} 
                                            onChange={(inDate, outDate) => {
                                                setEditCheckIn(inDate ? inDate.toISOString().split('T')[0] : "");
                                                setEditCheckOut(outDate ? outDate.toISOString().split('T')[0] : "");
                                                if (inDate && outDate) {
                                                    setCalOpen(false);
                                                }
                                            }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Guest Selector */}
                            <div className="h-[42px] px-3 flex items-center gap-3 bg-white rounded-xl border border-[#d8d8d8] text-[14px]">
                                <div className="flex items-center gap-2 border-r border-[#e8e8e8] pr-2">
                                    <User size={16} className="text-[#828282]" />
                                    <span className="font-medium text-[#1d1d1d] hidden sm:inline">Guests</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        disabled={editGuests <= 1}
                                        onClick={() => setEditGuests(g => Math.max(1, g - 1))}
                                        className="w-6 h-6 rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        <span className="text-sm leading-none mb-0.5">-</span>
                                    </button>
                                    <span className="font-semibold text-[#1d1d1d] w-3 text-center">{editGuests}</span>
                                    <button 
                                        disabled={editGuests >= 10}
                                        onClick={() => setEditGuests(g => Math.min(10, g + 1))}
                                        className="w-6 h-6 rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center disabled:opacity-50 transition-colors cursor-pointer"
                                    >
                                        <span className="text-sm leading-none mb-0.5">+</span>
                                    </button>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <button 
                                onClick={handleApplyFilters}
                                className="h-[42px] px-5 bg-[#1d1d1d] hover:bg-black text-white font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        
                        {/* Left: Room Selection */}
                        <div className="flex flex-col gap-6">
                            
                            {/* Inserted Room Types */}
                            <div>
                                {(() => {
                                    const displayedRooms = (property.roomTypes || []).filter((room: any) => room.maxGuests >= guestsFromSearch);
                                    if (displayedRooms.length === 0) {
                                        return (
                                            <div className="p-8 bg-[#fff5f5] border border-[#ffe0e0] rounded-2xl text-[#d32f2f] flex flex-col items-center justify-center text-center">
                                                <AlertTriangle size={40} className="mb-3 opacity-80" />
                                                <h3 className="font-bold text-[18px] mb-1">No Rooms Available</h3>
                                                <p className="text-[14px] opacity-90 max-w-sm">Sorry, there are no rooms available at this property for your selected dates and guest count. Try changing your criteria.</p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x">
                                            {displayedRooms.map((room: any) => (
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
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Right: Checkout & Payment */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-[#fcfcfc] border border-[#e8e8e8] rounded-2xl p-6 shadow-sm flex flex-col relative h-full">

                        {bookingStep === "confirmation" && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={24} className="text-emerald-500" />
                                </div>
                                <h3 className="text-[18px] font-bold text-[#1d1d1d] mb-2">Booking Complete</h3>
                                <p className="text-[14px] text-[#828282]">Your booking was successful. Check your email for the itinerary.</p>
                            </div>
                        )}

                        {/* SECTION 2 & 3: Your Booking Details and Checkout */}
                        {bookingStep !== "confirmation" && Object.keys(selectedRooms).length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full">
                                {/* Left Column: Booking Details */}
                                <div className="flex flex-col gap-6">
                                    <h2 className="text-[20px] font-bold text-[#1d1d1d]">Booking Details</h2>
                                    
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between border-b border-[#e8e8e8] pb-3">
                                            <span className="text-[#555] font-medium text-[14px]">Property Name</span>
                                            <span className="font-bold text-[#1d1d1d] text-[15px] text-right max-w-[60%]">{property.title}</span>
                                        </div>
                                        
                                        <div className="flex justify-between border-b border-[#e8e8e8] pb-3">
                                            <span className="text-[#555] font-medium text-[14px]">Room Type</span>
                                            <span className="font-bold text-[#1d1d1d] text-[14px] text-right max-w-[60%]">
                                                {Object.values(selectedRooms).map(r => r.name).join(", ")}
                                            </span>
                                        </div>

                                        <div className="flex justify-between border-b border-[#e8e8e8] pb-3">
                                            <span className="text-[#555] font-medium text-[14px]">Dates</span>
                                            <span className="font-semibold text-[#1d1d1d] text-[14px] text-right">
                                                {new Date(checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between border-b border-[#e8e8e8] pb-3">
                                            <span className="text-[#555] font-medium text-[14px]">Guests</span>
                                            <span className="font-semibold text-[#1d1d1d] text-[14px] text-right">{guestsFromSearch} Guest{guestsFromSearch > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Booking Summary */}
                                    <div className="pt-2 border-t border-[#e8e8e8]">
                                        <h2 className="text-[20px] font-bold text-[#1d1d1d] mb-4">Booking Summary</h2>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-[14px]">
                                                <span className="text-[#555]">Rooms</span>
                                                <span className="font-semibold text-[#1d1d1d]">
                                                    {Object.values(selectedRooms).reduce((acc, curr) => acc + curr.quantity, 0)} Room{Object.values(selectedRooms).reduce((acc, curr) => acc + curr.quantity, 0) > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[14px]">
                                                <span className="text-[#555]">Duration</span>
                                                <span className="font-semibold text-[#1d1d1d]">
                                                    {Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))} Night{Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24))) > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {Object.values(selectedRooms).map((r, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[14px]">
                                                    <span className="text-[#555]">Price per night ({r.name})</span>
                                                    <span className="font-semibold text-[#1d1d1d]">LKR {r.price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className="pt-5 border-t border-[#e8e8e8]">
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
                                                    onClick={handleApplyPromo}
                                                    disabled={!promoCodeInput.trim() || isApplyingPromo || appliedPromos.includes(promoCodeInput.trim().toUpperCase())}
                                                    className="bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1d1d1d] font-semibold px-4 py-2 rounded-xl text-[14px] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                                                >
                                                    {isApplyingPromo ? (
                                                        <div className="w-4 h-4 border-2 border-[#1d1d1d] border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        "Apply"
                                                    )}
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
                                </div>

                                {/* Right Column: Summary & Payment */}
                                <div className="flex flex-col gap-6 lg:border-l lg:border-[#e8e8e8] lg:pl-12 lg:border-t-0 border-t border-[#e8e8e8] pt-6 lg:pt-0">
                                    {/* Price Breakdown */}
                                    <div className="pt-2">
                                        <h3 className="font-bold text-[#1d1d1d] mb-3 text-[20px]">Price Breakdown</h3>
                                        <div className="flex flex-col gap-2 text-[14px] text-[#555]">
                                            <div className="flex justify-between font-medium">
                                                <span>Base Price</span>
                                                <span>LKR {priceBreakdown ? priceBreakdown.subtotal.toLocaleString() : "..."}</span>
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

                                    {user ? (
                                        <>
                                            {/* Payment Options */}
                                            <div className="pt-5 border-t border-[#e8e8e8]">
                                                <h3 className="font-semibold text-[#1d1d1d] mb-3 text-[16px]">Select Payment Method</h3>
                                                <div className="flex flex-col gap-3">
                                                    <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5' : 'border-[#e8e8e8] hover:border-[#ccc]'}`}>
                                                        <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="mt-1 cursor-pointer" />
                                                        <div>
                                                            <p className="font-semibold text-[#1d1d1d] text-[14px]">Pay online now</p>
                                                            <p className="text-[12px] text-[#828282]">Securely pay the full amount instantly.</p>
                                                        </div>
                                                    </label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className={`flex items-start gap-3 p-4 border rounded-xl transition-colors ${
                                                            hasActivePayAtProperty || (Object.values(selectedRooms).reduce((acc: number, curr: any) => acc + curr.quantity, 0) > 2) ? 'opacity-50 cursor-not-allowed bg-gray-50' : 
                                                            paymentMethod === 'property' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 cursor-pointer' : 'border-[#e8e8e8] hover:border-[#ccc] cursor-pointer'
                                                        }`}>
                                                            <input 
                                                                type="radio" 
                                                                name="payment" 
                                                                checked={paymentMethod === 'property'} 
                                                                onChange={() => {
                                                                    const totalRooms = Object.values(selectedRooms).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
                                                                    if (!hasActivePayAtProperty && totalRooms <= 2) setPaymentMethod('property');
                                                                }} 
                                                                disabled={hasActivePayAtProperty || (Object.values(selectedRooms).reduce((acc: number, curr: any) => acc + curr.quantity, 0) > 2)}
                                                                className={`mt-1 ${hasActivePayAtProperty || (Object.values(selectedRooms).reduce((acc: number, curr: any) => acc + curr.quantity, 0) > 2) ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-[#1d1d1d] text-[14px]">Pay at property</p>
                                                                <p className="text-[12px] text-[#828282]">
                                                                    {hasActivePayAtProperty 
                                                                        ? "You already have an active Pay at Property booking. Please complete it first."
                                                                        : (Object.values(selectedRooms).reduce((acc: number, curr: any) => acc + curr.quantity, 0) > 2)
                                                                        ? "Pay at Property is limited to 2 rooms. Please pay online."
                                                                        : "Your room is held, settle the bill on arrival."}
                                                                </p>
                                                            </div>
                                                        </label>
                                                        {paymentMethod === 'property' && (
                                                            <div className="px-4 py-3 bg-[#f8f8f8] rounded-xl border border-[#e8e8e8] animate-in fade-in slide-in-from-top-2">
                                                                <p className="text-[12px] text-[#555]">
                                                                    For security, we will send a One-Time Password (OTP) to your email <strong>{user.email}</strong> to verify this booking.
                                                                </p>
                                                                <p className="text-[12px] text-[#555] mt-1">
                                                                    Once verified, the system will automatically generate a secure passkey for you to present at check-in.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                disabled={isSubmitting || otpStep === "sending" || otpStep === "verifying"}
                                                onClick={async () => {
                                                    if (paymentMethod === 'property') {
                                                        if (!user?.email) return;
                                                        setOtpStep("sending");
                                                        setOtpError("");
                                                        try {
                                                            await guestApi.sendGuestOTP(user.email, user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Guest");
                                                            setOtpStep("entering");
                                                        } catch (error: any) {
                                                            const msg = error.response?.data?.message || error.message || "Failed to send OTP";
                                                            setOtpStep("none");
                                                            setErrorMsg(msg);
                                                            setBookingStep("failed");
                                                        }
                                                        return;
                                                    }
                                                    
                                                    // Execute directly for online payment
                                                    executeBooking();
                                                }}
                                                className="w-full bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 disabled:opacity-70 transition-colors cursor-pointer mt-2"
                                            >
                                                {isSubmitting || otpStep === "sending" ? "Processing..." : "Confirm Booking"}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="pt-5 border-t border-[#e8e8e8] flex flex-col gap-4">
                                            <div className="bg-[#fff8e1] p-4 rounded-xl border border-[#ffe082]">
                                                <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-1 flex items-center gap-2">
                                                    <AlertTriangle size={16} className="text-[#f57f17]" />
                                                    Login Required
                                                </h3>
                                                <p className="text-[13px] text-[#555]">Please log in to your account to select a payment method and complete this booking.</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const params = new URLSearchParams(window.location.search);
                                                    router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + '?' + params.toString())}`);
                                                }}
                                                className="w-full bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-colors cursor-pointer mt-2"
                                            >
                                                Login to Continue Booking
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>

                {/* Location / Map */}
                <div className="mt-12 bg-white border border-[#e8e8e8] rounded-3xl p-6 md:p-8 shadow-sm">
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
                <div className="mt-12 bg-white border border-[#e8e8e8] rounded-3xl p-6 md:p-8 shadow-sm">
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
                                {(property.cancellationPolicy || "Free cancellation until 48 hours before.\n50% refund within 48 hours.\nNo-shows will be charged full amount.").split('\n').map((line: string, i: number) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-2 flex items-center gap-2">
                                <Users size={16} className="text-[var(--brand-primary)]" /> Age & Children
                            </h3>
                            <ul className="text-[14px] text-[#555] space-y-1.5 list-disc list-inside">
                                {(property.childPolicy || "Children of any age are welcome.\nNo age restriction for check-in.\nExtra beds available upon request.").split('\n').map((line: string, i: number) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#1d1d1d] text-[15px] mb-2 flex items-center gap-2">
                                <Ban size={16} className="text-[var(--brand-primary)]" /> House Rules
                            </h3>
                            <ul className="text-[14px] text-[#555] space-y-1.5 list-disc list-inside">
                                {(property.houseRules || "No smoking indoors.\nNo pets allowed.\nNo parties or events.").split('\n').map((line: string, i: number) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
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
                        {allImages.map((img: string, i: number) => (
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

            {/* OTP Verification Modal */}
            {(otpStep === "entering" || otpStep === "verifying") && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-[24px] font-bold text-[#1d1d1d] mb-2">Verify Your Email</h2>
                        <p className="text-[14px] text-[#555] mb-6">
                            We&apos;ve sent a 6-digit verification code to <strong>{user?.email}</strong>. Please enter it below to confirm your booking.
                        </p>
                        
                        <div className="w-full flex flex-col gap-4 mb-6">
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="------"
                                className="w-full border border-[#d8d8d8] rounded-xl px-4 py-4 text-center text-[24px] tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-[var(--brand-primary)] bg-[#f8f8f8]"
                            />
                            {otpError && <p className="text-[13px] text-red-500 font-medium">{otpError}</p>}
                        </div>

                        <div className="w-full flex gap-3">
                            <button
                                disabled={otpStep === "verifying"}
                                onClick={() => {
                                    setOtpStep("none");
                                    setOtpCode("");
                                    setOtpError("");
                                }}
                                className="flex-1 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1d1d1d] font-bold py-3.5 rounded-xl transition-colors cursor-pointer text-center text-[15px]"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={otpCode.length !== 6 || otpStep === "verifying"}
                                onClick={handleVerifyOTP}
                                className="flex-1 bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer flex justify-center items-center gap-2 text-[15px] disabled:opacity-70"
                            >
                                {otpStep === "verifying" ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Verifying...
                                    </>
                                ) : "Verify & Book"}
                            </button>
                        </div>
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
                        <p className="text-[15px] text-[#555] mb-8">{errorMsg || "We couldn&apos;t process your booking at this time. Please try again."}</p>

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
