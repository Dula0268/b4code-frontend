"use client";

import { useState } from "react";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { ownerPricingApi, RatePlan, Discount } from "@/api/owner/pricing.api";
import RatePlanModal from "@/components/owner/rates/rate-plan-modal";
import DiscountRuleModal from "@/components/owner/rates/discount-rule-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tag,
  Percent,
  Plus,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  ShieldCheck,
  Calendar,
  BedDouble,
  Layers,
} from "lucide-react";

export default function RatePlansTab() {
  const { propertyId, rateOverview, fetchRateOverview } = useOwnerPricingStore();

  const [isRatePlanModalOpen, setIsRatePlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RatePlan | null>(null);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const ratePlans = rateOverview?.ratePlans || [];
  const discounts = rateOverview?.discounts || [];

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setIsRatePlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: RatePlan) => {
    setEditingPlan(plan);
    setIsRatePlanModalOpen(true);
  };

  const handleDeletePlan = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete rate plan "${name}"?`)) return;
    setDeletingId(id);
    try {
      await ownerPricingApi.deleteRatePlan(id);
      await fetchRateOverview();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete rate plan.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCreateDiscount = () => {
    setEditingDiscount(null);
    setIsDiscountModalOpen(true);
  };

  const handleOpenEditDiscount = (disc: Discount) => {
    setEditingDiscount(disc);
    setIsDiscountModalOpen(true);
  };

  const handleDeleteDiscount = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete discount rule "${name}"?`)) return;
    setDeletingId(id);
    try {
      await ownerPricingApi.deleteDiscount(id);
      await fetchRateOverview();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete discount rule.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeedDefaults = async () => {
    if (!propertyId) return;
    setIsSeeding(true);
    try {
      // Create standard rate plan
      await ownerPricingApi.createRatePlan({
        propertyId,
        name: "Standard Flexible Rate",
        type: "STANDARD",
        basePrice: 10000,
        minNights: 1,
        isActive: true,
      });

      // Create non-refundable saver
      await ownerPricingApi.createRatePlan({
        propertyId,
        name: "Non-Refundable Saver",
        type: "NON_REFUNDABLE",
        basePrice: 8500,
        minNights: 1,
        isActive: true,
      });

      // Create early bird discount
      await ownerPricingApi.createDiscount({
        propertyId,
        name: "Early Bird 15 Days",
        type: "EARLY_BIRD",
        percentage: 10,
        daysInAdvance: 15,
        minNights: 2,
        isActive: true,
      });

      // Create last minute discount
      await ownerPricingApi.createDiscount({
        propertyId,
        name: "Last Minute Deal",
        type: "LAST_MINUTE",
        percentage: 15,
        daysInAdvance: 1,
        minNights: 1,
        isActive: true,
      });

      // Create long stay discount (7+ nights)
      await ownerPricingApi.createDiscount({
        propertyId,
        name: "Long Stay Weekly Discount",
        type: "LONG_STAY",
        percentage: 15,
        daysInAdvance: 0,
        minNights: 7,
        isActive: true,
      });

      await fetchRateOverview();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to seed default rate plans.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Rate Plans Section */}
      <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#953002]/10 text-[#953002] flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">Base Rate Plans</h3>
              <p className="text-xs text-gray-500">
                Primary pricing structures configured for guest bookings (e.g. Standard Flexible, Non-Refundable Saver).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {ratePlans.length === 0 && (
              <Button
                variant="outline"
                disabled={isSeeding || !propertyId}
                onClick={handleSeedDefaults}
                className="rounded-xl text-xs font-bold h-9 border-[#953002]/20 text-[#953002] hover:bg-[#953002]/5 gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSeeding ? "Initializing..." : "Seed Default Plans"}
              </Button>
            )}
            <Button
              disabled={!propertyId}
              onClick={handleOpenCreatePlan}
              className="bg-[#953002] hover:bg-[#7D2802] text-white rounded-xl text-xs font-bold px-4 h-9 shadow-sm gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rate Plan
            </Button>
          </div>
        </div>

        {ratePlans.length === 0 ? (
          <div className="py-8 px-4 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#953002]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">No Rate Plans Defined</h4>
              <p className="text-[11px] text-gray-500 max-w-sm mt-0.5">
                Define pricing tiers (Standard Flexible, Non-refundable) or click &ldquo;Seed Default Plans&rdquo; to auto-create standard hotel packages.
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant="outline"
                disabled={isSeeding || !propertyId}
                onClick={handleSeedDefaults}
                className="rounded-lg text-xs font-bold h-8"
              >
                Seed Recommended Plans
              </Button>
              <Button
                size="sm"
                disabled={!propertyId}
                onClick={handleOpenCreatePlan}
                className="bg-[#953002] hover:bg-[#7D2802] text-white rounded-lg text-xs font-bold h-8"
              >
                + Create Rate Plan
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gray-600">Plan Name</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Applies To</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Type</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Base Price</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Min Nights</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Status</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ratePlans.map((plan) => (
                  <TableRow key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-semibold text-xs text-gray-900">
                      {plan.name}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {plan.roomTypeName ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          <BedDouble className="w-3 h-3 text-amber-600" />
                          {plan.roomTypeName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          <Layers className="w-3 h-3 text-gray-500" />
                          All Rooms
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {plan.type === "STANDARD"
                          ? "Standard Flexible"
                          : plan.type === "NON_REFUNDABLE"
                          ? "Non-Refundable"
                          : plan.type === "CUSTOM"
                          ? "Custom Package"
                          : plan.type || "Standard"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-black text-emerald-700">
                      LKR {Number(plan.basePrice).toLocaleString()} / night
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-medium">
                      {plan.minNights || 1} night(s)
                    </TableCell>
                    <TableCell>
                      {plan.isActive !== false ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <Check className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditPlan(plan)}
                          title="Edit Rate Plan"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {plan.id && (
                          <button
                            disabled={deletingId === plan.id}
                            onClick={() => handleDeletePlan(plan.id!, plan.name)}
                            title="Delete Rate Plan"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Discounts Section */}
      <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">Rule-Based Discounts</h3>
              <p className="text-xs text-gray-500">
                Advance booking and length-of-stay promotional discounts applied automatically.
              </p>
            </div>
          </div>

          <Button
            disabled={!propertyId}
            onClick={handleOpenCreateDiscount}
            className="bg-[#953002] hover:bg-[#7D2802] text-white rounded-xl text-xs font-bold px-4 h-9 shadow-sm gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Discount Rule
          </Button>
        </div>

        {discounts.length === 0 ? (
          <div className="py-8 px-4 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">No Discount Rules Configured</h4>
              <p className="text-[11px] text-gray-500 max-w-sm mt-0.5">
                Set up Early Bird or Last Minute automated discounts to reward advance or spontaneous bookings.
              </p>
            </div>
            <Button
              size="sm"
              disabled={!propertyId}
              onClick={handleOpenCreateDiscount}
              className="bg-[#953002] hover:bg-[#7D2802] text-white rounded-lg text-xs font-bold h-8 mt-1"
            >
              + Create Discount Rule
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gray-600">Discount Name</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Applies To</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Discount %</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Advance Requirement</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Min Stay</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Status</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((disc) => (
                  <TableRow key={disc.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-semibold text-xs text-gray-900">
                      {disc.name}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {disc.roomTypeName ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          <BedDouble className="w-3 h-3 text-amber-600" />
                          {disc.roomTypeName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          <Layers className="w-3 h-3 text-gray-500" />
                          All Rooms
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-black text-blue-600">
                      {disc.percentage}% OFF
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {disc.daysInAdvance ? `${disc.daysInAdvance} days before check-in` : "None"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-medium">
                      {disc.minNights || 1} night(s)
                    </TableCell>
                    <TableCell>
                      {disc.isActive !== false ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <Check className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditDiscount(disc)}
                          title="Edit Discount Rule"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {disc.id && (
                          <button
                            disabled={deletingId === disc.id}
                            onClick={() => handleDeleteDiscount(disc.id!, disc.name)}
                            title="Delete Discount Rule"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modals */}
      <RatePlanModal
        isOpen={isRatePlanModalOpen}
        onClose={() => setIsRatePlanModalOpen(false)}
        propertyId={propertyId}
        rooms={rateOverview?.rooms || []}
        editingPlan={editingPlan}
        onSaved={fetchRateOverview}
      />

      <DiscountRuleModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        propertyId={propertyId}
        rooms={rateOverview?.rooms || []}
        editingDiscount={editingDiscount}
        onSaved={fetchRateOverview}
      />
    </div>
  );
}
