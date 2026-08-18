"use client";

import { useState, useEffect, useRef } from "react";
import { guestApi } from "@/api/guest/guest.api";
import { Send, RefreshCw, MessageSquareText } from "lucide-react";
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
            const newMessage = JSON.parse(message.body);
            setMessages((prevMessages) => {
              // Prevent duplicates if REST API and WS race
              if (!prevMessages.find(m => m.id === newMessage.id)) {
                return [...prevMessages, newMessage];
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const sentMessage = await guestApi.sendMessage(bookingId, newMessage);
      setMessages((prev) => {
        if (!prev.find(m => m.id === sentMessage.id)) {
          return [...prev, sentMessage];
        }
        return prev;
      });
      setNewMessage("");
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
    <div className="bg-white rounded-2xl border border-[#eadfce] flex flex-col h-[600px] overflow-hidden shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#6f6254]">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isGuest = msg.senderRole === "GUEST";
            return (
              <div key={msg.id} className={`flex ${isGuest ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    isGuest
                      ? "bg-[#9a3300] text-white rounded-tr-none"
                      : "bg-[#f4eee6] text-[#2d2116] rounded-tl-none border border-[#e8ddcf]"
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

      <div className="p-4 bg-[#fafafa] border-t border-[#eadfce] flex flex-col gap-3">
        {/* Quick Requests */}
        {quickRequests.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {quickRequests.map((req) => (
              <button
                key={req.id}
                onClick={() => setNewMessage(req.keyword)}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-[#eadfce] rounded-full text-xs text-[#6f6254] hover:bg-[#f4eee6] transition-colors"
              >
                {req.keyword}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl bg-white border-[#eadfce] focus-visible:ring-[#9a3300]"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-xl px-4"
          >
            {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </div>
  );
}
