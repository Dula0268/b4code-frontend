"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WelcomeModal from "@/components/features/guest/ordering/landing/welcome-modal";
import MenuClient from "@/components/guest/order/menu/menu-client";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";

export default function GuestOrderLanding() {
  const router = useRouter();
  const qrContext = useOrderContextStore((s) => s.qrContext);
  const loading = useOrderContextStore((s) => s.loading);

  // Redirect to scanner if no QR context
  useEffect(() => {
    if (!loading && !qrContext) {
      router.push("/guest/my-room/qr-scanner");
    }
  }, [qrContext, loading, router]);

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
