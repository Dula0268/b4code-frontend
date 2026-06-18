"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MenuClient from "@/components/guest/ordering/menu/menu-client";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import api from "@/lib/axios";

import { Suspense } from "react";

function GuestOrderLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrId = searchParams.get("qrId");

  const setQRContext = useOrderContextStore((s) => s.setQRContext);
  const qrContext = useOrderContextStore((s) => s.qrContext);

  const [localLoading, setLocalLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadQRContext() {
      if (!qrId) {
        setLocalLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/qr/unique/${qrId}`);
        const data = response.data;

        if (data.status === "INACTIVE") {
          setErrorMsg("This QR code is currently inactive.");
          setLocalLoading(false);
          return;
        }

        setQRContext({
          qrId: data.uniqueQrId,
          propertyId: data.propertyId,
          roomId: data.roomNumber ? parseInt(data.roomNumber) : undefined, // Assuming roomId is mapped or can be ignored if we just use roomNumber
          tableId: data.tableId,
          propertyName: data.name || "Property Name", // Backend currently doesn't send property name inside QR? We might need to fetch it later if not available.
          locationLabel: data.tableId ? `Table ${data.tableId}` : (data.roomNumber ? `Room ${data.roomNumber}` : data.location),
          type: data.type,
          name: data.name,
          status: data.status,
        });

        setLocalLoading(false);
      } catch (error) {
        console.error("Error loading QR context", error);
        setErrorMsg("Invalid QR code or QR code not found.");
        setLocalLoading(false);
      }
    }

    // Only load if we don't have the context or if qrId differs
    if (qrId && (!qrContext || qrContext.qrId !== qrId)) {
      loadQRContext();
    } else {
      setLocalLoading(false);
    }
  }, [qrId, qrContext, setQRContext]);

  // If no qrId provided and no existing context
  useEffect(() => {
    if (!localLoading && !qrId && !qrContext) {
      router.push("/guest/booking/my-bookings");
    }
  }, [localLoading, qrId, qrContext, router]);

  if (localLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[var(--brand-primary)] border-neutral-200 rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-2xl font-bold text-[var(--state-error)] mb-2">QR Code Error</h2>
        <p className="text-gray-600 mb-6">{errorMsg}</p>
      </div>
    );
  }

  if (!qrContext) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="relative">
      <MenuClient />
    </div>
  );
}

export default function GuestOrderLanding() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[var(--brand-primary)] border-neutral-200 rounded-full animate-spin" />
      </div>
    }>
      <GuestOrderLandingContent />
    </Suspense>
  );
}
