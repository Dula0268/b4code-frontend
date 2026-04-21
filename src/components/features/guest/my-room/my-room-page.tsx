"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import {
  Star, Lock, XCircle, Clock, ChefHat, CheckCircle2, DollarSign,
  Camera, X, RefreshCw, AlertCircle, BedDouble, ArrowRight,
  MessageSquare, ClipboardList, Pencil,
  Utensils, Sparkles, CalendarClock, ThumbsUp, Phone, Wifi,
  ChevronRight, PackageCheck, Bell, CircleDot, TrendingUp
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────
const HOTEL_NAME  = "Luxe Horizon Resort"
const ROOM_NUMBER = "Suite 402"
const STAY_DATES  = "Oct 12 – Oct 16, 2024"
const ROOM_CHARGE = "LKR 5,400.00"
const CHECK_IN    = "Oct 12"
const CHECK_OUT   = "Oct 16"
const NIGHTS_TOTAL = 4
const NIGHTS_DONE  = 1
const NIGHTS_LEFT  = 3
const WIFI_PASS   = "LuxeSuite2024"

declare class BarcodeDetector {
  constructor(options: { formats: string[] })
  detect(src: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}



// ─── Main component ───────────────────────────────────────────────────────────
export default function MyRoomPage() {
  const router   = useRouter()
  const user     = useAuthStore((s) => s.user)
  const guestFirst = user?.profile?.firstName || "Guest"
  const guestFull  = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : "Valued Guest"

  const [verificationStatus, setVerificationStatus] = useState<"otp_entry"|"verifying"|"verified">("otp_entry")
  const [otp,   setOtp]   = useState("")
  const [error, setError] = useState("")
  const [hour]            = useState(new Date().getHours())

  // QR / camera
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraPhase, setCameraPhase] = useState<"idle"|"requesting"|"scanning"|"detected"|"error">("idle")
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
    const loop = async () => {
      const vid = videoRef.current
      if (!vid || vid.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return }
      try {
        const codes = await detector.detect(vid)
        if (codes.length > 0) {
          setCameraPhase("detected"); stopCamera()
          setTimeout(() => { setShowCamera(false); setCameraPhase("idle"); router.push("/guest/order") }, 1000)
          return
        }
      } catch { /* ignore */ }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [stopCamera, router])

  const startCamera = useCallback(async () => {
    setShowCamera(true); setCameraPhase("requesting"); setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream; await videoRef.current.play()
        setCameraPhase("scanning"); startScanLoop()
      }
    } catch (err: unknown) {
      stopCamera(); setCameraPhase("error")
      setCameraError((err as { name?: string })?.name === "NotAllowedError"
        ? "Camera access denied. Allow it in your browser settings."
        : "Could not access camera on this device.")
    }
  }, [startScanLoop, stopCamera])

  const closeCamera = () => { stopCamera(); setShowCamera(false); setCameraPhase("idle") }

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("my_room_verified") === "true")
      setVerificationStatus("verified")
  }, [])

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 4) { setError("Please enter a valid 4-digit PIN."); return }
    setError(""); setVerificationStatus("verifying")
    setTimeout(() => { setVerificationStatus("verified"); sessionStorage.setItem("my_room_verified", "true") }, 1500)
  }

  // ── OTP Gate ────────────────────────────────────────────────────────────────
  if (verificationStatus !== "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-20 font-sans"
        style={{ background: "linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 60%,#111 100%)" }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-400/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] max-w-md w-full p-10 text-center shadow-2xl">
          {verificationStatus === "verifying" ? (
            <div className="flex flex-col items-center py-10 gap-5">
              <div className="w-20 h-20 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              <div>
                <h2 className="text-[22px] font-bold text-white mb-1">Verifying Access</h2>
                <p className="text-[14px] text-white/50">Communicating with front desk…</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="w-20 h-20 bg-amber-400/15 rounded-full flex items-center justify-center mb-6 mx-auto border border-amber-400/20">
                <Lock size={34} className="text-amber-400" />
              </div>
              <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-[14px] text-white/50 mb-8 leading-relaxed max-w-[300px] mx-auto">
                Enter your <strong className="text-white/80">4-digit Arrival PIN</strong> to unlock your suite dashboard.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
                <div>
                  <input type="text" maxLength={4} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • •"
                    className="w-full px-4 py-5 bg-white/5 border border-white/10 focus:border-amber-400/60 rounded-2xl text-[28px] tracking-[0.6em] text-center font-bold text-white focus:outline-none transition-all placeholder:text-white/20"
                    autoFocus />
                  {error && (
                    <p className="text-red-400 text-[12px] font-medium mt-2 flex items-center gap-1.5">
                      <XCircle size={13} />{error}
                    </p>
                  )}
                </div>
                <button type="submit"
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-[#1a1a1a] text-[15px] font-black rounded-2xl transition-all cursor-pointer tracking-wide">
                  Unlock My Suite
                </button>
              </form>
              <p className="text-[12px] text-white/25 mt-7">Need help? Call the front desk on ext. 0</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <>
      <div className="min-h-screen bg-[#f4f4f2] pt-24 pb-20 font-sans">
        <div className="max-w-[1100px] mx-auto px-4 lg:px-8">

          {/* ────────────────────────────────────────────────────────────
              ROW A  —  Hero welcome banner (full-width dark strip)
          ──────────────────────────────────────────────────────────── */}
          <div className="relative bg-[#1a1a1a] rounded-[22px] px-8 py-7 mb-5 overflow-hidden">
            {/* ambient glows */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-amber-400/12 rounded-full blur-[80px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full blur-[60px]" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left — greeting */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/15 border border-amber-400/20 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">
                  <Star size={9} className="fill-amber-400" /> Premium Suite
                </div>
                <h1 className="text-[28px] sm:text-[32px] font-black text-white leading-tight tracking-tight">
                  {greeting}, <span className="text-amber-400">{guestFirst}</span>
                </h1>
                <p className="text-white/40 text-[13px] mt-1">{HOTEL_NAME} · {ROOM_NUMBER}</p>
              </div>

              {/* Right — 4 stat chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
                {[
                  { icon: BedDouble,     label: "Room",       value: ROOM_NUMBER,   hi: false },
                  { icon: Clock,         label: "Check-in",   value: CHECK_IN,      hi: false },
                  { icon: CalendarClock, label: "Check-out",  value: CHECK_OUT,     hi: false },
                  { icon: DollarSign,    label: "Balance",    value: ROOM_CHARGE,   hi: true  },
                ].map(({ icon: Icon, label, value, hi }) => (
                  <div key={label}
                    className={`rounded-xl px-3 py-2.5 border ${hi
                      ? "bg-amber-400/10 border-amber-400/25"
                      : "bg-white/5 border-white/8"
                    }`}>
                    <div className="flex items-center gap-1 mb-1">
                      <Icon size={10} className={hi ? "text-amber-400" : "text-white/35"} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/35">{label}</span>
                    </div>
                    <p className={`text-[11px] font-black leading-tight ${hi ? "text-amber-400" : "text-white"}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stay progress bar */}
            <div className="relative z-10 mt-5 pt-5 border-t border-white/8">
              <div className="flex justify-between text-[10px] font-semibold text-white/30 mb-1.5">
                <span>{STAY_DATES}</span>
                <span>{NIGHTS_DONE} of {NIGHTS_TOTAL} nights · {NIGHTS_LEFT} remaining</span>
              </div>
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700"
                  style={{ width: `${(NIGHTS_DONE / NIGHTS_TOTAL) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────
              MAIN GRID  (left 2/3 + right 1/3)
          ──────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── LEFT COLUMN (spans 2 cols) ─────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* ── Quick Actions grid ─────────────────────────────────── */}
              <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-6">
                <h2 className="text-[13px] font-black text-[#aaa] uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      icon: Utensils, label: "Order Food", sub: "Browse menu",
                      href: "/guest/order/menu",
                      color: "bg-amber-50 border-amber-100", iconColor: "text-amber-600",
                    },
                    {
                      icon: MessageSquare, label: "Staff Chat", sub: "We reply fast",
                      href: "/guest/my-room/message-staff",
                      color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600",
                    },
                    {
                      icon: ClipboardList, label: "Order Status", sub: "Track order",
                      href: "/guest/my-room/order-details",
                      color: "bg-green-50 border-green-100", iconColor: "text-green-600",
                    },
                    {
                      icon: Pencil, label: "Write Review", sub: "Share thoughts",
                      href: "/guest/my-room/submit-review",
                      color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600",
                    },
                  ].map(({ icon: Icon, label, sub, href, color, iconColor }) => (
                    <Link key={label} href={href}
                      className={`flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl border ${color} hover:shadow-md transition-all no-underline group`}>
                      <div className={`w-11 h-11 rounded-xl ${color} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className={iconColor} />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-[#1a1a1a]">{label}</p>
                        <p className="text-[11px] text-[#aaa] mt-0.5">{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Scan QR (mobile only) */}
                <button onClick={startCamera}
                  className="mt-4 w-full flex items-center justify-between px-5 py-3.5 bg-[#f4f4f2] hover:bg-[#ebebeb] border border-[#e0e0e0] rounded-xl transition-colors cursor-pointer">
                  <span className="flex items-center gap-2.5 text-[13px] font-bold text-[#1a1a1a]">
                    <Camera size={16} className="text-[#888]" /> Scan Room QR Code
                  </span>
                  <ChevronRight size={15} className="text-[#aaa]" />
                </button>
              </div>

              {/* ── Live order tracker ─────────────────────────────────── */}
              <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-black text-[#1a1a1a]">Active Order</h2>
                    <p className="text-[12px] text-[#888] mt-0.5">Order #4029 · Club Sandwich, Mojito, Caesar Salad</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-black text-amber-700">ETA 12 min</span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="flex items-start gap-0 mb-5">
                  {[
                    { label: "Received",   pct: 100 },
                    { label: "Preparing",  pct: 60  },
                    { label: "Ready",      pct: 0   },
                    { label: "Delivered",  pct: 0   },
                  ].map(({ label, pct }, i, arr) => (
                    <div key={label} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-center">
                        {i > 0 && <div className={`flex-1 h-0.5 ${pct > 0 || arr[i-1].pct === 100 ? "bg-amber-400" : "bg-[#e8e8e8]"}`} />}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          pct === 100 ? "bg-amber-400 border-amber-400"
                          : pct > 0   ? "bg-amber-400 border-amber-400 animate-pulse"
                          :             "bg-white border-[#ddd]"
                        }`}>
                          {pct === 100 && <CheckCircle2 size={11} className="text-[#1a1a1a]" />}
                          {pct > 0 && pct < 100 && <CircleDot size={11} className="text-[#1a1a1a]" />}
                        </div>
                        {i < arr.length - 1 && <div className={`flex-1 h-0.5 ${pct === 100 ? "bg-amber-400" : "bg-[#e8e8e8]"}`} />}
                      </div>
                      <p className="text-[9px] font-bold text-[#888] mt-1.5 text-center">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Assigned chef */}
                <div className="flex items-center gap-3 p-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb] mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <ChefHat size={17} className="text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-black text-[#1a1a1a]">Chef Marcus is preparing your order</p>
                    <p className="text-[11px] text-[#aaa]">Kitchen — preparing now</p>
                  </div>
                </div>

                <Link href="/guest/my-room/order-details"
                  className="w-full py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 no-underline transition-colors">
                  <PackageCheck size={15} /> View Full Order Details
                </Link>
              </div>

              {/* ── Staff quick-request row ────────────────────────────── */}
              <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-black text-[#1a1a1a]">Request from Staff</h2>
                    <p className="text-[12px] text-[#888] mt-0.5">Available 24 hours · Usually replies instantly</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-green-600">Staff Online</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { icon: Utensils,   label: "Room Service", q: "I'd like to order room service." },
                    { icon: Sparkles,   label: "Housekeeping", q: "Could you arrange room cleaning?" },
                    { icon: AlertCircle,label: "Report Issue",  q: "I need to report an issue in my room." },
                    { icon: Bell,        label: "Assistance",   q: "I need general assistance please." },
                  ].map(({ icon: Icon, label, q }) => (
                    <Link key={label}
                      href={`/guest/my-room/message-staff?q=${encodeURIComponent(q)}`}
                      className="flex flex-col items-center gap-2 p-3.5 border border-[#ebebeb] rounded-xl hover:border-[#1a1a1a]/20 hover:bg-[#f8f7f5] transition-all no-underline text-center group">
                      <div className="w-9 h-9 rounded-xl bg-[#f4f4f2] group-hover:bg-[#1a1a1a] flex items-center justify-center transition-colors">
                        <Icon size={17} className="text-[#555] group-hover:text-amber-400 transition-colors" />
                      </div>
                      <span className="text-[11px] font-bold text-[#444]">{label}</span>
                    </Link>
                  ))}
                </div>
                <Link href="/guest/my-room/message-staff"
                  className="mt-4 w-full py-3 border border-[#ebebeb] hover:border-[#1a1a1a] text-[13px] font-bold text-[#444] hover:text-[#1a1a1a] rounded-xl flex items-center justify-center gap-2 no-underline transition-all">
                  <MessageSquare size={14} /> Open Staff Chat <ArrowRight size={13} className="ml-auto" />
                </Link>
              </div>
            </div>

            {/* ── RIGHT COLUMN ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Room info card */}
              <div className="bg-[#1a1a1a] rounded-[20px] p-5 text-white">
                <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-4">Room Details</p>
                <div className="space-y-3">
                  {[
                    { icon: BedDouble,  label: "Room",        value: ROOM_NUMBER },
                    { icon: Clock,      label: "Check-in",    value: `${CHECK_IN}, 2:00 PM` },
                    { icon: CalendarClock, label: "Check-out", value: `${CHECK_OUT}, 11:00 AM` },
                    { icon: TrendingUp, label: "Stay",        value: `${NIGHTS_TOTAL} nights` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-white/50" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-wide">{label}</p>
                        <p className="text-[13px] font-bold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wi-Fi card */}
              <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Wifi size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[#1a1a1a]">Wi-Fi Access</p>
                    <p className="text-[11px] text-[#888]">Complimentary for suite guests</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2.5 px-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                    <span className="text-[11px] font-semibold text-[#888]">Network</span>
                    <span className="text-[12px] font-black text-[#1a1a1a]">LuxeHorizon_VIP</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 px-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                    <span className="text-[11px] font-semibold text-[#888]">Password</span>
                    <span className="text-[12px] font-black text-[#1a1a1a] tracking-wide">{WIFI_PASS}</span>
                  </div>
                </div>
              </div>

              {/* Contact front desk */}
              <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-5">
                <p className="text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-3">Front Desk</p>
                <p className="text-[13px] text-[#666] leading-relaxed mb-4">
                  Need anything? Call us any time of day or night — we{"'"}re always here.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl text-[12px] font-bold transition-colors cursor-pointer">
                    <Phone size={14} /> Call Ext. 0
                  </button>
                  <Link href="/guest/my-room/message-staff"
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#ebebeb] hover:border-[#1a1a1a] text-[12px] font-bold text-[#444] hover:text-[#1a1a1a] rounded-xl transition-all no-underline">
                    <MessageSquare size={14} /> Message
                  </Link>
                </div>
              </div>

              {/* Review prompt */}
              <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp size={16} className="text-purple-500" />
                  <p className="text-[14px] font-black text-[#1a1a1a]">Enjoying your stay?</p>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={22}
                      className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-[#ddd]"} />
                  ))}
                </div>
                <p className="text-[12px] text-[#888] leading-relaxed mb-4">
                  We{"'"}d love to hear about your experience. Your feedback helps us improve for every guest.
                </p>
                <Link href="/guest/my-room/submit-review"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 no-underline transition-colors">
                  <Pencil size={14} /> Write a Review
                </Link>
              </div>

            </div>
          </div>{/* /MAIN GRID */}

        </div>
      </div>

      {/* ── QR Camera modal ────────────────────────────────────────────────── */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 bg-black/60">
            <button onClick={closeCamera} className="flex items-center gap-2 text-white/60 hover:text-white text-[14px] cursor-pointer transition-colors">
              <X size={18} /> Close
            </button>
            <span className="text-white font-bold text-[14px]">Scan Menu QR Code</span>
            <div className="w-16" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            {cameraPhase === "requesting" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <p className="text-white/60 text-[14px]">Requesting camera access…</p>
              </div>
            )}
            {cameraPhase === "scanning" && (
              <div className="w-full max-w-[340px] flex flex-col items-center gap-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 pointer-events-none">
                    {[
                      "top-6 left-6 rounded-tl-lg border-r-0 border-b-0",
                      "top-6 right-6 rounded-tr-lg border-l-0 border-b-0",
                      "bottom-6 left-6 rounded-bl-lg border-r-0 border-t-0",
                      "bottom-6 right-6 rounded-br-lg border-l-0 border-t-0",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-10 h-10 border-[3px] border-amber-400 ${cls}`} />
                    ))}
                  </div>
                </div>
                <p className="text-white/50 text-[13px]">Point at the QR code in your room</p>
                <button onClick={closeCamera} className="text-white/40 hover:text-white/70 text-[13px] cursor-pointer flex items-center gap-1.5">
                  <RefreshCw size={13} /> Cancel
                </button>
              </div>
            )}
            {cameraPhase === "detected" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <p className="text-white font-bold text-[18px]">QR Code Detected!</p>
                <p className="text-white/50 text-[13px]">Redirecting to menu…</p>
              </div>
            )}
            {cameraPhase === "error" && (
              <div className="w-full max-w-[320px] flex flex-col items-center gap-5 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-[16px] mb-1">Camera Unavailable</p>
                  <p className="text-white/40 text-[13px] leading-relaxed">{cameraError}</p>
                </div>
                <button onClick={() => { setCameraPhase("idle"); startCamera() }}
                  className="border border-white/20 hover:border-white/40 text-white/60 hover:text-white text-[13px] font-semibold py-2.5 px-5 rounded-xl transition-colors cursor-pointer flex items-center gap-2">
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
