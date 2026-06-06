"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin, Heart, Share2, Star, Check, ShieldCheck, Tag, ChevronRight, Home, Wifi, Wind, Waves,
    Dumbbell, Car, Utensils, Coffee, Leaf, Bike, BookOpen,
    Monitor, SquareDot, Grid2X2, X,
} from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { RoomCard, RatingBar } from "@/components/guest/property/property-components"
import CalendarPicker from "@/components/shared/forms/calendar-picker"
import { useEffect, useRef } from "react"

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Wifi, Wind, Waves, Dumbbell, Car, Utensils, ShieldCheck, Coffee,
    Leaf, Bike, BookOpen, Monitor,
}

function AmenityIcon({ name, size = 18 }: { name: string; size?: number }) {
    const Icon = ICON_MAP[name] ?? SquareDot
    return <Icon size={size} className="text-[var(--brand-primary)] flex-shrink-0" />
}

export default function PropertyClient({ property }: { property: PropertyDetail }) {
    const [selectedRooms, setSelectedRooms] = useState<{room: Room; quantity: number}[]>([])
    const [paymentMethod, setPaymentMethod] = useState<"card" | "property">("card")
    const [nicNumber, setNicNumber] = useState("")
    const [saved, setSaved] = useState(false)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [activeGalleryIdx, setActiveGalleryIdx] = useState(0)
    const [descExpanded, setDescExpanded] = useState(false)
    const [shareToast, setShareToast] = useState<"copied" | "shared" | null>(null)
    const [isBooking, setIsBooking] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [promoCodeInput, setPromoCodeInput] = useState("")
    const [discountPercentage, setDiscountPercentage] = useState(0)
    const [promoMessage, setPromoMessage] = useState("")
    const [promoError, setPromoError] = useState("")
    const [isApplyingPromo, setIsApplyingPromo] = useState(false)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const user = useAuthStore(s => s.user)
    
    const initCheckIn = searchParams?.get("checkIn") ? new Date(searchParams.get("checkIn")! + "T00:00:00") : new Date()
    const initCheckOut = searchParams?.get("checkOut") ? new Date(searchParams.get("checkOut")! + "T00:00:00") : new Date(Date.now() + 86400000)
    
    const [checkIn, setCheckIn] = useState<Date | null>(initCheckIn)
    const [checkOut, setCheckOut] = useState<Date | null>(initCheckOut)
    const [calOpen, setCalOpen] = useState(false)
    const calRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (calRef.current && !calRef.current.contains(e.target as Node)) {
                setCalOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleDateChange = (ci: Date | null, co: Date | null) => {
        setCheckIn(ci)
        setCheckOut(co)
        if (ci && co && ci < co) {
            setCalOpen(false)
            const params = new URLSearchParams(searchParams?.toString())
            params.set("checkIn", ci.toISOString().split("T")[0])
            params.set("checkOut", co.toISOString().split("T")[0])
            router.replace(`${pathname}?${params.toString()}`)
            setSelectedRooms([]) // Clear rooms on date change
        }
    }
    const addBooking = useGuestBookingStore(s => s.addBooking)

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

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) return
        setIsApplyingPromo(true)
        setPromoError("")
        setPromoMessage("")
        
        try {
            const res = await fetch(`http://localhost:8080/api/promotions/validate?code=${encodeURIComponent(promoCodeInput.trim())}`)
            const data = await res.json()
            
            if (res.ok) {
                setDiscountPercentage(data.discountPercentage)
                setPromoMessage(`${data.discountPercentage}% off applied!`)
            } else {
                setPromoError(data.message || "Invalid code")
                setDiscountPercentage(0)
            }
        } catch (err) {
            setPromoError("Failed to validate code")
            setDiscountPercentage(0)
        } finally {
            setIsApplyingPromo(false)
        }
    }

    const handleRoomQuantityChange = (room: Room, qty: number) => {
        setSelectedRooms(prev => {
            if (qty === 0) return prev.filter(r => r.room.id !== room.id)
            const existing = prev.find(r => r.room.id === room.id)
            if (existing) return prev.map(r => r.room.id === room.id ? { ...r, quantity: qty } : r)
            return [...prev, { room, quantity: qty }]
        })
    }

    const handleBook = () => {
        if (!user) {
            alert("Please sign in to book.")
            return
        }
        if (selectedRooms.length === 0) {
            alert("Please select at least one room to book.")
            return
        }
        if (paymentMethod === 'property' && !nicNumber) {
            alert("Please enter your NIC Number to pay at property.")
            return
        }
        
        setIsBooking(true)
        
        const roomNames = selectedRooms.map(r => `${r.quantity}x ${r.room.name}`).join(", ")
        const totalGuests = selectedRooms.reduce((sum, r) => sum + (r.room.maxGuests * r.quantity), 0)
        
        setTimeout(() => {
            const bookingId = crypto.randomUUID()
            const code = `BK-${Math.floor(Math.random() * 1000000)}`
            addBooking({
                id: bookingId,
                confirmationCode: code,
                status: "UPCOMING",
                property: property.title,
                propertyId: property.id,
                location: `${property.city}, ${property.country}`,
                imageSrc: property.imageSrc,
                roomName: roomNames,
                roomId: selectedRooms.map(r => r.room.id).join(","),
                checkIn: checkIn ? checkIn.toISOString().split("T")[0] : "",
                checkOut: checkOut ? checkOut.toISOString().split("T")[0] : "",
                checkInFormatted: checkIn ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
                checkOutFormatted: checkOut ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
                guests: totalGuests,
                guestsLabel: `${totalGuests} Adults`,
                nights: nights,
                nightsLabel: `${nights} night${nights > 1 ? "s" : ""}`,
                totalPrice: total,
                basePrice: currentPrice,
                taxes: taxes,
                serviceFee: 0,
                discount: 0,
                paymentMethod: paymentMethod,
                paidInFull: paymentMethod === 'card',
                nationalId: nicNumber || undefined,
                bookedAt: new Date().toISOString(),
                userEmail: user.email
            })

            setIsBooking(false)
            setShowSuccess(true)
            
            setTimeout(() => {
                router.push('/guest/booking/my-bookings')
            }, 1500)
        }, 1200)
    }

    const nights = checkIn && checkOut && checkOut > checkIn
        ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000))
        : 1

    const allImages = [property.imageSrc, ...(property.galleryImages || [])]
    const currentPrice = selectedRooms.length > 0 
        ? selectedRooms.reduce((sum, r) => sum + (r.room.pricePerNight * r.quantity), 0) 
        : property.pricePerNight
    const subtotal = currentPrice * nights
    const discountAmount = subtotal * (discountPercentage / 100)
    const priceAfterDiscount = subtotal - discountAmount
    const taxes = priceAfterDiscount * 0.1
    const total = priceAfterDiscount + taxes

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
                        <p className="text-[12px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">{property.propertyType}</p>
                        <h1 className="text-[32px] font-bold text-[#1d1d1d] leading-tight mb-2">{property.title}</h1>
                        <div className="flex items-center gap-1.5 text-[14px] text-[#555]"><MapPin size={15} className="text-[var(--brand-primary)]" /><span>{property.fullAddress}</span></div>
                    </div>
                </div>

                {/* Map Card at Top */}
                <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-sm overflow-hidden mb-8 w-full">
                    <div className="relative h-[350px] sm:h-[450px] bg-[#e8f4f8]">
                        <iframe
                            title="Property location map"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.05},${property.lat - 0.05},${property.lng + 0.05},${property.lat + 0.05}&layer=mapnik&marker=${property.lat},${property.lng}`}
                            className="w-full h-full border-none"
                            loading="lazy"
                        />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[14px] font-bold text-[#1d1d1d] mb-1">Location</p>
                            <p className="text-[13px] text-[#555]">{property.fullAddress}</p>
                        </div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`} target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[#6d2200] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer text-center">
                            Get Directions →
                        </a>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                    {/* LEFT COLUMN */}
                    <div className="flex-1 min-w-0 flex flex-col gap-8">

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
                                <p className="text-[12px] text-[#828282]">☑ Prices include taxes and fees</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(property.rooms || []).map(room => (
                                    <RoomCard 
                                        key={room.id} 
                                        room={room} 
                                        propertyId={property.id} 
                                        selectedQuantity={selectedRooms.find(r => r.room.id === room.id)?.quantity || 0}
                                        onQuantityChange={(qty) => handleRoomQuantityChange(room, qty)} 
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

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-24">
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-sm p-6 relative overflow-hidden">
                            
                            {isBooking && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                                    <div className="w-8 h-8 border-4 border-[#9a3300] border-t-transparent rounded-full animate-spin mb-3" />
                                    <p className="text-[14px] font-bold text-[#1d1d1d]">Processing Booking...</p>
                                </div>
                            )}
                            {showSuccess && (
                                <div className="absolute inset-0 bg-emerald-50 z-10 flex flex-col items-center justify-center rounded-2xl border border-emerald-200 animate-in fade-in zoom-in duration-300">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                        <Check size={24} className="text-emerald-600" />
                                    </div>
                                    <p className="text-[18px] font-black text-emerald-800 tracking-tight">Booking Confirmed!</p>
                                    <p className="text-[13px] font-medium text-emerald-600 mt-1">Redirecting to My Bookings...</p>
                                </div>
                            )}

                            {selectedRooms.length > 0 && (
                                <div className="mb-4 bg-orange-50 border border-orange-100 rounded-xl p-3 flex flex-col gap-2">
                                    <p className="text-[11px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">Selected Rooms ({selectedRooms.reduce((sum, r) => sum + r.quantity, 0)})</p>
                                    {selectedRooms.map(r => (
                                        <div key={r.room.id} className="flex items-center justify-between">
                                            <p className="text-[13px] font-semibold text-[#1d1d1d]">{r.quantity}x {r.room.name}</p>
                                            <button onClick={() => handleRoomQuantityChange(r.room, 0)} className="text-red-500 hover:text-red-700 text-[18px] leading-none cursor-pointer p-1">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mb-5 flex items-baseline gap-1.5">
                                <span className="text-[24px] font-bold text-[#1d1d1d]">LKR {currentPrice.toLocaleString("en-US")}</span>
                                <span className="text-[14px] text-[#555] font-medium">/ night</span>
                            </div>

                            <div className="border border-[#e0e0e0] rounded-xl overflow-hidden mb-5">
                                <div ref={calRef} className="relative">
                                    <div 
                                        onClick={() => setCalOpen(!calOpen)}
                                        className="flex border-b border-[#e0e0e0] cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1 p-3 border-r border-[#e0e0e0]">
                                            <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Check-in</p>
                                            <p className="text-[14px] font-semibold text-[#1d1d1d]">
                                                {checkIn ? checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                                            </p>
                                        </div>
                                        <div className="flex-1 p-3">
                                            <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Check-out</p>
                                            <p className="text-[14px] font-semibold text-[#1d1d1d]">
                                                {checkOut ? checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                                            </p>
                                        </div>
                                    </div>
                                    {calOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl z-50 shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#f0f0f0] p-4 flex justify-center">
                                            <CalendarPicker
                                                checkIn={checkIn}
                                                checkOut={checkOut}
                                                onChange={handleDateChange}
                                                onComplete={() => {}}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Guests</p>
                                        <p className="text-[14px] font-semibold text-[#1d1d1d]">2 Adults</p>
                                    </div>
                                    <span className="text-[#888] text-[18px]">›</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-[#e0e0e0]">
                                <div className="flex items-center justify-between text-[14px] text-[#555]">
                                    <span>LKR {currentPrice.toLocaleString("en-US")} × {nights} night{nights !== 1 ? 's' : ''}</span>
                                    <span className="font-semibold text-[#1d1d1d]">LKR {subtotal.toLocaleString("en-US")}</span>
                                </div>
                                {discountPercentage > 0 && (
                                    <div className="flex items-center justify-between text-[14px] text-emerald-600 font-medium">
                                        <span>Discount ({discountPercentage}%)</span>
                                        <span>- LKR {discountAmount.toLocaleString("en-US")}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-[14px] text-[#555]">
                                    <span>Taxes & Fees (10%)</span>
                                    <span className="font-semibold text-[#1d1d1d]">LKR {taxes.toLocaleString("en-US")}</span>
                                </div>
                            </div>

                            <div className="mb-6 pb-6 border-b border-[#e0e0e0]">
                                <p className="text-[13px] font-bold text-[#b03a00] mb-2">Have a promo code?</p>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Enter code" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} className="flex-1 border border-[#e0e0e0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--brand-primary)]" />
                                    <button onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCodeInput} className="bg-[#1d1d1d] hover:bg-black text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer disabled:opacity-50">Apply</button>
                                </div>
                                {promoError && <p className="text-[12px] text-red-500 mt-2 font-medium">{promoError}</p>}
                                {promoMessage && <p className="text-[12px] text-emerald-600 mt-2 font-medium">{promoMessage}</p>}
                            </div>

                            <div className="mb-6 pb-6 border-b border-[#e0e0e0]">
                                <p className="text-[14px] font-bold text-[#1d1d1d] mb-3">Payment Method</p>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-[var(--brand-primary)] w-4 h-4 cursor-pointer" />
                                        <span className="text-[14px] text-[#333] font-medium">Online Card</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="payment" value="property" checked={paymentMethod === 'property'} onChange={() => setPaymentMethod('property')} className="accent-[var(--brand-primary)] w-4 h-4 cursor-pointer" />
                                        <span className="text-[14px] text-[#333] font-medium">Pay at Property</span>
                                    </label>
                                </div>
                                
                                {paymentMethod === 'property' && (
                                    <div className="mt-4 pt-4 border-t border-[#f0f0f0] animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2">NIC Number <span className="text-red-500">*</span></p>
                                        <input type="text" placeholder="Enter NIC Number" value={nicNumber} onChange={(e) => setNicNumber(e.target.value)} className="w-full border border-[#e0e0e0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--brand-primary)] bg-[#fafafa]" required />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[18px] font-bold text-[#1d1d1d]">Total</span>
                                <span className="text-[20px] font-bold text-[#b03a00]">LKR {total.toLocaleString("en-US")}</span>
                            </div>

                            <button onClick={handleBook} disabled={isBooking || showSuccess} className="w-full bg-[#9c3100] hover:bg-[#852900] text-white py-3.5 rounded-xl font-bold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                                Confirm & Book <span className="text-[18px]">→</span>
                            </button>
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
        </div>
    )
}
