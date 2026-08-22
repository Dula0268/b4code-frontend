import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import GuestTopbar from "@/components/shared/layout/guest-shell/guest-topbar";
import GuestFooter from "@/components/shared/layout/guest-shell/guest-footer";

import GuestMessageClient from "./guest-message-client";

export default async function GuestMessagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const bookingId = params.id;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <GuestTopbar />
      <main className="flex-1 pt-24 px-4 sm:px-6 pb-6 flex flex-col">
        <Link
          href="/guest/booking"
          className="inline-flex items-center gap-2 text-sm font-bold mb-4 no-underline text-[#828282] hover:text-[#1d1d1d] transition-colors"
        >
          <ChevronLeft size={16} /> Back to My Bookings
        </Link>
        <div className="flex-1 min-h-0 flex flex-col">
          <GuestMessageClient bookingId={bookingId} />
        </div>
      </main>
      <GuestFooter />
    </div>
  );
}
