"use client";

import { useState, useEffect, useRef } from "react";
import { guestApi } from "@/api/guest/guest.api";
import { Send, RefreshCw, MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@stomp/stompjs";

interface Message {
  id: number;
  content: string;
  senderRole: "GUEST" | "STAFF";
  createdAt: string;
}

export default function GuestMessageClient({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quickRequests, setQuickRequests] = useState<{id: number, keyword: string}[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const [data, qrData] = await Promise.all([
        guestApi.getConversation(bookingId),
        guestApi.getActiveQuickRequests(bookingId)
      ]);
      setMessages(data);
      setQuickRequests(qrData || []);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 403) {
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
      brokerURL: "ws://localhost:8080/ws/messages/raw",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");
        client.subscribe(`/topic/booking/${bookingId}`, (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body);
            
            // Handle config update broadcasts
            if (parsed.type === "CONFIG_UPDATE") {
              if (parsed.data) {
                setQuickRequests(parsed.data);
              }
              return;
            }
            
            // Handle normal chat messages
            setMessages((prevMessages) => {
              if (!prevMessages.find(m => m.id === parsed.id)) {
                return [...prevMessages, parsed];
              }
              return prevMessages;
            });
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      debug: (str) => {
        // console.log(new Date(), str);
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || newMessage.trim();
    if (!textToSend) return;

    setSending(true);
    try {
      const sentMessage = await guestApi.sendMessage(bookingId, textToSend);
      setMessages((prev) => {
        if (!prev.find(m => m.id === sentMessage.id)) {
          return [...prev, sentMessage];
        }
        return prev;
      });
      if (!textOverride) setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#eadfce] p-6 min-h-[400px] flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-[#9a3300]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <MessageSquareText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Messaging Locked</h3>
        <p className="text-gray-500 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full relative h-full overflow-hidden">
      {/* Rich Banner Header - Edge to Edge */}
      <div className="bg-[#833100] w-full px-6 py-5 md:px-10 md:py-6 shadow-md shrink-0">
        <div className="flex items-center gap-2 text-white font-bold tracking-wider text-xs uppercase mb-1.5 opacity-90">
          <MessageSquareText size={16} /> GUEST SERVICES
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#facc15] mb-1.5">Front Desk Support</h1>
        <p className="text-white/90 text-sm md:text-base max-w-2xl">
          Get in touch with the front desk for any assistance. We&apos;re here to make your stay perfect.
        </p>
      </div>

      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-8 min-h-0">
      {/* Left Panel: Quick Requests Sidebar */}
      {quickRequests.length > 0 && (
        <div className="w-[320px] bg-white rounded-3xl border border-[#eadfce] p-6 shadow-sm flex flex-col shrink-0 overflow-y-auto">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#2d2116] flex items-center gap-2">
              <Sparkles size={18} className="text-[#9a3300]" /> Quick Requests
            </h3>
            <p className="text-[#8b7d6d] text-xs mt-1">Tap a card to instantly send a request to the front desk.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {quickRequests.map((req) => (
              <button
                key={req.id}
                onClick={() => handleSend(undefined, req.keyword)}
                disabled={sending}
                className="w-full text-center p-4 bg-white border border-[#eadfce] rounded-2xl hover:bg-orange-50 hover:border-[#9a3300]/30 transition-all shadow-sm disabled:opacity-50"
              >
                 <span className="font-semibold text-[#2d2116] text-sm leading-snug">{req.keyword}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 bg-white rounded-3xl border border-[#eadfce] flex flex-col overflow-hidden shadow-sm relative">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#9a3300] to-[#7a2800] p-4 flex items-center justify-between text-white shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <MessageSquareText size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg leading-tight text-white">Front Desk</h2>
              <span className="flex h-2 w-2 rounded-full bg-green-400 border border-green-200"></span>
            </div>
            <p className="text-white/80 text-xs font-medium">We typically reply in a few minutes</p>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#9a3300]/10 rounded-full flex items-center justify-center mb-4 text-[#9a3300]">
               <MessageSquareText size={32} />
            </div>
            <p className="text-lg font-bold text-[#2d2116]">How can we help?</p>
            <p className="text-[#8b7d6d] text-sm mt-1 max-w-[250px]">Send us a message or choose a quick request below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isGuest = msg.senderRole === "GUEST";
            return (
              <div key={msg.id} className={`flex ${isGuest ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
                    isGuest
                      ? "bg-[#9a3300] text-white rounded-tr-none"
                      : "bg-white text-[#2d2116] rounded-tl-none border border-[#eadfce]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isGuest ? "text-white/70" : "text-[#8b7d6d]"}`}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-[#eadfce] flex flex-col gap-3 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-[#fafafa] border-[#eadfce] focus-visible:ring-[#9a3300] px-4"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-full px-5 shadow-sm"
          >
            {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </div>
      </div>
      </div>
    </div>
  );
}
