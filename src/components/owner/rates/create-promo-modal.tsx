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
import { Tag, Sparkles, AlertCircle, Percent } from "lucide-react";
import { ownerPromotionsApi, PromoCodeDto } from "@/api/owner/promotions.api";

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number | null;
  propertyName?: string;
  onCreated: (promo: PromoCodeDto) => void;
}

export default function CreatePromoModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  onCreated,
}: CreatePromoModalProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [validFrom, setValidFrom] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [validTo, setValidTo] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [maxUses, setMaxUses] = useState<number>(50);
  const [applyToAll, setApplyToAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter a promo code.");
      return;
    }

    if (!validFrom || !validTo) {
      setError("Please select both valid from and valid to dates.");
      return;
    }

    if (validTo < validFrom) {
      setError("Valid to date must be on or after valid from date.");
      return;
    }

    if (discountPercent < 1 || discountPercent > 100) {
      setError("Discount percentage must be between 1% and 100%.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: cleanCode,
        description: description.trim() || `${discountPercent}% discount promo code`,
        discountPercent,
        validFrom,
        validTo,
        maxUses: isUnlimited ? null : maxUses,
        propertyId: applyToAll ? null : propertyId,
      };

      const created = await ownerPromotionsApi.createPromotion(payload);
      onCreated(created);
      onClose();
      // Reset form
      setCode("");
      setDescription("");
      setDiscountPercent(15);
      setIsUnlimited(true);
      setError(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create promo code.";
      setError(msg);
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
            Create Promo Code
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Generate promotional discount vouchers that guests can apply during checkout.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Promo Code Input */}
          <div>
            <Label className="text-xs font-bold text-gray-700">Promo Code</Label>
            <div className="relative mt-1">
              <Input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. SUMMER20, WELCOME10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                className="h-10 text-xs font-mono font-bold tracking-wider uppercase rounded-xl border-gray-200 pl-3 pr-10 focus-visible:ring-[#953002]"
              />
              <Sparkles className="w-4 h-4 text-amber-500 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Letters, numbers, hyphens, and underscores only. Max 20 characters.
            </p>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-bold text-gray-700">Description</Label>
            <Input
              type="text"
              required
              placeholder="e.g. 20% off summer weekend bookings"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 h-10 text-xs rounded-xl border-gray-200"
            />
          </div>

          {/* Discount Percentage */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#953002]" />
                Discount Percentage
              </Label>
              <span className="text-sm font-black text-[#953002] bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                {discountPercent}% OFF
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full accent-[#953002] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-0.5">
              <span>1% (Minimum)</span>
              <span>25%</span>
              <span>50%</span>
              <span>100% (Free)</span>
            </div>
          </div>

          {/* Validity Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-gray-700">Valid From</Label>
              <Input
                type="date"
                required
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700">Valid To (Expiry)</Label>
              <Input
                type="date"
                required
                value={validTo}
                min={validFrom}
                onChange={(e) => setValidTo(e.target.value)}
                className="mt-1 h-10 text-xs rounded-xl border-gray-200"
              />
            </div>
          </div>

          {/* Usage Limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-700">Maximum Usage Limit</Label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={isUnlimited}
                  onChange={(e) => setIsUnlimited(e.target.checked)}
                  className="rounded text-[#953002] focus:ring-[#953002] accent-[#953002]"
                />
                <span>Unlimited</span>
              </label>
            </div>
            {!isUnlimited && (
              <Input
                type="number"
                min={1}
                max={10000}
                required
                placeholder="e.g. 50 bookings"
                value={maxUses}
                onChange={(e) => setMaxUses(Math.max(1, Number(e.target.value)))}
                className="h-10 text-xs rounded-xl border-gray-200"
              />
            )}
          </div>

          {/* Property Scoping */}
          {propertyId && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-600">
                Applicable To:{" "}
                <strong className="text-gray-900 font-bold">
                  {applyToAll ? "All My Properties" : (propertyName || "Selected Property")}
                </strong>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="rounded text-[#953002] focus:ring-[#953002] accent-[#953002]"
                />
                <span>All Properties</span>
              </label>
            </div>
          )}

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
              {isSubmitting ? "Creating..." : "Create Promo Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
