"use client";

// Final clean version for New QR Page
import QrCreateForm from "@/components/staff/qr/qr-generate-modal";

import { Suspense } from "react";

export default function NewQrPage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <QrCreateForm />
      </Suspense>
  );
}
