"use client";

import { useParams } from "next/navigation";
import QrPrintCard from "@/components/staff/qr/qr-print-card";

export default function QrPrintPage() {
  const params = useParams();
  const qrId = params.id as string;

  return (
      <QrPrintCard qrId={qrId} />
  );
}
