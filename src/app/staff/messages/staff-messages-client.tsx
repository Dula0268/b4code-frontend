"use client";

import { useState, useEffect, useRef } from "react";
import { staffApi } from "@/api/staff/staff.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { Send, RefreshCw, MessageSquare, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@stomp/stompjs";
import { useStaffBookingsStore } from "@/store/staff/bookings/staff-bookings.store";
import AutoReplyClient from "../auto-reply/auto-reply-client";

interface Conversation {
  bookingId: number;
  confirmationCode: string;
  guestName: string;
  propertyName: string;
  latestMessageContent: string;
  latestMessageAt: string;
  latestMessageSenderRole: string;
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
  const activeBookingIdRef = useRef<number | null>(null);

  const setUnreadMessagesCount = useStaffBookingsStore((state) => state.setUnreadMessagesCount);

  useEffect(() => {
    activeBookingIdRef.current = activeBookingId;
  }, [activeBookingId]);

  const fetchConversations = async () => {
    if (!user?.propertyId) return;
    try {
      const data = await staffApi.getConversations(user.propertyId);
      setConversations(data);
      const unrepliedCount = data.filter((c: Conversation) => c.latestMessageSenderRole === 'GUEST').length;
      setUnreadMessagesCount(unrepliedCount);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (user?.propertyId) {
      fetchConversations();
      
      const client = new Client({
        brokerURL: "ws://localhost:8080/ws/messages/raw",
        reconnectDelay: 5000,
        onConnect: () => {
          console.log("Staff WS Connected");
          client.subscribe(`/topic/property/${user.propertyId}/messages`, (message) => {
            if (message.body) {
              const newMsg = JSON.parse(message.body);
              
              if (activeBookingIdRef.current && activeBookingIdRef.current.toString() === newMsg.bookingId.toString()) {
                setMessages((prev) => {
                  if (!prev.find(m => m.id === newMsg.id)) {
                    return [...prev, newMsg];
                  }
                  return prev;
                });
              }
              // Refresh conversations list to show new latest message
              fetchConversations();
            }
          });
        }
      });
      
      client.activate();
      return () => {
        client.deactivate();
      };
    }
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
      setMessages((prev) => {
        if (!prev.find(m => m.id === sentMessage.id)) {
          return [...prev, sentMessage];
        }
        return prev;
      });
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
    <div className="bg-white rounded-2xl border border-[#eadfce] flex h-[calc(100vh-60px)] min-h-[600px] overflow-hidden shadow-sm">
      {/* Left Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-[#eadfce] flex flex-col bg-[#fafafa]">
        <div className="p-4 border-b border-[#eadfce] bg-white flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#2d2116] flex items-center gap-2">
            <MessageSquare size={18} /> Conversations
          </h2>
          <Button 
            onClick={() => setActiveBookingId(null)}
            variant={!activeBookingId ? "default" : "outline"}
            size="sm" 
            className={`h-8 text-xs ${!activeBookingId ? 'bg-[#9a3300] hover:bg-[#7a2800] text-white' : 'border-[#eadfce] text-[#6f6254] hover:bg-[#f4eee6]'}`}
          >
            <Settings size={14} className="mr-1" />
            Auto-Reply
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#8b7d6d] text-sm">
              No messages found.
            </div>
          ) : (
            conversations.map((conv) => {
              const isUnreplied = conv.latestMessageSenderRole === "GUEST";
              return (
              <button
                key={conv.bookingId}
                onClick={() => setActiveBookingId(conv.bookingId)}
                className={`w-full text-left p-4 border-b border-[#eadfce] transition-colors relative ${
                  activeBookingId === conv.bookingId ? "bg-white border-l-4 border-l-[#9a3300]" : isUnreplied ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm truncate flex items-center gap-2 ${isUnreplied ? 'text-[#9a3300]' : 'text-[#2d2116]'}`}>
                    {conv.guestName}
                    {isUnreplied && <span className="h-2 w-2 rounded-full bg-red-500"></span>}
                  </span>
                  <span className={`text-[10px] shrink-0 ${isUnreplied ? 'text-[#9a3300] font-medium' : 'text-[#8b7d6d]'}`}>
                    {new Date(conv.latestMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#9a3300] mb-1">Ref: {conv.confirmationCode}</div>
                <p className={`text-xs truncate ${isUnreplied ? 'text-[#2d2116] font-medium' : 'text-[#6f6254]'}`}>{conv.latestMessageContent}</p>
              </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeBookingId ? (
          <div className="flex-1 overflow-y-auto bg-[#fafafa] p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#2d2116]">Auto-Reply Configuration</h2>
              <p className="text-[#8b7d6d] mt-1">Set up automatic replies to common guest questions using keywords.</p>
            </div>
            <AutoReplyClient />
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
