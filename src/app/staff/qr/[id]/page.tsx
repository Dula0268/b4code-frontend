"use client";

import { useParams } from "next/navigation";
import QrDetail from "@/components/staff/qr/qr-detail";

export default function QrDetailPage() {
  const params = useParams();
  const qrId = params.id as string;

  return (
      <QrDetail qrId={qrId} />
  );
}
