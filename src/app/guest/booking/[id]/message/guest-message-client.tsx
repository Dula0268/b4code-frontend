"use client";

import { useState, useEffect, useRef } from "react";
import { guestApi } from "@/api/guest/guest.api";
import { Send, RefreshCw, MessageSquareText, Sparkles, Clock, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client } from "@stomp/stompjs";
import { getWsBrokerUrl } from "@/lib/ws";

interface Message {
  id: number;
  content: string;
  senderRole: "GUEST" | "STAFF" | "OWNER";
  createdAt: string;
}

interface QuickRequest {
  id: number;
  keyword: string;
}

const GROUP_WINDOW_MS = 3 * 60 * 1000;

function formatBubbleTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

import { useSearchParams } from "next/navigation";

export default function GuestMessageClient({ bookingId }: { bookingId: string }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "owner" ? "owner" : "staff";
  const [activeTab, setActiveTab] = useState<"staff" | "owner">(initialTab);
  
  // States for Staff Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickRequests, setQuickRequests] = useState<QuickRequest[]>([]);
  const [ownerQuickRequests, setOwnerQuickRequests] = useState<QuickRequest[]>([]);
  
  // States for Owner Chat
  const [ownerMessages, setOwnerMessages] = useState<Message[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ownerMessagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const [data, qrData, ownerData] = await Promise.all([
        guestApi.getConversation(bookingId, "STAFF"),
        guestApi.getActiveQuickRequests(bookingId),
        guestApi.getConversation(bookingId, "OWNER").catch(() => []), 
      ]);
      setMessages(data);
      if (qrData) {
        setQuickRequests(qrData.filter((r: any) => r.targetRole === "STAFF" || !r.targetRole));
        setOwnerQuickRequests(qrData.filter((r: any) => r.targetRole === "OWNER"));
      }
      setOwnerMessages(ownerData || []);
      setError(null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setError("Messaging is only available while you are checked in at the property.");
      } else {
        console.error("Failed to load messages or quick requests", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll for access if currently locked
  useEffect(() => {
    if (error) {
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [error]);

  useEffect(() => {
    fetchMessages();

    // WebSocket Connection
    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        // Staff Topic
        client.subscribe(`/topic/booking/${bookingId}`, (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body);
            if (parsed.type === "CONFIG_UPDATE") {
              if (parsed.staffRules) setQuickRequests(parsed.staffRules);
              if (parsed.ownerRules) setOwnerQuickRequests(parsed.ownerRules);
              return;
            }
            setMessages((prev) => (!prev.find((m) => m.id === parsed.id) ? [...prev, parsed] : prev));
          }
        });
        
        // Owner Topic
        client.subscribe(`/topic/booking/${bookingId}/owner`, (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body);
            setOwnerMessages((prev) => (!prev.find((m) => m.id === parsed.id) ? [...prev, parsed] : prev));
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [bookingId]);

  useEffect(() => {
    if (activeTab === "staff") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      ownerMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, ownerMessages, activeTab]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;

    setSending(true);
    try {
      const targetRole = activeTab === "staff" ? "STAFF" : "OWNER";
      const sentMessage = await guestApi.sendMessage(bookingId, textToSend, targetRole);
      
      if (activeTab === "staff") {
        setMessages((prev) => (!prev.find((m) => m.id === sentMessage.id) ? [...prev, sentMessage] : prev));
      } else {
        setOwnerMessages((prev) => (!prev.find((m) => m.id === sentMessage.id) ? [...prev, sentMessage] : prev));
      }
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickRequestTap = (keyword: string) => {
    setNewMessage(keyword);
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 w-full h-full items-center justify-center bg-white">
        <RefreshCw size={24} className="animate-spin text-[#9a3300]" />
        <p className="text-sm text-[#8b7d6d] mt-3 font-medium">Loading your conversation...</p>
      </div>
    );
  }

  const renderLockedStaffState = () => (
    <div className="flex flex-col flex-1 w-full h-full">

      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-5 border border-orange-100/60">
          <Clock className="w-9 h-9 text-[#9a3300]" />
        </div>
        <h3 className="text-xl font-bold text-[#2d2116] mb-2">Messaging Locked</h3>
        <p className="text-[#8b7d6d] max-w-sm leading-relaxed">{error}</p>
        <p className="text-xs text-[#b3a591] mt-4 font-medium">Checking again automatically&hellip;</p>
      </div>
    </div>
  );

  const renderMessageList = (msgList: Message[], role: "staff" | "owner") => {
    const decorated = msgList.map((msg, idx) => {
      const prev = msgList[idx - 1];
      const next = msgList[idx + 1];
      const sameSenderAsPrev = !!prev && prev.senderRole === msg.senderRole && new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;
      const sameSenderAsNext = !!next && next.senderRole === msg.senderRole && new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() < GROUP_WINDOW_MS;
      const showDayDivider = idx === 0 || formatDayLabel(msg.createdAt) !== formatDayLabel(msgList[idx - 1].createdAt);
      return { msg, isGroupStart: !sameSenderAsPrev, isGroupEnd: !sameSenderAsNext, showDayDivider };
    });

    if (msgList.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#9a3300]/10 text-[#9a3300]">
            {role === "staff" ? <MessageSquareText size={32} /> : <UserRound size={32} />}
          </div>
          <p className="text-lg font-bold text-[#2d2116]">{role === "staff" ? "How can we help?" : "Message the Host"}</p>
          <p className="text-[#8b7d6d] text-sm mt-1 max-w-[250px]">
            {role === "staff" ? "Send us a message or choose a quick request below." : "Have a specific question for the owner? Ask here."}
          </p>
        </div>
      );
    }

    return decorated.map(({ msg, isGroupStart, isGroupEnd, showDayDivider }) => {
      const isGuest = msg.senderRole === "GUEST";
      const senderName = role === "staff" ? "Front Desk" : "Host";
      const primaryColor = "bg-[#9a3300]";
      const primaryTextColor = "text-[#9a3300]";

      return (
        <div key={msg.id}>
          {showDayDivider && (
            <div className="flex items-center justify-center my-4">
              <span className="text-[11px] font-semibold text-[#8b7d6d] bg-white border border-[#eadfce] px-3 py-1 rounded-full shadow-sm">
                {formatDayLabel(msg.createdAt)}
              </span>
            </div>
          )}
          <div className={`flex ${isGuest ? "justify-end" : "justify-start"} ${isGroupStart ? "mt-3" : "mt-0.5"}`}>
            <div className="flex flex-col max-w-[82%] sm:max-w-[70%]">

              <div
                className={`px-3.5 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words ${
                  isGuest
                    ? `${primaryColor} text-white rounded-2xl ${isGroupEnd ? "rounded-tr-md" : "rounded-tr-2xl"} ${isGroupStart ? "" : "rounded-tr-md"}`
                    : `bg-white text-[#2d2116] border border-[#eadfce] rounded-2xl ${isGroupStart ? "" : "rounded-tl-md"}`
                }`}
              >
                {msg.content}
              </div>
              {isGroupEnd && (
                <span className={`text-[10px] mt-1 text-[#b3a591] ${isGuest ? "text-right mr-1" : "ml-1"}`}>
                  {formatBubbleTime(msg.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col flex-1 w-full relative h-full overflow-hidden">

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto p-0 sm:p-4 md:p-8 min-h-0 flex-col">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "staff" | "owner")} className="flex flex-col flex-1 h-full min-h-0">
          <div className="px-4 sm:px-0 mb-4 shrink-0 flex items-center">
            <TabsList className="bg-[#f1f5f9] p-1 rounded-xl h-auto">
              <TabsTrigger 
                value="staff" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[15px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm text-[#64748b] transition-all"
              >
                <MessageSquareText size={16} />
                Staff
              </TabsTrigger>
              <TabsTrigger 
                value="owner" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-[15px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f172a] data-[state=active]:shadow-sm text-[#64748b] transition-all"
              >
                <UserRound size={16} />
                Owner
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="staff" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col">
            {error ? renderLockedStaffState() : (
              <div className="flex-1 bg-white sm:rounded-3xl border-0 sm:border border-[#eadfce] flex flex-col overflow-hidden sm:shadow-sm relative">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#9a3300] to-[#7a2800] p-3.5 sm:p-4 flex items-center justify-between text-white shrink-0 z-10 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <MessageSquareText size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base sm:text-lg leading-tight text-white">Staff</h2>
                        <span className="flex h-2 w-2 rounded-full bg-green-400 border border-green-200"></span>
                      </div>
                      <p className="text-white/80 text-[11px] sm:text-xs font-medium">We typically reply in a few minutes</p>
                    </div>
                  </div>
                </div>

                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 bg-[#fafafa]">
                  {renderMessageList(messages, "staff")}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick requests + composer */}
                <div className="bg-white border-t border-[#eadfce] shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                  {quickRequests.length > 0 && (
                    <div className="px-3 sm:px-4 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <Sparkles size={14} className="text-[#9a3300] shrink-0" />
                      {quickRequests.map((req) => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => handleQuickRequestTap(req.keyword)}
                          disabled={sending}
                          className="shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full bg-orange-50/80 border border-[#eadfce] text-[#7a2800] text-xs font-semibold hover:bg-orange-100 hover:border-[#9a3300]/40 transition-all disabled:opacity-50"
                        >
                          {req.keyword}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="p-3 sm:p-4 flex flex-col gap-3">
                    <form onSubmit={handleSend} className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-full bg-[#fafafa] border-[#eadfce] focus-visible:ring-[#9a3300] px-4 h-11"
                        disabled={sending}
                      />
                      <Button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-full w-11 h-11 p-0 shrink-0 shadow-sm"
                      >
                        {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="owner" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden flex flex-col">
            <div className="flex-1 bg-white sm:rounded-3xl border-0 sm:border border-[#eadfce] flex flex-col overflow-hidden sm:shadow-sm relative">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#9a3300] to-[#7a2800] p-3.5 sm:p-4 flex items-center justify-between text-white shrink-0 z-10 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <UserRound size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-base sm:text-lg leading-tight text-white">Host</h2>
                      <span className="flex h-2 w-2 rounded-full bg-green-400 border border-green-200"></span>
                    </div>
                    <p className="text-white/80 text-[11px] sm:text-xs font-medium">Direct line to property owner</p>
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 bg-[#fafafa]">
                {renderMessageList(ownerMessages, "owner")}
                <div ref={ownerMessagesEndRef} />
              </div>

              {/* Composer */}
              <div className="bg-white border-t border-[#eadfce] shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                {ownerQuickRequests.length > 0 && (
                  <div className="px-3 sm:px-4 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <Sparkles size={14} className="text-[#9a3300] shrink-0" />
                    {ownerQuickRequests.map((req) => (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => handleQuickRequestTap(req.keyword)}
                        disabled={sending}
                        className="shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full bg-orange-50/80 border border-[#eadfce] text-[#7a2800] text-xs font-semibold hover:bg-orange-100 hover:border-[#9a3300]/40 transition-all disabled:opacity-50"
                      >
                        {req.keyword}
                      </button>
                    ))}
                  </div>
                )}
                <div className="p-3 sm:p-4 flex flex-col gap-3">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Message the host..."
                      className="flex-1 rounded-full bg-[#fafafa] border-[#eadfce] focus-visible:ring-[#9a3300] px-4 h-11"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-full w-11 h-11 p-0 shrink-0 shadow-sm"
                    >
                      {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
