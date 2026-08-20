"use client";

import AdminPageLayout from "@/components/admin/admin-page-layout";
import FinanceHeader from "@/components/admin/finance/finance-header";
import RefundTable from "@/components/admin/finance/refund/refund-table";
import { useState } from "react";

export default function RefundPage() {
  const [activeSubTab, setActiveSubTab] = useState<"refunds" | "complaints">("refunds");

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Header with main tabs ── */}
        <FinanceHeader activeTab="refunds" />

        {/* ── Sub Tabs ── */}
        <div className="flex items-center gap-4 border-b border-[#F0EBE7] pb-2 px-2">
          <button
            onClick={() => setActiveSubTab("refunds")}
            className={`text-[15px] font-extrabold pb-2 border-b-[3px] transition-all ${
              activeSubTab === "refunds"
                ? "border-[#C05621] text-[#1A1A1A]"
                : "border-transparent text-[#9E7B6A] hover:text-[#1A1A1A]"
            }`}
          >
            Refund Requests
          </button>
          <button
            onClick={() => setActiveSubTab("complaints")}
            className={`text-[15px] font-extrabold pb-2 border-b-[3px] transition-all ${
              activeSubTab === "complaints"
                ? "border-[#C05621] text-[#1A1A1A]"
                : "border-transparent text-[#9E7B6A] hover:text-[#1A1A1A]"
            }`}
          >
            Guest Complaints
          </button>
        </div>

        {/* ── Content ── */}
        {activeSubTab === "refunds" ? (
          <RefundTable />
        ) : (
          <div className="bg-white rounded-2xl border border-[#F0EBE7] p-8 text-center min-h-[400px] flex items-center justify-center">
            <p className="text-[#9E7B6A] font-medium">Guest complaints module is coming soon.</p>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
