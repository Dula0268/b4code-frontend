"use client";

import { useSearchParams } from "next/navigation"
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import QrCreateForm from "@/components/features/staff/qr/qr-generate-modal";

export default function NewQrPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get("propertyId") ? parseInt(searchParams.get("propertyId")!) : 1;
  
  return (
    <StaffPageLayout>
      <QrCreateForm propertyId={propertyId} />
    </StaffPageLayout>
  );
}
