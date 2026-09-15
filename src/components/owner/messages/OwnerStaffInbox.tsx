"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Send, Search, Users, ChevronDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/auth/auth.store";
import { ownerMessageApi, StaffConversationDto, InternalMessageDto } from "@/api/owner/owner-message.api";
import { Client } from "@stomp/stompjs";
import { getWsBrokerUrl } from "@/lib/ws";

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
  if (!iso) return "";
  return new Date(iso).toLocaleDateString();
}

interface OwnerStaffInboxProps {
  propertyId: number | "ALL";
}

export default function OwnerStaffInbox({ propertyId }: OwnerStaffInboxProps) {
  const [conversations, setConversations] = useState<StaffConversationDto[]>([]);
  const [messages, setMessages] = useState<InternalMessageDto[]>([]);
  const [activeStaffId, setActiveStaffId] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [sending, setSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const fetchConversations = async () => {
    try {
      const pid = propertyId === "ALL" ? undefined : propertyId;
      const data = await ownerMessageApi.getStaffConversations(pid);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load staff conversations", err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [propertyId]);

  useEffect(() => {
    let isMounted = true;
    const fetchMsgs = async () => {
      if (!activeStaffId) {
        setMessages([]);
        return;
      }
      setLoadingMsg(true);
      try {
        const conv = conversations.find(c => c.staffId === activeStaffId);
        if (conv) {
          const data = await ownerMessageApi.getStaffMessages(activeStaffId, conv.propertyId);
          if (isMounted) setMessages(data);
        }
      } catch (err) {
        console.error("Failed to load staff messages", err);
      } finally {
        if (isMounted) setLoadingMsg(false);
      }
    };
    fetchMsgs();
    
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStaffId]);

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
            
            // 1. Update the chat history if it matches the current active staff
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              
              // Only append if we are looking at this specific staff member
              if (
                activeStaffId &&
                (newMsg.senderId === activeStaffId || newMsg.receiverId === activeStaffId)
              ) {
                return [...prev, newMsg];
              }
              return prev;
            });

            // 2. Refresh conversations list to update 'latest message' and unread counts
            fetchConversations();
          }
        });
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [user?.userId, activeStaffId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeStaffId) return;
    
    const conv = conversations.find(c => c.staffId === activeStaffId);
    if (!conv) return;

    setSending(true);
    try {
      const newMsg = await ownerMessageApi.sendStaffMessage(activeStaffId, conv.propertyId, inputText);
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInputText("");
      // Refresh conv list to update latest message
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.staffName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const activeConversation = conversations.find(c => c.staffId === activeStaffId);

  return (
    <div className="flex h-full bg-white rounded-2xl border border-[#eadfce] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Pane: Staff List */}
      <div className="w-full md:w-1/3 border-r border-[#eadfce] flex flex-col bg-[#fafafa] flex-shrink-0">
        <div className="p-4 border-b border-[#eadfce] bg-white flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7d6d]" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff or property..." 
              className="pl-9 h-9 text-sm bg-white border-[#eadfce] focus-visible:ring-[#9a3300] focus-visible:border-[#9a3300] transition-colors rounded-xl placeholder:text-[#b3a591]" 
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2.5 gap-1">
            {loadingConv ? (
              <div className="text-center py-8 text-sm text-[#8b7d6d]">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#8b7d6d]">No staff conversations found.</div>
            ) : (
              filteredConversations.map((conv) => {
                const isNew = conv.unreadCount > 0;
                const isActive = activeStaffId === conv.staffId;
                
                return (
                  <button
                    key={conv.staffId}
                    onClick={() => setActiveStaffId(conv.staffId)}
                    className={`w-full text-left p-2.5 border-b border-[#eadfce] transition-colors relative flex items-start gap-2.5 ${
                      isActive ? "bg-white border-l-4 border-l-[#9a3300]" : isNew ? "bg-blue-50/60 hover:bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-white border-l-4 border-l-transparent"
                    }`}
                  >
                    <Avatar name={conv.staffName || "Staff"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold text-xs truncate flex items-center gap-1.5 ${isNew ? "text-blue-800" : "text-[#2d2116]"}`}>
                          {conv.staffName}
                          {isNew && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>}
                        </span>
                        <span className={`text-[9px] shrink-0 ${isNew ? "text-blue-600 font-bold" : "text-[#8b7d6d]"}`}>
                          {conv.latestMessageAt ? timeAgoOrDate(conv.latestMessageAt) : ""}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8b7d6d] truncate mb-0.5">{conv.staffRole} &bull; {conv.propertyName}</p>
                      <p className={`text-[11px] truncate ${isNew ? "text-blue-900 font-semibold" : "text-[#6f6254]"}`}>
                        {conv.latestMessageContent || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Middle Pane: Chat History */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
        {activeConversation ? (
          <>
            <div className="p-4 bg-white border-b border-[#eadfce] flex items-center justify-between z-10 sticky top-0 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={activeConversation.staffName || "Staff"} size="md" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#2d2116]">{activeConversation.staffName}</span>
                  <span className="text-[11px] text-[#8b7d6d]">{activeConversation.staffRole} &bull; {activeConversation.propertyName}</span>
                </div>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col bg-[#fafafa] custom-scrollbar"
            >
              {loadingMsg ? (
                <div className="text-center py-8 text-sm text-[#8b7d6d]">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[#8b7d6d] text-sm">
                  Send a message to your staff to start the conversation!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((msg, idx) => {
                    const isOwner = user?.userId ? msg.senderId === user.userId : false;
                    
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isOwner ? "justify-end" : "justify-start"}`}>
                        <div className="flex flex-col max-w-[70%]">
                          <div
                            className={`px-3.5 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words ${
                              isOwner
                                ? "bg-[#9a3300] text-white rounded-2xl rounded-tr-sm"
                                : "bg-white text-[#2d2116] border border-[#eadfce] rounded-2xl rounded-tl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span className={`text-[10px] mt-1 text-[#b3a591] ${isOwner ? "text-right" : "text-left"}`}>
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-[#eadfce] shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 h-11 rounded-xl px-4 bg-white border-[#eadfce] focus-visible:ring-[#9a3300] focus-visible:border-[#9a3300] text-sm"
                  disabled={sending}
                />
                <Button 
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="h-11 px-6 rounded-xl bg-[#9a3300] hover:bg-[#7a2800] text-white shadow-sm flex items-center gap-2 font-semibold transition-all shrink-0"
                >
                  {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8b7d6d]">
            <div className="w-16 h-16 rounded-full bg-[#f4eee6] flex items-center justify-center mb-4 text-[#d4c5b0]">
              <Users size={32} />
            </div>
            <h3 className="text-[#2d2116] font-bold text-lg mb-1">Staff Messages</h3>
            <p className="text-sm">Select a staff member to view your messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
