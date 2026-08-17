"use client";

import InboxList from "@/components/staff/messages/inbox-list";
import ThreadPanel from "@/components/staff/messages/thread-panel";
import StaffHeader from "@/components/staff/layout/staff-header";
import { useStaffChatStore } from "@/store/staff/messages/staff-chat.store";

export default function StaffMessages() {
  const activeConvId = useStaffChatStore((s) => s.activeConvId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <StaffHeader
        title="Guest Messages"
        subtitle="Communicate with guests in real-time."
      />

      {/* 2-column: inbox + thread */}
      <div className="flex-1 flex justify-center min-h-0 overflow-hidden mt-[64px]">
        <div className="flex w-full max-w-7xl h-full">
          <div className={`w-full lg:w-[300px] shrink-0 ${activeConvId ? 'hidden lg:block' : 'block'}`}>
            <InboxList />
          </div>
          <div className={`flex-1 ${activeConvId ? 'block' : 'hidden lg:block'}`}>
            <ThreadPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
