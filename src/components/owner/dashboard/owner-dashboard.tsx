"use client";

import { useTranslations } from "next-intl";
import { Building, CalendarCheck, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerDashboard() {
  const t = useTranslations('OwnerDashboard');

  return (
    <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-y-auto bg-[#F5F6F8]">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="rounded-[20px] shadow-sm border-[#E8EAED]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-[#6B7280]">Total Properties</CardTitle>
            <div className="w-8 h-8 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center">
              <Building className="h-4 w-4 text-[#953002]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1A1A1A]">0</div>
            <p className="text-xs text-[#6B7280] mt-1">Properties listed</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-[20px] shadow-sm border-[#E8EAED]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-[#6B7280]">Active Bookings</CardTitle>
            <div className="w-8 h-8 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center">
              <CalendarCheck className="h-4 w-4 text-[#953002]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1A1A1A]">0</div>
            <p className="text-xs text-[#6B7280] mt-1">Pending and confirmed</p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] shadow-sm border-[#E8EAED]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-[#6B7280]">Revenue (MTD)</CardTitle>
            <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1A1A1A]">$0.00</div>
            <p className="text-xs text-[#6B7280] mt-1">Month to date</p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] shadow-sm border-[#E8EAED]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-[#6B7280]">Staff Members</CardTitle>
            <div className="w-8 h-8 rounded-full bg-[rgba(149,48,2,0.1)] flex items-center justify-center">
              <Users className="h-4 w-4 text-[#953002]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1A1A1A]">0</div>
            <p className="text-xs text-[#6B7280] mt-1">Active staff</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-[24px] border border-[#E8EAED] shadow-sm p-8 text-center mt-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Welcome to the Owner Portal</h2>
        <p className="text-[#6B7280] max-w-lg mx-auto">
          Start by onboarding your first property. Set up your rooms, upload media, configure your rates, and get ready to welcome guests!
        </p>
      </div>
    </div>
  );
}
