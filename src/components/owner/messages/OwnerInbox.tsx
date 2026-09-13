"use client";

import { useOwnerMessageStore, Conversation } from "@/store/owner/message.store";
import { useOwnerBookingStore } from "@/store/owner/booking.store";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Send, Check, CheckCheck, User, Search, Clock, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";

// ─── Shared helpers ─────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-8 h-8 text-[11px]" : "w-10 h-10 text-sm";
  return (
    <div className={`${dims} shrink-0 rounded-full bg-[#9a3300] text-white flex items-center justify-center font-bold`}>
      {getInitials(name)}
    </div>
  );
}

function timeAgoOrDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export default function OwnerInbox() {
  const { conversations, activeConversationId, setActiveConversation, sendMessage, properties, selectedPropertyId, setSelectedPropertyId } = useOwnerMessageStore();
  const { reservations } = useOwnerBookingStore();
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeReservation = activeConversation ? reservations.find(r => r.id === activeConversation.reservationId) : null;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const handleSend = () => {
    if (inputText.trim() && activeConversationId) {
      sendMessage(activeConversationId, inputText);
      setInputText("");
    }
  };

  return (
    <div className="flex h-full bg-white rounded-2xl border border-[#eadfce] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-1/3 border-r border-[#eadfce] flex flex-col bg-[#fafafa] flex-shrink-0">
        <div className="p-4 border-b border-[#eadfce] bg-white flex flex-col gap-3">
          
          <div className="flex gap-1 bg-[#f4eee6] rounded-xl p-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedPropertyId("ALL")}
              className={`whitespace-nowrap px-3 flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                selectedPropertyId === "ALL" ? "bg-white text-[#9a3300] shadow-sm" : "text-[#8b7d6d] hover:text-[#2d2116]"
              }`}
            >
              All
            </button>
            {properties.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`whitespace-nowrap px-3 flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                  selectedPropertyId === p.id ? "bg-white text-[#9a3300] shadow-sm" : "text-[#8b7d6d] hover:text-[#2d2116]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7d6d]" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..." 
              className="pl-9 h-9 text-sm bg-white border-[#eadfce] focus-visible:ring-[#9a3300] focus-visible:border-[#9a3300] transition-colors rounded-xl placeholder:text-[#b3a591]" 
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2.5 gap-1">
            {conversations
              .filter(c => selectedPropertyId === "ALL" || c.propertyId === selectedPropertyId)
              .filter(c => c.guestName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((conv) => {
                const isNew = conv.unreadCount > 0;
                const isActive = activeConversationId === conv.id;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full text-left p-2.5 border-b border-[#eadfce] transition-colors relative flex items-start gap-2.5 ${
                      isActive ? "bg-white border-l-4 border-l-[#9a3300]" : isNew ? "bg-blue-50/60 hover:bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-white border-l-4 border-l-transparent"
                    }`}
                  >
                    <Avatar name={conv.guestName || "Guest"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold text-xs truncate flex items-center gap-1.5 ${isNew ? "text-blue-800" : "text-[#2d2116]"}`}>
                          {conv.guestName}
                          {isNew && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>}
                        </span>
                        <span className={`text-[9px] shrink-0 ${isNew ? "text-blue-600 font-bold" : "text-[#8b7d6d]"}`}>
                          {conv.messages.length > 0 ? timeAgoOrDate(conv.messages[conv.messages.length - 1].timestamp) : ""}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isNew ? "text-blue-900 font-semibold" : "text-[#6f6254]"}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </ScrollArea>
      </div>

      {/* Middle Pane: Chat History */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
        {activeConversation ? (
          <>
            <div className="p-4 bg-white border-b border-[#eadfce] flex items-center justify-between z-10 sticky top-0 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={activeConversation.guestName || "Guest"} size="md" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#2d2116]">{activeConversation.guestName}</span>
                  <span className="text-[11px] text-[#8b7d6d]">{activeConversation.propertyName}</span>
                </div>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col bg-[#fafafa] custom-scrollbar"
            >
              <div className="flex flex-col gap-4">
                {activeConversation.messages.map((msg, idx) => {
                  const isOwner = msg.sender === "owner" || msg.sender === "staff";
                  const showAvatar = !isOwner && (idx === 0 || activeConversation.messages[idx - 1].sender !== msg.sender);
                  
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isOwner ? "justify-end" : "justify-start"}`}>
                      {!isOwner && (
                        <div className="w-8 shrink-0 flex items-end">
                          {showAvatar && <Avatar name={activeConversation.guestName} />}
                        </div>
                      )}
                      <div className="flex flex-col max-w-[70%]">
                        <div
                          className={`px-3.5 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words ${
                            isOwner
                              ? "bg-[#9a3300] text-white rounded-2xl rounded-tr-sm"
                              : "bg-white text-[#2d2116] border border-[#eadfce] rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className={`text-[10px] mt-1 text-[#b3a591] ${isOwner ? "text-right" : "text-left"}`}>
                          {format(new Date(msg.timestamp), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-[#eadfce] shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 h-11 rounded-xl px-4 bg-white border-[#eadfce] focus-visible:ring-[#9a3300] focus-visible:border-[#9a3300] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!inputText.trim()}
                  className="h-11 px-6 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white shadow-sm flex items-center gap-2 font-semibold transition-all shrink-0"
                >
                  <Send size={16} />
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8b7d6d]">
            <div className="w-16 h-16 rounded-full bg-[#f4eee6] flex items-center justify-center mb-4 text-[#d4c5b0]">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-[#2d2116] font-bold text-lg mb-1">No conversation selected</h3>
            <p className="text-sm">Select a guest to start messaging</p>
          </div>
        )}
      </div>

      {/* Right Pane: Contextual Sidebar */}
      {activeReservation && (
        <div className="w-[280px] border-l bg-slate-50/50 flex-shrink-0 hidden lg:block overflow-y-auto">
          <div className="p-5">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Info size={16} className="text-[var(--brand-primary)]" />
              Reservation Context
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Status</p>
                <Badge variant={activeReservation.status === "CONFIRMED" ? "default" : "secondary"}>
                  {activeReservation.status}
                </Badge>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Dates</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(activeReservation.checkIn), "MMM dd")} - {format(new Date(activeReservation.checkOut), "MMM dd")}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Room</p>
                <p className="font-medium text-slate-900">{activeReservation.roomType}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
