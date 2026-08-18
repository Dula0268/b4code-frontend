import AutoReplyClient from "./auto-reply-client";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";

export default function AutoReplyPage() {
  return (
    <StaffPageLayout>
      <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2d2116] mb-2">Auto-Reply Configuration</h1>
          <p className="text-[#6f6254]">
            Set up automatic replies to common guest questions using keywords.
          </p>
        </div>
        <AutoReplyClient />
      </div>
    </StaffPageLayout>
  );
}
