"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useStaffChatStore } from "@/store/staff/messages/staff-chat.store";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function InboxList() {
  const conversations = useStaffChatStore((s) => s.conversations);
  const activeConvId = useStaffChatStore((s) => s.activeConvId);
  const selectConversation = useStaffChatStore((s) => s.selectConversation);
  const [search, setSearch] = useState("");

  const onlineCount = conversations.filter((c) => c.isOnline).length;
  const filtered = conversations.filter(
    (c) =>
      c.roomName.toLowerCase().includes(search.toLowerCase()) ||
      c.guestName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col border-r border-[var(--gray-5)]">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-[var(--gray-5)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[var(--black-2)]">Active Chats</h2>
          <Badge className="bg-[rgba(39,174,96,0.1)] text-[var(--state-success)] text-[10px] font-medium rounded-full px-2 py-0.5">
            {onlineCount} Online
          </Badge>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--gray-4)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-8 text-xs h-8 rounded-[8px] border-[var(--gray-5)]"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-4 py-2.5 flex gap-2.5 transition-colors border-l-[3px] ${
                  isActive
                    ? "bg-[rgba(149,48,2,0.04)] border-l-[var(--brand-primary)]"
                    : "border-l-transparent hover:bg-[rgba(0,0,0,0.02)]"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{conv.guestInitials}</span>
                  </div>
                  {conv.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--state-success)] border-2 border-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--black-2)] truncate">{conv.roomName}</p>
                    <span className="text-[9px] text-[var(--gray-3)] shrink-0 ml-1">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-[10px] text-[var(--gray-3)] truncate">{conv.guestName}</p>
                  <p className="text-[10px] text-[var(--gray-4)] mt-0.5 truncate">{conv.lastMessage}</p>
                </div>

                {/* Unread badge */}
                {conv.unread > 0 && (
                  <Badge className="bg-[var(--brand-primary)] text-white text-[9px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1 shrink-0 self-start mt-0.5">
                    {conv.unread}
                  </Badge>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-[var(--gray-3)] text-center py-6">No conversations found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
