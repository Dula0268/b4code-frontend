"use client";

import { useSearchParams } from "next/navigation";
import StaffPageLayout from "@/components/features/staff/layout/staff-page-layout";
import QrList from "@/components/features/staff/qr/qr-list";

export default function QrPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get("propertyId") ? parseInt(searchParams.get("propertyId")!) : 1;
  
  return (
    <StaffPageLayout>
      <QrList propertyId={propertyId} />
    </StaffPageLayout>
  );
}
