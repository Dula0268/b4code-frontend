import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GuestMessagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const bookingId = params.id;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`/guest/booking/${bookingId}`}>
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight m-0">Messages</h1>
          <p className="text-sm text-[#6B7280] m-0">Chat with the property staff</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#eadfce] p-6 min-h-[400px] flex items-center justify-center text-center">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-[#2d2116] mb-2">Messaging is currently unavailable</h2>
          <p className="text-[#6f6254] text-sm">
            We are working on bringing this feature back soon. Please contact the property directly via phone or email for any urgent requests.
          </p>
        </div>
      </div>
    </div>
  );
}
