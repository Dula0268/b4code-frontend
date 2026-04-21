"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Send, Paperclip, Clock, CheckCircle2, ChevronLeft,
  Smile, Phone, Video, Star, MapPin, Users, Wifi, Coffee,
  CalendarDays, BadgeCheck, Lightbulb, ArrowUpRight,
  ParkingCircle, Building2, CalendarCheck,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  sender: "host" | "guest"
  text: string
  time: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo data — replace with real API / WebSocket when backend is live
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    sender: "host",
    text: "Hello! 👋 Thank you for booking at Sunset Peak Resort. My name is Sarah, and I'll be your host. How can I help you?",
    time: "10:00 AM",
  },
  {
    id: "m2",
    sender: "guest",
    text: "Hi Sarah! I'm wondering if there's any flexibility with the check-in time?",
    time: "10:02 AM",
  },
  {
    id: "m3",
    sender: "host",
    text: "Of course! We can accommodate early check-in from 11 AM onwards, subject to availability. Just let us know your arrival time and we'll prepare everything for you. 🏨",
    time: "10:04 AM",
  },
]

// Pool of auto-replies — simulates host response; swap for real WebSocket event
const AUTO_REPLIES = [
  "Of course! We can accommodate that. Please let us know your preferred time.",
  "Great question! I'll check availability and get back to you shortly.",
  "Absolutely, we're happy to help with that. Our team will make it happen.",
  "Thank you for asking. Yes, that's definitely possible — we'll arrange it for you.",
  "Sure! I'll personally ensure everything is ready before your arrival. 😊",
  "No problem at all! Feel free to ask if you have any other questions.",
]

const BOOKING_INFO = {
  propertyName:      "Sunset Peak Resort",
  imageSrc:          "/images/booking/sunset-peak-resort.png",
  reservationPeriod: "Oct 12 – Oct 15, 2024",
  bookingId:         "#BK-8829",
  nights:            3,
  guests:            2,
  rating:            4.9,
  reviewCount:       127,
  location:          "Colombo, Sri Lanka",
  hostName:          "Sarah",
  hostSince:         "2019",
  responseRate:      "99%",
}

const QUICK_CHIPS = [
  { label: "Ask about check-in time", icon: Clock },
  { label: "Request early check-in",  icon: CalendarCheck },
  { label: "Ask about parking",       icon: ParkingCircle },
  { label: "Ask about facilities",    icon: Building2 },
  { label: "Ask about Wi-Fi",         icon: Wifi },
  { label: "Request late check-out",  icon: CalendarCheck },
]

const PROPERTY_FEATURES = [
  { icon: Wifi,    label: "Free Wi-Fi"  },
  { icon: Coffee,  label: "Breakfast"   },
  { icon: MapPin,  label: "City Centre" },
  { icon: Users,   label: "Up to 4"    },
]

const PRE_ARRIVAL_TIPS = [
  "Mention your flight number or ETA for seamless check-in",
  "Ask about local transit and nearby attractions",
  "Confirm parking arrangements before arrival",
]

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function MessageHostPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input,    setInput]    = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Scroll to the latest message whenever the list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    setMessages(prev => [...prev, {
      id:     Date.now().toString(),
      sender: "guest",
      text:   text.trim(),
      time:   getTime(),
    }])
    setInput("")
    setIsTyping(true)

    // Simulated host typing delay — replace with real WebSocket reply event
    const delay = 1500 + Math.random() * 700
    setTimeout(() => {
      setIsTyping(false)
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setMessages(prev => [...prev, {
        id:     Date.now().toString() + "-host",
        sender: "host",
        text:   reply,
        time:   getTime(),
      }])
    }, delay)
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[1100px] mx-auto px-4 lg:px-6 pt-6">

        <Link href="/guest/booking/my-bookings"
          className="inline-flex items-center gap-2 text-sm font-bold mb-6 no-underline transition-colors"
          style={{ color: "var(--gray-3)" }}>
          <ChevronLeft size={16} /> Back to Bookings
        </Link>

        <div className="mb-6">
          <h1 className="text-[1.75rem] font-black leading-tight" style={{ color: "var(--fg)", fontSize: "1.75rem" }}>
            Message Host
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--gray-3)" }}>
            Chat directly with your property host about your booking or any pre-arrival requests.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-260px)] lg:min-h-[640px]">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">

            {/* Host profile card */}
            <div className="ps-card overflow-hidden">
              <div className="relative h-32">
                <Image src={BOOKING_INFO.imageSrc} alt={BOOKING_INFO.propertyName} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.65))" }} />
                {/* Rating pill */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  <span className="text-[0.6875rem] font-black" style={{ color: "var(--fg)" }}>{BOOKING_INFO.rating}</span>
                  <span className="text-[0.625rem]" style={{ color: "var(--gray-3)" }}>({BOOKING_INFO.reviewCount})</span>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[0.6875rem] font-bold text-white">Online now</span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--brand-primary), #d4520a)" }}>
                    <span className="text-white font-black text-lg">
                      {BOOKING_INFO.hostName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>{BOOKING_INFO.hostName}</p>
                    <p className="text-[0.6875rem]" style={{ color: "var(--gray-3)" }}>Host since {BOOKING_INFO.hostSince} · Superhost</p>
                  </div>
                </div>

                {/* Response rate stat */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: "Response rate", value: BOOKING_INFO.responseRate },
                    { label: "Response time",  value: "~1 hr"                  },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-2.5 border text-center"
                      style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)" }}>
                      <p className="text-sm font-black" style={{ color: "var(--fg)" }}>{value}</p>
                      <p className="text-[0.625rem] font-semibold" style={{ color: "var(--gray-3)" }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {[{ icon: Phone, label: "Call" }, { icon: Video, label: "Video" }].map(({ icon: Icon, label }) => (
                    <button key={label}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors"
                      style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)", color: "var(--gray-2)" }}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking details card */}
            <div className="ps-card p-4">
              <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-3" style={{ color: "var(--gray-4)" }}>
                Booking Details
              </p>
              <p className="text-sm font-black mb-1" style={{ color: "var(--fg)" }}>{BOOKING_INFO.propertyName}</p>
              <div className="flex items-center gap-1 mb-4">
                <MapPin size={12} style={{ color: "var(--gray-4)" }} />
                <span className="text-xs" style={{ color: "var(--gray-3)" }}>{BOOKING_INFO.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {PROPERTY_FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 py-2 px-2.5 rounded-xl border"
                    style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)" }}>
                    <Icon size={13} style={{ color: "var(--brand-secondary)" }} />
                    <span className="text-[0.6875rem] font-semibold" style={{ color: "var(--gray-2)" }}>{label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { icon: CalendarDays, label: "Dates",      value: BOOKING_INFO.reservationPeriod, accent: false },
                  { icon: BadgeCheck,   label: "Booking ID", value: BOOKING_INFO.bookingId,          accent: true  },
                  { icon: Users,        label: "Stay",        value: `${BOOKING_INFO.nights} nights · ${BOOKING_INFO.guests} guests`, accent: false },
                ].map(({ icon: Icon, label, value, accent }) => (
                  <div key={label} className="flex items-center gap-2.5 py-2 px-3 rounded-xl border"
                    style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)" }}>
                    <Icon size={14} style={{ color: accent ? "var(--state-success)" : "var(--brand-secondary)" }} />
                    <div>
                      <p className="text-[0.5625rem] font-bold uppercase tracking-wide" style={{ color: "var(--gray-4)" }}>{label}</p>
                      <p className="text-xs font-bold" style={{ color: "var(--fg)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/guest/booking/confirmation"
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-xs font-bold transition-all no-underline"
                style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>
                View Booking Receipt <ArrowUpRight size={12} />
              </Link>
            </div>

            {/* Tips — dark card so it stands out from the white cards above */}
            <div className="rounded-[1.25rem] p-4 text-white" style={{ background: "var(--black-2)" }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Lightbulb size={14} style={{ color: "var(--brand-secondary)" }} />
                <p className="text-[0.8125rem] font-black">Tips for a smooth stay</p>
              </div>
              <div className="space-y-2">
                {PRE_ARRIVAL_TIPS.map(tip => (
                  <div key={tip} className="flex items-start gap-2 text-xs text-white/60">
                    <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" style={{ color: "var(--brand-secondary)" }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Chat panel ──────────────────────────────────────────── */}
          <div className="flex-1 ps-card flex flex-col overflow-hidden min-h-0">

            {/* Chat header */}
            <div className="px-5 sm:px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--brand-primary), #d4520a)" }}>
                    <span className="text-white font-black text-base">{BOOKING_INFO.hostName[0]}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div>
                  <p className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>
                    {BOOKING_INFO.hostName} · Property Host
                  </p>
                  <p className="text-[0.6875rem] font-semibold flex items-center gap-1.5 text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Online · usually replies within an hour
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: "var(--gray-4)" }}>
                {messages.length} messages
              </span>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 flex flex-col gap-4 min-h-0"
              style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--gray-5) 60%, white) 0%, white 60%)" }}>

              {/* Date divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-[0.5625rem] font-bold uppercase tracking-wider px-2" style={{ color: "var(--gray-4)" }}>
                  Today
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              {messages.map(msg => (
                <div key={msg.id}
                  className={`flex items-end gap-2.5 ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>
                  {/* Host avatar — only shown for host messages to reduce visual noise */}
                  {msg.sender === "host" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm"
                      style={{ background: "linear-gradient(135deg, var(--brand-primary), #d4520a)" }}>
                      <span className="text-white font-black text-xs">{BOOKING_INFO.hostName[0]}</span>
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 max-w-[70%] ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "guest"
                        ? "rounded-br-md text-white"
                        : "rounded-bl-md border"
                    }`} style={{
                      background:  msg.sender === "guest" ? "var(--brand-primary)" : "white",
                      borderColor: msg.sender === "host" ? "var(--border)" : undefined,
                      color:       msg.sender === "host" ? "var(--fg)" : undefined,
                    }}>
                      {msg.text}
                    </div>

                    <div className={`flex items-center gap-1.5 text-[0.625rem] font-medium ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}
                      style={{ color: "var(--gray-4)" }}>
                      <Clock size={9} /> {msg.time}
                      {/* Double-check only on outgoing messages to confirm delivery */}
                      {msg.sender === "guest" && <CheckCircle2 size={11} style={{ color: "var(--state-success)" }} />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--brand-primary), #d4520a)" }}>
                    <span className="text-white font-black text-xs">{BOOKING_INFO.hostName[0]}</span>
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md border shadow-sm" style={{ background: "white", borderColor: "var(--border)" }}>
                    <div className="flex gap-1 items-center h-4">
                      {[0, 120, 240].map(d => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick chip suggestions */}
            <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-t flex-shrink-0 scrollbar-hide"
              style={{ borderColor: "var(--border)" }}>
              {QUICK_CHIPS.map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => sendMessage(label)}
                  className="inline-flex items-center gap-1.5 text-xs border rounded-full px-3 py-1.5 whitespace-nowrap flex-shrink-0 bg-white transition-colors cursor-pointer font-medium"
                  style={{ borderColor: "var(--border)", color: "var(--gray-2)" }}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="px-4 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 rounded-2xl border px-2 py-1 transition-colors focus-within:border-[var(--fg)]"
                style={{ background: "color-mix(in srgb, var(--gray-5) 50%, white)", borderColor: "var(--border)" }}>
                <button className="p-2 rounded-xl cursor-pointer transition-colors" style={{ color: "var(--gray-4)" }}>
                  <Smile size={18} />
                </button>
                <input
                  ref={inputRef}
                  id="host-message-input"
                  type="text"
                  placeholder="Message your host…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                  className="flex-1 bg-transparent text-sm placeholder:text-[var(--gray-4)] outline-none py-2"
                  style={{ color: "var(--fg)" }}
                />
                <button className="p-2 rounded-xl cursor-pointer transition-colors" style={{ color: "var(--gray-4)" }}>
                  <Paperclip size={16} />
                </button>
                <button
                  id="send-message-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                  style={{ background: "var(--brand-primary)" }}>
                  <Send size={15} className="text-white" />
                </button>
              </div>
              <p className="text-[0.625rem] text-center mt-2 font-medium" style={{ color: "var(--gray-4)" }}>
                The property host will reply as soon as possible.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
