"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

// ─────────────────────────────────────────────────────────────────────────────
// Stay constants — replace with API data in production
// ─────────────────────────────────────────────────────────────────────────────
const HOTEL_NAME   = "Luxe Horizon Resort"
const ROOM_NUMBER  = "Suite 402"
const STAY_DATES   = "Oct 12 – Oct 16, 2024"
const CHECK_IN     = "Oct 12"
const CHECK_OUT    = "Oct 16"
const NIGHTS_TOTAL = 4
const NIGHTS_DONE  = 1
const BALANCE_DUE  = "LKR 5,400.00"
const WIFI_NETWORK = "LuxeHorizon_VIP"
const WIFI_PASS    = "LuxeSuite2024"

// BarcodeDetector is a browser API not in TypeScript's lib — declare minimally
declare class BarcodeDetector {
  constructor(options: { formats: string[] })
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type CameraPhase = "idle" | "requesting" | "scanning" | "detected" | "error"
type VerifyPhase = "otp_entry" | "verifying" | "verified"

// ─────────────────────────────────────────────────────────────────────────────
// OTP gate — keeps dashboard private until a 4-digit PIN is entered
// ─────────────────────────────────────────────────────────────────────────────
function OtpGate({ onVerified }: { onVerified: () => void }) {
  const [otp, setOtp]     = useState("")
  const [phase, setPhase] = useState<VerifyPhase>("otp_entry")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) { setError("Please enter a valid 4-digit PIN."); return }
    setError("")
    setPhase("verifying")
    // Simulate front-desk verification — swap for real API call
    setTimeout(() => {
      sessionStorage.setItem("my_room_verified", "true")
      onVerified()
    }, 1500)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 pt-20"
      style={{ background: "linear-gradient(135deg, var(--black-1) 0%, var(--black-2) 100%)" }}
    >
      {/* Ambient glow — purely decorative */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--brand-secondary) 8%, transparent)" }} />

      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 text-center shadow-2xl">
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
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
              style={{ background: "color-mix(in srgb, var(--brand-secondary) 15%, transparent)", borderColor: "color-mix(in srgb, var(--brand-secondary) 20%, transparent)" }}>
              <Lock size={34} style={{ color: "var(--brand-secondary)" }} />
            </div>

            <h2 className="text-[1.75rem] font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-white/50 mb-8 leading-relaxed max-w-xs mx-auto">
              Enter your <strong className="text-white/80">4-digit Arrival PIN</strong> to unlock your suite dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="&bull; &bull; &bull; &bull;"
                  autoFocus
                  className="w-full px-4 py-5 bg-white/5 border border-white/10 focus:border-[var(--brand-secondary)]/60 rounded-2xl text-[1.75rem] tracking-[0.6em] text-center font-bold text-white focus:outline-none transition-all placeholder:text-white/20"
                />
                {error && (
                  <p className="text-sm font-medium mt-2 flex items-center gap-1.5" style={{ color: "var(--state-error)" }}>
                    <XCircle size={13} />{error}
                  </p>
                )}
              </div>
              <button type="submit"
                className="w-full py-4 font-black text-[0.9375rem] rounded-2xl transition-all cursor-pointer tracking-wide"
                style={{ background: "var(--brand-secondary)", color: "var(--black-2)" }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// QR Camera modal — fullscreen overlay for scanning the room QR code
// ─────────────────────────────────────────────────────────────────────────────
function QrCameraModal({
  phase, error, videoRef, onClose, onRetry
}: {
  phase: CameraPhase
  error: string
  videoRef: React.RefObject<HTMLVideoElement | null>
  onClose: () => void
  onRetry: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 bg-black/60">
        <button onClick={onClose} className="flex items-center gap-2 text-white/60 hover:text-white text-sm cursor-pointer transition-colors">
          <X size={18} /> Close
        </button>
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
              {/* Corner brackets — visual guide for framing the QR code */}
              {(["top-6 left-6 rounded-tl-lg border-r-0 border-b-0",
                "top-6 right-6 rounded-tr-lg border-l-0 border-b-0",
                "bottom-6 left-6 rounded-bl-lg border-r-0 border-t-0",
                "bottom-6 right-6 rounded-br-lg border-l-0 border-t-0",
              ] as const).map((cls, i) => (
                <div key={i} className={`absolute w-10 h-10 border-[3px] ${cls}`}
                  style={{ borderColor: "var(--brand-secondary)" }} />
              ))}
            </div>
            <p className="text-white/50 text-sm">Point at the QR code in your room</p>
            <button onClick={onClose} className="text-white/40 hover:text-white/70 text-sm cursor-pointer flex items-center gap-1.5">
              <RefreshCw size={13} /> Cancel
            </button>
          </div>
        )}

        {phase === "detected" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <p className="text-white font-bold text-lg">QR Code Detected!</p>
            <p className="text-white/50 text-sm">Redirecting to menu…</p>
          </div>
        )}

        {phase === "error" && (
          <div className="w-full max-w-xs flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">Camera Unavailable</p>
              <p className="text-white/40 text-sm leading-relaxed">{error}</p>
            </div>
            <button onClick={onRetry}
              className="border border-white/20 hover:border-white/40 text-white/60 hover:text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer flex items-center gap-2">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard — the main room hub shown after PIN verification
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard() {
  const router = useRouter()
  const user   = useAuthStore(s => s.user)
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
          // Brief delay lets the user see the success state before navigating
          setTimeout(() => { setShowCamera(false); setCameraPhase("idle"); router.push("/guest/order") }, 1000)
          return
        }
      } catch { /* browser may throw on non-video frames — safe to ignore */ }
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
      // NotAllowedError means the user denied permission — give a clear message
      const isDenied = (err as { name?: string })?.name === "NotAllowedError"
      setCameraError(isDenied
        ? "Camera access denied. Allow it in your browser settings."
        : "Could not access camera on this device.")
    }
  }, [startScanLoop, stopCamera])

  const closeCamera = () => { stopCamera(); setShowCamera(false); setCameraPhase("idle") }

  const stayProgress = Math.round((NIGHTS_DONE / NIGHTS_TOTAL) * 100)

  return (
    <>
      <div className="min-h-screen pt-[4.5rem] pb-20" style={{ background: "var(--gray-5)" }}>
        <div className="ps-container-md max-w-[1100px] py-6">

          {/* ── Hero banner ── */}
          <div className="relative rounded-[1.5rem] px-6 sm:px-10 py-7 mb-5 overflow-hidden"
            style={{ background: "var(--black-2)" }}>
            {/* Decorative ambient blur — not interactive */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[80px]"
              style={{ background: "color-mix(in srgb, var(--brand-secondary) 12%, transparent)" }} />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.625rem] font-black uppercase tracking-widest mb-3 border"
                  style={{ background: "color-mix(in srgb, var(--brand-secondary) 15%, transparent)", borderColor: "color-mix(in srgb, var(--brand-secondary) 20%, transparent)", color: "var(--brand-secondary)" }}>
                  <Star size={9} fill="currentColor" /> Premium Suite
                </div>
                <h1 className="text-3xl sm:text-[2rem] font-black text-white leading-tight tracking-tight"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
                  {greeting}, <span style={{ color: "var(--brand-secondary)" }}>{firstName}</span>
                </h1>
                <p className="text-sm text-white/40 mt-1">{HOTEL_NAME} · {ROOM_NUMBER}</p>
              </div>

              {/* Stay stats chips — 2×2 on mobile, 1×4 on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { icon: BedDouble,     label: "Room",      value: ROOM_NUMBER  },
                  { icon: Clock,         label: "Check-in",  value: CHECK_IN     },
                  { icon: CalendarClock, label: "Check-out", value: CHECK_OUT    },
                  { icon: DollarSign,    label: "Balance",   value: BALANCE_DUE, accent: true },
                ].map(({ icon: Icon, label, value, accent }) => (
                  <div key={label}
                    className="rounded-xl px-3 py-2.5 border"
                    style={{
                      background: accent ? "color-mix(in srgb, var(--brand-secondary) 10%, transparent)" : "rgba(255,255,255,0.05)",
                      borderColor: accent ? "color-mix(in srgb, var(--brand-secondary) 25%, transparent)" : "rgba(255,255,255,0.08)",
                    }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Icon size={10} style={{ color: accent ? "var(--brand-secondary)" : "rgba(255,255,255,0.35)" }} />
                      <span className="text-[0.5625rem] font-black uppercase tracking-widest"
                        style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                    </div>
                    <p className="text-xs font-black leading-tight"
                      style={{ color: accent ? "var(--brand-secondary)" : "white" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stay progress */}
            <div className="relative z-10 mt-5 pt-5 border-t border-white/8">
              <div className="flex justify-between text-[0.625rem] font-semibold text-white/30 mb-1.5">
                <span>{STAY_DATES}</span>
                <span>{NIGHTS_DONE} of {NIGHTS_TOTAL} nights · {NIGHTS_TOTAL - NIGHTS_DONE} remaining</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stayProgress}%`, background: "linear-gradient(to right, var(--brand-secondary), var(--brand-primary))" }} />
              </div>
            </div>
          </div>

          {/* ── 2-column main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left column — actions + live order + staff requests */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Quick actions */}
              <div className="ps-card p-5 sm:p-6">
                <p className="text-[0.625rem] font-black uppercase tracking-widest mb-4" style={{ color: "var(--gray-4)" }}>
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Utensils,      label: "Order Food",   sub: "Browse menu",   href: "/guest/order/menu",            bg: "bg-amber-50",  border: "border-amber-100",  iconCls: "text-amber-600"  },
                    { icon: MessageSquare, label: "Staff Chat",   sub: "We reply fast", href: "/guest/my-room/message-staff",  bg: "bg-blue-50",   border: "border-blue-100",   iconCls: "text-blue-600"   },
                    { icon: ClipboardList, label: "Order Status", sub: "Track your order", href: "/guest/my-room/order-details", bg: "bg-green-50",  border: "border-green-100",  iconCls: "text-green-600"  },
                    { icon: Pencil,        label: "Write Review", sub: "Share feedback", href: "/guest/my-room/submit-review", bg: "bg-purple-50", border: "border-purple-100", iconCls: "text-purple-600" },
                  ].map(({ icon: Icon, label, sub, href, bg, border, iconCls }) => (
                    <Link key={label} href={href}
                      className={`flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl border ${bg} ${border} hover:shadow-md transition-all no-underline group`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} ${border} border group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className={iconCls} />
                      </div>
                      <div>
                        <p className="text-[0.8125rem] font-black" style={{ color: "var(--black-2)" }}>{label}</p>
                        <p className="text-[0.6875rem] mt-0.5" style={{ color: "var(--gray-4)" }}>{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* QR scan — accessed via button on all devices */}
                <button onClick={openCamera}
                  className="mt-4 w-full flex items-center justify-between px-5 py-3.5 rounded-xl border transition-colors cursor-pointer"
                  style={{ background: "var(--gray-5)", borderColor: "var(--border)" }}>
                  <span className="flex items-center gap-2.5 text-[0.8125rem] font-bold" style={{ color: "var(--fg)" }}>
                    <Camera size={16} style={{ color: "var(--gray-3)" }} /> Scan Room QR Code
                  </span>
                  <ChevronRight size={15} style={{ color: "var(--gray-4)" }} />
                </button>
              </div>

              {/* Live order tracker */}
              <div className="ps-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Active Order</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gray-3)" }}>
                      Order #4029 · Club Sandwich, Mojito, Caesar Salad
                    </p>
                  </div>
                  {/* ETA badge — shows urgency without a full status bar */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[0.6875rem] font-black text-amber-700">ETA 12 min</span>
                  </div>
                </div>

                {/* Step progress rail */}
                <div className="flex items-start mb-5">
                  {([
                    { label: "Received",  done: true,  active: false },
                    { label: "Preparing", done: false, active: true  },
                    { label: "Ready",     done: false, active: false },
                    { label: "Delivered", done: false, active: false },
                  ] as const).map(({ label, done, active }, i, arr) => (
                    <div key={label} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-center">
                        {i > 0 && (
                          <div className="flex-1 h-0.5"
                            style={{ background: done || arr[i - 1].done ? "var(--brand-secondary)" : "var(--gray-5)" }} />
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          active ? "animate-pulse" : ""
                        }`} style={{
                          background: done || active ? "var(--brand-secondary)" : "white",
                          borderColor: done || active ? "var(--brand-secondary)" : "var(--gray-5)",
                        }}>
                          {done   && <CheckCircle2 size={11} color="var(--black-2)" />}
                          {active && <CircleDot    size={11} color="var(--black-2)" />}
                        </div>
                        {i < arr.length - 1 && (
                          <div className="flex-1 h-0.5"
                            style={{ background: done ? "var(--brand-secondary)" : "var(--gray-5)" }} />
                        )}
                      </div>
                      <p className="text-[0.5625rem] font-bold mt-1.5 text-center" style={{ color: "var(--gray-3)" }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Chef assignment */}
                <div className="flex items-center gap-3 p-3 rounded-xl border mb-4"
                  style={{ background: "color-mix(in srgb, var(--gray-5) 50%, white)", borderColor: "var(--border)" }}>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <ChefHat size={17} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="text-[0.8125rem] font-black" style={{ color: "var(--fg)" }}>Chef Marcus is preparing your order</p>
                    <p className="text-[0.6875rem]" style={{ color: "var(--gray-3)" }}>Kitchen — preparing now</p>
                  </div>
                </div>

                <Link href="/guest/my-room/order-details"
                  className="w-full py-3 rounded-xl text-[0.8125rem] font-bold flex items-center justify-center gap-2 no-underline transition-colors"
                  style={{ background: "var(--black-2)", color: "white" }}>
                  <PackageCheck size={15} /> View Full Order Details
                </Link>
              </div>

              {/* Staff quick-request shortcuts */}
              <div className="ps-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Request from Staff</h2>
                    <p className="text-xs mt-0.5" style={{ color: "var(--gray-3)" }}>Available 24 hours · Usually replies instantly</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[0.6875rem] font-bold text-green-600">Staff Online</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { icon: Utensils,     label: "Room Service", q: "I'd like to order room service." },
                    { icon: Sparkles,     label: "Housekeeping", q: "Could you arrange room cleaning?" },
                    { icon: AlertCircle, label: "Report Issue",  q: "I need to report an issue in my room." },
                    { icon: Bell,        label: "Assistance",   q: "I need general assistance, please." },
                  ].map(({ icon: Icon, label, q }) => (
                    <Link key={label}
                      href={`/guest/my-room/message-staff?q=${encodeURIComponent(q)}`}
                      className="flex flex-col items-center gap-2 p-3.5 border rounded-xl transition-all no-underline text-center group"
                      style={{ borderColor: "var(--border)" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
                        <Icon size={17} style={{ color: "var(--gray-2)" }} />
                      </div>
                      <span className="text-[0.6875rem] font-bold" style={{ color: "var(--gray-2)" }}>{label}</span>
                    </Link>
                  ))}
                </div>

                <Link href="/guest/my-room/message-staff"
                  className="mt-4 w-full py-3 border rounded-xl text-[0.8125rem] font-bold flex items-center justify-center gap-2 no-underline transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>
                  <MessageSquare size={14} /> Open Staff Chat <ArrowRight size={13} className="ml-auto" />
                </Link>
              </div>
            </div>

            {/* Right column — info widgets */}
            <div className="flex flex-col gap-5">

              {/* Room detail chip list */}
              <div className="rounded-[1.25rem] p-5 text-white" style={{ background: "var(--black-2)" }}>
                <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-4 text-white/35">Room Details</p>
                <div className="space-y-3">
                  {[
                    { icon: BedDouble,     label: "Room",      value: ROOM_NUMBER              },
                    { icon: Clock,         label: "Check-in",  value: `${CHECK_IN}, 2:00 PM`   },
                    { icon: CalendarClock, label: "Check-out", value: `${CHECK_OUT}, 11:00 AM` },
                    { icon: TrendingUp,   label: "Stay",      value: `${NIGHTS_TOTAL} nights`  },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-white/50" />
                      </div>
                      <div>
                        <p className="text-[0.5625rem] font-bold uppercase tracking-wide text-white/30">{label}</p>
                        <p className="text-[0.8125rem] font-bold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wi-Fi credentials */}
              <div className="ps-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Wifi size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[0.875rem] font-black" style={{ color: "var(--fg)" }}>Wi-Fi Access</p>
                    <p className="text-[0.6875rem]" style={{ color: "var(--gray-3)" }}>Complimentary for suite guests</p>
                  </div>
                </div>
                {[
                  { label: "Network",  value: WIFI_NETWORK },
                  { label: "Password", value: WIFI_PASS    },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 px-3 rounded-xl border mb-2"
                    style={{ background: "color-mix(in srgb, var(--gray-5) 50%, white)", borderColor: "var(--border)" }}>
                    <span className="text-[0.6875rem] font-semibold" style={{ color: "var(--gray-3)" }}>{label}</span>
                    <span className="text-xs font-black tracking-wide" style={{ color: "var(--fg)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Front desk contact */}
              <div className="ps-card p-5">
                <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-3" style={{ color: "var(--gray-4)" }}>
                  Front Desk
                </p>
                <p className="text-[0.8125rem] leading-relaxed mb-4" style={{ color: "var(--gray-2)" }}>
                  Need anything? We&apos;re available 24 hours a day.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                    style={{ background: "var(--black-2)" }}>
                    <Phone size={14} /> Call Ext. 0
                  </button>
                  <Link href="/guest/my-room/message-staff"
                    className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-bold transition-all no-underline"
                    style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>
                    <MessageSquare size={14} /> Message
                  </Link>
                </div>
              </div>

              {/* Review prompt */}
              <div className="ps-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp size={16} className="text-purple-500" />
                  <p className="text-[0.875rem] font-black" style={{ color: "var(--fg)" }}>Enjoying your stay?</p>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={22}
                      className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-[#ddd]"} />
                  ))}
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--gray-3)" }}>
                  Share your experience. Your feedback helps us improve for every guest.
                </p>
                <Link href="/guest/my-room/submit-review"
                  className="w-full py-3 rounded-xl text-[0.8125rem] font-bold flex items-center justify-center gap-2 no-underline transition-colors"
                  style={{ background: "var(--brand-primary)", color: "white" }}>
                  <Pencil size={14} /> Write a Review
                </Link>
              </div>
            </div>

          </div>{/* /grid */}
        </div>
      </div>

      {showCamera && (
        <QrCameraModal
          phase={cameraPhase}
          error={cameraError}
          videoRef={videoRef}
          onClose={closeCamera}
          onRetry={openCamera}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page entry point — PIN gate then dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function MyRoomPage() {
  const [verified, setVerified] = useState(false)

  // Persist verification across page refreshes within the same session
  useEffect(() => {
    if (sessionStorage.getItem("my_room_verified") === "true") setVerified(true)
  }, [])

  if (!verified) return <OtpGate onVerified={() => setVerified(true)} />
  return <Dashboard />
}
