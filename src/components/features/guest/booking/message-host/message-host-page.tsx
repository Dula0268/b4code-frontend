"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Send, Plus, Clock, CalendarCheck, ParkingCircle, Building2,
    CalendarDays, BadgeCheck, Lightbulb, CheckCircle2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: string
    sender: "host" | "guest"
    text: string
    time: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────
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
    reservationPeriod: "Oct 12 – Oct 15, 2023",
    bookingId: "#BK-8829",
}

const TIPS = [
    "Be polite and clear",
    "Ask about local transit",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function now() {
    return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessageHostPage() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
    const [input, setInput] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = (text: string) => {
        if (!text.trim()) return
        const guest: Message = { id: Date.now().toString(), sender: "guest", text: text.trim(), time: now() }
        setMessages(prev => [...prev, guest])
        setInput("")

        // Simulated host reply after 1.5s
        setTimeout(() => {
            const replies = [
                "Of course! We can accommodate that. Please let us know your preferred time.",
                "Great question! I'll check availability and get back to you shortly.",
                "Absolutely, we're happy to help with that. Our team will make it happen.",
                "Thank you for asking. Yes, that's definitely possible — we'll arrange it for you.",
            ]
            const reply = replies[Math.floor(Math.random() * replies.length)]
            setMessages(prev => [...prev, { id: Date.now().toString() + "h", sender: "host", text: reply, time: now() }])
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-20 pb-10">
            <div className="max-w-[1020px] mx-auto px-4 pt-8">

                {/* Page header */}
                <div className="mb-7">
                    <h1 className="text-[26px] font-bold text-[#1d1d1d] leading-tight">Contact Property Owner</h1>
                    <p className="text-[14px] font-semibold text-[#953002] mt-1">Need help with your booking?</p>
                    <p className="text-[13px] text-[#828282] mt-0.5">
                        You can message the property owner for booking details, special requests, or any questions before your arrival.
                    </p>
                </div>

                <div className="flex gap-6 items-start">

                    {/* ── LEFT: Chat panel ───────────────────────────────────── */}
                    <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col">

                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0f0f0]">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#953002] to-[#d4520a] flex items-center justify-center text-white font-bold text-[15px]">
                                    P
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#27AE60] border-2 border-white" />
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-[#1d1d1d]">Chat with Property Owner</p>
                                <p className="text-[12px] font-semibold text-[#27AE60]">Online</p>
                            </div>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-[300px] max-h-[360px]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                                    {msg.sender === "host" && (
                                        <div className="flex items-end gap-2 max-w-[75%]">
                                            {/* Host avatar */}
                                            <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center flex-shrink-0 mb-4">
                                                <span className="text-[11px] text-[#828282]">🏨</span>
                                            </div>
                                            <div>
                                                <div className="bg-[#f5f5f5] rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-[#1d1d1d] leading-relaxed">
                                                    {msg.text}
                                                </div>
                                                <p className="text-[11px] text-[#bbb] mt-1 ml-1">{msg.time}</p>
                                            </div>
                                        </div>
                                    )}
                                    {msg.sender === "guest" && (
                                        <div className="max-w-[75%]">
                                            <div className="bg-[#953002] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-white leading-relaxed">
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center justify-end gap-1 mt-1 mr-1">
                                                <p className="text-[11px] text-[#bbb]">{msg.time}</p>
                                                <CheckCircle2 size={11} className="text-[#27AE60]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick suggestion chips */}
                        <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto border-t border-[#f5f5f5] scrollbar-hide">
                            {QUICK_CHIPS.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    onClick={() => sendMessage(label)}
                                    className="inline-flex items-center gap-1.5 text-[12px] text-[#555] border border-[#e0e0e0] rounded-full px-3 py-1.5 hover:border-[#953002] hover:text-[#953002] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 bg-white"
                                >
                                    <Icon size={12} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Input row */}
                        <div className="px-5 py-4 border-t border-[#f0f0f0]">
                            <div className="flex items-center gap-3">
                                <button className="w-8 h-8 rounded-full border border-[#953002] text-[#953002] flex items-center justify-center hover:bg-[#fff4eb] transition-colors cursor-pointer flex-shrink-0">
                                    <Plus size={16} />
                                </button>
                                <input
                                    id="host-message-input"
                                    type="text"
                                    placeholder="Type your message to the property owner..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                                    className="flex-1 text-[13px] text-[#1d1d1d] placeholder:text-[#bbb] bg-transparent outline-none"
                                />
                                <button
                                    id="send-message-btn"
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim()}
                                    className="inline-flex items-center gap-2 bg-[#953002] hover:bg-[#6d2200] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                                >
                                    Send Message <Send size={13} />
                                </button>
                            </div>
                            <p className="text-[11px] text-[#aaa] mt-2 text-center">
                                The property owner will reply as soon as possible.
                            </p>
                        </div>
                    </div>

                    {/* ── RIGHT: Booking Details sidebar ─────────────────────── */}
                    <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">

                        {/* Booking Details card */}
                        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] overflow-hidden">
                            <div className="px-5 pt-4 pb-3 border-b border-[#f5f5f5]">
                                <p className="text-[14px] font-bold text-[#1d1d1d]">Booking Details</p>
                            </div>

                            {/* Property image */}
                            <div className="relative h-[150px] w-full">
                                <Image
                                    src={BOOKING.imageSrc}
                                    alt={BOOKING.propertyName}
                                    fill
                                    className="object-cover"
                                    sizes="280px"
                                />
                            </div>

                            <div className="px-5 py-4 flex flex-col gap-3">
                                {/* Property name */}
                                <div>
                                    <p className="text-[10px] font-bold text-[#953002] uppercase tracking-widest mb-0.5">Property Name</p>
                                    <p className="text-[15px] font-bold text-[#1d1d1d]">{BOOKING.propertyName}</p>
                                </div>

                                {/* Reservation period */}
                                <div className="flex items-center gap-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-4 py-3">
                                    <CalendarDays size={15} className="text-[#953002] flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide">Reservation Period</p>
                                        <p className="text-[13px] font-semibold text-[#1d1d1d]">{BOOKING.reservationPeriod}</p>
                                    </div>
                                </div>

                                {/* Booking ID */}
                                <div className="flex items-center gap-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-4 py-3">
                                    <BadgeCheck size={15} className="text-[#27AE60] flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-[#828282] uppercase tracking-wide">Booking ID</p>
                                        <p className="text-[13px] font-bold text-[#1d1d1d]">{BOOKING.bookingId}</p>
                                    </div>
                                </div>

                                {/* View booking receipt */}
                                <Link
                                    href="/guest/booking/confirmation"
                                    className="w-full flex items-center justify-center text-[13px] font-semibold text-[#1d1d1d] border border-[#e0e0e0] hover:border-[#953002] hover:text-[#953002] rounded-xl py-2.5 transition-colors no-underline"
                                >
                                    View Booking Receipt
                                </Link>
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="bg-[#7a2700] rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(149,48,2,0.25)]">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb size={15} className="text-[#ffd06b]" />
                                <p className="text-[13px] font-bold text-white">Tips for Guests</p>
                            </div>
                            <p className="text-[12px] text-white/80 leading-relaxed mb-3">
                                Mention your flight number or arrival time to help the owner prepare for your check-in.
                            </p>
                            <div className="flex flex-col gap-1.5">
                                {TIPS.map((tip) => (
                                    <div key={tip} className="flex items-center gap-2 text-[12px] text-white/90">
                                        <CheckCircle2 size={12} className="text-[#ffd06b] flex-shrink-0" />
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
