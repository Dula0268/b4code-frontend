"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Copy, Printer, Download, QrCode } from "lucide-react";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import { BASE_URL } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function QrDetail({ qrId }: { qrId: string }) {
  const router = useRouter();
  const qr = useStaffQRStore((s) => s.getQR(qrId));
  console.log('QR detail context:', qr);
  console.log('BASE_URL:', BASE_URL);
  const successMsg = useStaffQRStore((s) => s.successMsg);
  const setSuccess = useStaffQRStore((s) => s.setSuccess);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, setSuccess]);

  if (!qr) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[var(--gray-3)]">
        QR context not found.{" "}
        <button className="ml-1 text-[var(--brand-primary)] underline" onClick={() => router.push("/staff/qr")}>Back to list</button>
      </div>
    );
  }

  const copyQRId = () => {
    navigator.clipboard.writeText(qr.qrId);
  };

  const downloadQR = async () => {
    if (!qr.qrImageUrl) return;
    try {
      const response = await fetch(qr.qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-${qr.name.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR code", err);
      window.open(qr.qrImageUrl, "_blank");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push("/staff/qr")} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm font-bold text-[var(--black-2)]">QR Detail</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => router.push(`/staff/qr/${qrId}/print`)}>
            <Printer size={12} /> Print QR
          </Button>
          <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={downloadQR} disabled={!qr.qrImageUrl}>
            <Download size={12} /> Download
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(39,174,96,0.08)] border border-[rgba(39,174,96,0.2)] rounded-[8px] px-3 py-2">
          <CheckCircle size={14} className="text-[var(--state-success)]" />
          <span className="text-xs text-[var(--state-success)] font-medium">{successMsg}</span>
        </div>
      )}

      {/* Body — 2 column */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: QR Code */}
        <Card className="bg-white flex-1 py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <CardContent className="p-5 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-[200px] h-[200px] bg-white border border-[var(--gray-5)] rounded-[12px] flex items-center justify-center overflow-hidden p-2 shadow-sm">
              {qr.qrImageUrl ? (
                <img src={qr.qrImageUrl} alt={`QR Code for ${qr.name}`} className="w-full h-full object-contain" />
              ) : (
                <QrCode size={80} className="text-[var(--gray-2)]" />
              )}
            </div>
            <Badge className="bg-[rgba(149,48,2,0.08)] text-[var(--brand-primary)] text-xs font-medium px-3 py-1 rounded-full">
              {qr.name}
            </Badge>
            <p className="text-[10px] text-[var(--gray-3)] text-center">{qr.instructionText || "Scan this QR code to place your order"}</p>
          </CardContent>
        </Card>

        {/* Right: Details */}
        <div className="w-full lg:w-[320px] lg:shrink-0 flex flex-col gap-3 lg:overflow-y-auto">
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-5 flex flex-col gap-4">
              {/* Name */}
              <div>
                <p className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wide">QR Name</p>
                <p className="text-sm font-semibold text-[var(--black-2)] mt-0.5">{qr.name}</p>
                {qr.location && <p className="text-[10px] text-[var(--gray-3)]">{qr.location}</p>}
              </div>

              {/* Type */}
              <div>
                <p className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wide">Type</p>
                <p className="text-xs text-[var(--black-2)] mt-0.5">{qr.type}</p>
              </div>

              {/* Created */}
              <div>
                <p className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wide">Created</p>
                <p className="text-xs text-[var(--black-2)] mt-0.5">{qr.createdAt}</p>
              </div>

              {/* Unique QR ID */}
              <div>
                <p className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wide">Unique QR ID</p>
                <div className="flex items-center gap-2 mt-1 bg-[var(--black-3)] rounded-[6px] px-2.5 py-1.5">
                  <code className="text-[10px] text-[var(--black-1)] flex-1 font-mono break-all">{qr.qrId}</code>
                  <button onClick={copyQRId} className="text-[var(--gray-2)] hover:text-[var(--brand-primary)] transition-colors shrink-0">
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-bold text-[var(--gray-3)] uppercase tracking-wide">Status</p>
                <Badge className={`mt-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${qr.status === "active" ? "bg-[rgba(39,174,96,0.1)] text-[var(--state-success)]" : "bg-[var(--black-3)] text-[var(--gray-2)]"}`}>
                  {qr.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8 flex-1 gap-1" onClick={() => router.push(`/staff/qr/${qrId}/edit`)}>
              Edit QR
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 flex-1 gap-1" onClick={() => router.push(`/staff/qr/${qrId}/print`)}>
              <Printer size={12} /> Print Layout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
