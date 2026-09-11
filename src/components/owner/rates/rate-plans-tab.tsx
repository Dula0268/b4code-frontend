"use client";

import { useState } from "react";
import { useOwnerPricingStore } from "@/store/owner/owner-pricing.store";
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
import { Tag, Percent, ShieldCheck, Plus, Check } from "lucide-react";

export default function RatePlansTab() {
  const { rateOverview } = useOwnerPricingStore();

  const ratePlans = rateOverview?.ratePlans || [
    {
      id: 1,
      name: "Standard Flexible Rate",
      type: "STANDARD",
      basePrice: 10000,
      minNights: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "Non-Refundable Saver",
      type: "NON_REFUNDABLE",
      basePrice: 8500,
      minNights: 1,
      isActive: true,
    },
    {
      id: 3,
      name: "Long Stay Weekly Discount",
      type: "WEEKLY",
      basePrice: 7500,
      minNights: 7,
      isActive: true,
    },
  ];

  const discounts = rateOverview?.discounts || [
    {
      id: 1,
      name: "Early Bird 15 Days",
      percentage: 10,
      daysInAdvance: 15,
      minNights: 2,
      isActive: true,
    },
    {
      id: 2,
      name: "Last Minute Deal",
      percentage: 15,
      daysInAdvance: 1,
      minNights: 1,
      isActive: true,
    },
  ];

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
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Base Rate Plans
              </h3>
              <p className="text-xs text-gray-500">
                Primary pricing structures configured for guest bookings.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-600">Plan Name</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Type</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Base Price</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Min Nights</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratePlans.map((plan) => (
                <TableRow key={plan.id || plan.name}>
                  <TableCell className="font-semibold text-xs text-gray-900">
                    {plan.name}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                      {plan.type || "STANDARD"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">
                    LKR {Number(plan.basePrice).toLocaleString()} / night
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {plan.minNights || 1} night(s)
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      <Check className="w-3 h-3 mr-1" /> Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Discounts Section */}
      <div className="bg-white rounded-3xl border border-[#E8EAED] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Rule-Based Discounts
              </h3>
              <p className="text-xs text-gray-500">
                Advance booking and length-of-stay promotional discounts.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-600">Discount Name</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Discount %</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Advance Requirement</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Min Stay</TableHead>
                <TableHead className="text-xs font-bold text-gray-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((disc) => (
                <TableRow key={disc.id || disc.name}>
                  <TableCell className="font-semibold text-xs text-gray-900">
                    {disc.name}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-blue-600">
                    {disc.percentage}% OFF
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {disc.daysInAdvance ? `${disc.daysInAdvance} days before check-in` : "None"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {disc.minNights || 1} night(s)
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      <Check className="w-3 h-3 mr-1" /> Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
