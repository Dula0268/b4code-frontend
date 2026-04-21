"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import {
  Utensils, Sparkles, AlertCircle, HelpCircle,
  Send, Paperclip, Clock, CheckCircle2,
  Smile, Phone, Video, Info, User, DoorOpen
} from "lucide-react"



interface Message {
  id: number
  sender: "staff" | "guest"
  text: string
  time: string
}

const QUICK_REQUESTS = [
  { icon: Utensils, label: "Room service", msg: "I'd like to order room service please." },
  { icon: Sparkles, label: "Room cleaning", msg: "Could you arrange room cleaning?" },
  { icon: AlertCircle, label: "Report issue", msg: "I'd like to report an issue in my room." },
  { icon: HelpCircle, label: "Assistance", msg: "I need general assistance please." },
]

const STAFF_REPLIES = [
  "Of course! We'll attend to that right away.",
  "Thank you for letting us know. Our team is on it!",
  "We've received your request and will be with you shortly.",
  "No problem at all — we'll send someone to your suite immediately.",
  "Noted! Is there anything else we can assist you with?",
]

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

function MessageStaffInner() {
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const guestFirst = user?.profile?.firstName || "Guest"
  const initialQ = searchParams.get("q") || ""

  const [input, setInput] = useState(initialQ)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "staff", text: `Welcome ${guestFirst}! I'm Amal from the front desk. How can I help you today?`, time: "12:00 PM" },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (initialQ) setTimeout(() => handleSend(initialQ), 400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return
    setMessages(prev => [...prev, { id: Date.now(), sender: "guest", text: msg, time: getTime() }])
    setInput("")
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const reply = STAFF_REPLIES[Math.floor(Math.random() * STAFF_REPLIES.length)]
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "staff", text: reply, time: getTime() }])
    }, 1400 + Math.random() * 600)
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] pt-20 pb-10 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 lg:px-6 pt-6">

        <div className="mb-5">
          <h1 className="text-[24px] font-black text-[#1a1a1a] leading-tight mb-1">Contact Hotel Staff</h1>
          <p className="text-[13px] text-[#888]">Message our team for room service, cleaning, maintenance or any assistance — available 24/7.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-280px)] min-h-[600px]">

          {/* ── SIDEBAR ───────────────────────────────────────────────── */}
          <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">

            {/* Stay card */}
            <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm overflow-hidden">
              <div className="relative h-[120px]">
                <Image src="/images/room/resort-exterior.png" alt="Luxe Horizon Resort" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white">Staff Online</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-black text-[#1a1a1a] mb-0.5">Luxe Horizon Resort</h3>
                <div className="flex items-center gap-1.5 text-[12px] text-[#888] mb-4">
                  <DoorOpen size={13} className="text-[#bbb]" /> Suite 402
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#f8f7f5] hover:bg-[#f0f0f0] border border-[#ebebeb] rounded-xl text-[12px] font-bold text-[#444] transition-colors cursor-pointer">
                    <Phone size={13} /> Call
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#f8f7f5] hover:bg-[#f0f0f0] border border-[#ebebeb] rounded-xl text-[12px] font-bold text-[#444] transition-colors cursor-pointer">
                    <Video size={13} /> Video
                  </button>
                  <button className="flex items-center justify-center py-2 px-3 bg-[#f8f7f5] hover:bg-[#f0f0f0] border border-[#ebebeb] rounded-xl transition-colors cursor-pointer">
                    <Info size={13} className="text-[#aaa]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Requests */}
            <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-4">
              <p className="text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-3">Quick Requests</p>
              <div className="flex flex-col gap-2">
                {QUICK_REQUESTS.map(({ icon: Icon, label, msg }) => (
                  <button key={label} onClick={() => handleSend(msg)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-[#ebebeb] hover:border-[var(--brand-secondary)]/50 hover:bg-[var(--brand-secondary)]/5 transition-all cursor-pointer text-left">
                    <Icon size={15} className="text-[var(--brand-secondary)] flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stay summary */}
            <div className="bg-[#1a1a1a] rounded-[20px] p-4 text-white hidden lg:block">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Your Stay</p>
              <div className="space-y-2">
                {[["Check-in", "Oct 12, 2024"], ["Check-out", "Oct 16, 2024"], ["Balance", "LKR 5,400"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[12px]">
                    <span className="text-white/50">{k}</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CHAT ────────────────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-[20px] border border-[#ebebeb] shadow-sm flex flex-col overflow-hidden min-h-0">

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#ebebeb] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center relative">
                  <User size={18} className="text-[var(--brand-secondary)]" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-[#1a1a1a]">Amal — Front Desk</p>
                  <p className="text-[11px] text-green-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online · replies instantly
                  </p>
                </div>
              </div>
              <span className="text-[12px] text-[#aaa] font-medium">{messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 min-h-0"
              style={{ background: "linear-gradient(to bottom, #f8f7f5, #ffffff)" }}>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#ebebeb]" />
                <span className="text-[10px] font-bold text-[#bbb] uppercase tracking-wider px-2">Today</span>
                <div className="flex-1 h-px bg-[#ebebeb]" />
              </div>

              {messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-2.5 ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>
                  {msg.sender === "staff" && (
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 mb-1">
                      <User size={15} className="text-[var(--brand-secondary)]" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[72%] ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.sender === "guest"
                      ? "bg-[#1a1a1a] text-white rounded-br-md"
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

              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <User size={15} className="text-[var(--brand-secondary)]" />
                  </div>
                  <div className="bg-white border border-[#ebebeb] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 120, 240].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#bbb] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-[#ebebeb] bg-white flex-shrink-0">
              <div className="flex items-center gap-2 bg-[#f8f7f5] rounded-2xl border border-[#ebebeb] focus-within:border-[#1a1a1a] transition-colors px-2 py-1">
                <button className="p-2 rounded-xl text-[#bbb] hover:text-[#666] transition-colors cursor-pointer"><Smile size={18} /></button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type your message to the staff…"
                  className="flex-1 bg-transparent text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none py-2"
                />
                <button className="p-2 rounded-xl text-[#bbb] hover:text-[#666] transition-colors cursor-pointer"><Paperclip size={16} /></button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#1a1a1a] hover:bg-[#2a2a2a] disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer">
                  <Send size={15} className="text-white" />
                </button>
              </div>
              <p className="text-[10px] text-[#bbb] text-center mt-2 font-medium">Our staff will assist you directly to your suite terminal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessageStaffPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5]">
        <div className="w-10 h-10 border-4 border-[var(--brand-secondary)]/30 border-t-[var(--brand-secondary)] rounded-full animate-spin" />
      </div>
    }>
      <MessageStaffInner />
    </Suspense>
  )
}
