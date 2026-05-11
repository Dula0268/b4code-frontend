"use client";

import { useRouter } from "next/navigation";
import { useOwnerGuard } from "@/hooks/use-owner-guard";
import AccessDenied from "@/components/shared/auth/access-denied";

export default function OwnerPage() {
  const { ready, status, userRole } = useOwnerGuard();
  const router = useRouter();

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Owner" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F6F8F7]">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-[28px] font-bold text-[#282828]">Owner Portal</h1>
        <p className="text-sm text-[#666]">Manage your properties, availability and payouts.</p>
        <div className="flex gap-3 justify-center mt-2">
          <button
            onClick={() => router.push("/owner/listings")}
            className="px-5 py-2.5 rounded-full bg-[#953002] text-white text-sm font-semibold hover:bg-[#7a2600]"
          >
            My Listings
          </button>
          <button
            onClick={() => router.push("/owner/availability")}
            className="px-5 py-2.5 rounded-full border border-[#953002] text-[#953002] text-sm font-semibold hover:bg-[rgba(149,48,2,0.08)]"
          >
            Availability
          </button>
          <button
            onClick={() => router.push("/owner/payouts")}
            className="px-5 py-2.5 rounded-full border border-[#953002] text-[#953002] text-sm font-semibold hover:bg-[rgba(149,48,2,0.08)]"
          >
            Payouts
          </button>
          <button
            onClick={() => router.push("/owner/staff")}
            className="px-5 py-2.5 rounded-full border border-[#953002] text-[#953002] text-sm font-semibold hover:bg-[rgba(149,48,2,0.08)]"
          >
            Staff Management
          </button>
        </div>
      </div>
    </div>
  );
}