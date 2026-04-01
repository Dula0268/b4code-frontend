"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import { 
  Star, QrCode, MessageSquare, Lock, Loader2, XCircle, 
  Utensils, Sparkles, Bell, Receipt, Clock, ChefHat, CheckCircle2, 
  ChevronRight, Send, Phone, DollarSign, Camera, X, RefreshCw, AlertCircle
} from "lucide-react"

const HOTEL_NAME = "Luxe Horizon Resort"
const ROOM_NUMBER = "Suite 402"
const STAY_DATES = "Oct 12 - Oct 16"
const ROOM_CHARGE = "LKR 5,400.00"

// ─── BarcodeDetector Type ─────────────────────────────────────────────────────
declare class BarcodeDetector {
    constructor(options: { formats: string[] })
    detect(src: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
    const [hover, setHover] = useState(0)
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="cursor-pointer transition-transform hover:scale-110"
                >
                    <Star
                        size={28}
                        className={`transition-colors ${(hover || rating) >= star ? "text-[var(--brand-secondary)] fill-[var(--brand-secondary)]" : "text-[var(--gray-4)] fill-transparent"}`}
                    />
                </button>
            ))}
        </div>
    )
}

export default function MyRoomPage() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    
    const guestFirst = user?.profile?.firstName || "Guest"
    const guestName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Valued Guest"
    
    const [rating, setRating] = useState(0)
    const [verificationStatus, setVerificationStatus] = useState<'otp_entry' | 'verifying' | 'verified'>('otp_entry')
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')

    // ─── QR Camera State ──────────────────────────────────────────────────────
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const rafRef = useRef<number>(0)
    const [showCamera, setShowCamera] = useState(false)
    const [cameraPhase, setCameraPhase] = useState<'idle' | 'requesting' | 'scanning' | 'detected' | 'error'>('idle')
    const [cameraError, setCameraError] = useState('')

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        if (videoRef.current) videoRef.current.srcObject = null
    }, [])

    const startScanLoop = useCallback(() => {
        if (!("BarcodeDetector" in window)) return
        const detector = new BarcodeDetector({ formats: ["qr_code"] })
        const loop = async () => {
            const vid = videoRef.current
            if (!vid || vid.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return }
            try {
                const codes = await detector.detect(vid)
                if (codes.length > 0) {
                    setCameraPhase("detected")
                    stopCamera()
                    setTimeout(() => {
                        setShowCamera(false)
                        setCameraPhase("idle")
                        router.push("/guest/order")
                    }, 1000)
                    return
                }
            } catch { /* ignore */ }
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
    }, [stopCamera, router])

    const startCamera = useCallback(async () => {
        setShowCamera(true)
        setCameraPhase("requesting")
        setCameraError("")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
                setCameraPhase("scanning")
                startScanLoop()
            }
        } catch (err: unknown) {
            stopCamera()
            setCameraPhase("error")
            const name = (err as { name?: string })?.name
            setCameraError(
                name === "NotAllowedError"
                    ? "Camera access was denied. Please allow camera access in your browser settings."
                    : "Could not access camera on this device."
            )
        }
    }, [startScanLoop, stopCamera])

    const closeCamera = () => {
        stopCamera()
        setShowCamera(false)
        setCameraPhase("idle")
    }

    // Effect to check if already verified in session
    useEffect(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('my_room_verified') === 'true') {
            setVerificationStatus('verified')
        }
    }, [])

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length < 4) {
            setError("Please enter a valid 4-digit PIN.")
            return
        }
        setError("")
        setVerificationStatus('verifying')
        
        setTimeout(() => {
            setVerificationStatus('verified')
            sessionStorage.setItem('my_room_verified', 'true')
        }, 1500)
    }

    if (verificationStatus !== 'verified') {
        return (
            <div className="min-h-screen bg-[var(--gray-5)]/20 flex items-center justify-center p-4 pt-20 font-sans">
                <div className="bg-[var(--white)] rounded-[28px] shadow-[var(--shadow-card)] max-w-md w-full p-10 text-center border border-[var(--border)] animate-in slide-in-from-bottom-4 duration-500">
                    {verificationStatus === 'verifying' ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 py-8">
                            <div className="w-20 h-20 bg-[var(--black-2)]/5 rounded-full flex items-center justify-center mb-6 relative">
                                <Lock size={32} className="text-[var(--black-2)]" />
                                <span className="absolute inset-0 rounded-full border-4 border-[var(--brand-secondary)] animate-ping opacity-30" />
                            </div>
                            <h2 className="text-[24px] font-bold text-[var(--black-2)] mb-2 tracking-tight">Verifying Keys</h2>
                            <p className="text-[14px] text-[var(--gray-2)] mb-6">Communicating with the front desk...</p>
                            <div className="flex items-center justify-center gap-2 text-[var(--brand-secondary)] font-semibold text-[14px]">
                                <Loader2 size={18} className="animate-spin" /> Verifying...
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-[var(--brand-secondary)]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <QrCode size={36} className="text-[var(--brand-secondary)]" />
                            </div>
                            <h2 className="text-[24px] font-bold text-[var(--black-2)] mb-3 mx-auto tracking-tight">Welcome to {HOTEL_NAME}</h2>
                            <p className="text-[14px] text-[var(--gray-2)] mb-8 mx-auto leading-relaxed">
                                Please enter your 4-digit <strong>Arrival PIN</strong> provided by the concierge to unlock your premium digital services.
                            </p>

                            <form onSubmit={handleVerifyOtp} className="space-y-5 text-left animate-in slide-in-from-bottom-4 duration-300">
                                <div>
                                    <label className="block text-[13px] font-bold text-[var(--gray-1)] mb-2 uppercase tracking-wider">
                                        Arrival PIN
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="••••"
                                        className="w-full px-4 py-4 bg-[var(--gray-5)]/30 border border-[var(--border)] rounded-[var(--radius-lg)] text-[24px] tracking-[0.5em] text-center font-bold focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]/30 focus:border-[var(--brand-secondary)] transition-all text-[var(--black-2)]"
                                        autoFocus
                                    />
                                    {error && <p className="text-[var(--state-error)] text-[13px] font-medium mt-2 flex items-center gap-1.5"><XCircle size={14} /> {error}</p>}
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-4 bg-[var(--black-2)] hover:bg-[var(--black-3)] text-white text-[15px] font-bold rounded-[var(--radius-lg)] transition-all shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] cursor-pointer"
                                    >
                                        Unlock Dashboard
                                    </button>
                                </div>
                            </form>
                            
                            <p className="text-[12px] text-[var(--gray-3)] mt-8 leading-relaxed font-medium">
                                Need assistance? Visit our 24/7 reception desk or call from the house phone.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <>
        <div className="min-h-screen bg-[var(--gray-5)]/10 pt-28 pb-20 animate-in fade-in duration-700 font-sans">
            <div className="max-w-[1040px] mx-auto px-5 lg:px-8">

                {/* 1) Welcome Header */}
                <header className="relative bg-[var(--black-2)] rounded-[28px] p-8 md:p-10 mb-8 overflow-hidden shadow-[var(--shadow-card)]">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--brand-secondary)]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[12px] font-medium text-[var(--brand-secondary)] uppercase tracking-widest mb-4">
                                <Star size={12} className="fill-[var(--brand-secondary)]" />
                                Premium Guest
                            </div>
                            <h1 className="text-[32px] md:text-[40px] font-medium text-white tracking-tight mb-2 leading-tight">
                                Welcome back,<br/>
                                <span className="font-bold">{guestName}</span>
                            </h1>
                            <p className="text-[var(--gray-3)] text-[15px] md:text-[16px]">
                                Enjoy your stay at <span className="text-[var(--white)] font-medium">{HOTEL_NAME}</span>
                            </p>
                        </div>
                        <div className="flex lg:items-center gap-4 lg:gap-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[var(--radius-lg)] p-5 w-fit flex-col lg:flex-row">
                            <div className="flex gap-6 items-center">
                                <div>
                                    <p className="text-[var(--gray-3)] text-[12px] uppercase tracking-wider font-semibold mb-1">Room</p>
                                    <p className="text-white text-[18px] font-bold tracking-tight">{ROOM_NUMBER}</p>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10 hidden lg:block"></div>
                                <div>
                                    <p className="text-[var(--gray-3)] text-[12px] uppercase tracking-wider font-semibold mb-1">Dates</p>
                                    <p className="text-white text-[14px] font-medium tracking-tight mt-1">{STAY_DATES}</p>
                                </div>
                            </div>
                            <div className="lg:w-[1px] lg:h-10 w-full h-[1px] bg-white/10"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--brand-secondary)]/20 flex items-center justify-center">
                                    <DollarSign size={18} className="text-[var(--brand-secondary)]" />
                                </div>
                                <div>
                                    <p className="text-[var(--gray-3)] text-[12px] uppercase tracking-wider font-semibold mb-1">Room Charges Due</p>
                                    <p className="text-[var(--brand-secondary)] text-[16px] font-bold tracking-tight">{ROOM_CHARGE}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2) Quick Action Cards */}
                <h2 className="text-[20px] font-bold text-[var(--fg)] tracking-tight mb-5 px-1">At Your Service</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-10">
                    {[
                        { id: 1, title: 'Food & Beverage', desc: 'In-room dining', icon: Utensils, iconColor: 'text-[var(--brand-primary)]', iconBg: 'bg-[var(--brand-primary)]/10', href: '/guest/order' },
                        { id: 2, title: 'Housekeeping', desc: 'Request cleaning', icon: Sparkles, iconColor: 'text-[var(--state-success)]', iconBg: 'bg-[var(--state-success)]/10', href: '/guest/my-room/message-staff' },
                        { id: 3, title: 'Service Desk', desc: 'Chat with us', icon: MessageSquare, iconColor: 'text-[var(--state-info)]', iconBg: 'bg-[var(--state-info)]/10', href: '/guest/my-room/message-staff' },
                        { id: 4, title: 'Room Services', desc: 'Extra amenities', icon: Bell, iconColor: 'text-[var(--state-warning)]', iconBg: 'bg-[var(--state-warning)]/10', href: '/guest/my-room/message-staff' },
                        { id: 5, title: 'View Bill', desc: 'Checkout details', icon: Receipt, iconColor: 'text-[var(--brand-secondary)]', iconBg: 'bg-[var(--brand-secondary)]/10', href: '/guest/booking/my-bookings' },
                        { id: 6, title: 'Feedback', desc: 'Rate your stay', icon: Star, iconColor: 'text-[var(--state-error)]', iconBg: 'bg-[var(--state-error)]/10', href: '/guest/my-room/submit-review' },
                    ].map((item) => (
                        <Link href={item.href} key={item.id} className="group bg-[var(--white)] rounded-[24px] p-5 md:p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] border border-[var(--border)] transition-all cursor-pointer hover:-translate-y-1 block no-underline text-inherit">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.iconBg} flex items-center justify-center mb-4 md:mb-5 transition-transform group-hover:scale-110 duration-300`}>
                                <item.icon size={24} className={item.iconColor} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[var(--fg)] font-bold text-[16px] md:text-[17px] mb-1">{item.title}</h3>
                            <p className="text-[var(--gray-2)] text-[13px]">{item.desc}</p>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* 3) QR Food Ordering Card — with hero image */}
                    <div className="bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--secondary-active)] rounded-[28px] relative overflow-hidden shadow-[var(--shadow-card)] text-white group hover:shadow-[0_16px_40px_rgba(255,180,1,0.35)] transition-shadow flex flex-col">
                        {/* Hero Image */}
                        <div className="relative w-full h-[180px]">
                            <Image src="/images/room/restaurant-menu-hero.png" alt="Restaurant dining" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-secondary)] via-[var(--brand-secondary)]/40 to-transparent"></div>
                            <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-[12px] font-bold uppercase tracking-widest text-white">
                                <Utensils size={14} /> Restaurant Menu
                            </div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col flex-1 justify-between">
                            <div className="px-8 pt-5 pb-0">
                                <h3 className="text-[28px] font-bold leading-tight mb-2 text-[var(--black-2)]">Craving<br/>something special?</h3>
                                <p className="text-[var(--black-2)]/80 text-[15px] max-w-[260px] leading-relaxed font-semibold">
                                    Browse our digital menu or scan the QR code in your room.
                                </p>
                            </div>
                            <div className="p-8 pt-5 flex flex-col gap-3">
                                {/* Mobile only — Scan QR Code */}
                                <button 
                                    onClick={startCamera}
                                    className="flex lg:hidden items-center justify-between w-full bg-[var(--black-2)] text-[var(--brand-secondary)] px-6 py-4 rounded-[var(--radius-lg)] font-bold text-[15px] hover:bg-[var(--black-3)] transition-all cursor-pointer"
                                >
                                    <span className="flex items-center gap-3"><Camera size={20} /> Scan QR Code</span>
                                    <ChevronRight size={20} />
                                </button>
                                {/* Desktop only — Browse Menu */}
                                <Link href="/guest/order" className="hidden lg:flex items-center justify-between w-full bg-white text-[var(--secondary-active)] px-6 py-4 rounded-[var(--radius-lg)] font-bold text-[15px] hover:shadow-[var(--shadow-soft)] transition-all no-underline">
                                    <span className="flex items-center gap-3"><QrCode size={20} /> Browse Menu</span>
                                    <ChevronRight size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 4) Live Order Tracking — with hero image */}
                    <div className="bg-[var(--white)] rounded-[28px] border border-[var(--border)] shadow-[var(--shadow-soft)] flex flex-col overflow-hidden">
                        {/* Hero Image */}
                        <div className="relative w-full h-[160px]">
                            <Image src="/images/room/food-order-hero.png" alt="Your order" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"></div>
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-[var(--brand-secondary)]/90 backdrop-blur-sm text-[var(--black-2)] px-3 py-1.5 rounded-full font-black text-[12px] uppercase tracking-wider">
                                <Clock size={12} /> ETA 12 Min
                            </div>
                        </div>

                        <div className="p-8 pt-4 flex flex-col flex-1 justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-full bg-[var(--state-success)]/10 flex items-center justify-center border border-[var(--state-success)]/20">
                                        <CheckCircle2 size={20} className="text-[var(--state-success)]" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-[var(--fg)]">Active Order #4029</p>
                                        <p className="text-[13px] text-[var(--gray-2)]">Club Sandwich, Mojito & Caesar Salad</p>
                                    </div>
                                </div>
                                
                                {/* Compact Timeline */}
                                <div className="relative pl-3 mb-4">
                                    <div className="absolute left-[11px] top-1 bottom-3 w-[2px] bg-[var(--gray-5)]"></div>
                                    <div className="absolute left-[11px] top-1 h-1/2 w-[2px] bg-[var(--brand-secondary)]"></div>
                                    
                                    <div className="space-y-4 tracking-tight">
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-secondary)] ring-3 ring-white z-10"></div>
                                            <p className="text-[13px] font-bold text-[var(--fg)]">Order Placed</p>
                                        </div>
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-secondary)] ring-3 ring-white z-10 animate-pulse"></div>
                                            <p className="text-[13px] font-bold text-[var(--fg)]">Preparing in Kitchen</p>
                                            <span className="ml-auto text-[10px] bg-[var(--gray-5)]/30 px-2 py-0.5 rounded-md text-[var(--gray-2)] font-bold uppercase flex items-center gap-1"><ChefHat size={10}/> Chef Marcus</span>
                                        </div>
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)] ring-3 ring-white z-10"></div>
                                            <p className="text-[13px] font-medium text-[var(--gray-3)]">On the way</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => router.push('/guest/my-room/order-details')} className="w-full py-3.5 bg-[var(--black-2)] hover:bg-[var(--black-3)] text-[var(--white)] rounded-[var(--radius-lg)] text-[14px] font-bold transition-all cursor-pointer shadow-[var(--shadow-soft)]">
                                View Order Details
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* 5) Messaging Center — Notification + Start Chat */}
                    <div className="bg-[var(--white)] rounded-[28px] border border-[var(--border)] shadow-[var(--shadow-soft)] overflow-hidden flex flex-col">
                        {/* Hero Image */}
                        <div className="relative w-full h-[160px]">
                            <Image src="/images/room/staff-concierge.png" alt="Our concierge team" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                
                        </div>

                        <div className="p-8 pt-4 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="text-[18px] font-bold text-[var(--fg)] flex items-center gap-2 mb-4">
                                    <MessageSquare size={18} className="text-[var(--fg)]"/> Messages
                                </h3>

                                
                            </div>

                            <button onClick={() => router.push('/guest/my-room/message-staff')} className="w-full bg-[var(--black-2)] hover:bg-[var(--black-3)] text-[var(--white)] px-5 py-3.5 rounded-[var(--radius-lg)] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-[var(--shadow-soft)] cursor-pointer">
                                <Send size={16} /> Start Chat with Staff
                            </button>
                        </div>
                    </div>

                    {/* 6) Review & Feedback Card — with hero image */}
                    <div className="bg-[var(--black-2)] rounded-[28px] relative overflow-hidden shadow-[var(--shadow-card)] text-[var(--white)] flex flex-col">
                        {/* Hero Image */}
                        <div className="relative w-full h-[160px]">
                            <Image src="/images/room/review-stay.png" alt="Your luxurious stay" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--black-2)] via-[var(--black-2)]/50 to-transparent"></div>
                        </div>

                        <div className="p-8 pt-4 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="text-[24px] font-bold mb-2 tracking-tight">How is your stay?</h3>
                                <p className="text-[var(--gray-3)] text-[14px] mb-6 leading-relaxed max-w-[320px]">
                                    We strive for excellence. Share your experience and help us improve for future guests.
                                </p>
                            </div>

                            <button 
                                onClick={() => router.push(`/guest/my-room/submit-review${rating > 0 ? `?rating=${rating}` : ''}`)}
                                className="w-full bg-[var(--brand-secondary)] hover:bg-[var(--secondary-hover)] text-[var(--black-2)] font-bold text-[15px] py-4 rounded-[var(--radius-lg)] transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                            >
                                Add Review
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* ── QR Camera Modal Overlay ──────────────────────────────────────── */}
        {showCamera && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 bg-black/60">
                    <button onClick={closeCamera} className="flex items-center gap-1.5 text-white/70 hover:text-white text-[14px] cursor-pointer transition-colors">
                        <X size={18} /> Close
                    </button>
                    <span className="text-white font-bold text-[14px]">Scan QR Code</span>
                    <div className="w-16" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
                    {cameraPhase === "requesting" && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-14 h-14 border-4 border-[var(--brand-secondary)]/30 border-t-[var(--brand-secondary)] rounded-full animate-spin" />
                            <p className="text-white/70 text-[14px]">Requesting camera access…</p>
                        </div>
                    )}

                    {cameraPhase === "scanning" && (
                        <div className="w-full max-w-[350px] flex flex-col items-center gap-4">
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-6 left-6 w-10 h-10 border-t-[3px] border-l-[3px] border-[var(--brand-secondary)] rounded-tl-md" />
                                    <div className="absolute top-6 right-6 w-10 h-10 border-t-[3px] border-r-[3px] border-[var(--brand-secondary)] rounded-tr-md" />
                                    <div className="absolute bottom-6 left-6 w-10 h-10 border-b-[3px] border-l-[3px] border-[var(--brand-secondary)] rounded-bl-md" />
                                    <div className="absolute bottom-6 right-6 w-10 h-10 border-b-[3px] border-r-[3px] border-[var(--brand-secondary)] rounded-br-md" />
                                </div>
                            </div>
                            <p className="text-white/60 text-[13px] text-center">Point at the QR code — scans automatically</p>
                            <button onClick={closeCamera} className="text-white/40 hover:text-white/70 text-[13px] transition-colors cursor-pointer flex items-center gap-1.5">
                                <RefreshCw size={13} /> Cancel
                            </button>
                        </div>
                    )}

                    {cameraPhase === "detected" && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-[var(--state-success)]/20 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-[var(--state-success)]" />
                            </div>
                            <p className="text-white font-bold text-[18px]">QR Code Detected!</p>
                            <p className="text-white/60 text-[13px]">Redirecting to menu...</p>
                        </div>
                    )}

                    {cameraPhase === "error" && (
                        <div className="w-full max-w-[340px] flex flex-col items-center gap-5 text-center">
                            <div className="w-14 h-14 rounded-full bg-[var(--state-error)]/20 flex items-center justify-center">
                                <AlertCircle size={28} className="text-[var(--state-error)]" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[16px] mb-1.5">Camera Unavailable</p>
                                <p className="text-white/50 text-[13px] leading-relaxed">{cameraError}</p>
                            </div>
                            <button
                                onClick={() => { setCameraPhase("idle"); startCamera() }}
                                className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-[13px] font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                            >
                                <RefreshCw size={14} /> Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    )
}
