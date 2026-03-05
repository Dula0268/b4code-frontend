"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Utensils, Sparkles, AlertCircle, HelpCircle, User, DoorOpen, Send, ChevronLeft
} from "lucide-react"

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessageStaffPage() {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([
        { id: 1, sender: "staff", text: "Welcome! Please let us know if you need anything during your stay.", timestamp: "Just now" }
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
        <div className="min-h-screen bg-[#f4f4f4] pt-24 pb-16">
            <div className="max-w-[1000px] mx-auto px-4 flex flex-col gap-6">

                {/* ── Page Header ───────────────────────────────────────────── */}
                <div className="mb-4">
                    <h1 className="text-[32px] font-bold text-[#1d1d1d] leading-tight mb-3">
                        Contact Property Staff
                    </h1>
                    <p className="text-[17px] font-semibold text-[#953002] leading-snug mb-2">
                        Need help during your stay?
                    </p>
                    <p className="text-[14px] text-[#828282] max-w-[500px] leading-relaxed">
                        You can message the staff for room service, cleaning, maintenance, or any assistance during your stay.
                    </p>
                </div>

                {/* ── Layout Grid ───────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left Sidebar */}
                    <div className="w-full md:w-[340px] flex-shrink-0">
                        {/* Current Stay Card */}
                        <div className="mb-7">
                            <h2 className="text-[11px] font-bold text-[#828282] uppercase tracking-widest mb-3 pl-1">
                                CURRENT STAY
                            </h2>
                            <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                                <div className="relative w-full h-[140px] rounded-2xl overflow-hidden mb-4 bg-[#f0f0f0]">
                                    <Image
                                        src="/images/room/resort-exterior.png"
                                        alt="Grand Horizon Resort"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="text-[18px] font-bold text-[#1d1d1d] mb-1.5 leading-snug">
                                    Grand Horizon Resort
                                </h3>
                                <div className="flex items-center gap-2 text-[13px] text-[#828282] font-medium">
                                    <DoorOpen size={15} className="text-[#a0a0a0]" />
                                    Room Number: Suite 402
                                </div>
                            </div>
                        </div>

                        {/* Quick Requests */}
                        <div>
                            <h2 className="text-[10px] font-bold text-[#828282] uppercase tracking-widest mb-3 pl-1">
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
                                        className="w-full bg-white rounded-full py-4 px-5 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#ffffff] hover:border-[#f0a500]/30 transition-colors cursor-pointer"
                                    >
                                        <Icon size={18} className="text-[#f0a500]" strokeWidth={2.5} />
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Area - Chat Interface */}
                    <div className="flex-1 bg-white rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f0f0f0] p-6 flex flex-col min-h-[580px]">

                        {/* Chat Header */}
                        <div className="flex items-center gap-3 pb-6 border-b border-[#f0f0f0]">
                            <div className="w-[42px] h-[42px] rounded-full bg-[#f8efe8] flex items-center justify-center flex-shrink-0 pb-0.5">
                                <User size={22} className="text-[#953002]" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-[16px] font-bold text-[#1d1d1d] leading-snug">
                                    Chat with Staff
                                </h2>
                                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#27AE60]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
                                    Staff Online
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 py-8 flex flex-col gap-5 overflow-y-auto">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex items-start gap-4 flex-shrink-0 ${msg.sender === "guest" ? "flex-row-reverse pl-12" : "pr-12"}`}>
                                    {msg.sender === "staff" && (
                                        <div className="w-[36px] h-[36px] rounded-full bg-[#f8efe8] flex items-center justify-center flex-shrink-0 mt-1 pb-0.5 shadow-sm border border-[#f5ede4]">
                                            <User size={18} className="text-[#953002]" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.sender === "guest" ? "items-end" : ""}`}>
                                        <div className={`shadow-sm px-5 py-4 text-[14px] leading-relaxed ${msg.sender === "guest"
                                                ? "bg-[#953002] text-white rounded-[20px] rounded-tr-none"
                                                : "bg-white border border-[#eaeaea] text-[#333] rounded-[20px] rounded-tl-none"
                                            }`}>
                                            {msg.text}
                                        </div>
                                        <span className={`text-[10px] text-[#a0a0a0] font-medium ${msg.sender === "staff" ? "ml-1" : "mr-1"}`}>
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
                                    className="flex-1 bg-[#fafafa] border border-[#ebebeb] hover:border-[#ddd] focus:border-[#953002] focus:ring-1 focus:ring-[#953002] transition-colors rounded-full px-6 py-[15px] text-[14px] text-[#1d1d1d] placeholder:text-[#a0a0a0] outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-[#953002] hover:bg-[#6d2200] text-white rounded-full px-7 py-[15px] flex items-center justify-center gap-2 text-[14px] font-bold transition-colors cursor-pointer shadow-md"
                                >
                                    Send Message <Send size={15} />
                                </button>
                            </div>
                            <p className="text-[11px] text-[#a0a0a0] text-center mt-3 font-medium">
                                Our staff will assist you as quickly as possible.
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
