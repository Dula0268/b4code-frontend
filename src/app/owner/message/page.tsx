/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import { messageApi } from "@/api/owner/message.api";
import {
    Bell, Search, Send, Loader2, MessageSquare,
    Building2, CheckCheck, Clock, User,
} from "lucide-react";

interface Conversation {
    conversationId: number;
    guestName: string;
    guestEmail: string;
    propertyName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    confirmationCode: string;
}

interface Message {
    id: number;
    conversationId: number;
    senderType: string;
    senderName: string;
    content: string;
    attachmentUrl?: string;
    isRead: boolean;
    sentAt: string;
}

function timeAgo(dateStr: string) {
    if (!dateStr) return "";
    try {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short" });
    } catch { return ""; }
}

function formatTime(dateStr: string) {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return ""; }
}

function formatDay(dateStr: string) {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return "Today";
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    } catch { return ""; }
}

export default function MessagePage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messageApi.getConversations()
            .then((data) => setConversations(Array.isArray(data) ? data : []))
            .catch(() => setConversations([]))
            .finally(() => setLoadingConvs(false));
    }, []);

    const loadMessages = useCallback(async (conv: Conversation) => {
        setSelected(conv);
        setLoadingMsgs(true);
        setMessages([]);
        try {
            const data = await messageApi.getMessages(conv.conversationId);
            setMessages(Array.isArray(data) ? data : []);
            await messageApi.markAsRead(conv.conversationId);
            setConversations((prev) =>
                prev.map((c) => c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c)
            );
        } catch {
            setMessages([]);
        } finally {
            setLoadingMsgs(false);
        }
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    async function handleSend() {
        if (!input.trim() || !selected || sending) return;
        const content = input.trim();
        setInput("");
        setSending(true);
        try {
            const sent: Message = await messageApi.sendMessage(selected.conversationId, content);
            setMessages((prev) => [...prev, sent]);
            setConversations((prev) =>
                prev.map((c) => c.conversationId === selected.conversationId
                    ? { ...c, lastMessage: content, lastMessageAt: sent.sentAt }
                    : c)
            );
        } catch {
            setInput(content);
        } finally {
            setSending(false);
        }
    }

    // Group messages by day
    function groupByDay(msgs: Message[]) {
        const groups: { day: string; messages: Message[] }[] = [];
        msgs.forEach((msg) => {
            const day = formatDay(msg.sentAt);
            const last = groups[groups.length - 1];
            if (last && last.day === day) last.messages.push(msg);
            else groups.push({ day, messages: [msg] });
        });
        return groups;
    }

    const filtered = conversations.filter((c) =>
        !search || c.guestName?.toLowerCase().includes(search.toLowerCase()) ||
        c.propertyName?.toLowerCase().includes(search.toLowerCase())
    );

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            <OwnerSidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center px-9 py-1.5 shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} color="#953002" />
                        <span className="text-[16px] font-extrabold text-[#1d1d1d]">Messages</span>
                        {totalUnread > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#953002] text-white rounded-full">{totalUnread}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Chat Layout */}
                <div className="flex flex-1 min-h-0 border-t border-[#e8e8e8]">

                    {/* ── Conversation List ── */}
                    <div className="w-[300px] shrink-0 border-r border-[#e8e8e8] flex flex-col bg-white">
                        {/* Search */}
                        <div className="px-3 py-3 border-b border-[#f0f0f0]">
                            <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-lg px-3 py-2">
                                <Search size={13} color="#b0b0b0" />
                                <input
                                    type="text"
                                    placeholder="Search guests…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-[12px] text-[#1d1d1d] placeholder:text-[#b0b0b0]"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingConvs ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 size={22} color="#953002" className="animate-spin" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                    <MessageSquare size={32} color="#c0a898" className="mb-2" />
                                    <p className="text-[12px] text-[#828282]">No conversations yet.</p>
                                </div>
                            ) : (
                                filtered.map((conv) => {
                                    const isSelected = selected?.conversationId === conv.conversationId;
                                    return (
                                        <button
                                            key={conv.conversationId}
                                            onClick={() => loadMessages(conv)}
                                            className={`w-full text-left px-4 py-3.5 border-b border-[#f5f5f5] transition-colors cursor-pointer border-none ${
                                                isSelected ? "bg-[#fef5ef]" : "bg-white hover:bg-[#fafafa]"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#fef5ef] border border-[#f0cdb4] flex items-center justify-center shrink-0 mt-0.5">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.guestEmail}`}
                                                        alt=""
                                                        className="w-full h-full rounded-full"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className={`text-[13px] truncate ${conv.unreadCount > 0 ? "font-bold text-[#1d1d1d]" : "font-semibold text-[#1d1d1d]"}`}>
                                                            {conv.guestName ?? "Guest"}
                                                        </span>
                                                        <span className="text-[10px] text-[#b0b0b0] shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Building2 size={10} color="#b0b0b0" className="shrink-0" />
                                                        <span className="text-[11px] text-[#828282] truncate">{conv.propertyName}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className={`text-[11px] truncate max-w-[160px] ${conv.unreadCount > 0 ? "text-[#4f4f4f] font-medium" : "text-[#b0b0b0]"}`}>
                                                            {conv.lastMessage || "No messages yet"}
                                                        </span>
                                                        {conv.unreadCount > 0 && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#953002] text-white rounded-full shrink-0 ml-1">
                                                                {conv.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── Chat Window ── */}
                    {!selected ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center bg-[#faf9f7]">
                            <div className="w-16 h-16 rounded-full bg-[#fef5ef] border border-[#f0cdb4] flex items-center justify-center">
                                <MessageSquare size={28} color="#953002" />
                            </div>
                            <div>
                                <div className="text-[15px] font-bold text-[#1d1d1d]">Select a conversation</div>
                                <p className="text-[12px] text-[#828282] mt-1">Choose a guest conversation from the left to start messaging.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
                            {/* Chat header */}
                            <div className="bg-white border-b border-[#e8e8e8] px-5 py-3 flex items-center gap-3 shrink-0">
                                <div className="w-9 h-9 rounded-full bg-[#fef5ef] border border-[#f0cdb4] flex items-center justify-center shrink-0">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.guestEmail}`}
                                        alt=""
                                        className="w-full h-full rounded-full"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-bold text-[#1d1d1d]">{selected.guestName ?? "Guest"}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Building2 size={11} color="#828282" />
                                        <span className="text-[11px] text-[#828282]">{selected.propertyName}</span>
                                        {selected.confirmationCode && (
                                            <span className="text-[10px] font-semibold text-[#953002] bg-[#fef5ef] px-2 py-0.5 rounded-full border border-[#f0cdb4]">
                                                #{selected.confirmationCode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-[#27ae60] font-semibold bg-[#eafaf1] px-2.5 py-1 rounded-full border border-[#a9dfbf]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" />
                                    Active
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {loadingMsgs ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 size={22} color="#953002" className="animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <MessageSquare size={28} color="#c0a898" className="mb-2" />
                                        <p className="text-[12px] text-[#828282]">No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    groupByDay(messages).map(({ day, messages: dayMsgs }) => (
                                        <div key={day}>
                                            {/* Day separator */}
                                            <div className="flex items-center gap-3 my-4">
                                                <div className="flex-1 h-px bg-[#e8e8e8]" />
                                                <span className="text-[10px] font-semibold text-[#b0b0b0] px-2 bg-[#faf9f7]">{day}</span>
                                                <div className="flex-1 h-px bg-[#e8e8e8]" />
                                            </div>

                                            {dayMsgs.map((msg) => {
                                                const isOwner = msg.senderType === "OWNER";
                                                return (
                                                    <div key={msg.id} className={`flex mb-3 ${isOwner ? "justify-end" : "justify-start"}`}>
                                                        {!isOwner && (
                                                            <div className="w-7 h-7 rounded-full bg-[#fef5ef] border border-[#f0cdb4] flex items-center justify-center shrink-0 mr-2 mt-1">
                                                                <User size={13} color="#953002" />
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[65%] flex flex-col ${isOwner ? "items-end" : "items-start"}`}>
                                                            {!isOwner && (
                                                                <span className="text-[10px] text-[#828282] mb-1 ml-1">{msg.senderName}</span>
                                                            )}
                                                            <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                                                isOwner
                                                                    ? "bg-[#953002] text-white rounded-br-sm"
                                                                    : "bg-white border border-[#e8e8e8] text-[#1d1d1d] rounded-bl-sm"
                                                            }`}>
                                                                {msg.content}
                                                            </div>
                                                            <div className={`flex items-center gap-1 mt-1 ${isOwner ? "flex-row-reverse" : "flex-row"}`}>
                                                                <span className="text-[10px] text-[#b0b0b0]">{formatTime(msg.sentAt)}</span>
                                                                {isOwner && (
                                                                    msg.isRead
                                                                        ? <CheckCheck size={11} color="#27ae60" />
                                                                        : <Clock size={10} color="#b0b0b0" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="bg-white border-t border-[#e8e8e8] px-4 py-3 shrink-0">
                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                                        }}
                                        placeholder="Type a message… (Enter to send)"
                                        rows={1}
                                        className="flex-1 py-2.5 px-3.5 border border-[#e0e0e0] rounded-xl text-[13px] outline-none focus:border-[#953002] bg-[#fafafa] resize-none leading-relaxed max-h-[120px] overflow-y-auto"
                                        style={{ minHeight: "42px" }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || sending}
                                        className="w-10 h-10 rounded-xl bg-[#953002] flex items-center justify-center border-none cursor-pointer hover:bg-[#b03a02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                                    >
                                        {sending
                                            ? <Loader2 size={16} color="#fff" className="animate-spin" />
                                            : <Send size={16} color="#fff" />
                                        }
                                    </button>
                                </div>
                                <p className="text-[10px] text-[#b0b0b0] mt-1.5 ml-1">Shift + Enter for new line</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
