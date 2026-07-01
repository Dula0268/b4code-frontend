"use client";

import InboxList from "@/components/staff/messages/inbox-list";
import ThreadPanel from "@/components/staff/messages/thread-panel";
import StaffHeader from "@/components/staff/layout/staff-header";

export default function StaffMessages() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <StaffHeader
        title="Guest Messages"
        subtitle="Communicate with guests in real-time."
      />

      {/* 2-column: inbox + thread */}
      <div className="flex-1 flex min-h-0 overflow-hidden mt-[64px]">
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
