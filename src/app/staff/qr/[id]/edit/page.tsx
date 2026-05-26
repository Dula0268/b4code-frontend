"use client";

import { useParams } from "next/navigation";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import QrCreateForm from "@/components/staff/qr/qr-generate-modal";

export default function QrEditPage() {
  const params = useParams();
  const qrId = params.id as string;

  return (
    <StaffPageLayout>
      <QrCreateForm qrId={qrId} />
    </StaffPageLayout>
  );
}
