"use client";

import { useSearchParams } from "next/navigation";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import QrList from "@/components/staff/qr/qr-list";

import React, { Suspense, useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";

function QrContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const queryPropertyId = searchParams?.get("propertyId") ? parseInt(searchParams.get("propertyId")!, 10) : null;

  const [propertyId, setPropertyId] = useState<number | null>(queryPropertyId);

  // Read from AuthStore or localStorage only on the client after mount to avoid hydration mismatch
  useEffect(() => {
    if (!propertyId) {
      // 1. Check AuthStore (assigned property)
      if (user?.propertyId) {
        setPropertyId(user.propertyId);
        return;
      }

      // 2. Check localStorage (selected property)
      const stored = localStorage.getItem("selected_property_id");
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) setPropertyId(parsed);
      }
    }
  }, [propertyId, user]);

  return (
    <StaffPageLayout>
      {propertyId ? <QrList propertyId={propertyId} /> : <div className="p-6 text-sm text-[var(--gray-3)]">Select a property to view QR management.</div>}

    </StaffPageLayout>
  );
}

export default function QrPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QrContent />
    </Suspense>
  );
}

