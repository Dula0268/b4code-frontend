"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import PayoutKpiCards from "@/components/features/admin/finance/payout-kpi-cards";
import PayoutTable from "@/components/features/admin/finance/payout/payout-table";
import PayoutDetailPanel from "@/components/features/admin/finance/payout/payout-detail-panel";
import type { PayoutDto } from "@/api/admin/finance.api";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import { useEffect } from "react";

export default function PayoutPage() {
  const [selectedPayout, setSelectedPayout] = useState<PayoutDto | null>(null);
  const router = useRouter();
  const { fetchSummary } = useAdminFinanceStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
        <PayoutTable onRowClick={(p) => setSelectedPayout(p)} />

        {/* ── Detail Panel ── */}
        <PayoutDetailPanel
          isOpen={!!selectedPayout}
          onClose={() => setSelectedPayout(null)}
          payout={selectedPayout}
        />
      </div>
    </AdminPageLayout>
  );
}
