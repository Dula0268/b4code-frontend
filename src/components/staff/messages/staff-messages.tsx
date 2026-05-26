"use client";

import InboxList from "@/components/staff/messages/inbox-list";
import ThreadPanel from "@/components/staff/messages/thread-panel";

export default function StaffMessages() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none px-5 py-3 border-b border-[var(--gray-5)]">
        <h1 className="text-sm font-bold text-[var(--black-2)]">Guest Messages</h1>
        <p className="text-[10px] text-[var(--gray-3)]">Communicate with guests in real-time.</p>
      </div>

      {/* 2-column: inbox + thread */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-[300px] shrink-0">
          <InboxList />
        </div>
        <div className="flex-1">
          <ThreadPanel />
        </div>
      </div>
    </div>
  );
}
