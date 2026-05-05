"use client";

// Final clean version for New QR Page
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import QrCreateForm from "@/components/features/staff/qr/qr-generate-modal";

export default function NewQrPage() {
  return (
    <StaffPageLayout>
      <QrCreateForm />
    </StaffPageLayout>
  );
}
