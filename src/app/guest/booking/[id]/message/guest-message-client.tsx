"use client";

import { useState, useEffect, useRef } from "react";
import { guestApi } from "@/api/guest/guest.api";
import { Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  content: string;
  senderRole: "GUEST" | "STAFF";
  createdAt: string;
}

export default function GuestMessageClient({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await guestApi.getConversation(bookingId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
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
      setMessages([...messages, sentMessage]);
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

      <div className="p-4 bg-[#fafafa] border-t border-[#eadfce]">
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
