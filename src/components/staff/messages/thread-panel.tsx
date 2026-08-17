"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, MoreVertical, Send, ChevronLeft } from "lucide-react";
import { useStaffChatStore, QUICK_REPLIES } from "@/store/staff/messages/staff-chat.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ThreadPanel() {
  const activeConv = useStaffChatStore((s) => s.getActiveConversation());
  const sendMessage = useStaffChatStore((s) => s.sendMessage);
  const selectConversation = useStaffChatStore((s) => s.selectConversation);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages.length]);

  if (!activeConv) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[var(--gray-3)]">
        Select a conversation to start messaging.
      </div>
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(activeConv.id, draft.trim());
    setDraft("");
  };

  const handleQuickReply = (text: string) => {
    sendMessage(activeConv.id, text);
  };

  return (
    <div className="h-full flex flex-col bg-white lg:bg-transparent">
      {/* Chat header */}
      <div className="flex-none px-4 py-2.5 border-b border-[var(--gray-5)] flex items-center gap-3">
        <button 
          onClick={() => selectConversation(null)}
          className="lg:hidden p-1.5 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors -ml-2"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
          <span className="text-xs font-bold text-white">{activeConv.guestInitials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-[var(--black-2)]">{activeConv.roomName}</p>
            {activeConv.isOnline && <span className="w-2 h-2 rounded-full bg-[var(--state-success)]" />}
          </div>
          <p className="text-[10px] text-[var(--gray-3)] truncate">
            {activeConv.guestName} · Checked in {activeConv.checkedIn}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <Phone size={14} />
          </button>
          <button className="p-1.5 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        <div className="flex flex-col gap-2.5">
          {activeConv.messages.map((msg) => {
            const isStaff = msg.sender === "staff";
            return (
              <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                <div className="flex items-end gap-1.5 max-w-[70%]">
                  {!isStaff && (
                    <div className="w-6 h-6 rounded-full bg-[var(--gray-5)] flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-[var(--gray-2)]">{activeConv.guestInitials}</span>
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-3 py-2 rounded-[10px] ${
                        isStaff
                          ? "bg-[var(--brand-primary)] text-white rounded-br-sm"
                          : "bg-white border border-[var(--gray-5)] text-[var(--black-2)] rounded-bl-sm"
                      }`}
                    >
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                    </div>
                    <p className={`text-[9px] text-[var(--gray-4)] mt-0.5 ${isStaff ? "text-right" : ""}`}>{msg.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick replies + Input */}
      <div className="flex-none border-t border-[var(--gray-5)] px-4 py-2.5 flex flex-col gap-2">
        {/* Quick reply chips */}
        <div className="flex gap-1.5 flex-wrap">
          {QUICK_REPLIES.map((text) => (
            <button
              key={text}
              onClick={() => handleQuickReply(text)}
              className="text-[10px] text-[var(--brand-primary)] bg-[rgba(149,48,2,0.06)] hover:bg-[rgba(149,48,2,0.12)] rounded-full px-2.5 py-1 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Message input */}
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="text-xs h-8 rounded-[8px] border-[var(--gray-5)] flex-1"
          />
          <Button size="sm" className="bg-[var(--brand-primary)] text-white h-8 w-8 p-0 shrink-0" onClick={handleSend} disabled={!draft.trim()}>
            <Send size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
