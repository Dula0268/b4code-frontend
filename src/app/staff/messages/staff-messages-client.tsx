"use client";

import { useState, useEffect, useRef } from "react";
import { staffApi } from "@/api/staff/staff.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { Send, RefreshCw, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Conversation {
  bookingId: number;
  confirmationCode: string;
  guestName: string;
  propertyName: string;
  latestMessageContent: string;
  latestMessageAt: string;
}

interface Message {
  id: number;
  content: string;
  senderRole: "GUEST" | "STAFF";
  createdAt: string;
}

export default function StaffMessagesClient() {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!user?.propertyId) return;
    try {
      const data = await staffApi.getConversations(user.propertyId);
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (user?.propertyId) fetchConversations();
  }, [user?.propertyId]);

  const fetchMessages = async (bookingId: number) => {
    setLoadingMsg(true);
    try {
      const data = await staffApi.getConversation(bookingId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoadingMsg(false);
    }
  };

  useEffect(() => {
    if (activeBookingId) {
      fetchMessages(activeBookingId);
    }
  }, [activeBookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeBookingId) return;

    setSending(true);
    try {
      const sentMessage = await staffApi.sendMessage(activeBookingId, newMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage("");
      // Refresh conversations list to update latest message
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  if (loadingConv) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <RefreshCw size={24} className="animate-spin text-[#9a3300]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#eadfce] flex h-[600px] overflow-hidden shadow-sm">
      {/* Left Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-[#eadfce] flex flex-col bg-[#fafafa]">
        <div className="p-4 border-b border-[#eadfce] bg-white">
          <h2 className="text-lg font-bold text-[#2d2116] flex items-center gap-2">
            <MessageSquare size={18} /> Active Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#8b7d6d] text-sm">
              No messages found.
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.bookingId}
                onClick={() => setActiveBookingId(conv.bookingId)}
                className={`w-full text-left p-4 border-b border-[#eadfce] transition-colors ${
                  activeBookingId === conv.bookingId ? "bg-white border-l-4 border-l-[#9a3300]" : "hover:bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[#2d2116] text-sm truncate">{conv.guestName}</span>
                  <span className="text-[10px] text-[#8b7d6d] shrink-0">
                    {new Date(conv.latestMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#9a3300] mb-1">Ref: {conv.confirmationCode}</div>
                <p className="text-xs text-[#6f6254] truncate">{conv.latestMessageContent}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeBookingId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-[#8b7d6d]">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#eadfce] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#2d2116]">
                  {conversations.find((c) => c.bookingId === activeBookingId)?.guestName}
                </h3>
                <p className="text-xs text-[#8b7d6d]">
                  Booking Ref: {conversations.find((c) => c.bookingId === activeBookingId)?.confirmationCode}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMsg ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw size={20} className="animate-spin text-[#8b7d6d]" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isStaff = msg.senderRole === "STAFF";
                  return (
                    <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          isStaff
                            ? "bg-[#9a3300] text-white rounded-tr-none"
                            : "bg-[#f4eee6] text-[#2d2116] rounded-tl-none border border-[#e8ddcf]"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isStaff ? "text-white/70" : "text-[#8b7d6d]"}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[#fafafa] border-t border-[#eadfce]">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-xl bg-white border-[#eadfce] focus-visible:ring-[#9a3300]"
                  disabled={sending || loadingMsg}
                />
                <Button
                  type="submit"
                  disabled={sending || loadingMsg || !newMessage.trim()}
                  className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-xl px-4"
                >
                  {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
