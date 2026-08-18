"use client";

import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import StaffMessagesClient from "./staff-messages-client";

export default function StaffMessagesPage() {
  return (
    <StaffPageLayout
      title="Guest Messages"
      subtitle="Communicate directly with guests"
    >
      <StaffMessagesClient />
    </StaffPageLayout>
  );
}
