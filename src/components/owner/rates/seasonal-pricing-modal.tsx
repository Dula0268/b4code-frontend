"use client";

import { useState } from "react";
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
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { CalendarRange, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

export default function SeasonalPricingModal() {
  const { isSeasonalModalOpen, setSeasonalModalOpen, addSeasonalRule } =
    useOwnerPricingStore();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adjustment, setAdjustment] = useState<number>(15);
  const [isSurge, setIsSurge] = useState<boolean>(true);
  const [description, setDescription] = useState("");

  if (!isSeasonalModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    const finalPercent = isSurge ? Math.abs(adjustment) : -Math.abs(adjustment);

    await addSeasonalRule({
      name,
      startDate,
      endDate,
      priceAdjustmentPercent: finalPercent,
      description:
        description ||
        `${name} (${finalPercent > 0 ? "+" : ""}${finalPercent}% rate adjustment)`,
    });

    // Reset
    setName("");
    setStartDate("");
    setEndDate("");
    setAdjustment(15);
    setDescription("");
  };

  return (
    <Dialog open={isSeasonalModalOpen} onOpenChange={setSeasonalModalOpen}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#953002]" />
            Define Seasonal Pricing Rule
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Configure automatic rate adjustments (e.g. Peak Surge +20%, Monsoon Discount -15%).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-semibold text-gray-700">
              Season Name
            </Label>
            <Input
              type="text"
              required
              placeholder="e.g. Summer High Season, Holiday Peak"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 text-xs rounded-xl border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-gray-700">
                Start Date
              </Label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-700">
                End Date
              </Label>
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Price Adjustment Direction
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSurge(true)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  isSurge
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Surge / Peak (+%)
              </button>
              <button
                type="button"
                onClick={() => setIsSurge(false)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  !isSurge
                    ? "bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <TrendingDown className="w-4 h-4 text-blue-600" />
                Discount / Off-Peak (-%)
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700">
              Adjustment Percentage (%)
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">
                {isSurge ? "+" : "-"}
              </span>
              <Input
                type="number"
                min="1"
                max="300"
                required
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
                className="pl-7 h-10 text-xs rounded-xl border-gray-200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                %
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700">
              Description (Optional)
            </Label>
            <Input
              type="text"
              placeholder="e.g. Applied to all standard room types"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 h-9 text-xs rounded-xl border-gray-200"
            />
          </div>

          <DialogFooter className="mt-6 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSeasonalModalOpen(false)}
              className="rounded-xl h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-10 text-xs px-5 bg-[#953002] hover:bg-[#7a2701] font-semibold text-white"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Save Season Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
