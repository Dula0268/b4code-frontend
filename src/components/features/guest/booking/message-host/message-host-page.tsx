"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Send, Paperclip, Clock, CalendarCheck, ParkingCircle, Building2,
  CalendarDays, BadgeCheck, Lightbulb, CheckCircle2, ChevronLeft,
  Smile, Phone, Video, Star, MapPin, Users, Wifi, Coffee,
  ArrowUpRight
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  sender: "host" | "guest"
  text: string
  time: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
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

const QUICK_CHIPS = [
  { label: "Ask about check-in time", icon: Clock },
  { label: "Request early check-in", icon: CalendarCheck },
  { label: "Ask about parking", icon: ParkingCircle },
  { label: "Ask about facilities", icon: Building2 },
  { label: "Ask about Wi-Fi", icon: Wifi },
  { label: "Request late check-out", icon: CalendarCheck },
]

const HOST_REPLIES = [
  "Of course! We can accommodate that. Please let us know your preferred time.",
  "Great question! I'll check availability and get back to you shortly.",
  "Absolutely, we're happy to help with that. Our team will make it happen.",
  "Thank you for asking. Yes, that's definitely possible — we'll arrange it for you.",
  "Sure! I'll personally ensure everything is ready before your arrival. 😊",
  "No problem at all! Feel free to ask if you have any other questions.",
]

const BOOKING = {
  propertyName: "Sunset Peak Resort",
  imageSrc: "/images/booking/sunset-peak-resort.png",
  reservationPeriod: "Oct 12 – Oct 15, 2024",
  bookingId: "#BK-8829",
  nights: 3,
  guests: 2,
  rating: 4.9,
  reviews: 127,
  location: "Colombo, Sri Lanka",
  hostName: "Sarah",
  hostSince: "2019",
  responseRate: "99%",
  responseTime: "within an hour",
}

const PROPERTY_FEATURES = [
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Coffee, label: "Breakfast" },
  { icon: MapPin, label: "City Centre" },
  { icon: Users, label: "Up to 4 guests" },
]

const TIPS = [
  "Mention your flight number or ETA for seamless check-in",
  "Ask about local transit and nearby attractions",
  "Confirm parking arrangements before arrival",
]

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MessageHostPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "guest", text: text.trim(), time: getTime() }])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const reply = HOST_REPLIES[Math.floor(Math.random() * HOST_REPLIES.length)]
      setMessages(prev => [...prev, { id: Date.now().toString() + "h", sender: "host", text: reply, time: getTime() }])
    }, 1500 + Math.random() * 700)
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-20 pb-10 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 lg:px-6 pt-6">

        {/* ── Back ─────────────────────────────────────────────────────── */}
        <Link href="/guest/booking/my-bookings"
          className="inline-flex items-center gap-2 text-[#888] hover:text-[#1a1a1a] text-[13px] font-bold mb-6 no-underline transition-colors">
          <ChevronLeft size={16} /> Back to Bookings
        </Link>

        {/* ── Page title ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-[28px] font-black text-[#1a1a1a] leading-tight mb-1">Message Host</h1>
          <p className="text-[14px] text-[#888]">Chat directly with your property host about your booking or any pre-arrival requests.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-260px)] min-h-[640px]">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto lg:max-h-full">

            {/* Host profile card */}
            <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm overflow-hidden">
              <div className="relative h-[130px]">
                <Image src={BOOKING.imageSrc} alt={BOOKING.propertyName} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/65" />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  <span className="text-[11px] font-black text-[#1a1a1a]">{BOOKING.rating}</span>
                  <span className="text-[10px] text-[#888]">({BOOKING.reviews})</span>
                </div>
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white">Online now</span>
                </div>
              </div>
              <div className="p-4">
                {/* Host avatar + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-black text-[17px]">S</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-[#1a1a1a]">Sarah</p>
                    <p className="text-[11px] text-[#888]">Host since {BOOKING.hostSince} · Superhost</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[#f8f7f5] rounded-xl p-2.5 border border-[#ebebeb] text-center">
                    <p className="text-[14px] font-black text-[#1a1a1a]">{BOOKING.responseRate}</p>
                    <p className="text-[10px] text-[#888] font-semibold">Response rate</p>
                  </div>
                  <div className="bg-[#f8f7f5] rounded-xl p-2.5 border border-[#ebebeb] text-center">
                    <p className="text-[12px] font-black text-[#1a1a1a] leading-tight">~1 hr</p>
                    <p className="text-[10px] text-[#888] font-semibold">Response time</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#f8f7f5] hover:bg-[#f0f0f0] border border-[#ebebeb] rounded-xl text-[12px] font-bold text-[#444] transition-colors cursor-pointer">
                    <Phone size={13} /> Call
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#f8f7f5] hover:bg-[#f0f0f0] border border-[#ebebeb] rounded-xl text-[12px] font-bold text-[#444] transition-colors cursor-pointer">
                    <Video size={13} /> Video
                  </button>
                </div>
              </div>
            </div>

            {/* Booking details */}
            <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-4">
              <p className="text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-3">Booking Details</p>
              <p className="text-[14px] font-black text-[#1a1a1a] mb-1">{BOOKING.propertyName}</p>
              <div className="flex items-center gap-1 mb-4">
                <MapPin size={12} className="text-[#bbb]" />
                <span className="text-[12px] text-[#888]">{BOOKING.location}</span>
              </div>

              {/* Property features */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PROPERTY_FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 py-2 px-2.5 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                    <Icon size={13} className="text-[var(--brand-secondary)] flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-[#555]">{label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 py-2 px-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                  <CalendarDays size={14} className="text-[var(--brand-secondary)] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wide">Dates</p>
                    <p className="text-[12px] font-bold text-[#1a1a1a]">{BOOKING.reservationPeriod}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 py-2 px-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                  <BadgeCheck size={14} className="text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wide">Booking ID</p>
                    <p className="text-[12px] font-bold text-[#1a1a1a]">{BOOKING.bookingId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 py-2 px-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                  <Users size={14} className="text-[#888] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-wide">Stay</p>
                    <p className="text-[12px] font-bold text-[#1a1a1a]">{BOOKING.nights} nights · {BOOKING.guests} guests</p>
                  </div>
                </div>
              </div>

              <Link href="/guest/booking/confirmation"
                className="mt-4 w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#444] border border-[#ebebeb] hover:border-[#ccc] hover:bg-[#f8f7f5] rounded-xl py-2.5 transition-colors no-underline">
                View Booking Receipt <ArrowUpRight size={12} />
              </Link>
            </div>

            {/* Tips */}
            <div className="bg-[#1a1a1a] rounded-[20px] p-4 text-white">
              <div className="flex items-center gap-2 mb-2.5">
                <Lightbulb size={14} className="text-[var(--brand-secondary)]" />
                <p className="text-[13px] font-black">Tips for a smooth stay</p>
              </div>
              <div className="space-y-2">
                {TIPS.map(tip => (
                  <div key={tip} className="flex items-start gap-2 text-[12px] text-white/60">
                    <CheckCircle2 size={12} className="text-[var(--brand-secondary)] flex-shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CHAT AREA ──────────────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-[20px] border border-[#ebebeb] shadow-sm flex flex-col overflow-hidden min-h-0">

            {/* Chat header */}
            <div className="px-6 py-4 border-b border-[#ebebeb] flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-orange-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-black text-[16px]">S</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-[#1a1a1a]">Sarah · Property Host</p>
                  <p className="text-[11px] text-green-500 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    Online · usually replies within an hour
                  </p>
                </div>
              </div>
              <span className="text-[12px] text-[#bbb] font-medium hidden sm:block">{messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 min-h-0"
              style={{ background: "linear-gradient(to bottom, #f8f7f5 0%, #ffffff 60%)" }}>

              {/* Date divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#ebebeb]" />
                <span className="text-[10px] font-bold text-[#bbb] uppercase tracking-wider px-2">Today</span>
                <div className="flex-1 h-px bg-[#ebebeb]" />
              </div>

              {messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2.5 ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  {msg.sender === "host" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-orange-600 flex items-center justify-center flex-shrink-0 mb-1 shadow-sm">
                      <span className="text-white font-black text-[12px]">S</span>
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 max-w-[70%] ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.sender === "guest"
                      ? "bg-[var(--brand-primary)] text-white rounded-br-md"
                      : "bg-white border border-[#ebebeb] text-[#1a1a1a] rounded-bl-md"
                      }`}>
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] text-[#bbb] font-medium ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>
                      <Clock size={9} /> {msg.time}
                      {msg.sender === "guest" && <CheckCircle2 size={11} className="text-green-500" />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-black text-[12px]">S</span>
                  </div>
                  <div className="bg-white border border-[#ebebeb] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 120, 240].map(d => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#ccc] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick chips */}
            <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-t border-[#f0f0f0] flex-shrink-0 scrollbar-hide">
              {QUICK_CHIPS.map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => sendMessage(label)}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[#555] border border-[#e0e0e0] rounded-full px-3 py-1.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 bg-white font-medium">
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="px-4 py-4 border-t border-[#ebebeb] bg-white flex-shrink-0">
              <div className="flex items-center gap-2 bg-[#f8f7f5] rounded-2xl border border-[#ebebeb] focus-within:border-[#1a1a1a] transition-colors px-2 py-1">
                <button className="p-2 rounded-xl text-[#bbb] hover:text-[#666] transition-colors cursor-pointer">
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
                  className="flex-1 bg-transparent text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none py-2"
                />
                <button className="p-2 rounded-xl text-[#bbb] hover:text-[#666] transition-colors cursor-pointer">
                  <Paperclip size={16} />
                </button>
                <button
                  id="send-message-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer">
                  <Send size={15} className="text-white" />
                </button>
              </div>
              <p className="text-[10px] text-[#bbb] text-center mt-2 font-medium">
                The property host will reply as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
