"use client";

import { useSearchParams } from "next/navigation";
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import QrList from "@/components/features/staff/qr/qr-list";

import React, { Suspense, useState, useEffect } from "react";

function QrContent() {
  const searchParams = useSearchParams();
  const queryPropertyId = searchParams?.get("propertyId") ? parseInt(searchParams.get("propertyId")!, 10) : null;

  const [propertyId, setPropertyId] = useState<number | null>(queryPropertyId);

  // Read from localStorage only on the client after mount to avoid hydration mismatch
  useEffect(() => {
    if (!propertyId) {
      const stored = localStorage.getItem("selected_property_id");
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) setPropertyId(parsed);
      }
    }
  }, [propertyId]);

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

