"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { staffApi } from "@/api/staff/staff.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { format } from "date-fns";
import { Client } from "@stomp/stompjs";
import { getWsBrokerUrl } from "@/lib/ws";
import { StaffQuickReplyDto } from "@/api/owner/owner-message.api";

export interface InternalMessageDto {
  id: number;
  propertyId: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

function Avatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  return (
    <div className="w-8 h-8 shrink-0 rounded-full bg-[#f4eee6] text-[#2d2116] border border-[#eadfce] flex items-center justify-center font-bold text-xs">
      {initial}
    </div>
  );
}

export default function StaffOwnerInbox() {
  const [messages, setMessages] = useState<InternalMessageDto[]>([]);
  const [quickReplies, setQuickReplies] = useState<StaffQuickReplyDto[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    Promise.all([
      staffApi.getStaffOwnerMessages(),
      staffApi.getStaffQuickReplies()
    ])
      .then(([msgs, replies]) => {
        setMessages(msgs);
        setQuickReplies(replies);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // WebSocket Subscription
  useEffect(() => {
    if (!user?.userId) return;

    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/user/${user.userId}/internal-messages`, (message) => {
          if (message.body) {
            const newMsg = JSON.parse(message.body) as InternalMessageDto;
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        });
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [user?.userId]);

  const handleSend = async (text: string) => {
    if (text.trim()) {
      try {
        const newMsg = await staffApi.sendStaffOwnerMessage(text);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
  };

  const handleSendClick = () => {
    handleSend(inputText);
    setInputText("");
  };

  return (
    <div className="flex h-full bg-white rounded-2xl border border-[#eadfce] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
        
        {/* Header */}
        <div className="p-4 bg-[#9a3300] border-b border-[#eadfce] flex items-center justify-between z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                Host <span className="h-2 w-2 rounded-full bg-green-400"></span>
              </span>
              <span className="text-[11px] text-white/80">Direct line to property owner</span>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col bg-[#fafafa] custom-scrollbar"
        >
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-[#8b7d6d] text-sm">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#8b7d6d] text-sm">
              No messages yet. Send a message to the host to start the conversation!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isStaff = user?.userId ? msg.senderId === user.userId : false;
                
                return (
                  <div key={msg.id} className={`flex gap-2 ${isStaff ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col max-w-[70%]">
                      <div
                        className={`px-3.5 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words ${
                          isStaff
                            ? "bg-[#9a3300] text-white rounded-2xl rounded-tr-sm"
                            : "bg-white text-[#2d2116] border border-[#eadfce] rounded-2xl rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className={`text-[10px] mt-1 text-[#b3a591] ${isStaff ? "text-right" : "text-left"}`}>
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#eadfce] shrink-0">
          {/* Quick Replies */}
          {quickReplies.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-1 custom-scrollbar hide-scrollbar-arrows no-scrollbar">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleSend(reply.name)}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full border border-slate-200 transition-colors shadow-sm font-medium"
                >
                  {reply.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message the host..."
              className="flex-1 h-11 rounded-full px-5 bg-white border-[#eadfce] focus-visible:ring-[#9a3300] focus-visible:border-[#9a3300] text-sm shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
            />
            <Button 
              onClick={handleSendClick} 
              disabled={!inputText.trim()}
              className={`h-11 w-11 rounded-full text-white shadow-sm flex items-center justify-center transition-colors shrink-0 p-0 ${
                inputText.trim() ? "bg-[#9a3300] hover:bg-[#7a2800]" : "bg-[#d7ae9b]"
              }`}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
