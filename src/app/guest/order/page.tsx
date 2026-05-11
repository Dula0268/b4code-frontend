"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WelcomeModal from "@/components/features/guest/ordering/landing/welcome-modal";
import MenuClient from "@/components/guest/order/menu/menu-client";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import { useGuestGuard } from "@/hooks/use-guest-guard";

export default function GuestOrderLanding() {
  const { ready } = useGuestGuard();
  const router = useRouter();
  const qrContext = useOrderContextStore((s) => s.qrContext);
  const loading = useOrderContextStore((s) => s.loading);

  useEffect(() => {
    if (ready && !loading && !qrContext) {
      router.push("/guest/my-room/qr-scanner");
    }
  }, [ready, qrContext, loading, router]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-t-[#9a3300] border-neutral-200 rounded-full animate-spin" />
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!qrContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-gray-600">Invalid QR code or session data. Please scan a valid QR code.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Menu page shown behind the overlay (non-interactive) */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <MenuClient />
      </div>

      {/* Welcome overlay modal */}
      <WelcomeModal propertyName={qrContext.propertyName} locationLabel={qrContext.locationLabel} />
    </div>
  );
}
