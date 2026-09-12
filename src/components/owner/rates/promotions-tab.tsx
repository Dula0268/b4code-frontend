"use client";

import { useEffect, useState, useCallback } from "react";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { ownerPromotionsApi, PromoCodeDto } from "@/api/owner/promotions.api";
import CreatePromoModal from "@/components/owner/rates/create-promo-modal";
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
  Plus,
  Copy,
  Check,
  Percent,
  Calendar,
  Users,
  Power,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface PromotionsTabProps {
  propertyName?: string;
}

export default function PromotionsTab({ propertyName }: PromotionsTabProps) {
  const { propertyId } = useOwnerPricingStore();
  const [promotions, setPromotions] = useState<PromoCodeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ownerPromotionsApi.getPromotions(propertyId || undefined);
      setPromotions(data);
    } catch (err: any) {
      console.error("Failed to load promotions", err);
      setError(err.response?.data?.message || "Failed to load promotions.");
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggle = async (id: number) => {
    setActionLoadingId(id);
    try {
      const updated = await ownerPromotionsApi.togglePromotion(id);
      setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to toggle promotion status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;
    setActionLoadingId(id);
    try {
      await ownerPromotionsApi.deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete promo code.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const totalCodes = promotions.length;
  const activeCodes = promotions.filter((p) => p.active && p.isValid).length;
  const totalRedemptions = promotions.reduce((acc, curr) => acc + (curr.currentUses || 0), 0);

  const getStatusBadge = (promo: PromoCodeDto) => {
    const today = new Date().toISOString().split("T")[0];
    if (!promo.active) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200 text-[11px] font-semibold">
          Inactive
        </Badge>
      );
    }
    if (promo.validTo < today) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-semibold">
          Expired
        </Badge>
      );
    }
    if (promo.maxUses != null && promo.currentUses >= promo.maxUses) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[11px] font-semibold">
          Exhausted
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none text-[11px] font-bold">
        Active
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#953002]/10 text-[#953002] flex items-center justify-center shrink-0 shadow-2xs">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A]">Promo Codes & Discounts</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Create marketing vouchers to drive direct bookings and offer seasonal discounts.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#953002] hover:bg-[#7D2802] text-white rounded-xl text-xs font-bold px-5 h-10 shadow-sm gap-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Promo Code
        </Button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Codes</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalCodes}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Promos</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeCodes}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Uses</p>
            <p className="text-2xl font-black text-[#953002] mt-1">{totalRedemptions}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#953002]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Promotions Table */}
      <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Active & Historical Promo Codes</h3>
          <span className="text-xs text-gray-400 font-semibold">{promotions.length} promotions</span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="w-6 h-6 border-2 border-[#953002] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Loading promotions...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-12 px-4 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-[#953002]">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">No Promo Codes Created Yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Create promotional discount codes (e.g. 15% OFF for early bookings) to attract more guests.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 bg-[#953002] hover:bg-[#7D2802] text-white rounded-xl text-xs font-bold px-4 h-9 shadow-sm gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Promo Code
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gray-600">Promo Code</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Discount</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Scope</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Validity Period</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Usage Progress</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600">Status</TableHead>
                  <TableHead className="text-xs font-bold text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                  const isActionLoading = actionLoadingId === promo.id;
                  const usagePercent =
                    promo.maxUses != null
                      ? Math.min(100, Math.round((promo.currentUses / promo.maxUses) * 100))
                      : 0;

                  return (
                    <TableRow key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Promo Code & Copy */}
                      <TableCell className="font-medium text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 tracking-wider">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            title="Copy promo code"
                            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            {copiedCode === promo.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] truncate">
                          {promo.description}
                        </p>
                      </TableCell>

                      {/* Discount */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-black text-xs text-[#953002] bg-[#953002]/10 px-2 py-0.5 rounded-md">
                          {promo.discountPercent}% OFF
                        </span>
                      </TableCell>

                      {/* Scope */}
                      <TableCell className="text-xs font-medium text-gray-700">
                        {promo.propertyName ? (
                          <span className="font-bold text-gray-900">{promo.propertyName}</span>
                        ) : (
                          <span className="text-gray-500 italic">All Properties</span>
                        )}
                      </TableCell>

                      {/* Validity Period */}
                      <TableCell className="text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {promo.validFrom} <span className="text-gray-300">→</span> {promo.validTo}
                          </span>
                        </div>
                      </TableCell>

                      {/* Usage Progress */}
                      <TableCell>
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-700">{promo.currentUses} used</span>
                            <span className="text-gray-400 font-medium">
                              {promo.maxUses != null ? `/ ${promo.maxUses}` : "Unlimited"}
                            </span>
                          </div>
                          {promo.maxUses != null && (
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent >= 100
                                    ? "bg-red-500"
                                    : usagePercent >= 75
                                    ? "bg-amber-500"
                                    : "bg-[#953002]"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(promo)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active Button */}
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleToggle(promo.id)}
                            title={promo.active ? "Deactivate code" : "Activate code"}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              promo.active
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button (Only enabled if currentUses == 0) */}
                          <button
                            disabled={isActionLoading || promo.currentUses > 0}
                            onClick={() => handleDelete(promo.id, promo.code)}
                            title={
                              promo.currentUses > 0
                                ? "Cannot delete promo code that has been redeemed"
                                : "Delete promo code"
                            }
                            className={`p-1.5 rounded-lg border transition-all ${
                              promo.currentUses > 0
                                ? "border-transparent text-gray-300 cursor-not-allowed"
                                : "border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create Promo Modal */}
      <CreatePromoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={propertyId}
        propertyName={propertyName}
        onCreated={(newPromo) => {
          setPromotions((prev) => [newPromo, ...prev]);
        }}
      />
    </div>
  );
}
