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
import { Tag, AlertCircle } from "lucide-react";
import { ownerPricingApi, RatePlan } from "@/api/owner/pricing.api";

interface RatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number | null;
  rooms?: Array<{ id: number; name: string; baseRate?: string }>;
  editingPlan?: RatePlan | null;
  onSaved: () => void;
}

export default function RatePlanModal({
  isOpen,
  onClose,
  propertyId,
  rooms = [],
  editingPlan,
  onSaved,
}: RatePlanModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("STANDARD");
  const [roomTypeId, setRoomTypeId] = useState<number | null>(null);
  const [basePrice, setBasePrice] = useState<number>(10000);
  const [minNights, setMinNights] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name || "");
      setType(editingPlan.type || "STANDARD");
      setRoomTypeId(editingPlan.roomTypeId || null);
      setBasePrice(editingPlan.basePrice ? Number(editingPlan.basePrice) : 10000);
      setMinNights(editingPlan.minNights || 1);
      setIsActive(editingPlan.isActive !== false);
    } else {
      setName("");
      setType("STANDARD");
      setRoomTypeId(null);
      setBasePrice(10000);
      setMinNights(1);
      setIsActive(true);
    }
    setError(null);
  }, [editingPlan, isOpen]);

  if (!isOpen) return null;

  const handleRoomChange = (val: string) => {
    if (!val) {
      setRoomTypeId(null);
    } else {
      const rId = Number(val);
      setRoomTypeId(rId);
      const matched = rooms.find((r) => r.id === rId);
      if (matched && matched.baseRate && !editingPlan) {
        setBasePrice(Number(matched.baseRate));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      setError("Please select a property first.");
      return;
    }
    if (!name.trim()) {
      setError("Plan name is required.");
      return;
    }
    if (basePrice <= 0) {
      setError("Base price must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingPlan && editingPlan.id) {
        await ownerPricingApi.updateRatePlan(editingPlan.id, {
          propertyId,
          roomTypeId: roomTypeId || null,
          name: name.trim(),
          type,
          basePrice,
          minNights,
          isActive,
        });
      } else {
        await ownerPricingApi.createRatePlan({
          propertyId,
          roomTypeId: roomTypeId || null,
          name: name.trim(),
          type,
          basePrice,
          minNights,
          isActive,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to save rate plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-3xl shadow-2xl p-6 border border-[#E8EAED]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#953002]" />
            {editingPlan ? "Edit Rate Plan" : "Create New Rate Plan"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Define guest pricing tiers, cancellation policies, and minimum night requirements.
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
            <Label className="text-xs font-bold text-gray-700">Plan Name</Label>
            <Input
              type="text"
              required
              placeholder="e.g. Standard Flexible Rate, Non-Refundable Saver"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 text-xs rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-700">Applies To (Room)</Label>
            <select
              value={roomTypeId || ""}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="mt-1 w-full h-10 text-xs rounded-xl border border-gray-200 px-3 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-[#953002]"
            >
              <option value="">All Rooms (Property-Wide)</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.baseRate ? `(Current: LKR ${Number(r.baseRate).toLocaleString()})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              {roomTypeId
                ? "This rate plan applies specifically to the selected room."
                : "Standard price will sync to all rooms in this property."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-gray-700">Pricing Tier / Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full h-10 text-xs rounded-xl border border-gray-200 px-3 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-[#953002]"
              >
                <option value="STANDARD">Standard Flexible (Free Cancellation)</option>
                <option value="NON_REFUNDABLE">Non-Refundable Saver (No Refund)</option>
                <option value="CUSTOM">Custom Package Tier</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-700">Minimum Nights</Label>
              <Input
                type="number"
                min={1}
                max={30}
                required
                value={minNights}
                onChange={(e) => setMinNights(Math.max(1, Number(e.target.value)))}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-700">Base Price (LKR per night)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">LKR</span>
              <Input
                type="number"
                min={0}
                step="any"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="h-10 text-xs pl-12 rounded-xl border-gray-200 font-bold"
              />
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
                {isActive ? "Active (Bookable)" : "Inactive"}
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
              {isSubmitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Rate Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
