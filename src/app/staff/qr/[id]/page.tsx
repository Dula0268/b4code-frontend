"use client";

import { useParams } from "next/navigation";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import QrDetail from "@/components/staff/qr/qr-detail";

export default function QrDetailPage() {
  const params = useParams();
  const qrId = params.id as string;

  return (
    <StaffPageLayout>
      <QrDetail qrId={qrId} />
    </StaffPageLayout>
  );
}
