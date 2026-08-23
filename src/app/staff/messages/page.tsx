"use client";

import StaffHeader from "@/components/staff/layout/staff-header";
import StaffMessagesClient from "./staff-messages-client";
import { useAuthStore } from "@/store/auth/auth.store";

export default function StaffMessagesPage() {
  const user = useAuthStore((state) => state.user);
  const staffRole = user?.profile?.staffRole || "Staff Admin";

  const subtitle =
    staffRole === "Kitchen Staff"
      ? "Communicate with guests about their orders"
      : staffRole === "Property Staff"
      ? "Communicate directly with guests about their stay"
      : "Communicate with guests about their stay and their orders";

  return (
    <>
      <StaffHeader
        title="Messages"
        subtitle={subtitle}
        searchPlaceholder="Search conversations..."
      />
      <main className="mt-[64px] flex-1 min-h-0 overflow-hidden">
        <StaffMessagesClient />
      </main>
    </>
  );
}
