"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MenuClient from "@/components/guest/ordering/menu/menu-client";
import { useOrderContextStore } from "@/store/guest/ordering/order-context.store";
import api from "@/lib/axios";

import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

function MenuSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 flex flex-col gap-6">
      {/* Header Banner Skeleton */}
      <div className="h-44 w-full bg-white rounded-2xl p-6 flex flex-col justify-end gap-3 border border-[#f3f4f6]">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Category Tabs Bar */}
      <div className="flex gap-3 overflow-x-auto py-2">
        <Skeleton className="h-10 w-24 rounded-full shrink-0" />
        <Skeleton className="h-10 w-28 rounded-full shrink-0" />
        <Skeleton className="h-10 w-24 rounded-full shrink-0" />
        <Skeleton className="h-10 w-32 rounded-full shrink-0" />
        <Skeleton className="h-10 w-20 rounded-full shrink-0" />
      </div>

      {/* Main Grid: Dishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#f3f4f6] p-4 flex gap-4 h-36">
            <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        const response = await api.get(`/qr/unique/${qrId}`);
        const data = response.data;

        if (data.status === "INACTIVE") {
          setErrorMsg("This QR code is currently inactive.");
          setLocalLoading(false);
          return;
        }

        setQRContext({
          qrId: data.uniqueQrId,
          propertyId: data.propertyId,
          location: data.location,
          propertyName: data.name || "Property Name", // Backend currently doesn't send property name inside QR? We might need to fetch it later if not available.
          locationLabel: data.location || data.name,
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
      router.push("/guest/booking");
    }
  }, [localLoading, qrId, qrContext, router]);

  if (localLoading) {
    return <MenuSkeleton />;
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
    <Suspense fallback={<MenuSkeleton />}>
      <GuestOrderLandingContent />
    </Suspense>
  );
}
