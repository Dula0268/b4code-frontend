"use client";

import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarRange,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Plus,
  RotateCcw,
} from "lucide-react";

export default function SeasonalPricingTab() {
  const {
    propertyId,
    seasonalRules,
    deleteSeasonalRule,
    applySeasonalRuleToCalendar,
    revertSeasonalRuleFromCalendar,
    setSeasonalModalOpen,
    applyingRuleId,
    actionSuccess,
    appliedRules,
  } = useOwnerPricingStore();

  const activeRuleList = propertyId ? appliedRules[propertyId] || [] : [];

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#953002]/10 via-amber-500/10 to-orange-500/5 border border-[#953002]/20 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#953002] flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A]">
              Seasonal Rates & Surge Rules
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Automate multi-month price increases during peak seasons and discounts during off-peak periods.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setSeasonalModalOpen(true)}
          className="bg-[#953002] hover:bg-[#7a2701] text-white rounded-xl text-xs font-bold h-10 px-5 gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Season Rule
        </Button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seasonalRules.map((rule) => {
          const isSurge = rule.priceAdjustmentPercent > 0;
          const isThisRuleLoading = applyingRuleId === rule.id;
          const isApplied = activeRuleList.includes(rule.id);
          return (
            <div
              key={rule.id}
              className={`bg-white rounded-2xl border ${
                isApplied ? "border-emerald-300 ring-1 ring-emerald-200" : "border-[#E8EAED]"
              } p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-[#1A1A1A]">
                    {rule.name}
                  </span>
                  <Badge
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isSurge
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-blue-50 text-blue-700 border border-blue-300"
                    }`}
                  >
                    {isSurge ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {isSurge ? "+" : ""}
                    {rule.priceAdjustmentPercent}%
                  </Badge>
                </div>

                {isApplied && (
                  <div className="mb-2.5">
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full gap-1 inline-flex items-center">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active on Calendar
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-2.5 mb-3">
                  <CalendarRange className="w-4 h-4 text-[#953002] shrink-0" />
                  <span className="font-medium">
                    {rule.startDate} &rarr; {rule.endDate}
                  </span>
                </div>

                {rule.description && (
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    {rule.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                {isApplied ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applySeasonalRuleToCalendar(rule.id)}
                      disabled={isThisRuleLoading || applyingRuleId !== null}
                      className="rounded-xl text-xs h-9 px-2.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold gap-1 flex-1 shadow-2xs"
                    >
                      {isThisRuleLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      Sync Rate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => revertSeasonalRuleFromCalendar(rule.id)}
                      disabled={isThisRuleLoading || applyingRuleId !== null}
                      className="rounded-xl text-xs h-9 px-2 text-gray-500 hover:text-red-700 hover:bg-red-50 font-medium gap-1"
                      title="Revert seasonal rate back to standard base price"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applySeasonalRuleToCalendar(rule.id)}
                    disabled={isThisRuleLoading || applyingRuleId !== null}
                    className="rounded-xl text-xs h-9 px-3 border-[#953002]/30 text-[#953002] hover:bg-[#953002]/10 font-bold gap-1.5 flex-1"
                  >
                    {isThisRuleLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {isThisRuleLoading ? "Applying..." : "Apply to Calendar"}
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isThisRuleLoading || applyingRuleId !== null}
                  onClick={() => deleteSeasonalRule(rule.id)}
                  className="h-9 w-9 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Delete Season"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
