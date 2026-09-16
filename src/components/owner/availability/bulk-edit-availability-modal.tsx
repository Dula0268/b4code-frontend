"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { BedDouble, CheckCircle, RefreshCw } from "lucide-react";

export default function BulkEditAvailabilityModal() {
  const {
    isBulkAvailabilityModalOpen,
    setBulkAvailabilityModalOpen,
    selectedDates,
    calendarDays,
    selectedRoomId,
    bulkUpdateAvailabilityCount,
    actionLoading,
  } = useOwnerPricingStore();

  const [availableRoomsOverride, setAvailableRoomsOverride] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isBulkAvailabilityModalOpen) {
      setAvailableRoomsOverride("");
      setNotes("");
      setError(null);
    }
  }, [isBulkAvailabilityModalOpen]);

  if (!isBulkAvailabilityModalOpen) return null;

  // Look up the base inventory of the selected room type
  let baseInventory = 0;
  if (selectedDates.length > 0) {
    const firstDate = selectedDates[0];
    const days = calendarDays.filter(
      (d) =>
        d.date === firstDate &&
        (selectedRoomId === "ALL" || d.roomId === selectedRoomId)
    );
    if (days.length > 0) {
      baseInventory = days[0].baseInventory ?? 0;
    }
  }

  const handleApply = async () => {
    setError(null);
    try {
      const val = parseInt(availableRoomsOverride, 10);
      if (isNaN(val) || val < 0 || val > baseInventory) {
        setError(`Please enter a valid number of rooms (0 to ${baseInventory}).`);
        return;
      }
      await bulkUpdateAvailabilityCount(val, "AVAILABLE", notes || "Bulk Availability Update");
    } catch {
      // Error handled in store
    }
  };

  const formattedDateRange =
    selectedDates.length > 0
      ? `${selectedDates[0]} ${
          selectedDates.length > 1
            ? `to ${selectedDates[selectedDates.length - 1]}`
            : ""
        } (${selectedDates.length} days)`
      : "No dates selected";

  return (
    <Dialog open={isBulkAvailabilityModalOpen} onOpenChange={setBulkAvailabilityModalOpen}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-[#953002]" />
            Bulk Edit Availability
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Apply room availability overrides across selected dates.
          </DialogDescription>
        </DialogHeader>

        {/* Selected dates indicator */}
        <div className="bg-[#FAF3F0] border border-[#F2DCD2] rounded-xl p-3 my-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#953002] block">
              Target Dates:
            </span>
            <span className="text-xs text-gray-700 font-medium">
              {formattedDateRange}
            </span>
          </div>
          <Badge className="bg-[#953002] text-white text-xs px-2.5 py-0.5 rounded-full">
            {selectedDates.length} Selected
          </Badge>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-700">
                Rooms Available to Book
              </Label>
              <span className="text-[10px] text-gray-500 font-medium">
                Maximum physical rooms: {baseInventory}
              </span>
            </div>
            <Input
              type="number"
              min="0"
              max={baseInventory}
              step="1"
              placeholder={`e.g. ${baseInventory}`}
              value={availableRoomsOverride}
              onChange={(e) => setAvailableRoomsOverride(e.target.value)}
              className="mt-1 h-10 text-sm rounded-xl border-gray-200 focus:border-[#953002] focus:ring-[#953002]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              This will override the number of available rooms for all selected days.
            </p>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700">
              Reason / Note (Optional)
            </Label>
            <Input
              type="text"
              placeholder="e.g. Maintenance, Group Booking"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 h-9 text-xs rounded-xl border-gray-200"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
            <span className="w-4 h-4 shrink-0 text-red-600 font-bold">!</span>
            {error}
          </div>
        )}

        <DialogFooter className="mt-6 flex sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setBulkAvailabilityModalOpen(false)}
            disabled={actionLoading}
            className="rounded-xl h-10 text-xs px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={actionLoading || availableRoomsOverride === ""}
            className="rounded-xl h-10 text-xs px-5 font-semibold text-white transition-all bg-[#953002] hover:bg-[#7a2701]"
          >
            {actionLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1.5" />
            )}
            {actionLoading ? "Applying..." : "Apply to Selected Dates"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
