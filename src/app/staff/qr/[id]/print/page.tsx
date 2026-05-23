"use client";

import { useParams } from "next/navigation";
import StaffPageLayout from "@/components/staff/layout/staff-page-layout";
import QrPrintCard from "@/components/staff/qr/qr-print-card";

export default function QrPrintPage() {
  const params = useParams();
  const qrId = params.id as string;

  return (
    <StaffPageLayout>
      <QrPrintCard qrId={qrId} />
    </StaffPageLayout>
  );
}
