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
import { DollarSign, CheckCircle, RefreshCw } from "lucide-react";

export default function BulkEditPriceModal() {
  const {
    isBulkModalOpen,
    setBulkModalOpen,
    selectedDates,
    bulkUpdatePrices,
    actionLoading,
  } = useOwnerPricingStore();

  const [fixedPrice, setFixedPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isBulkModalOpen) {
      setFixedPrice("");
      setNotes("");
      setError(null);
    }
  }, [isBulkModalOpen]);

  if (!isBulkModalOpen) return null;

  const handleApply = async () => {
    setError(null);
    try {
      const val = parseFloat(fixedPrice);
      if (isNaN(val) || val <= 0) {
        setError("Please enter a valid price (greater than 0).");
        return;
      }
      await bulkUpdatePrices(val, "AVAILABLE", notes || "Bulk Rate Update", undefined);
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
    <Dialog open={isBulkModalOpen} onOpenChange={setBulkModalOpen}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#953002]" />
            Bulk Edit Rates
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Apply pricing overrides across selected dates.
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
            <Label className="text-xs font-semibold text-gray-700">
              New Price Per Night (LKR / Sri Lankan Rupees)
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                LKR
              </span>
              <Input
                type="number"
                min="1"
                step="100"
                placeholder="e.g. 15000"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                className="pl-12 h-10 text-sm rounded-xl border-gray-200 focus:border-[#953002] focus:ring-[#953002]"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              This custom rate will override standard pricing for all selected days.
            </p>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700">
              Reason / Note (Optional)
            </Label>
            <Input
              type="text"
              placeholder="e.g. High Season Surge, Weekend Rate"
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
            onClick={() => setBulkModalOpen(false)}
            disabled={actionLoading}
            className="rounded-xl h-10 text-xs px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={actionLoading || !fixedPrice}
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
