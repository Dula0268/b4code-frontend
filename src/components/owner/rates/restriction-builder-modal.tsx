"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Calendar, BedDouble, AlertCircle, Clock, Ban } from "lucide-react";
import { restrictionsApi } from "@/api/owner/restrictions.api";

interface RoomOption {
  id: number;
  name: string;
}

interface RestrictionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  rooms: RoomOption[];
  onSuccess: () => void;
}

export default function RestrictionBuilderModal({
  isOpen,
  onClose,
  propertyId,
  rooms,
  onSuccess,
}: RestrictionBuilderModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"MIN_STAY" | "MAX_STAY" | "CLOSED_TO_ARRIVAL" | "CLOSED_TO_DEPARTURE" | "BLACKOUT">("MIN_STAY");
  const [roomTypeId, setRoomTypeId] = useState<string>("ALL");
  const [stayNights, setStayNights] = useState<number>(2);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a rule name (e.g., Weekend Minimum Stay).");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after start date.");
      return;
    }
    if ((type === "MIN_STAY" || type === "MAX_STAY") && (!stayNights || stayNights < 1)) {
      setError("Please specify at least 1 night for stay constraints.");
      return;
    }

    setLoading(true);
    try {
      await restrictionsApi.createRestriction({
        propertyId,
        roomTypeId: roomTypeId === "ALL" ? null : Number(roomTypeId),
        name: name.trim(),
        type,
        minStay: type === "MIN_STAY" ? stayNights : null,
        maxStay: type === "MAX_STAY" ? stayNights : null,
        closedToArrival: type === "CLOSED_TO_ARRIVAL",
        closedToDeparture: type === "CLOSED_TO_DEPARTURE",
        startDate,
        endDate,
        reason: reason.trim() || undefined,
        isActive: true,
      });

      // Reset and close
      setName("");
      setType("MIN_STAY");
      setRoomTypeId("ALL");
      setStayNights(2);
      setStartDate("");
      setEndDate("");
      setReason("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create restriction rule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-3xl p-6 bg-white border border-gray-100 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#953002]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-gray-900">
                Create Restriction Rule
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Define stay length constraints or arrival/departure locks
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Rule Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Rule Name</Label>
            <Input
              placeholder="e.g. Peak Weekend 2-Night Minimum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-gray-200 text-xs font-medium focus:ring-[#953002] focus:border-[#953002]"
              required
            />
          </div>

          {/* Scope: Property or Room */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-[#953002]" /> Target Scope
              </Label>
              <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                <SelectTrigger className="rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL" className="text-xs font-bold">Entire Property (All Rooms)</SelectItem>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Restriction Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#953002]" /> Rule Type
              </Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="MIN_STAY" className="text-xs font-medium">Minimum Stay (Nights)</SelectItem>
                  <SelectItem value="MAX_STAY" className="text-xs font-medium">Maximum Stay (Nights)</SelectItem>
                  <SelectItem value="CLOSED_TO_ARRIVAL" className="text-xs font-medium">Closed to Arrival (CTA)</SelectItem>
                  <SelectItem value="CLOSED_TO_DEPARTURE" className="text-xs font-medium">Closed to Departure (CTD)</SelectItem>
                  <SelectItem value="BLACKOUT" className="text-xs font-medium">Maintenance / Blackout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stay Nights (if MIN_STAY or MAX_STAY) */}
          {(type === "MIN_STAY" || type === "MAX_STAY") && (
            <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
              <Label className="text-xs font-bold text-amber-950">
                {type === "MIN_STAY" ? "Minimum Nights Required" : "Maximum Nights Allowed"}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={stayNights}
                  onChange={(e) => setStayNights(Number(e.target.value))}
                  className="rounded-xl bg-white border-amber-200 text-xs font-bold w-32"
                  required
                />
                <span className="text-xs text-amber-900 font-medium">
                  {type === "MIN_STAY" ? "Guests must book at least this many nights" : "Guests cannot exceed this booking duration"}
                </span>
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border-gray-200 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border-gray-200 text-xs"
                required
              />
            </div>
          </div>

          {/* Reason / Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700">Reason / Internal Note (Optional)</Label>
            <Input
              placeholder="e.g. High demand weekend or scheduled AC maintenance"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border-gray-200 text-xs"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-bold text-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl text-xs font-bold bg-[#953002] hover:bg-[#7a2702] text-white shadow-sm"
            >
              {loading ? "Creating..." : "Save Restriction Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
