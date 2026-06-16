"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
    Search, Send, Paperclip, ChevronLeft, ShieldCheck,
    Check, CheckCheck, FileText, Image as ImageIcon, Info,
    User, HelpCircle, ArrowRight
} from "lucide-react"

import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar"
import { useGuestGuard } from "@/hooks/use-guest-guard"
import { useGuestBookingStore } from "@/store/guest/booking/booking.store"

// ─── Data Types ──────────────────────────────────────────────────────────────
interface ChatMessage {
    id: string
    sender: "guest" | "host" | "staff" | "system"
    senderName: string
    content: string
    timestamp: string
    isRead: boolean
    isAutoMessage?: boolean
    attachments?: { name: string; type: "image" | "pdf"; size: string }[]
}

interface Conversation {
    id: string
    propertyTitle: string
    propertyImage: string
    bookingId: string
    bookingStatus: "UPCOMING" | "COMPLETED" | "CANCELLED"
    hostName: string
    hostAvatar: string
    staffName: string
    staffAvatar: string
    hostMessages: ChatMessage[]
    staffMessages: ChatMessage[]
}

// ─── Seeded Conversations with Host & Staff messages ────────────────────────
const SEEDED_CONVERSATIONS: Conversation[] = [
    {
        id: "conv-1",
        propertyTitle: "Shangri-La Colombo",
        propertyImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&auto=format&fit=crop",
        bookingId: "CONF-9023",
        bookingStatus: "UPCOMING",
        hostName: "Amal — Host",
        hostAvatar: "AH",
        staffName: "Front Desk & Concierge Staff",
        staffAvatar: "CS",
        hostMessages: [
            {
                id: "m1-auto1",
                sender: "system",
                senderName: "System",
                content: "Your booking for Shangri-La Colombo (CONF-9023) has been confirmed.",
                timestamp: "Oct 01, 10:00 AM",
                isRead: true,
                isAutoMessage: true
            },
            {
                id: "m1-h1",
                sender: "host",
                senderName: "Amal",
                content: "Thank you for booking! Let us know if you need anything before your check-in.",
                timestamp: "Yesterday, 10:00 AM",
                isRead: true
            }
        ],
        staffMessages: [
            {
                id: "m1-s-sys",
                sender: "system",
                senderName: "System",
                content: "Welcome to Guest Support Channel. Feel free to request front desk, cleaning, or maintenance assistance here.",
                timestamp: "Oct 01, 10:05 AM",
                isRead: true,
                isAutoMessage: true
            },
            {
                id: "m1-s1",
                sender: "staff",
                senderName: "Front Desk Support",
                content: "Hello! I am Nihal from guest services. We're here to help you during your upcoming stay. Let us know if you need airport transfer or special amenities.",
                timestamp: "Yesterday, 10:30 AM",
                isRead: true
            }
        ]
    },
    {
        id: "conv-2",
        propertyTitle: "Heritance Kandalama",
        propertyImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&auto=format&fit=crop",
        bookingId: "CONF-1184",
        bookingStatus: "UPCOMING",
        hostName: "Sunil — Property Manager",
        hostAvatar: "SM",
        staffName: "Kandalama Reception",
        staffAvatar: "KR",
        hostMessages: [
            {
                id: "m2-h1",
                sender: "host",
                senderName: "Sunil",
                content: "Welcome to Heritance Kandalama! We are looking forward to your stay.",
                timestamp: "Yesterday, 2:00 PM",
                isRead: true
            }
        ],
        staffMessages: [
            {
                id: "m2-s1",
                sender: "guest",
                senderName: "You",
                content: "Hi, does the breakfast buffet include traditional hoppers?",
                timestamp: "3h ago",
                isRead: true
            },
            {
                id: "m2-s2",
                sender: "staff",
                senderName: "Front Desk Staff",
                content: "Yes, our chef is happy to prepare traditional hoppers for breakfast.",
                timestamp: "2h ago",
                isRead: true
            }
        ]
    }
]

function MessagingContent() {
    const { ready } = useGuestGuard()
    const searchParams = useSearchParams()
    const storedBookings = useGuestBookingStore(s => s.bookings)
    const paramBookingRef = searchParams?.get("bookingRef") || ""

    const [conversations, setConversations] = useState<Conversation[]>(SEEDED_CONVERSATIONS)
    const [activeConvId, setActiveConvId] = useState<string>("")
    const [activeChannel, setActiveChannel] = useState<"host" | "staff">("host")
    const [searchQuery, setSearchQuery] = useState("")
    const [composerInput, setComposerInput] = useState("")
    const [composerAttachments, setComposerAttachments] = useState<{ name: string; type: "image" | "pdf"; size: string }[]>([])
    
    const threadBottomRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sync bookings from store
    useEffect(() => {
        let conversationsList = SEEDED_CONVERSATIONS
        if (storedBookings && storedBookings.length > 0) {
            conversationsList = storedBookings.map((b) => {
                const existing = SEEDED_CONVERSATIONS.find(c => c.bookingId === b.confirmationCode)
                return {
                    id: `booking-${b.id}`,
                    propertyTitle: b.property,
                    propertyImage: b.imageSrc || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&auto=format&fit=crop",
                    bookingId: b.confirmationCode,
                    bookingStatus: b.status as "UPCOMING" | "COMPLETED" | "CANCELLED",
                    hostName: existing ? existing.hostName : "Property Manager",
                    hostAvatar: existing ? existing.hostAvatar : b.property.charAt(0),
                    staffName: existing ? existing.staffName : "On-site Receptionist",
                    staffAvatar: existing ? existing.staffAvatar : "OS",
                    hostMessages: existing ? existing.hostMessages : [
                        {
                            id: `m-auto-${b.id}-1`,
                            sender: "system",
                            senderName: "System",
                            content: `Your reservation for ${b.roomName || 'Standard Room'} is confirmed. Ref: #${b.confirmationCode}.`,
                            timestamp: "Today, 10:00 AM",
                            isRead: true,
                            isAutoMessage: true
                        }
                    ],
                    staffMessages: existing ? existing.staffMessages : [
                        {
                            id: `m-s-auto-${b.id}-1`,
                            sender: "system",
                            senderName: "System",
                            content: `This is the Support Staff channel for ${b.property}. Ask here for cleaning, food, or general support.`,
                            timestamp: "Today, 10:00 AM",
                            isRead: true,
                            isAutoMessage: true
                        }
                    ]
                }
            })
        }
        setConversations(conversationsList)

        if (paramBookingRef) {
            const matched = conversationsList.find(c => c.bookingId === paramBookingRef)
            if (matched) setActiveConvId(matched.id)
        } else if (conversationsList.length > 0) {
            setActiveConvId(conversationsList[0].id)
        }
    }, [storedBookings, paramBookingRef])

    const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0]

    const activeMessages = activeConv 
        ? (activeChannel === "host" ? activeConv.hostMessages : activeConv.staffMessages) 
        : []

    useEffect(() => {
        if (activeConv) {
            threadBottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [activeMessages, activeConvId, activeChannel])

    // Mask privacy details
    const maskSensitiveInfo = (text: string) => {
        let result = text
        result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[masked-email]")
        result = result.replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4,6}/g, "[masked-phone]")
        return result
    }

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!composerInput.trim() && composerAttachments.length === 0) return

        const cleanedContent = maskSensitiveInfo(composerInput.trim())
        const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: "guest",
            senderName: "You",
            content: cleanedContent || `Sent ${composerAttachments.length} attachments`,
            timestamp: `Today, ${currentTime}`,
            isRead: true,
            attachments: composerAttachments.length > 0 ? [...composerAttachments] : undefined
        }

        setConversations(prev => prev.map(conv => {
            if (conv.id === activeConvId) {
                if (activeChannel === "host") {
                    return { ...conv, hostMessages: [...conv.hostMessages, newMsg] }
                } else {
                    return { ...conv, staffMessages: [...conv.staffMessages, newMsg] }
                }
            }
            return conv
        }))

        setComposerInput("")
        setComposerAttachments([])

        // Auto-reply mock
        const replyChannel = activeChannel
        setTimeout(() => {
            const autoMsg: ChatMessage = {
                id: `msg-reply-${Date.now()}`,
                sender: replyChannel,
                senderName: replyChannel === "host" ? activeConv.hostName : activeConv.staffName,
                content: replyChannel === "host" 
                    ? `Hi there! I've received your request and will follow up shortly.` 
                    : `Front Desk here. We have noted your request and our support team is working on it.`,
                timestamp: `Today, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
                isRead: false
            }
            setConversations(curr => curr.map(c => {
                if (c.id === activeConvId) {
                    if (replyChannel === "host") {
                        return { ...c, hostMessages: [...c.hostMessages, autoMsg] }
                    } else {
                        return { ...c, staffMessages: [...c.staffMessages, autoMsg] }
                    }
                }
                return c
            }))
        }, 1500)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        const newAttachments = files.map(f => {
            const isImg = f.type.startsWith("image/")
            return {
                name: f.name,
                type: isImg ? ("image" as const) : ("pdf" as const),
                size: `${Math.round(f.size / 1024)} KB`
            }
        })
        setComposerAttachments(prev => [...prev, ...newAttachments])
    }

    const filteredConversations = conversations.filter(conv => 
        conv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
        conv.hostName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Mark current active channel messages as read
    useEffect(() => {
        if (activeConv) {
            setConversations(prev => prev.map(c => {
                if (c.id === activeConvId) {
                    if (activeChannel === "host") {
                        return {
                            ...c,
                            hostMessages: c.hostMessages.map(m => m.isRead ? m : { ...m, isRead: true })
                        }
                    } else {
                        return {
                            ...c,
                            staffMessages: c.staffMessages.map(m => m.isRead ? m : { ...m, isRead: true })
                        }
                    }
                }
                return c
            }))
        }
    }, [activeConvId, activeChannel])

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-t-[#9a3300] border-gray-200 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col font-sans bg-gray-50 text-gray-900 overflow-hidden">
            <GuestTopbar />
            
            <div className="flex-1 pt-16 p-0 md:p-6 flex justify-center overflow-hidden">
                <div className="w-full max-w-6xl bg-white md:border border-gray-200 md:rounded-xl overflow-hidden flex shadow-sm h-full">
                    
                    {/* Left Sidebar (Inbox) */}
                    <div className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 flex flex-col border-r border-gray-200 ${
                        activeConvId ? "hidden md:flex" : "flex"
                    }`}>
                        <div className="p-4 border-b border-gray-100">
                            <h1 className="text-xl font-bold mb-4">Messages</h1>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg focus-within:ring-2 focus-within:ring-[#9a3300]/20 transition-all">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="bg-transparent text-sm w-full outline-none placeholder:text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">No conversations found.</div>
                            ) : (
                                filteredConversations.map(conv => {
                                    const isActive = conv.id === activeConvId
                                    // Count unread across both channels
                                    const hostUnread = conv.hostMessages.filter(m => !m.isRead && m.sender !== "guest").length
                                    const staffUnread = conv.staffMessages.filter(m => !m.isRead && m.sender !== "guest").length
                                    const totalUnread = hostUnread + staffUnread

                                    const lastHostMsg = conv.hostMessages[conv.hostMessages.length - 1]
                                    const lastStaffMsg = conv.staffMessages[conv.staffMessages.length - 1]
                                    const lastMsg = (lastHostMsg && lastStaffMsg)
                                        ? (new Date(lastHostMsg.timestamp) > new Date(lastStaffMsg.timestamp) ? lastHostMsg : lastStaffMsg)
                                        : (lastHostMsg || lastStaffMsg)

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setActiveConvId(conv.id)}
                                            className={`p-4 flex gap-3 cursor-pointer transition-colors border-l-4 ${
                                                isActive ? "bg-orange-50/50 border-[#9a3300]" : "border-transparent hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img src={conv.propertyImage} alt={conv.propertyTitle} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-sm font-semibold truncate pr-2">{conv.propertyTitle}</h4>
                                                    <span className={`text-[11px] flex-shrink-0 ${totalUnread > 0 ? "text-[#9a3300] font-semibold" : "text-gray-400"}`}>
                                                        {lastMsg?.timestamp.split(", ")[0] || "Today"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs truncate pr-2 ${totalUnread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                                                        {lastMsg?.sender === "guest" ? "You: " : ""}{lastMsg?.content}
                                                    </p>
                                                    {totalUnread > 0 && (
                                                        <div className="w-4 h-4 rounded-full bg-[#9a3300] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                                            {totalUnread}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Pane (Active Chat) */}
                    <div className={`flex-1 flex flex-col bg-[#f8f9fa] ${
                        !activeConvId ? "hidden md:flex items-center justify-center" : "flex"
                    }`}>
                        {activeConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-4 py-3 bg-white border-b border-gray-200 flex flex-col gap-2 shadow-sm z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setActiveConvId("")}
                                                className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 leading-tight">{activeConv.propertyTitle}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Booking Ref: {activeConv.bookingId} • 
                                                    <span className={`ml-1 font-medium uppercase ${
                                                        activeConv.bookingStatus === "UPCOMING" ? "text-emerald-600" : 
                                                        activeConv.bookingStatus === "COMPLETED" ? "text-blue-600" : "text-gray-500"
                                                    }`}>
                                                        {activeConv.bookingStatus}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DUAL CHANNELS SELECTOR TABS */}
                                    <div className="flex border-t border-gray-100 pt-2 gap-2">
                                        <button
                                            onClick={() => setActiveChannel("host")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                                                activeChannel === "host"
                                                    ? "bg-[#9a3300] text-white border-[#9a3300] shadow-sm"
                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <User size={14} />
                                            <div className="text-left">
                                                <div className="font-bold">Contact Host</div>
                                                <div className={`text-[10px] ${activeChannel === "host" ? "text-orange-200" : "text-gray-400"} truncate max-w-[120px]`}>{activeConv.hostName}</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setActiveChannel("staff")}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                                                activeChannel === "staff"
                                                    ? "bg-[#9a3300] text-white border-[#9a3300] shadow-sm"
                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <HelpCircle size={14} />
                                            <div className="text-left">
                                                <div className="font-bold">On-Site Staff</div>
                                                <div className={`text-[10px] ${activeChannel === "staff" ? "text-orange-200" : "text-gray-400"} truncate max-w-[120px]`}>{activeConv.staffName}</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Privacy Banner */}
                                <div className="bg-amber-50 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-700 border-b border-amber-100 flex-shrink-0">
                                    <ShieldCheck size={14} className="flex-shrink-0" />
                                    <span>Phone numbers and email addresses are masked. Keep transactions on the platform for protection.</span>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
                                    {activeMessages.map((msg, index) => {
                                        const isGuest = msg.sender === "guest"
                                        const isSystem = msg.sender === "system"

                                        if (isSystem || msg.isAutoMessage) {
                                            return (
                                                <div key={msg.id || index} className="flex justify-center my-1">
                                                    <div className="bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 max-w-[85%] text-left shadow-sm flex items-start gap-2.5">
                                                        <Info size={15} className="text-[#9a3300] mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9a3300] mb-0.5">Notification</div>
                                                            <p className="text-xs text-gray-700 leading-relaxed">{msg.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <div key={msg.id || index} className={`flex ${isGuest ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[75%] md:max-w-[65%] flex flex-col gap-1 ${isGuest ? "items-end" : "items-start"}`}>
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                        isGuest 
                                                            ? "bg-[#9a3300] text-white rounded-br-sm" 
                                                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                                                    }`}>
                                                        {msg.content}
                                                        
                                                        {/* Attachments */}
                                                        {msg.attachments && (
                                                            <div className="mt-2 flex flex-col gap-1.5">
                                                                {msg.attachments.map((att, idx) => (
                                                                    <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                                                        isGuest ? "bg-white/10 text-white" : "bg-gray-50 border border-gray-100 text-gray-700"
                                                                    }`}>
                                                                        {att.type === "image" ? <ImageIcon size={14} /> : <FileText size={14} />}
                                                                        <span className="truncate flex-1 font-medium">{att.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 px-1">
                                                        <span>{msg.timestamp}</span>
                                                        {isGuest && (
                                                            msg.isRead ? <CheckCheck size={12} className="text-[#9a3300]" /> : <Check size={12} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={threadBottomRef} />
                                </div>

                                {/* Composer */}
                                <div className="p-4 bg-white border-t border-gray-200">
                                    {/* Attachment Preview */}
                                    {composerAttachments.length > 0 && (
                                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                            {composerAttachments.map((att, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-700 whitespace-nowrap">
                                                    {att.type === "image" ? <ImageIcon size={14} className="text-gray-500" /> : <FileText size={14} className="text-gray-500" />}
                                                    <span className="max-w-[100px] truncate">{att.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept="image/*,.pdf"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                        >
                                            <Paperclip size={20} />
                                        </button>
                                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#9a3300] focus-within:ring-1 focus-within:ring-[#9a3300] transition-all">
                                            <input
                                                type="text"
                                                value={composerInput}
                                                onChange={e => setComposerInput(e.target.value)}
                                                placeholder={`Message ${activeChannel === "host" ? activeConv.hostName.split(" —")[0] : "Staff"}...`}
                                                className="w-full bg-transparent px-4 py-3 outline-none text-sm text-gray-800"
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={!composerInput.trim() && composerAttachments.length === 0}
                                            className="p-3 bg-[#9a3300] text-white rounded-full hover:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Info size={24} className="text-gray-400" />
                                </div>
                                <p>Select a conversation to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function GuestMessagesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-t-[#9a3300] border-gray-200 rounded-full animate-spin" />
            </div>
        }>
            <MessagingContent />
        </Suspense>
    )
}
