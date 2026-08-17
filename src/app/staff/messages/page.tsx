"use client";

import StaffPageLayout from "@/components/staff/layout/staff-page-layout";

export default function StaffMessagesPage() {
  return (
    <StaffPageLayout
      title="Guest Messages"
      subtitle="Communicate directly with guests"
    >
      <div className="bg-white rounded-2xl border border-[#eadfce] p-8 min-h-[500px] flex items-center justify-center text-center">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-[#2d2116] mb-2">Messaging is currently unavailable</h2>
          <p className="text-[#6f6254] text-sm">
            We are working on bringing this feature back soon.
          </p>
        </div>
      </div>
    </StaffPageLayout>
  );
}
