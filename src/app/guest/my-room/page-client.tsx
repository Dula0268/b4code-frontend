"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import {
  Star, Lock, XCircle, Clock, ChefHat, CheckCircle2,
  Camera, X, RefreshCw, AlertCircle, BedDouble, ArrowRight,
  MessageSquare, ClipboardList, Pencil,
  Utensils, Sparkles, CalendarClock, ThumbsUp, Phone, Wifi,
  ChevronRight, PackageCheck, Bell, CircleDot, TrendingUp, DollarSign
} from "lucide-react"

import { useGuestBookingStore } from "@/store/guest/booking/booking.store"
import { useEffect } from "react"

function useActiveBooking() {
  const user = useAuthStore(s => s.user)
  const { bookings, fetchUserBookings, loading } = useGuestBookingStore()

  useEffect(() => {
    if (user?.email) {
      fetchUserBookings(user.email)
    }
  }, [user?.email, fetchUserBookings])

  // Find the "most active" booking (CONFIRMED and closest to today)
  const active = bookings
    .filter(b => b.status === "CONFIRMED")
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())[0]

  // If no active stay, find the most recently completed one
  const completed = bookings
    .filter(b => b.status === "COMPLETED")
    .sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())[0]

  return { active, completed, loading }
}

declare class BarcodeDetector {
  constructor(options: { formats: string[] })
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type CameraPhase = "idle" | "requesting" | "scanning" | "detected" | "error"
type VerifyPhase = "otp_entry" | "verifying" | "verified"

function useOtpGateLogic(onVerified: () => void) {
  const [otp, setOtp]     = useState("")
  const [phase, setPhase] = useState<VerifyPhase>("otp_entry")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) { setError("Please enter a valid 4-digit PIN."); return }
    setError("")
    setPhase("verifying")
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      sessionStorage.setItem("my_room_verified", "true")
      onVerified()
    } catch {
      setError("Verification failed. Please try again.");
      setPhase("otp_entry");
    }
  }

  return { otp, setOtp, phase, error, handleSubmit };
}

function OtpGate({ onVerified }: { onVerified: () => void }) {
  const { otp, setOtp, phase, error, handleSubmit } = useOtpGateLogic(onVerified);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20" style={{ background: "var(--bg)" }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: "color-mix(in srgb, var(--brand-secondary) 8%, transparent)" }} />
      <div className="relative w-full max-w-md bg-[var(--brand-primary)] border border-white/10 rounded-[2rem] p-10 text-center shadow-2xl">
        {phase === "verifying" ? (
          <div className="flex flex-col items-center gap-5 py-10">
            <div className="w-20 h-20 rounded-full border-2 border-t-[var(--brand-secondary)] border-white/10 animate-spin" />
            <div>
              <p className="text-xl font-bold text-white">Verifying Access</p>
              <p className="text-sm text-white/50 mt-1">Communicating with front desk…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border" style={{ background: "color-mix(in srgb, var(--brand-secondary) 15%, transparent)", borderColor: "color-mix(in srgb, var(--brand-secondary) 20%, transparent)" }}>
              <Lock size={34} style={{ color: "var(--brand-secondary)" }} />
            </div>
            <h2 className="text-[1.75rem] font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-white/50 mb-8 leading-relaxed max-w-xs mx-auto">
              Enter your <strong className="text-white/80">4-digit Arrival PIN</strong> to unlock your suite dashboard.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <input
                  type="text" inputMode="numeric" maxLength={4} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="&bull; &bull; &bull; &bull;" autoFocus
                  className="w-full px-4 py-5 bg-white/5 border border-white/10 focus:border-[var(--brand-secondary)]/60 rounded-2xl text-[1.75rem] tracking-[0.6em] text-center font-bold text-white focus:outline-none transition-all placeholder:text-white/20"
                />
                {error && <p className="text-sm font-medium mt-2 flex items-center gap-1.5" style={{ color: "var(--state-error)" }}><XCircle size={13} />{error}</p>}
              </div>
              <button type="submit" className="w-full py-4 font-black text-[0.9375rem] rounded-2xl transition-all cursor-pointer tracking-wide" style={{ background: "var(--brand-secondary)", color: "var(--brand-primary)" }}>
                Unlock My Suite
              </button>
            </form>
            <p className="text-xs text-white/25 mt-7">Need help? Call the front desk on ext. 0</p>
          </>
        )}
      </div>
    </div>
  )
}

function QrCameraModal({ phase, error, videoRef, onClose, onRetry }: { phase: CameraPhase, error: string, videoRef: React.RefObject<HTMLVideoElement | null>, onClose: () => void, onRetry: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 bg-black/60">
        <button onClick={onClose} className="flex items-center gap-2 text-white/60 hover:text-white text-sm cursor-pointer transition-colors"><X size={18} /> Close</button>
        <span className="text-white font-bold text-sm">Scan Menu QR Code</span>
        <div className="w-16" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
        {phase === "requesting" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-t-[var(--brand-secondary)] border-white/20 rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Requesting camera access…</p>
          </div>
        )}

        {phase === "scanning" && (
          <div className="w-full max-w-xs flex flex-col items-center gap-4">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {(["top-6 left-6 rounded-tl-lg border-r-0 border-b-0", "top-6 right-6 rounded-tr-lg border-l-0 border-b-0", "bottom-6 left-6 rounded-bl-lg border-r-0 border-t-0", "bottom-6 right-6 rounded-br-lg border-l-0 border-t-0"] as const).map((cls, i) => (
                <div key={i} className={`absolute w-10 h-10 border-[3px] ${cls}`} style={{ borderColor: "var(--brand-secondary)" }} />
              ))}
            </div>
            <p className="text-white/50 text-sm">Point at the QR code in your room</p>
            <button onClick={onClose} className="text-white/40 hover:text-white/70 text-sm cursor-pointer flex items-center gap-1.5"><RefreshCw size={13} /> Cancel</button>
          </div>
        )}

        {phase === "detected" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle2 size={32} className="text-green-400" /></div>
            <p className="text-white font-bold text-lg">QR Code Detected!</p>
            <p className="text-white/50 text-sm">Redirecting to menu…</p>
          </div>
        )}

        {phase === "error" && (
          <div className="w-full max-w-xs flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center"><AlertCircle size={28} className="text-red-400" /></div>
            <div>
              <p className="text-white font-bold text-base mb-1">Camera Unavailable</p>
              <p className="text-white/40 text-sm leading-relaxed">{error}</p>
            </div>
            <button onClick={onRetry} className="border border-white/20 hover:border-white/40 text-white/60 hover:text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"><RefreshCw size={14} /> Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Dashboard() {
  const router = useRouter()
  const { active, completed, loading } = useActiveBooking()
  const displayBooking = active || completed
  const isCompleted = !active && !!completed
  
  const user = useAuthStore(s => s.user)
  const firstName = user?.profile?.firstName ?? "Guest"
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)

  const [showCamera,  setShowCamera]  = useState(false)
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("idle")
  const [cameraError, setCameraError] = useState("")

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const startScanLoop = useCallback(() => {
    if (!("BarcodeDetector" in window)) return
    const detector = new BarcodeDetector({ formats: ["qr_code"] })

    const tick = async () => {
      const vid = videoRef.current
      if (!vid || vid.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return }
      try {
        const codes = await detector.detect(vid)
        if (codes.length > 0) {
          setCameraPhase("detected")
          stopCamera()
          setTimeout(() => { setShowCamera(false); setCameraPhase("idle"); router.push("/guest/order") }, 1000)
          return
        }
      } catch { }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [stopCamera, router])

  const openCamera = useCallback(async () => {
    setShowCamera(true)
    setCameraPhase("requesting")
    setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
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
      const isDenied = (err as { name?: string })?.name === "NotAllowedError"
      setCameraError(isDenied ? "Camera access denied. Allow it in your browser settings." : "Could not access camera on this device.")
    }
  }, [startScanLoop, stopCamera])

  const closeCamera = () => { stopCamera(); setShowCamera(false); setCameraPhase("idle") }

  const handleCompleteBooking = async () => {
    if (!active) return
    try {
      const { guestApi } = await import("@/lib/api")
      await guestApi.completeBooking(Number(active.id))
      // Force refresh bookings in store
      if (user?.email) await useGuestBookingStore.getState().fetchUserBookings(user.email)
    } catch (err) {
      alert("Failed to complete booking. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" style={{ background: "var(--gray-5)" }}>
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-white/10 rounded-full animate-spin" />
      </div>
    )
  }

  if (!displayBooking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-4 text-center" style={{ background: "var(--gray-5)" }}>
        <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6">
          <CalendarClock size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "var(--fg)" }}>No Active Stay</h2>
        <p className="text-gray-500 max-w-sm mb-8">
          You don&apos;t have an active stay at the moment. Your suite dashboard will appear here once your booking begins.
        </p>
        <Link href="/guest/search" className="px-8 py-4 bg-[var(--brand-primary)] text-white rounded-2xl font-black no-underline shadow-lg hover:shadow-xl transition-all">
          Find a Property
        </Link>
      </div>
    )
  }

  const nightsDone = Math.max(0, Math.min(displayBooking.nights, Math.floor((new Date().getTime() - new Date(displayBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24))))
  const nightsTotal = displayBooking.nights
  const stayProgress = isCompleted ? 100 : Math.round((nightsDone / nightsTotal) * 100)
  const stayDates = displayBooking.checkInFormatted + " – " + displayBooking.checkOutFormatted
  const balanceDue = `LKR ${displayBooking.totalPrice.toLocaleString()}`
  const wifiNetwork = `${displayBooking.property.replace(/\s+/g, "")}_Guest`
  const wifiPass = `Stay${displayBooking.id}!`

  return (
    <>
      <div className="min-h-screen pt-[4.5rem] pb-20" style={{ background: "var(--gray-5)" }}>
        <div className="ps-container-md max-w-[1100px] py-6">
          <div className="relative rounded-[1.5rem] px-6 sm:px-10 py-7 mb-5 overflow-hidden" style={{ background: "var(--brand-primary)" }}>
            <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[80px]" style={{ background: "color-mix(in srgb, var(--brand-secondary) 12%, transparent)" }} />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-black uppercase tracking-widest mb-3 border" style={{ background: isCompleted ? "rgba(59, 130, 246, 0.15)" : "color-mix(in srgb, var(--brand-secondary) 15%, transparent)", borderColor: isCompleted ? "rgba(59, 130, 246, 0.25)" : "color-mix(in srgb, var(--brand-secondary) 20%, transparent)", color: isCompleted ? "#60a5fa" : "var(--brand-secondary)" }}>
                  {isCompleted ? <CheckCircle2 size={9} fill="currentColor" /> : <Star size={9} fill="currentColor" />} {isCompleted ? "Stay Completed" : "Premium Suite"}
                </div>
                <h1 className="text-3xl sm:text-[2rem] font-black text-white leading-tight tracking-tight" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
                  {isCompleted ? "Hope you enjoyed your stay" : `${greeting}, `}<span style={{ color: "var(--brand-secondary)" }}>{firstName}</span>
                </h1>
                <p className="text-sm text-white/40 mt-1">{displayBooking.property} · {displayBooking.roomName}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { icon: BedDouble,     label: "Room",      value: displayBooking.roomName  },
                  { icon: Clock,         label: "Check-in",  value: displayBooking.checkInFormatted },
                  { icon: CalendarClock, label: "Check-out", value: displayBooking.checkOutFormatted },
                  { icon: DollarSign,    label: "Total",     value: balanceDue, accent: true },
                ].map(({ icon: Icon, label, value, accent }) => (
                  <div key={label} className="rounded-xl px-3 py-2.5 border" style={{ background: accent ? "color-mix(in srgb, var(--brand-secondary) 10%, transparent)" : "rgba(255,255,255,0.05)", borderColor: accent ? "color-mix(in srgb, var(--brand-secondary) 25%, transparent)" : "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Icon size={10} style={{ color: accent ? "var(--brand-secondary)" : "rgba(255,255,255,0.35)" }} />
                      <span className="text-[0.5625rem] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                    </div>
                    <p className="text-xs font-black leading-tight" style={{ color: accent ? "var(--brand-secondary)" : "white" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-5 border-t border-white/8">
              <div className="flex justify-between text-[0.625rem] font-semibold text-white/30 mb-1.5">
                <span>{stayDates}</span>
                <span>{nightsDone} of {nightsTotal} nights · {Math.max(0, nightsTotal - nightsDone)} remaining</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stayProgress}%`, background: "linear-gradient(to right, var(--brand-secondary), var(--brand-primary))" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="ps-card p-5 sm:p-6">
                <p className="text-[0.625rem] font-black uppercase tracking-widest mb-4" style={{ color: "var(--gray-4)" }}>Quick Actions</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Utensils,      label: "Order Food",   sub: "Browse menu",   href: "/guest/order/menu",            bg: "bg-amber-50",  border: "border-amber-100",  iconCls: "text-amber-600"  },
                    { icon: MessageSquare, label: "Staff Chat",   sub: "We reply fast", href: `/guest/messages?type=staff&bookingId=${displayBooking.id}`,  bg: "bg-blue-50",   border: "border-blue-100",   iconCls: "text-blue-600"   },
                    { icon: ClipboardList, label: "Order Status", sub: "Track your order", href: "/guest/my-room/order-details", bg: "bg-green-50",  border: "border-green-100",  iconCls: "text-green-600"  },
                    { icon: isCompleted ? Pencil : CheckCircle2,  label: isCompleted ? "Write Review" : "Complete Book", sub: isCompleted ? "Share feedback" : "Finish stay",    onClick: isCompleted ? () => router.push(`/guest/reviews?propertyId=${displayBooking.propertyId}`) : handleCompleteBooking,         bg: isCompleted ? "bg-purple-50" : "bg-emerald-50", border: isCompleted ? "border-purple-100" : "border-emerald-100", iconCls: isCompleted ? "text-purple-600" : "text-emerald-600" },
                  ].map(({ icon: Icon, label, sub, href, bg, border, iconCls, onClick }) => {
                    const content = (
                      <>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} ${border} border group-hover:scale-110 transition-transform`}><Icon size={20} className={iconCls} /></div>
                        <div>
                          <p className="text-[0.8125rem] font-black" style={{ color: "var(--brand-primary)" }}>{label}</p>
                          <p className="text-[0.6875rem] mt-0.5" style={{ color: "var(--gray-4)" }}>{sub}</p>
                        </div>
                      </>
                    )
                    return href ? (
                      <Link key={label} href={href} className={`flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl border ${bg} ${border} hover:shadow-md transition-all no-underline group`}>
                        {content}
                      </Link>
                    ) : (
                      <button key={label} onClick={onClick} className={`flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl border ${bg} ${border} hover:shadow-md transition-all group cursor-pointer bg-transparent w-full`}>
                        {content}
                      </button>
                    )
                  })}
                </div>
                <button onClick={openCamera} className="mt-4 w-full flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl transition-all cursor-pointer text-white shadow-lg hover:shadow-xl active:scale-[0.98]" style={{ background: "var(--brand-primary)" }}>
                  <Camera size={18} />
                  <span className="text-[0.9375rem] font-black uppercase tracking-widest">Scan Room QR Code</span>
                </button>
              </div>

              <div className="ps-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Active Order</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gray-3)" }}>No active orders at the moment</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
                    <span className="text-[0.6875rem] font-black text-gray-400">Idle</span>
                  </div>
                </div>

                <Link href="/guest/order/menu" className="w-full py-3 rounded-xl text-[0.8125rem] font-bold flex items-center justify-center gap-2 no-underline transition-colors" style={{ background: "var(--brand-primary)", color: "white" }}>
                  <Utensils size={15} /> Browse Room Service Menu
                </Link>
              </div>

              <div className="ps-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Request from Staff</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gray-3)" }}>Available 24 hours · Usually replies instantly</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-[0.6875rem] font-bold text-green-600">Staff Online</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { icon: Utensils,     label: "Room Service", q: "I'd like to order room service." },
                    { icon: Sparkles,     label: "Housekeeping", q: "Could you arrange room cleaning?" },
                    { icon: AlertCircle, label: "Report Issue",  q: "I need to report an issue in my room." },
                    { icon: Bell,        label: "Assistance",   q: "I need general assistance, please." },
                  ].map(({ icon: Icon, label, q }) => (
                    <Link key={label} href={`/guest/messages?type=staff&bookingId=${displayBooking.id}&q=${encodeURIComponent(q)}`} className="flex flex-col items-center gap-2 p-3.5 border rounded-xl transition-all no-underline text-center group" style={{ borderColor: "var(--border)" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}><Icon size={17} style={{ color: "var(--gray-2)" }} /></div>
                      <span className="text-[0.6875rem] font-bold" style={{ color: "var(--gray-2)" }}>{label}</span>
                    </Link>
                  ))}
                </div>

                <Link href={`/guest/messages?type=staff&bookingId=${displayBooking.id}`} className="mt-4 w-full py-4 rounded-xl text-[0.9375rem] font-black flex items-center justify-center gap-2 no-underline transition-all text-white shadow-lg hover:shadow-xl" style={{ background: "var(--brand-primary)" }}>
                  <MessageSquare size={16} /> Open Staff Chat
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-[1.25rem] p-5 text-white" style={{ background: "var(--brand-primary)" }}>
                <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-4 text-white/35">Room Details</p>
                <div className="space-y-3">
                  {[
                    { icon: BedDouble,     label: "Room",      value: displayBooking.roomName              },
                    { icon: Clock,         label: "Check-in",  value: `${displayBooking.checkInFormatted}, 2:00 PM`   },
                    { icon: CalendarClock, label: "Check-out", value: `${displayBooking.checkOutFormatted}, 11:00 AM` },
                    { icon: TrendingUp,   label: "Stay",      value: `${nightsTotal} nights`  },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0"><Icon size={14} className="text-white/50" /></div>
                      <div>
                        <p className="text-[0.5625rem] font-bold uppercase tracking-wide text-white/30">{label}</p>
                        <p className="text-[0.8125rem] font-bold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ps-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Wifi size={18} className="text-blue-600" /></div>
                  <div>
                    <p className="text-[0.875rem] font-black" style={{ color: "var(--fg)" }}>Wi-Fi Access</p>
                    <p className="text-[0.6875rem]" style={{ color: "var(--gray-3)" }}>Complimentary for guests</p>
                  </div>
                </div>
                {[
                  { label: "Network",  value: wifiNetwork },
                  { label: "Password", value: wifiPass    },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 px-3 rounded-xl border mb-2" style={{ background: "color-mix(in srgb, var(--gray-5) 50%, white)", borderColor: "var(--border)" }}>
                    <span className="text-[0.6875rem] font-semibold" style={{ color: "var(--gray-3)" }}>{label}</span><span className="text-xs font-black tracking-wide" style={{ color: "var(--fg)" }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="ps-card p-5">
                <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-3" style={{ color: "var(--gray-4)" }}>Front Desk</p>
                <p className="text-[0.8125rem] leading-relaxed mb-4" style={{ color: "var(--gray-2)" }}>Need anything? We&apos;re available 24 hours a day.</p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer" style={{ background: "var(--brand-primary)" }}><Phone size={14} /> Call Ext. 0</button>
                  <Link href={`/guest/messages?type=staff&bookingId=${displayBooking.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-bold transition-all no-underline" style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}><MessageSquare size={14} /> Message</Link>
                </div>
              </div>

              <div className="ps-card p-5">
                <div className="flex items-center gap-2 mb-3"><ThumbsUp size={16} className={isCompleted ? "text-amber-500" : "text-emerald-500"} /><p className="text-[0.875rem] font-black" style={{ color: "var(--fg)" }}>{isCompleted ? "Enjoyed your stay?" : "Ready to checkout?"}</p></div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--gray-3)" }}>{isCompleted ? "Your feedback helps us improve for every guest. Please share your experience with us." : "Marking your stay as complete will allow you to share your feedback and help us improve."}</p>
                {isCompleted ? (
                   <Link href={`/guest/reviews?propertyId=${displayBooking.propertyId}`} className="w-full py-3.5 rounded-xl text-[0.875rem] font-black flex items-center justify-center gap-2 no-underline transition-all text-white" style={{ background: "var(--brand-primary)" }}><Pencil size={16} /> Write a Review</Link>
                ) : (
                   <button onClick={handleCompleteBooking} className="w-full py-3.5 rounded-xl text-[0.875rem] font-black flex items-center justify-center gap-2 transition-all cursor-pointer border-none text-white" style={{ background: "var(--brand-primary)" }}><CheckCircle2 size={16} /> Complete Booking</button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showCamera && <QrCameraModal phase={cameraPhase} error={cameraError} videoRef={videoRef} onClose={closeCamera} onRetry={openCamera} />}
    </>
  )
}

export default function MyRoomPageClient() {
  return <Dashboard />
}
