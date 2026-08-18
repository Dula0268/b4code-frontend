"use client";

import { useParams } from "next/navigation";
import QrCreateForm from "@/components/staff/qr/qr-generate-modal";

export default function QrEditPage() {
  const params = useParams();
  const qrId = params.id as string;

  return (
      <QrCreateForm qrId={qrId} />
  );
}
