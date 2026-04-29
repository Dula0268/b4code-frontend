"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
    Send, Paperclip, Clock, CalendarCheck, ParkingCircle, Building2,
    CalendarDays, BadgeCheck, Lightbulb, CheckCircle2, ChevronLeft,
    Smile, Phone, Video, Star, MapPin, Info, Home, Utensils, Sparkles,
    AlertCircle, HelpCircle, DoorOpen, User
} from "lucide-react"

// ─── Data & Types ────────────────────────────────────────────────────────
interface Message {
    id: string
    sender: "agent" | "guest"
    text: string
    time: string
}

const MESSAGING_CONFIG = {
    HOST_INITIAL: [
        { id: "m1", sender: "agent" as const, text: "Hello! Thank you for your booking at Sunset Peak Resort. How can we assist you?", time: "10:00 AM" },
        { id: "m2", sender: "guest" as const, text: "Hi! I'm wondering if there's any flexibility with the check-in time?", time: "10:02 AM" },
        { id: "m3", sender: "agent" as const, text: "Of course! We can accommodate early check-in from 11 AM onwards, subject to availability. Please let us know your arrival time.", time: "10:04 AM" },
    ],
    HOST_QUICK: [
        { label: "Check-in time", icon: Clock, msg: "Ask about check-in time" },
        { label: "Early check-in", icon: CalendarCheck, msg: "Request early check-in" },
        { label: "Parking", icon: ParkingCircle, msg: "Ask about parking" },
        { label: "Facilities", icon: Building2, msg: "Ask about facilities" },
    ],
    HOST_REPLIES: ["Of course, we can accommodate that.", "I'll check availability and get back to you shortly.", "Sure thing, we'll arrange it for you."],
    STAFF_INITIAL: [
        { id: "n1", sender: "agent" as const, text: "Welcome! I'm Amal from the front desk. Please let us know if you need anything during your stay.", time: "12:00 PM" },
    ],
    STAFF_QUICK: [
        { icon: Utensils, label: "Room service", msg: "I'd like to order room service please." },
        { icon: Sparkles, label: "Room cleaning", msg: "Could you arrange room cleaning?" },
        { icon: AlertCircle, label: "Report problem", msg: "I'd like to report an issue in my room." },
        { icon: HelpCircle, label: "Assistance", msg: "I need some general assistance please." },
    ],
    STAFF_REPLIES: ["Of course! We'll attend to that right away.", "Thank you for letting us know. Our team is on it!", "No problem at all — we'll send someone immediately."]
} as const;

import { useAuthStore } from "@/store/auth/auth.store"

function useMessagingLogic(initialMessages: Message[], replies: readonly string[]) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    const getTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    useEffect(() => {
        async function loadMessages() {
            try {
                const guestId = (useAuthStore.getState().user as any)?.id || 1;
                const res = await fetch(`http://localhost:8080/api/guest/messages?guestId=${guestId}`);
                if (res.ok) {
                    const data = await res.json();
                    const apiMsgs = data.map((m: any) => ({
                        id: String(m.id),
                        sender: String(m.senderId) === String(guestId) ? "guest" : "agent",
                        text: m.content,
                        time: new Date(m.sentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                    }));
                    if (apiMsgs.length > 0) {
                        setMessages(apiMsgs);
                    } else {
                        setMessages(initialMessages);
                    }
                } else {
                    setMessages(initialMessages);
                }
            } catch(e) {
                setMessages(initialMessages);
            }
        }
        loadMessages();
    }, [initialMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isTyping])

    const sendMessage = async (text: string) => {
        if (!text.trim()) return
        const guestId = (useAuthStore.getState().user as any)?.id || 1;
        const newMsg = { id: Date.now().toString(), sender: "guest" as const, text: text.trim(), time: getTime() };
        setMessages(prev => [...prev, newMsg]);
        setInput("")
        setIsTyping(true)

        try {
            await fetch("http://localhost:8080/api/guest/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: guestId,
                    receiverId: 2, 
                    propertyId: 1, 
                    content: text.trim()
                })
            });
        } catch (e) {}

        setTimeout(async () => {
            setIsTyping(false)
            const reply = replies[Math.floor(Math.random() * replies.length)]
            const agentMsg = { id: Date.now().toString() + "a", sender: "agent" as const, text: reply, time: getTime() };
            setMessages(prev => [...prev, agentMsg])

            try {
                await fetch("http://localhost:8080/api/guest/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        senderId: 2, 
                        receiverId: guestId,
                        propertyId: 1,
                        content: reply
                    })
                });
            } catch(e) {}
        }, 1500 + Math.random() * 700)
    }

    return { messages, input, setInput, isTyping, bottomRef, sendMessage }
}


export default function MessagingPage() {
    // Determine variant from searchParams
    const searchParams = useSearchParams()
    const isStaff = searchParams.get("type") === "staff"

    const data = isStaff ? {
        title: "Contact Hotel Staff",
        desc: "Message our team for room service, cleaning, maintenance or any assistance.",
        backHref: "/guest/my-room",
        backText: "Back to My Room",
        initial: [...MESSAGING_CONFIG.STAFF_INITIAL],
        img: "/images/room/resort-exterior.png",
        status: "Staff Online",
        agentName: "Amal — Front Desk",
        replies: MESSAGING_CONFIG.STAFF_REPLIES,
        quick: MESSAGING_CONFIG.STAFF_QUICK,
        agentIcon: () => <User size={18} className="text-[var(--brand-secondary)]" />,
        agentAvatarBg: "bg-[#1a1a1a]",
        bubbleBg: "bg-white border border-[#ebebeb] text-[#1a1a1a] rounded-bl-md",
        guestBubbleBg: "bg-[#1a1a1a] text-white rounded-br-md",
        sendBtnBg: "bg-[#1a1a1a] hover:bg-[#2a2a2a]",
        inputPlaceholder: "Type your message to the staff…",
        hint: "Our staff will assist you directly to your suite terminal."
    } : {
        title: "Contact Property Owner",
        desc: "Message the host directly about your booking or any pre-arrival requests.",
        backHref: "/guest/booking/my-bookings",
        backText: "Back to Bookings",
        initial: [...MESSAGING_CONFIG.HOST_INITIAL],
        img: "/images/booking/sunset-peak-resort.png",
        status: "Online now",
        agentName: "Property Owner",
        replies: MESSAGING_CONFIG.HOST_REPLIES,
        quick: MESSAGING_CONFIG.HOST_QUICK,
        agentIcon: () => <span className="text-white font-black text-[15px]">P</span>,
        agentAvatarBg: "bg-gradient-to-br from-[var(--brand-primary)] to-orange-600",
        bubbleBg: "bg-white border border-[#ebebeb] text-[#1a1a1a] rounded-bl-md",
        guestBubbleBg: "bg-[var(--brand-primary)] text-white rounded-br-md",
        sendBtnBg: "bg-[var(--brand-primary)] hover:bg-[var(--primary-hover)]",
        inputPlaceholder: "Type your message to the property owner…",
        hint: "The property owner will reply as soon as possible."
    }

    const { messages, input, setInput, isTyping, bottomRef, sendMessage } = useMessagingLogic(data.initial, data.replies);

    return (
        <div className="min-h-screen bg-[#f8f7f5] pb-10 font-sans">
            <div className="max-w-[1100px] mx-auto px-4 lg:px-6 pt-6 pt-24">
                {/* Back */}
                <Link href={data.backHref} className="inline-flex items-center gap-2 text-[#888] hover:text-[#1a1a1a] text-[13px] font-bold mb-6 no-underline transition-colors w-fit">
                    <ChevronLeft size={16} /> {data.backText}
                </Link>

                <div className="mb-6">
                    <h1 className="text-[28px] font-black text-[#1a1a1a] leading-tight mb-1">{data.title}</h1>
                    <p className="text-[14px] text-[#888]">{data.desc}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-250px)] min-h-[600px]">

                    {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
                    <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm overflow-hidden">
                            <div className="relative h-[120px]">
                                <Image src={data.img} alt="Property" fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[11px] font-bold text-white">{data.status}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-[15px] font-black text-[#1a1a1a] mb-0.5">{isStaff ? "Luxe Horizon Resort" : "Sunset Peak Resort"}</h3>
                                <div className="flex items-center gap-1.5 text-[12px] text-[#888] mb-4">
                                    {isStaff ? (
                                        <><DoorOpen size={13} className="text-[#bbb]" /> Suite 402</>
                                    ) : (
                                        <><Star size={12} className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]" /> <span className="font-bold text-[#1a1a1a]">4.8</span> · Superhost</>
                                    )}
                                </div>
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

                        {/* Booking Details OR Staff Quick Requests */}
                        <div className="bg-white rounded-[20px] border border-[#ebebeb] shadow-sm p-4">
                            {!isStaff ? (
                                <>
                                    <p className="text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-3">Booking Details</p>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2.5 py-2 px-3 bg-[#f8f7f5] rounded-xl border border-[#ebebeb]">
                                            <CalendarDays size={14} className="text-[var(--brand-secondary)] flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-wide">Dates</p>
                                                <p className="text-[12px] font-bold text-[#1a1a1a]">Oct 12 – Oct 15</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/guest/booking/confirmation" className="mt-4 w-full flex items-center justify-center text-[12px] font-bold text-[#444] border border-[#ebebeb] hover:border-[#ccc] hover:bg-[#f8f7f5] rounded-xl py-2.5 transition-colors no-underline block text-center">
                                        View Booking Receipt
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-3">Quick Requests</p>
                                    <div className="flex flex-col gap-2">
                                        {data.quick.map((q) => (
                                            <button key={q.label} onClick={() => sendMessage(q.msg)} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-[#ebebeb] hover:border-[#1a1a1a] transition-all cursor-pointer text-left bg-white">
                                                <q.icon size={15} className="text-[#888] flex-shrink-0" />
                                                <span className="text-[13px] font-semibold text-[#1a1a1a]">{q.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── CHAT AREA ───────────────────────────────────────────────── */}
                    <div className="flex-1 bg-white rounded-[20px] border border-[#ebebeb] shadow-sm flex flex-col overflow-hidden min-h-0">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#ebebeb] flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${data.agentAvatarBg}`}>
                                    <data.agentIcon />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-black text-[#1a1a1a]">{data.agentName}</p>
                                    <p className="text-[11px] text-green-500 font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online · replies instantly
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chat history */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4" style={{ background: "linear-gradient(to bottom, #f8f7f5, #ffffff)" }}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2.5 ${msg.sender === "guest" ? "flex-row-reverse" : ""}`}>
                                    {msg.sender === "agent" && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${data.agentAvatarBg}`}>
                                            <data.agentIcon />
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-1 max-w-[72%] ${msg.sender === "guest" ? "items-end" : "items-start"}`}>
                                        <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.sender === "guest" ? data.guestBubbleBg : data.bubbleBg}`}>
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
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${data.agentAvatarBg}`}><data.agentIcon /></div>
                                    <div className="bg-white border border-[#ebebeb] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                        <div className="flex gap-1 items-center h-4">
                                            {[0, 120, 240].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#bbb] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick chips (Host only) */}
                        {!isStaff && (
                            <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-t border-[#f0f0f0] flex-shrink-0">
                                {data.quick.map((q) => (
                                    <button key={q.label} onClick={() => sendMessage(q.msg)} className="inline-flex items-center gap-1.5 text-[12px] text-[#666] border border-[#ebebeb] rounded-full px-3 py-1.5 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer whitespace-nowrap bg-white">
                                        <q.icon size={11} /> {q.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 py-4 border-t border-[#ebebeb] bg-white flex-shrink-0">
                            <div className="flex items-center gap-2 bg-[#f8f7f5] rounded-2xl border border-[#ebebeb] focus-within:border-[#1a1a1a] transition-colors px-2 py-1">
                                <button className="p-2 rounded-xl text-[#bbb] hover:text-[#666] transition-colors cursor-pointer bg-transparent border-none"><Smile size={18} /></button>
                                <input
                                    type="text"
                                    placeholder={data.inputPlaceholder}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                                    className="flex-1 bg-transparent text-[14px] text-[#1a1a1a] placeholder:text-[#bbb] outline-none py-2 border-none"
                                />
                                <button className="p-2 rounded-xl text-[#bbb] hover:text-[#666] transition-colors cursor-pointer bg-transparent border-none"><Paperclip size={16} /></button>
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim()}
                                    className={`w-9 h-9 rounded-xl disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer border-none ${data.sendBtnBg}`}>
                                    <Send size={15} className="text-white" />
                                </button>
                            </div>
                            <p className="text-[10px] text-[#bbb] text-center mt-2 font-medium">{data.hint}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
