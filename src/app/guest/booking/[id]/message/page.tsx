import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import GuestMessageClient from "./guest-message-client";

export default async function GuestMessagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const bookingId = params.id;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/guest/booking`}>
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight m-0">Messages</h1>
          <p className="text-sm text-[#6B7280] m-0">Chat with the property staff</p>
        </div>
      </div>
      <GuestMessageClient bookingId={bookingId} />
    </div>
  );
}
