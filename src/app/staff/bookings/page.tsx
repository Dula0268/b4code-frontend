import { Metadata } from "next";
import StaffBookingsClient from "./staff-bookings-client";

export const metadata: Metadata = {
  title: "Staff Bookings | b4code",
  description: "Manage guest bookings, check-in, and check-out.",
};

export default function StaffBookingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <StaffBookingsClient />
    </div>
  );
}
