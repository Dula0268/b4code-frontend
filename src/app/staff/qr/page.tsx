"use client";

import { useSearchParams } from "next/navigation";
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import QrList from "@/components/features/staff/qr/qr-list";

import React, { Suspense, useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";

function QrContent() {
  const { user } = useAuthStore();
  const propertyId = user?.propertyId || 1; // Default to 1 as fallback for dev

  return (
    <StaffPageLayout>
      <QrList propertyId={propertyId} />
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

