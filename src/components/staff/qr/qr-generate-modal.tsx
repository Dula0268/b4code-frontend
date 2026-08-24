"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Info } from "lucide-react";
import { useStaffQRStore } from "@/store/staff/qr/staff-qr.store";
import { useAuthStore } from "@/store/auth/auth.store";
import type { QRType, QRTab } from "@/store/staff/qr/staff-qr.store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const TYPE_TAB: Record<QRType, QRTab> = {
  Table: "Table",
  Room: "Room",
};

export default function QrCreateForm({ qrId, propertyId: propPropertyId }: { qrId?: string; propertyId?: number }) {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const queryPropertyId = searchParams?.get("propertyId") ? parseInt(searchParams.get("propertyId")!, 10) : null;
  const fallbackPropertyId = typeof window !== "undefined" ? (user?.propertyId || parseInt(localStorage.getItem("selected_property_id") || "", 10) || null) : null;
  const propertyId = propPropertyId || queryPropertyId || fallbackPropertyId;

  const router = useRouter();
  const existingQR = useStaffQRStore((s) => (qrId ? s.getQR(qrId) : undefined));
  const addQR = useStaffQRStore((s) => s.addQR);
  const updateQR = useStaffQRStore((s) => s.updateQR);
  const setSuccess = useStaffQRStore((s) => s.setSuccess);
  const loading = useStaffQRStore((s) => s.loading);
  const error = useStaffQRStore((s) => s.error);

  const isEdit = !!qrId;

  const [type, setType] = useState<QRType>(existingQR?.type ?? "Table");
  const [name, setName] = useState(existingQR?.name ?? "");
  const [location, setLocation] = useState(existingQR?.location ?? "");
  const [description, setDescription] = useState(existingQR?.description ?? "");
  const [isActive, setIsActive] = useState(existingQR?.status === "active" || !existingQR);
  const [nameError, setNameError] = useState(false);
  const [rooms, setRooms] = useState<{id: number, roomType: string}[]>([]);

  // Fetch rooms dynamically when property is selected
  useEffect(() => {
    if (propertyId && type === "Room") {
      import("@/lib/axios").then(({ default: api }) => {
        api.get(`/rooms/property/${propertyId}`)
          .then(res => setRooms(res.data || []))
          .catch(err => console.error("Failed to fetch rooms:", err));
      });
    }
  }, [propertyId, type]);

  const handleSave = async () => {
    if (!name.trim()) { setNameError(true); return; }
    if (!propertyId) return;
    
    localStorage.setItem("selected_property_id", String(propertyId));

    try {
      if (isEdit && qrId) {
        await updateQR(qrId, { type, name, location, description, status: isActive ? "active" : "inactive", tab: TYPE_TAB[type] });
        setSuccess(`QR "${name}" updated successfully.`);
        router.push(`/staff/qr?propertyId=${propertyId}`);
      } else {
        const id = await addQR({
          type,
          name,
          location,
          description,
          status: isActive ? "active" : "inactive",
          tab: TYPE_TAB[type],
          instructionText: "Scan to Order Food",
          showRoomNumber: true,
          showLogo: true,
        }, propertyId);
        setSuccess(`QR "${name}" has been added to your QR management.`);
        router.push(`/staff/qr/${id}?propertyId=${propertyId}`);
      }
    } catch (error: unknown) {
      console.error("Error saving QR:", error);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-5 py-3 gap-3">
      {!propertyId && (
        <div className="flex-none bg-[rgba(255,180,1,0.12)] border border-[rgba(255,180,1,0.24)] rounded-lg px-3 py-2 text-xs text-[#8a5a00]">
          Select a property before creating or editing QR codes.
        </div>
      )}
      {/* Header */}
      <div className="flex-none flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={() => router.push(propertyId ? `/staff/qr?propertyId=${propertyId}` : "/staff/qr")} className="p-1 hover:bg-[rgba(0,0,0,0.04)] rounded-lg text-[#8A7568] transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#1A1A1A] leading-tight truncate">{isEdit ? "Edit QR" : "Create QR"}</h1>
            <p className="text-[10px] text-[#9E7B6A] truncate">Define a new location (Table, Room, or Area) to generate a unique QR code for ordering.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => router.push(propertyId ? `/staff/qr?propertyId=${propertyId}` : "/staff/qr")} disabled={loading}>Cancel</Button>
          <Button size="sm" className="bg-[#C05621] text-white text-xs h-7 gap-1 disabled:opacity-50" onClick={handleSave} disabled={loading || !propertyId}>
            <Save size={12} /> {loading ? "Saving..." : "Save QR"}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex-none bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] rounded-lg px-3 py-2 text-xs text-[#991b1b]">
          {error}
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 lg:overflow-y-auto">
          <Card className="bg-white/70 backdrop-blur-xl py-0 gap-0 border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-t-[3px] border-t-[#C05621]">
            <CardContent className="p-5 flex flex-col gap-4">
              {/* QR Type */}
              <div>
                <Label className="text-[10px] font-bold text-[#1A1A1A] uppercase">QR Type <span className="text-[var(--state-error)]">*</span></Label>
                <Select value={type} onValueChange={(v) => setType(v as QRType)}>
                  <SelectTrigger className="w-full mt-1 text-xs rounded-xl border-[#F0EBE7] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border-[#F0EBE7] z-[100]">
                    {(["Table", "Room"] as QRType[]).map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-[#D4C4B5] mt-0.5">Select the physical nature of this QR code location.</p>
              </div>

              {/* QR Name */}
              <div>
                <Label className="text-[10px] font-bold text-[#1A1A1A] uppercase">QR Name <span className="text-[var(--state-error)]">*</span></Label>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(false); }}
                  placeholder="e.g. Table 5, Room 101, Poolside Area"
                  className={`mt-1 text-xs rounded-xl ${nameError ? "border-[var(--state-error)] bg-[rgba(235,87,87,0.04)]" : "border-[#F0EBE7]"}`}
                />
                {nameError && <p className="text-[10px] text-[var(--state-error)] mt-0.5">Name is required</p>}
              </div>

              {/* Room Number / Table ID */}
              {type === "Room" ? (
                <div>
                  <Label className="text-[10px] font-bold text-[#1A1A1A] uppercase">Room <span className="text-[var(--state-error)]">*</span></Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full mt-1 text-xs rounded-xl border-[#F0EBE7] bg-white">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-white border-[#F0EBE7] z-[100]">
                      {rooms.map(r => (
                        <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                          {r.roomType}
                        </SelectItem>
                      ))}
                      {rooms.length === 0 && (
                        <SelectItem disabled value="none" className="text-xs">No rooms available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-[#D4C4B5] mt-0.5">Select from available rooms.</p>
                </div>
              ) : (
                <div>
                  <Label className="text-[10px] font-bold text-[#1A1A1A] uppercase">Table Number <span className="text-[var(--state-error)]">*</span></Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 5"
                    className="mt-1 text-xs rounded-xl border-[#F0EBE7]"
                  />
                  <p className="text-[10px] text-[#D4C4B5] mt-0.5">The exact table number or identifier.</p>
                </div>
              )}



              {/* Description */}
              <div>
                <Label className="text-[10px] font-bold text-[#1A1A1A] uppercase">Description <span className="text-[#9E7B6A] normal-case font-normal">(Optional)</span></Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add internal notes about this location..." rows={3} className="mt-1 text-xs rounded-xl border-[#F0EBE7] resize-none" />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between bg-[rgba(0,0,0,0.015)] rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-xs font-bold text-[#1A1A1A]">Active Status</p>
                  <p className="text-[10px] text-[#9E7B6A]">Enable or disable ordering via this QR code.</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[#2D7D5C] data-[state=unchecked]:bg-[#D4C4B5]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Info + Preview */}
        <div className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-3">
          {/* Info card */}
          <Card className="bg-white/70 backdrop-blur-xl py-0 gap-0 border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-4 flex gap-2.5">
              <Info size={16} className="text-[#C05621] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#C05621]">What is a QR Context?</p>
                <p className="text-[10px] text-[#9E7B6A] mt-1 leading-relaxed">A QR Context represents a physical location where guests can scan to order from. Creating this QR will generate a specific code that links orders directly to this location.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
