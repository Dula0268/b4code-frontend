"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import PayoutKpiCards from "@/components/features/admin/finance/payout-kpi-cards";
import PayoutTable from "./payout-table";
import PayoutDetailPanel from "./payout-detail-panel";

export default function PayoutPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const router = useRouter();

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Breadcrumb & Back Button ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/finance")}
            className="w-8 h-8 rounded-lg border border-[#E8DDD8] flex items-center justify-center text-[#9E7B6A] hover:bg-[#FAF5F2] hover:text-[#1A1A1A] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#9E7B6A]">Finance</span>
            <ChevronRight size={14} className="text-[#C4B5AB]" />
            <span className="font-bold text-[#C05621]">Payout</span>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <PayoutKpiCards />

        {/* ── Payout Table ── */}
        <PayoutTable onRowClick={() => setPanelOpen(true)} />

        {/* ── Detail Panel ── */}
        <PayoutDetailPanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
        />
      </div>
    </AdminPageLayout>
  );
}
