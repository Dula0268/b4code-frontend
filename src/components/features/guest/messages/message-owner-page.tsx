"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Send, Paperclip, Clock, CalendarCheck, ParkingCircle, Building2,
    CalendarDays, BadgeCheck, Lightbulb, CheckCircle2,
} from "lucide-react"

interface Message {
    id: string
    sender: "host" | "guest"
    text: string
    time: string
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: "m1",
        sender: "host",
        text: "Hello! Thank you for your booking. How can we assist you?",
        time: "10:00 AM",
    },
    {
        id: "m2",
        sender: "guest",
        text: "Hi! I'm wondering if there's any flexibility with the check-in time?",
        time: "10:02 AM",
    },
]

const QUICK_CHIPS = [
    { label: "Ask about check-in time", icon: Clock },
    { label: "Request early check-in", icon: CalendarCheck },
    { label: "Ask about parking", icon: ParkingCircle },
    { label: "Ask about facilities", icon: Building2 },
]

const BOOKING = {
    propertyName: "Sunset Peak Resort",
    imageSrc: "/images/booking/sunset-peak-resort.png",
    reservationPeriod: "Oct 12 - Oct 15, 2023",
    bookingId: "#BK-8829",
}

const TIPS = [
    "Be polite and clear",
    "Ask about local transit",
]

function now() {
    return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

export default function MessageOwnerPage() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
    const [input, setInput] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = (text: string) => {
        if (!text.trim()) return
        const guest: Message = { id: Date.now().toString(), sender: "guest", text: text.trim(), time: now() }
        setMessages(prev => [...prev, guest])
        setInput("")

        setTimeout(() => {
            const replies = [
                "Of course! We can accommodate that. Please let us know your preferred time.",
                "Great question! I'll check availability and get back to you shortly.",
                "Absolutely, we're happy to help with that. Our team will make it happen.",
                "Thank you for asking. Yes, that's definitely possible - we'll arrange it for you.",
            ]
            const reply = replies[Math.floor(Math.random() * replies.length)]
            setMessages(prev => [...prev, { id: Date.now().toString() + "h", sender: "host", text: reply, time: now() }])
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[var(--gray-5)]/20 pt-20 pb-10">
            <div className="ps-container-md pt-8">
                <div className="mb-7">
                    <h1 className="text-[26px] font-bold text-[var(--fg)] leading-tight">Contact Property Owner</h1>
                    <p className="text-[14px] font-semibold text-[var(--brand-primary)] mt-1">Need help with your booking?</p>
                    <p className="text-[13px] text-[var(--muted)] mt-0.5">
                        You can message the property owner for booking details, special requests, or any questions before your arrival.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
                    {/* Chat Section */}
                    <div className="flex-1 min-w-0 bg-[var(--bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] overflow-hidden flex flex-col border border-[var(--border)]">
                        
                        {/* Chat Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[#d4520a] flex items-center justify-center text-white font-bold text-[15px]">
                                    P
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--state-success)] border-2 border-white" />
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-[var(--fg)]">Chat with Property Owner</p>
                                <p className="text-[12px] font-semibold text-[var(--state-success)]">Online</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-4 min-h-[280px] max-h-[360px]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                                    {msg.sender === "host" && (
                                        <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[75%]">
                                            <div className="w-7 h-7 rounded-full bg-[var(--gray-5)]/50 flex items-center justify-center flex-shrink-0 mb-4">
                                                <span className="text-[11px]">🏨</span>
                                            </div>
                                            <div>
                                                <div className="bg-[var(--gray-5)]/30 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-[var(--fg)] leading-relaxed">
                                                    {msg.text}
                                                </div>
                                                <p className="text-[11px] text-[var(--gray-4)] mt-1 ml-1">{msg.time}</p>
                                            </div>
                                        </div>
                                    )}
                                    {msg.sender === "guest" && (
                                        <div className="max-w-[88%] sm:max-w-[75%]">
                                            <div className="bg-[var(--brand-primary)] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-[var(--white)] leading-relaxed">
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                                                <p className="text-[11px] text-[var(--gray-4)]">{msg.time}</p>
                                                <CheckCircle2 size={11} className="text-[var(--state-success)]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick Action Chips */}
                        <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto border-t border-[var(--gray-5)]/30 scrollbar-hide">
                            {QUICK_CHIPS.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    onClick={() => sendMessage(label)}
                                    className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] border border-[var(--border)] rounded-full px-3 py-1.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 bg-[var(--bg)]"
                                >
                                    <Icon size={12} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--bg)]/50">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <button className="w-9 h-9 rounded-full border border-[var(--border)] text-[var(--muted)] flex items-center justify-center hover:bg-[var(--gray-5)] transition-colors cursor-pointer flex-shrink-0" title="Attach file">
                                    <Paperclip size={16} />
                                </button>
                                <input
                                    id="host-message-input"
                                    type="text"
                                    placeholder="Type your message to the property owner..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                                    className="flex-1 min-w-0 text-[13px] text-[var(--fg)] placeholder:text-[var(--gray-4)] bg-transparent outline-none border border-[var(--border)] rounded-xl px-3 py-2.5 sm:border-0 sm:px-0 sm:py-0"
                                />
                                <button
                                    id="send-message-btn"
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim()}
                                    className="inline-flex items-center justify-center gap-2 bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-[var(--white)] text-[13px] font-semibold px-5 py-2.5 rounded-[var(--radius)] transition-colors cursor-pointer flex-shrink-0 w-full sm:w-auto"
                                >
                                    Send Message <Send size={13} />
                                </button>
                            </div>
                            <p className="text-[11px] text-[var(--gray-4)] mt-2 text-center">
                                The property owner will reply as soon as possible.
                            </p>
                        </div>
                    </div>

                    {/* Booking Reference Sidebar */}
                    <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
                        <div className="ps-card overflow-hidden">
                            <div className="px-5 pt-4 pb-3 border-b border-[var(--border)]">
                                <p className="text-[14px] font-bold text-[var(--fg)]">Booking Details</p>
                            </div>

                            <div className="relative h-[150px] w-full bg-[var(--gray-5)]">
                                <Image
                                    src={BOOKING.imageSrc}
                                    alt={BOOKING.propertyName}
                                    fill
                                    className="object-cover"
                                    sizes="280px"
                                />
                            </div>

                            <div className="px-5 py-4 flex flex-col gap-3">
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest mb-0.5">Property Name</p>
                                    <p className="text-[15px] font-bold text-[var(--fg)]">{BOOKING.propertyName}</p>
                                </div>

                                <div className="flex items-center gap-3 bg-[var(--gray-5)]/10 border border-[var(--border)] rounded-[var(--radius)] px-4 py-3">
                                    <CalendarDays size={15} className="text-[var(--brand-primary)] flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Reservation Period</p>
                                        <p className="text-[13px] font-semibold text-[var(--fg)]">{BOOKING.reservationPeriod}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-[var(--gray-5)]/10 border border-[var(--border)] rounded-[var(--radius)] px-4 py-3">
                                    <BadgeCheck size={15} className="text-[var(--state-success)] flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Booking ID</p>
                                        <p className="text-[13px] font-bold text-[var(--fg)]">{BOOKING.bookingId}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/guest/booking/confirmation"
                                    className="w-full flex items-center justify-center text-[13px] font-semibold text-[var(--fg)] border border-[var(--border)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] rounded-[var(--radius)] py-2.5 transition-colors no-underline"
                                >
                                    View Booking Receipt
                                </Link>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-[var(--brand-primary)] rounded-[var(--radius-lg)] px-5 py-4 shadow-[var(--shadow-soft)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb size={15} className="text-[var(--brand-secondary)]" />
                                <p className="text-[13px] font-bold text-[var(--white)]">Tips for Guests</p>
                            </div>
                            <p className="text-[12px] text-[var(--white)]/80 leading-relaxed mb-3">
                                Mention your flight number or arrival time to help the owner prepare for your check-in.
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {TIPS.map((tip) => (
                                    <div key={tip} className="flex items-center gap-2 text-[12px] text-[var(--white)]/90">
                                        <CheckCircle2 size={12} className="text-[var(--brand-secondary)] flex-shrink-0" />
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
