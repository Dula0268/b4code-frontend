"use client";

import { useEffect, useState } from "react";
import OwnerHeader from "@/components/owner/layout/owner-header";
import { useOwnerGuard } from "@/hooks/use-owner-guard";
import AccessDenied from "@/components/shared/auth/access-denied";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
import { ownerPricingApi } from "@/api/owner/pricing.api";
import { useAuthStore } from "@/store/auth/auth.store";
import BulkEditPriceModal from "@/components/owner/rates/bulk-edit-price-modal";
import SeasonalPricingModal from "@/components/owner/rates/seasonal-pricing-modal";
import SeasonalPricingTab from "@/components/owner/rates/seasonal-pricing-tab";
import RatePlansTab from "@/components/owner/rates/rate-plans-tab";
import PromotionsTab from "@/components/owner/rates/promotions-tab";
import RestrictionsTab from "@/components/owner/rates/restrictions-tab";
import RatesCalendar from "@/components/owner/rates/rates-calendar";
import { Calendar, Sparkles, Tag, Building2, AlertCircle, TicketPercent, ShieldAlert } from "lucide-react";

export default function OwnerRatesPage() {
  const { status, userRole } = useOwnerGuard();
  const { user } = useAuthStore();
  const { propertyId, setPropertyId, error } = useOwnerPricingStore();

  const [properties, setProperties] = useState<Array<{ id: number; name: string }>>([]);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    // Load ONLY the authenticated owner's properties
    ownerPricingApi
      .getOwnerProperties()
      .then((list) => {
        console.log("[OwnerRatesPage] Fetched owner properties count:", list.length, list);
        setProperties(list);
        if (list.length > 0) {
          const storedPid = sessionStorage.getItem("selected_property_id");
          const numericStoredPid = storedPid ? Number(storedPid) : null;
          // Verify that the storedPid actually belongs to this owner
          const exists = list.some((p) => p.id === numericStoredPid);
          const activePid = exists && numericStoredPid ? numericStoredPid : list[0].id;
          setPropertyId(activePid);
          sessionStorage.setItem("selected_property_id", String(activePid));
        }
      })
      .catch((err) => {
        console.warn("Could not load owner properties list:", err);
      });
  }, [setPropertyId]);

  if (status === "loading") {
    return (
      <div className="flex-1 flex flex-col p-6 gap-6 bg-[#F8F9FA] mt-[64px]">
        <Skeleton className="h-16 w-full rounded-2xl bg-white" />
        <Skeleton className="h-[600px] w-full rounded-3xl bg-white" />
      </div>
    );
  }

  if (status === "unauthorized") {
    return <AccessDenied userRole={userRole} requiredRole="Owner" />;
  }

  const selectedPropertyName =
    properties.find((p) => p.id === propertyId)?.name || "Select Property";

  return (
    <>
      <OwnerHeader
        title="Rates & Pricing"
        subtitle="Manage daily room rates, seasonal surges, and price rules"
        actions={
          <div className="flex items-center gap-2 bg-[#F5F6F8] border border-[#E8EAED] rounded-full px-3 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#953002]" />
            <select
              value={propertyId || ""}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setPropertyId(newId);
                sessionStorage.setItem("selected_property_id", String(newId));
              }}
              aria-label="Select target property"
              className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer text-xs"
            >
              {properties.length === 0 ? (
                <option value="">No Properties</option>
              ) : (
                properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>
        }
      />

      <main className="mt-[64px] flex-1 p-4 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Error Alert if any */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State if owner has no properties */}
        {properties.length === 0 && (
          <div className="bg-amber-50/60 border border-amber-200 text-amber-900 p-8 rounded-3xl text-sm flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">No Properties Found</h3>
              <p className="text-xs text-gray-600 mt-1 max-w-md">
                You do not have any properties registered under your owner account yet. Once you create a property listing, its daily rates and availability calendar will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-white border border-[#E8EAED] p-1.5 rounded-2xl shadow-2xs inline-flex h-auto gap-1 flex-wrap">
            <TabsTrigger
              value="calendar"
              className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-[#953002] data-[state=active]:text-white transition-all gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              Pricing Calendar
            </TabsTrigger>
            <TabsTrigger
              value="seasonal"
              className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-[#953002] data-[state=active]:text-white transition-all gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Seasonal Rules & Surge
            </TabsTrigger>
            <TabsTrigger
              value="rate-plans"
              className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-[#953002] data-[state=active]:text-white transition-all gap-2"
            >
              <Tag className="w-3.5 h-3.5" />
              Rate Plans
            </TabsTrigger>
            <TabsTrigger
              value="promotions"
              className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-[#953002] data-[state=active]:text-white transition-all gap-2"
            >
              <TicketPercent className="w-3.5 h-3.5" />
              Promo Codes & Discounts
            </TabsTrigger>
            <TabsTrigger
              value="restrictions"
              className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-[#953002] data-[state=active]:text-white transition-all gap-2"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Restrictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0 outline-none">
            <RatesCalendar />
          </TabsContent>

          {/* Tab 2: Seasonal Pricing */}
          <TabsContent value="seasonal" className="mt-0 outline-none">
            <SeasonalPricingTab />
          </TabsContent>

          {/* Tab 3: Rate Plans */}
          <TabsContent value="rate-plans" className="mt-0 outline-none">
            <RatePlansTab />
          </TabsContent>

          {/* Tab 4: Promo Codes & Discounts */}
          <TabsContent value="promotions" className="mt-0 outline-none">
            <PromotionsTab propertyName={selectedPropertyName} />
          </TabsContent>

          {/* Tab 5: Restrictions */}
          <TabsContent value="restrictions" className="mt-0 outline-none">
            <RestrictionsTab propertyName={selectedPropertyName} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <BulkEditPriceModal />
        <SeasonalPricingModal />
      </main>
    </>
  );
}
