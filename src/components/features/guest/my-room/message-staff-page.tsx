"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth/auth.store"
import {
  Utensils, Sparkles, AlertCircle, HelpCircle,
  Send, Paperclip, Clock, CheckCircle2, Smile,
  Phone, Video, Info, User, DoorOpen, ChevronLeft,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  sender: "staff" | "guest"
  text: string
  time: string
  read: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo data — swap auto-replies for a WebSocket event handler in production
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: "s1",
    sender: "staff",
    text: "Hello! Welcome to Luxe Horizon Resort, Suite 402. I'm the duty manager. How can I assist you today? 😊",
    time: "9:00 AM",
    read: true,
  },
]

const AUTO_REPLIES = [
  "Of course! We'll take care of that right away. Anything else?",
  "Understood. I'll send someone to your suite in about 10 minutes.",
  "Happy to help! Our team will sort that out for you immediately.",
  "Great question — I'll check and get back to you shortly. 👍",
  "That's been noted. Is there anything else you need while we arrange that?",
]

// Quick-request shortcuts that pre-fill the input with a common request
const QUICK_REQUESTS = [
  { icon: Utensils,     label: "Room Service", message: "I'd like to order room service, please." },
  { icon: Sparkles,     label: "Housekeeping", message: "Could you arrange room cleaning?" },
  { icon: AlertCircle, label: "Report Issue",  message: "I need to report an issue in my room." },
  { icon: HelpCircle,  label: "Assistance",   message: "I need general assistance, please." },
]

const STAFF_SERVICES = [
  { icon: Utensils,     label: "In-Room Dining", desc: "24-hour room service"  },
  { icon: Sparkles,     label: "Housekeeping",   desc: "Cleaning & turndown"   },
  { icon: DoorOpen,     label: "Concierge",      desc: "Tours & reservations"  },
  { icon: Info,         label: "Guest Services", desc: "General assistance"    },
]

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — needs Suspense because it calls useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
function StaffChatInner() {
  const searchParams = useSearchParams()
  const user = useAuthStore(s => s.user)
  const guestName = user?.profile?.firstName ?? "Guest"

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input,    setInput]    = useState(searchParams.get("q") ?? "")
  const [isTyping, setIsTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to the bottom on every new message or typing change
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
      read:   false,
    }])
    setInput("")
    setIsTyping(true)

    // Simulated reply delay — replace with real WebSocket message handler
    setTimeout(() => {
      setIsTyping(false)
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      setMessages(prev => [...prev, {
        id:     Date.now().toString() + "-staff",
        sender: "staff",
        text:   reply,
        time:   getTime(),
        read:   true,
      }])
    }, 1400 + Math.random() * 600)
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[1100px] mx-auto px-4 lg:px-6 pt-6">

        <Link href="/guest/my-room"
          className="inline-flex items-center gap-2 text-sm font-bold mb-6 no-underline"
          style={{ color: "var(--gray-3)" }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        <div className="mb-5">
          <h1 className="text-[1.75rem] font-black leading-tight" style={{ color: "var(--fg)", fontSize: "1.75rem" }}>
            Contact Hotel Staff
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--gray-3)" }}>
            Message our team for room service, cleaning, maintenance or any assistance — available 24/7.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-280px)] lg:min-h-[600px]">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">

            {/* Staff info card */}
            <div className="ps-card p-5">
              <div className="flex items-center gap-3 mb-4">
                {/* Gradient avatar instead of a real photo — avoids image dependency */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, var(--black-2), var(--black-3))" }}>
                  <User size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Hotel Staff</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-[0.6875rem] font-semibold text-green-600">Online — Available 24/7</p>
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold p-3 rounded-xl mb-4 border"
                style={{ background: "color-mix(in srgb, var(--gray-5) 40%, white)", borderColor: "var(--border)", color: "var(--gray-2)" }}>
                Hi, <strong>{guestName}</strong>! We&apos;re here to serve you. What can we do for you today?
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

            {/* Quick request tiles */}
            <div className="ps-card p-4">
              <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-3" style={{ color: "var(--gray-4)" }}>
                Quick Requests
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_REQUESTS.map(({ icon: Icon, label, message }) => (
                  <button key={label} onClick={() => sendMessage(message)}
                    className="flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-colors cursor-pointer group"
                    style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--gray-5) 30%, white)" }}>
                    <Icon size={18} style={{ color: "var(--gray-2)" }} />
                    <span className="text-[0.625rem] font-bold text-center leading-tight" style={{ color: "var(--gray-2)" }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services grid — informational, not interactive */}
            <div className="ps-card p-4">
              <p className="text-[0.5625rem] font-black uppercase tracking-widest mb-3" style={{ color: "var(--gray-4)" }}>
                Available Services
              </p>
              <div className="space-y-2.5">
                {STAFF_SERVICES.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)", borderColor: "var(--border)" }}>
                      <Icon size={14} style={{ color: "var(--gray-2)" }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "var(--fg)" }}>{label}</p>
                      <p className="text-[0.625rem]" style={{ color: "var(--gray-3)" }}>{desc}</p>
                    </div>
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--black-2), var(--black-3))" }}>
                    <User size={18} className="text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div>
                  <p className="text-[0.9375rem] font-black" style={{ color: "var(--fg)" }}>Hotel Staff</p>
                  <p className="text-[0.6875rem] font-semibold text-green-500">Online · instantly</p>
                </div>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 flex flex-col gap-4 min-h-0"
              style={{ background: "color-mix(in srgb, var(--gray-5) 30%, white)" }}>

              {messages.map(msg => (
                <div key={msg.id}
                  className={`flex items-end gap-2.5 ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>

                  {msg.sender === "staff" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1"
                      style={{ background: "linear-gradient(135deg, var(--black-2), var(--black-3))" }}>
                      <User size={14} className="text-white" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 max-w-[70%] ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "guest" ? "rounded-br-md" : "rounded-bl-md border"
                    }`} style={{
                      background:  msg.sender === "guest" ? "var(--black-2)" : "white",
                      color:       msg.sender === "guest" ? "white" : "var(--fg)",
                      borderColor: msg.sender === "staff" ? "var(--border)" : undefined,
                    }}>
                      {msg.text}
                    </div>

                    <div className={`flex items-center gap-1.5 text-[0.625rem] font-medium ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}
                      style={{ color: "var(--gray-4)" }}>
                      <Clock size={9} /> {msg.time}
                      {msg.sender === "guest" && msg.read && (
                        <CheckCircle2 size={11} style={{ color: "var(--state-success)" }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--black-2), var(--black-3))" }}>
                    <User size={14} className="text-white" />
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

            {/* Input */}
            <div className="px-4 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 rounded-2xl border px-2 py-1 transition-colors focus-within:border-[var(--fg)]"
                style={{ background: "color-mix(in srgb, var(--gray-5) 50%, white)", borderColor: "var(--border)" }}>
                <button className="p-2 rounded-xl cursor-pointer" style={{ color: "var(--gray-4)" }}>
                  <Smile size={18} />
                </button>
                <input
                  id="staff-message-input"
                  type="text"
                  placeholder="Type your request…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                  className="flex-1 bg-transparent text-sm outline-none py-2"
                  style={{ color: "var(--fg)" }}
                />
                <button className="p-2 rounded-xl cursor-pointer" style={{ color: "var(--gray-4)" }}>
                  <Paperclip size={16} />
                </button>
                <button
                  id="send-staff-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                  style={{ background: "var(--black-2)" }}>
                  <Send size={15} className="text-white" />
                </button>
              </div>
              <p className="text-[0.625rem] text-center mt-2 font-medium" style={{ color: "var(--gray-4)" }}>
                Our staff will assist you directly to your suite terminal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Export — Suspense boundary required by useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
export default function MessageStaffPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
        <div className="w-10 h-10 border-4 border-t-[var(--brand-secondary)] border-white/20 rounded-full animate-spin" />
      </div>
    }>
      <StaffChatInner />
    </Suspense>
  )
}
