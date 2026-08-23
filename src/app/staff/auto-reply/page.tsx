import AutoReplyClient from "./auto-reply-client";
import StaffHeader from "@/components/staff/layout/staff-header";

export default function AutoReplyPage() {
  return (
    <>
      <StaffHeader
        title="Auto-Reply"
        subtitle="Set up automatic replies to common guest questions"
      />
      <main className="mt-[64px] flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 max-w-4xl mx-auto">
          <AutoReplyClient />
        </div>
      </main>
    </>
  );
}
