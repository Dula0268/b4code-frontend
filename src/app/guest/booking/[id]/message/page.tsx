import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import GuestMessageClient from "./guest-message-client";

export default async function GuestMessagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const bookingId = params.id;

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-[#fafafa]">
      <GuestMessageClient bookingId={bookingId} />
    </div>
  );
}
