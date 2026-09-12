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
import { Percent, AlertCircle } from "lucide-react";
import { ownerPricingApi, Discount } from "@/api/owner/pricing.api";

interface DiscountRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number | null;
  rooms?: Array<{ id: number; name: string; baseRate?: string }>;
  editingDiscount?: Discount | null;
  onSaved: () => void;
}

export default function DiscountRuleModal({
  isOpen,
  onClose,
  propertyId,
  rooms = [],
  editingDiscount,
  onSaved,
}: DiscountRuleModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("EARLY_BIRD");
  const [roomTypeId, setRoomTypeId] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number>(10);
  const [daysInAdvance, setDaysInAdvance] = useState<number>(15);
  const [minNights, setMinNights] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingDiscount) {
      setName(editingDiscount.name || "");
      setType(editingDiscount.type || "EARLY_BIRD");
      setRoomTypeId(editingDiscount.roomTypeId || null);
      setPercentage(editingDiscount.percentage ? Number(editingDiscount.percentage) : 10);
      setDaysInAdvance(editingDiscount.daysInAdvance || 0);
      setMinNights(editingDiscount.minNights || 1);
      setIsActive(editingDiscount.isActive !== false);
    } else {
      setName("");
      setType("EARLY_BIRD");
      setRoomTypeId(null);
      setPercentage(10);
      setDaysInAdvance(15);
      setMinNights(1);
      setIsActive(true);
    }
    setError(null);
  }, [editingDiscount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      setError("Please select a property first.");
      return;
    }
    if (!name.trim()) {
      setError("Discount rule name is required.");
      return;
    }
    if (percentage <= 0 || percentage > 100) {
      setError("Discount percentage must be between 1% and 100%.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingDiscount && editingDiscount.id) {
        await ownerPricingApi.updateDiscount(editingDiscount.id, {
          propertyId,
          roomTypeId: roomTypeId || null,
          name: name.trim(),
          type,
          percentage,
          daysInAdvance,
          minNights,
          isActive,
        });
      } else {
        await ownerPricingApi.createDiscount({
          propertyId,
          roomTypeId: roomTypeId || null,
          name: name.trim(),
          type,
          percentage,
          daysInAdvance,
          minNights,
          isActive,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save discount rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-3xl shadow-2xl p-6 border border-[#E8EAED]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            {editingDiscount ? "Edit Discount Rule" : "Create Discount Rule"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Configure automated length-of-stay and advance purchase discounts.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-bold text-gray-700">Rule Name</Label>
            <Input
              type="text"
              required
              placeholder="e.g. Early Bird 15 Days, Last Minute Deal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 text-xs rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-700">Applies To (Room)</Label>
            <select
              value={roomTypeId || ""}
              onChange={(e) => setRoomTypeId(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 w-full h-10 text-xs rounded-xl border border-gray-200 px-3 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-[#953002]"
            >
              <option value="">All Rooms (Property-Wide)</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              {roomTypeId
                ? "This discount rule applies specifically to the selected room."
                : "This discount rule applies across all rooms in this property."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-gray-700">Rule Category</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full h-10 text-xs rounded-xl border border-gray-200 px-3 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-[#953002]"
              >
                <option value="EARLY_BIRD">Early Bird (Advance Booking)</option>
                <option value="LAST_MINUTE">Last Minute Deal (1-2 Days Before)</option>
                <option value="LONG_STAY">Long Stay (Length-of-Stay Savings)</option>
                <option value="CUSTOM">Custom Rule</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-700">Discount %</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  step="any"
                  required
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="h-10 text-xs pr-8 rounded-xl border-gray-200 font-bold"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-gray-700">Advance Days Required</Label>
              <Input
                type="number"
                min={0}
                max={365}
                required
                placeholder="e.g. 15 (0 for none)"
                value={daysInAdvance}
                onChange={(e) => setDaysInAdvance(Math.max(0, Number(e.target.value)))}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
              <span className="text-[10px] text-gray-400">Days before check-in</span>
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-700">Minimum Stay (Nights)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                required
                value={minNights}
                onChange={(e) => setMinNights(Math.max(1, Number(e.target.value)))}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
              <span className="text-[10px] text-gray-400">Min nights required</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Status</span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-[#953002] focus:ring-[#953002] accent-[#953002]"
              />
              <span className={isActive ? "text-emerald-700" : "text-gray-400"}>
                {isActive ? "Active (Enabled)" : "Inactive"}
              </span>
            </label>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-bold h-10 border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold h-10 bg-[#953002] hover:bg-[#7D2802] text-white shadow-sm"
            >
              {isSubmitting ? "Saving..." : editingDiscount ? "Update Rule" : "Create Discount Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
