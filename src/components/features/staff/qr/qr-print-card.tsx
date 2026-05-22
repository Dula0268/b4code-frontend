"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, QrCode, Printer } from "lucide-react";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function QrPrintCard({ qrId }: { qrId: string }) {
  const router = useRouter();
  const qr = useStaffQRStore((s) => s.getQR(qrId));
  const updateQR = useStaffQRStore((s) => s.updateQR);

  const [instruction, setInstruction] = useState(qr?.instructionText ?? "Scan to Order Food");
  const [showRoom, setShowRoom] = useState(qr?.showRoomNumber ?? true);
  const [showLogo, setShowLogo] = useState(qr?.showLogo ?? true);

  if (!qr) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[var(--gray-3)]">
        QR context not found.{" "}
        <button className="ml-1 text-[var(--brand-primary)] underline" onClick={() => router.push("/staff/qr")}>Back to list</button>
      </div>
    );
  }

  const handleSaveAndPrint = async () => {
    await updateQR(qrId, { instructionText: instruction, showRoomNumber: showRoom, showLogo: showLogo });
    window.print();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {/* Header */}
      <div className="flex-none flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button onClick={() => router.push(`/staff/qr/${qrId}`)} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[var(--gray-2)] transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-[var(--black-2)] leading-tight">Print QR — {qr.name}</h1>
            <p className="text-[10px] text-[var(--gray-3)]">Customize and download your QR card for printing.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => router.push("/staff/qr")}>Back to List</Button>
          <Button size="sm" className="bg-[var(--brand-primary)] text-white text-xs h-7 gap-1" onClick={handleSaveAndPrint}>
            <Printer size={12} /> Save & Print
          </Button>
        </div>
      </div>

      {/* Body — 2 column */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left: Customization */}
        <div className="flex-1 overflow-y-auto">
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <CardContent className="p-5 flex flex-col gap-5">
              <h2 className="text-xs font-bold text-[var(--black-2)]">Customization</h2>

              {/* Instruction text */}
              <div>
                <Label className="text-[10px] font-bold text-[var(--black-2)] uppercase">Instruction Text</Label>
                <Input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="e.g. Scan to Order Food" className="mt-1 text-xs rounded-[8px] border-[var(--gray-5)]" />
                <p className="text-[10px] text-[var(--gray-4)] mt-0.5">This appears below the QR code on the printed card.</p>
              </div>

              {/* Show room/table number */}
              <div className="flex items-start gap-2.5">
                <Checkbox id="show-room" checked={showRoom} onCheckedChange={(v) => setShowRoom(!!v)} className="mt-0.5" />
                <div>
                  <Label htmlFor="show-room" className="text-xs font-medium text-[var(--black-2)] cursor-pointer">Show Room / Table Number</Label>
                  <p className="text-[10px] text-[var(--gray-3)]">Display the context name prominently on the card.</p>
                </div>
              </div>

              {/* Show logo */}
              <div className="flex items-start gap-2.5">
                <Checkbox id="show-logo" checked={showLogo} onCheckedChange={(v) => setShowLogo(!!v)} className="mt-0.5" />
                <div>
                  <Label htmlFor="show-logo" className="text-xs font-medium text-[var(--black-2)] cursor-pointer">Show Hotel / Brand Logo</Label>
                  <p className="text-[10px] text-[var(--gray-3)]">Include the property&apos;s branding at the top of the card.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="w-[300px] shrink-0">
          <Card className="bg-white py-0 gap-0 border border-[var(--gray-5)] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] h-full">
            <CardContent className="p-5 h-full flex flex-col">
              <h2 className="text-xs font-bold text-[var(--black-2)] mb-3">Live Preview</h2>

              {/* Print card preview */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[220px] bg-white border border-[var(--gray-5)] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
                  {/* Brand header */}
                  {showLogo && (
                    <div className="bg-[var(--brand-primary)] px-4 py-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">H</span>
                      </div>
                      <span className="text-[10px] font-bold text-white">Hotel B4Code</span>
                    </div>
                  )}

                  {/* QR section */}
                  <div className="px-4 py-5 flex flex-col items-center gap-2.5">
                    {showRoom && (
                      <p className="text-xs font-bold text-[var(--black-2)]">{qr.name}</p>
                    )}
                    <div className="relative w-[140px] h-[140px] bg-white border border-[var(--gray-5)] rounded-[8px] flex items-center justify-center overflow-hidden p-2">
                      {qr.qrImageUrl ? (
                        <Image
                          src={qr.qrImageUrl}
                          alt={`QR Code for ${qr.name}`}
                          fill
                          sizes="140px"
                          className="object-contain"
                        />
                      ) : (
                        <QrCode size={64} className="text-[var(--gray-2)]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--gray-3)] text-center">{instruction}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
