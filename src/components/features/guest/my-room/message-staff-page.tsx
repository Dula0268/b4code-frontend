"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuthStore } from "@/store/auth/auth.store"
import {
    Utensils, Sparkles, AlertCircle, HelpCircle, User, DoorOpen, Send, ChevronLeft
} from "lucide-react"

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessageStaffPage() {
    const user = useAuthStore((state) => state.user)
    const guestFirst = user?.profile?.firstName || "Guest"

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([
        { id: 1, sender: "staff", text: `Welcome ${guestFirst}! Please let us know if you need anything during your stay.`, timestamp: "Just now" }
    ])

    const handleSendMessage = () => {
        if (!message.trim()) return

        const newMsg = { id: Date.now(), sender: "guest", text: message.trim(), timestamp: "Just now" }
        setMessages(prev => [...prev, newMsg])
        setMessage("")

        // Simulate staff auto-reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: "staff",
                text: "We have received your message and our team will attend to it shortly.",
                timestamp: "Just now"
            }])
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[var(--gray-5)]/10 pt-24 pb-16">
            <div className="max-w-[1000px] mx-auto px-4 flex flex-col gap-6">

                {/* ── Page Header ───────────────────────────────────────────── */}
                <div className="mb-4">
                    <Link href="/guest/my-room" className="inline-flex items-center gap-1 text-[var(--gray-3)] hover:text-[var(--fg)] text-[14px] font-bold mb-6 no-underline transition-colors">
                        <ChevronLeft size={16} /> Back to My Room
                    </Link>
                    <h1 className="text-[32px] font-bold text-[var(--fg)] leading-tight mb-3">
                        Contact Property Staff
                    </h1>
                    <p className="text-[17px] font-semibold text-[var(--brand-primary)] leading-snug mb-2">
                        Need help during your stay?
                    </p>
                    <p className="text-[14px] text-[var(--gray-2)] max-w-[500px] leading-relaxed">
                        You can message the staff for room service, cleaning, maintenance, or any assistance during your stay.
                    </p>
                </div>

                {/* ── Layout Grid ───────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Sidebar */}
                    <div className="w-full md:w-[340px] flex-shrink-0">
                        {/* Current Stay Card */}
                        <div className="mb-7">
                            <h2 className="text-[11px] font-bold text-[var(--gray-3)] uppercase tracking-widest mb-3 pl-1">
                                CURRENT STAY
                            </h2>
                            <div className="bg-[var(--white)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-soft)] border border-[var(--border)]">
                                <div className="relative w-full h-[140px] rounded-[var(--radius-lg)] overflow-hidden mb-4 bg-[var(--gray-5)]/30">
                                    <Image
                                        src="/images/room/resort-exterior.png"
                                        alt="Grand Horizon Resort"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-[18px] font-bold text-[var(--fg)] mb-1.5 leading-snug">
                                    Luxe Horizon Resort
                                </h3>
                                <div className="flex items-center gap-2 text-[13px] text-[var(--gray-2)] font-medium">
                                    <DoorOpen size={15} className="text-[var(--gray-4)]" />
                                    Room: Suite 402
                                </div>
                            </div>
                        </div>

                        {/* Quick Requests */}
                        <div>
                            <h2 className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-widest mb-3 pl-1">
                                QUICK REQUESTS
                            </h2>
                            <div className="flex flex-col gap-2.5">
                                {[
                                    { icon: Utensils, label: "Request room service" },
                                    { icon: Sparkles, label: "Request room cleaning" },
                                    { icon: AlertCircle, label: "Report a problem" },
                                    { icon: HelpCircle, label: "Ask for assistance" },
                                ].map(({ icon: Icon, label }) => (
                                    <button
                                        key={label}
                                        onClick={() => setMessage(label)}
                                        className="w-full bg-[var(--white)] rounded-full py-4 px-5 flex items-center gap-3 shadow-[var(--shadow-soft)] border border-[var(--border)] hover:border-[var(--brand-secondary)]/50 transition-colors cursor-pointer"
                                    >
                                        <Icon size={18} className="text-[var(--brand-secondary)]" strokeWidth={2.5} />
                                        <span className="text-[14px] font-bold text-[var(--fg)]">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Area - Chat Interface */}
                    <div className="flex-1 bg-[var(--white)] rounded-[24px] shadow-[var(--shadow-card)] border border-[var(--border)] p-6 flex flex-col min-h-[580px]">

                        {/* Chat Header */}
                        <div className="flex items-center gap-3 pb-6 border-b border-[var(--border)]">
                            <div className="w-[42px] h-[42px] rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center flex-shrink-0 pb-0.5">
                                <User size={22} className="text-[var(--brand-primary)]" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-[16px] font-bold text-[var(--fg)] leading-snug">
                                    Chat with Staff
                                </h2>
                                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--state-success)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--state-success)]" />
                                    Staff Online
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 py-8 flex flex-col gap-5 overflow-y-auto pr-2">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex items-start gap-4 flex-shrink-0 ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>
                                    {msg.sender === "staff" && (
                                        <div className="w-[36px] h-[36px] rounded-full bg-[var(--black-2)] flex items-center justify-center flex-shrink-0 mt-1 pb-0.5 shadow-sm">
                                            <User size={18} className="text-[var(--brand-secondary)]" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-1.5 max-w-[80%] ${msg.sender === "guest" ? "items-end" : ""}`}>
                                        <div className={`shadow-sm px-5 py-4 text-[14px] leading-relaxed ${msg.sender === "guest"
                                                ? "bg-[var(--black-2)] text-[var(--white)] rounded-[20px] rounded-tr-none"
                                                : "bg-[var(--gray-5)]/20 border border-[var(--border)] text-[var(--black-3)] rounded-[20px] rounded-tl-none"
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <span className={`text-[10px] text-[var(--gray-4)] font-bold uppercase tracking-wider ${msg.sender === "staff" ? "ml-1" : "mr-1"}`}>
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input ── */}
                        <div className="pt-2">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="Type your message to the staff..."
                                    className="flex-1 bg-[var(--gray-5)]/20 border border-[var(--border)] hover:border-[var(--gray-4)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors rounded-full px-6 py-[15px] text-[14px] text-[var(--fg)] placeholder:text-[var(--gray-4)] outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] text-white rounded-full px-7 py-[15px] flex items-center justify-center gap-2 text-[14px] font-bold transition-colors cursor-pointer shadow-[var(--shadow-soft)]"
                                >
                                    Send <Send size={15} />
                                </button>
                            </div>
                            <p className="text-[11px] text-[var(--gray-4)] text-center mt-3 font-medium">
                                Our staff will assist you directly to your digital suite terminal.
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
