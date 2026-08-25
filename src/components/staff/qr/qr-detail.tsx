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
      <div className="h-full flex items-center justify-center text-sm text-[#9E7B6A]">
        QR context not found.{" "}
        <button className="ml-1 text-[#C05621] underline" onClick={() => router.push("/staff/qr")}>Back to list</button>
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
          <button onClick={() => router.push("/staff/qr")} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[#8A7568] transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm font-bold text-[#1A1A1A]">QR Detail</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => router.push(`/staff/qr/${qrId}/print`)}>
            <Printer size={12} /> Print QR
          </Button>
          <Button size="sm" className="bg-[#C05621] text-white text-xs h-7 gap-1" onClick={downloadQR} disabled={!qr.qrImageUrl}>
            <Download size={12} /> Download
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex-none flex items-center gap-2 bg-[rgba(45,125,92,0.08)] border border-[rgba(45,125,92,0.2)] rounded-xl px-3 py-2">
          <CheckCircle size={14} className="text-[#2D7D5C]" />
          <span className="text-xs text-[#2D7D5C] font-medium">{successMsg}</span>
        </div>
      )}

      {/* Body — 2 column */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: QR Code */}
        <Card className="bg-white/70 backdrop-blur-xl flex-1 py-0 gap-0 border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardContent className="p-5 h-full flex flex-col items-center justify-center gap-3">
            <div className="w-[200px] h-[200px] bg-white border border-[#F0EBE7] rounded-[12px] flex items-center justify-center overflow-hidden p-2 shadow-sm">
              {qr.qrImageUrl ? (
                <img src={qr.qrImageUrl} alt={`QR Code for ${qr.name}`} className="w-full h-full object-contain" />
              ) : (
                <QrCode size={80} className="text-[#8A7568]" />
              )}
            </div>
            <Badge className="bg-[rgba(192,86,33,0.08)] text-[#C05621] text-xs font-medium px-3 py-1 rounded-full">
              {qr.name}
            </Badge>
            <p className="text-[10px] text-[#9E7B6A] text-center">{qr.instructionText || "Scan this QR code to place your order"}</p>
          </CardContent>
        </Card>

        {/* Right: Details */}
        <div className="w-full lg:w-[320px] lg:shrink-0 flex flex-col gap-3 lg:overflow-y-auto">
          <Card className="bg-white/70 backdrop-blur-xl py-0 gap-0 border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-5 flex flex-col gap-4">
              {/* Name */}
              <div>
                <p className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wide">QR Name</p>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">{qr.name}</p>
                {qr.location && <p className="text-[10px] text-[#9E7B6A]">{qr.location}</p>}
              </div>

              {/* Type */}
              <div>
                <p className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wide">Type</p>
                <p className="text-xs text-[#1A1A1A] mt-0.5">{qr.type}</p>
              </div>

              {/* Created */}
              <div>
                <p className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wide">Created</p>
                <p className="text-xs text-[#1A1A1A] mt-0.5">{qr.createdAt}</p>
              </div>

              {/* Unique QR ID */}
              <div>
                <p className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wide">Unique QR ID</p>
                <div className="flex items-center gap-2 mt-1 bg-[#F8F6F5] rounded-lg px-2.5 py-1.5">
                  <code className="text-[10px] text-[#1A1A1A] flex-1 font-mono break-all">{qr.qrId}</code>
                  <button onClick={copyQRId} className="text-[#8A7568] hover:text-[#C05621] transition-colors shrink-0">
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] font-bold text-[#9E7B6A] uppercase tracking-wide">Status</p>
                <Badge className={`mt-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${qr.status === "active" ? "bg-[rgba(45,125,92,0.1)] text-[#2D7D5C]" : "bg-[#F8F6F5] text-[#8A7568]"}`}>
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
