"use client";

// Final clean version for New QR Page
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import QrCreateForm from "@/components/features/staff/qr/qr-generate-modal";

import { Suspense } from "react";

export default function NewQrPage() {
  return (
    <StaffPageLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <QrCreateForm />
      </Suspense>
    </StaffPageLayout>
  );
}
