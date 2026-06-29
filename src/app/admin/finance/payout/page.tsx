"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PayoutKpiCards from "@/components/admin/finance/payout-kpi-cards";
import PayoutTable from "@/components/admin/finance/payout/payout-table";
import PayoutDetailPanel from "@/components/admin/finance/payout/payout-detail-panel";
import type { PayoutDto } from "@/api/admin/finance.api";
import { FinanceApi } from "@/api/admin/finance.api";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import ExportButton from "@/components/admin/audit-logs/ExportButton";

export default function PayoutPage() {
  const [selectedPayout, setSelectedPayout] = useState<PayoutDto | null>(null);
  const router = useRouter();
  const { payouts, fetchSummary } = useAdminFinanceStore();

  useEffect(() => {
    if (selectedPayout) {
      const updated = payouts.find((p) => p.id === selectedPayout.id);
      if (updated && updated.status !== selectedPayout.status) {
        setSelectedPayout(updated);
      }
    }
  }, [payouts, selectedPayout]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Breadcrumb & Back Button & Export ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/finance")}
              className="w-8 h-8 rounded-lg border border-[#E8DDD8] flex items-center justify-center text-[#9E7B6A] hover:bg-[#FAF5F2] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9E7B6A]">Finance</span>
              <ChevronRight size={14} className="text-[#C4B5AB]" />
              <span className="font-bold text-[#C05621]">Payout</span>
            </div>
          </div>
          <ExportButton
            filenamePrefix="payouts"
            onExportCsv={() => FinanceApi.exportPayoutsCsv({})}
            onExportPdf={() => FinanceApi.exportPayoutsPdf({})}
          />
        </div>

        {/* ── KPI Cards ── */}
        <PayoutKpiCards />

        {/* ── Main Content Area ── */}
        <div className="flex gap-6 items-start">
          <div className={`transition-all duration-300 ${selectedPayout ? "flex-1 min-w-0" : "w-full"}`}>
            <PayoutTable onRowClick={(p) => setSelectedPayout(p)} selectedPayoutId={selectedPayout?.id} />
          </div>

          <PayoutDetailPanel
            isOpen={!!selectedPayout}
            onClose={() => setSelectedPayout(null)}
            payout={selectedPayout}
          />
        </div>
      </div>
    </AdminPageLayout>
  );
}
