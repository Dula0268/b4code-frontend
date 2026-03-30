"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Search,
    Bell,
    LayoutDashboard,
    Building2,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Settings,
    Phone,
    MoreVertical,
    PlusCircle,
    Smile,
    Send,
    ChevronRight,
    Clock,
    Plus,
    SettingsIcon,
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: false, href: "/owner/ownerDashboard" },
    { icon: Building2, label: "Properties", active: false, href: "/owner/properties" },
    { icon: DoorOpen, label: "Rooms", active: false, href: "#" },
    { icon: CalendarCheck, label: "Availability", active: false, href: "/owner/availability/weeklyCalendar" },
    { icon: DollarSign, label: "Pricing", active: false, href: "/owner/rate" },
    { icon: ClipboardList, label: "Reservation", active: false, href: "/owner/reservation" },
    { icon: Settings, label: "Settings", active: false, href: "/owner/setting/propertySetting" },
];

interface Conversation {
    id: number;
    name: string;
    initials: string;
    initialsColor: string;
    lastMessage: string;
    property: string;
    time: string;
    unread: boolean;
    online: boolean;
}

const conversations: Conversation[] = [
    {
        id: 1,
        name: "John Doe",
        initials: "JD",
        initialsColor: "#2e7d32",
        lastMessage: "Thanks! What time is check-out?",
        property: "DOWNTOWN LUXURY LOFT",
        time: "Just now",
        unread: true,
        online: true,
    },
    {
        id: 2,
        name: "Sarah Miller",
        initials: "SM",
        initialsColor: "#1565c0",
        lastMessage: "The cabin was amazing! We just left.",
        property: "LAKESIDE CABIN RETREAT",
        time: "2h ago",
        unread: false,
        online: false,
    },
    {
        id: 3,
        name: "Michael K.",
        initials: "MK",
        initialsColor: "#8B6914",
        lastMessage: "Is there a coffee maker in the unit?",
        property: "URBAN SKYLINE CONDO",
        time: "1h ago",
        unread: false,
        online: false,
    },
    {
        id: 4,
        name: "David Chen",
        initials: "DC",
        initialsColor: "#6a1b9a",
        lastMessage: "Will do. See you then.",
        property: "SUNNY BEACH BUNGALOW",
        time: "Yesterday",
        unread: false,
        online: false,
    },
];

interface Message {
    id: number;
    sender: "guest" | "owner";
    text: string;
    time: string;
    read?: boolean;
}

const chatMessages: Message[] = [
    {
        id: 1,
        sender: "guest",
        text: "Hi Alex! We just arrived and the place looks amazing. Is there a specific spot we should park the second car?",
        time: "10:43 AM",
    },
    {
        id: 2,
        sender: "owner",
        text: "Welcome, John! Glad you like it. Yes, you can use the guest spot marked #204 in the alleyway right behind the building. The remote in the kitchen drawer opens that gate.",
        time: "10:45 AM",
        read: true,
    },
    {
        id: 3,
        sender: "guest",
        text: "Perfect, found it! Thanks! Also, what time is check-out for Sunday?",
        time: "Just now",
    },
];

interface Template {
    title: string;
    preview: string;
}

const messageTemplates: Template[] = [
    {
        title: "Pre-arrival Info",
        preview: "\"Hi [Guest Name], we're excited to host you! Here's the door code...\"",
    },
    {
        title: "Welcome Message",
        preview: "\"Hi [Guest Name], welcome to [Property Name]! I hope you settled in...\"",
    },
    {
        title: "Check-out Reminder",
        preview: "\"Hope you enjoyed your stay! Reminder that check-out is at 11am...\"",
    },
];

/* ───────────────────── component ───────────────────── */

export default function MessagePage() {
    const [selectedConversation, setSelectedConversation] = useState(1);
    const [messageText, setMessageText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [scheduledReplies, setScheduledReplies] = useState(true);

    const activeConvo = conversations.find((c) => c.id === selectedConversation);

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden">
            {/* ───── Sidebar ───── */}
            <aside className="w-[140px] bg-white border-r border-[#e0e0e0] flex flex-col py-3 shrink-0">
                <div className="px-3 mb-5">
                    <Logo width={100} height={30} />
                </div>
                <nav className="flex flex-col gap-0.5">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-2 py-2 px-3 text-[12px] font-medium no-underline border-l-[3px] transition-all duration-150 ${
                                    item.active
                                        ? "text-[#953002] bg-[#fef5ef] border-[#953002] font-semibold"
                                        : "text-[#4f4f4f] border-transparent"
                                }`}
                            >
                                <Icon size={16} className="shrink-0" />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>
            </aside>

            {/* ───── Conversation List ───── */}
            <div className="w-[260px] bg-white border-r border-[#e0e0e0] flex flex-col shrink-0">
                {/* Search */}
                <div className="px-3 py-2.5 border-b border-[#e0e0e0]">
                    <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-lg py-1.5 px-2.5">
                        <Search size={14} color="#b0b0b0" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border-none bg-transparent outline-none text-[12px] text-[#1d1d1d] flex-1"
                        />
                    </div>
                </div>

                {/* Conversation Items */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((convo) => (
                        <button
                            key={convo.id}
                            onClick={() => setSelectedConversation(convo.id)}
                            className={`w-full flex items-start gap-2.5 px-3 py-3 border-none cursor-pointer text-left transition-colors duration-100 border-b border-[#f0f0f0] ${
                                selectedConversation === convo.id
                                    ? "bg-[#fef5ef]"
                                    : "bg-white hover:bg-[#fafafa]"
                            }`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                                    style={{ background: convo.initialsColor }}
                                >
                                    {convo.initials}
                                </div>
                                {convo.online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2e7d32] border-2 border-white" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className={`text-[12px] ${convo.unread ? "font-bold text-[#1d1d1d]" : "font-semibold text-[#4f4f4f]"}`}>
                                        {convo.name}
                                    </span>
                                    <span className={`text-[9px] shrink-0 ${convo.unread ? "text-[#953002] font-bold" : "text-[#b0b0b0]"}`}>
                                        {convo.time}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#828282] m-0 line-clamp-1 leading-snug">
                                    {convo.lastMessage}
                                </p>
                                <span className="text-[9px] text-[#953002] font-semibold tracking-wider uppercase mt-0.5 block">
                                    {convo.property}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ───── Chat Area ───── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#e0e0e0] bg-white">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                                style={{ background: activeConvo?.initialsColor }}
                            >
                                {activeConvo?.initials}
                            </div>
                            {activeConvo?.online && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2e7d32] border-2 border-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-[#1d1d1d] m-0">{activeConvo?.name}</h3>
                            <span className="text-[11px] text-[#2e7d32] font-medium">
                                Online • Downtown Luxury Loft
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="bg-transparent border-none cursor-pointer p-1.5 rounded-md flex items-center justify-center hover:bg-[#f5f5f5]">
                            <Phone size={18} color="#4f4f4f" />
                        </button>
                        <button className="bg-transparent border-none cursor-pointer p-1.5 rounded-md flex items-center justify-center hover:bg-[#f5f5f5]">
                            <MoreVertical size={18} color="#4f4f4f" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-5">
                        <span className="text-[10px] font-semibold tracking-wider text-[#b0b0b0] bg-[#f0f0f0] px-3 py-1 rounded-full uppercase">
                            Today, Oct 12
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="flex flex-col gap-4">
                        {chatMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "owner" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[420px] ${msg.sender === "owner" ? "items-end" : "items-start"} flex flex-col`}>
                                    <div
                                        className={`px-4 py-2.5 text-[13px] leading-relaxed ${
                                            msg.sender === "owner"
                                                ? "bg-[#953002] text-white rounded-[16px_16px_4px_16px]"
                                                : "bg-white border border-[#e0e0e0] text-[#1d1d1d] rounded-[16px_16px_16px_4px]"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className={`flex items-center gap-1.5 mt-1 ${msg.sender === "owner" ? "flex-row-reverse" : ""}`}>
                                        <span className="text-[10px] text-[#b0b0b0]">{msg.time}</span>
                                        {msg.read && (
                                            <span className="text-[10px] text-[#2e7d32]">✓✓</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <div className="px-5 py-3 border-t border-[#e0e0e0] bg-white">
                    <div className="flex items-center gap-2.5">
                        <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center justify-center hover:bg-[#f5f5f5] shrink-0">
                            <PlusCircle size={22} color="#828282" />
                        </button>
                        <div className="flex-1 flex items-center bg-[#f5f5f5] rounded-full px-4 py-2">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="border-none bg-transparent outline-none text-[13px] text-[#1d1d1d] flex-1"
                            />
                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center ml-2">
                                <Smile size={18} color="#b0b0b0" />
                            </button>
                        </div>
                        <button className="w-9 h-9 rounded-full bg-[#953002] border-none cursor-pointer flex items-center justify-center shrink-0 hover:bg-[#7a2801] transition-colors">
                            <Send size={16} color="#fff" className="translate-x-[1px]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ───── Right Panel: Automated Messaging ───── */}
            <div className="w-[220px] bg-white border-l border-[#e0e0e0] flex flex-col shrink-0">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#e0e0e0]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[12px] font-bold text-[#828282] tracking-wider uppercase m-0">
                            Automated Messaging
                        </h3>
                        <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center">
                            <SettingsIcon size={14} color="#828282" />
                        </button>
                    </div>

                    {/* Scheduled Replies Toggle */}
                    <div className="flex items-center justify-between bg-[#faf9f7] rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <Clock size={16} color="#953002" />
                            <div>
                                <span className="text-[12px] font-semibold text-[#1d1d1d] block">Scheduled Replies</span>
                                <span className="text-[10px] text-[#828282]">2 active flows</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setScheduledReplies(!scheduledReplies)}
                            className="w-10 h-[22px] rounded-full border-none cursor-pointer relative transition-colors duration-200 shrink-0"
                            style={{ background: scheduledReplies ? "#953002" : "#e0e0e0" }}
                        >
                            <div
                                className="w-[18px] h-[18px] rounded-full bg-white shadow-sm absolute top-[2px] transition-transform duration-200"
                                style={{ transform: scheduledReplies ? "translateX(20px)" : "translateX(2px)" }}
                            />
                        </button>
                    </div>
                </div>

                {/* Message Templates */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[11px] font-bold text-[#828282] tracking-wider uppercase m-0">
                            Message Templates
                        </h4>
                        <button className="bg-transparent border-none text-[11px] font-semibold text-[#953002] cursor-pointer">
                            Manage
                        </button>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {messageTemplates.map((tpl) => (
                            <button
                                key={tpl.title}
                                className="flex items-start gap-2.5 p-2.5 bg-[#faf9f7] rounded-lg border-none cursor-pointer text-left hover:bg-[#f5f0eb] transition-colors w-full"
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="text-[12px] font-semibold text-[#1d1d1d] block mb-0.5">
                                        {tpl.title}
                                    </span>
                                    <p className="text-[10px] text-[#828282] m-0 leading-snug line-clamp-2">
                                        {tpl.preview}
                                    </p>
                                </div>
                                <ChevronRight size={14} color="#b0b0b0" className="shrink-0 mt-0.5" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* New Automation Flow Button */}
                <div className="px-4 py-3 border-t border-[#e0e0e0]">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#953002] text-white border-none rounded-xl text-[12px] font-semibold cursor-pointer hover:bg-[#7a2801] transition-colors">
                        <Plus size={16} />
                        New Automation Flow
                    </button>
                </div>
            </div>
        </div>
    );
}
