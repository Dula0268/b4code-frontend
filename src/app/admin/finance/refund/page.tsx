"use client";

import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import FinanceHeader from "@/components/features/admin/finance/finance-header";
import RefundTable from "./refund-table";

export default function RefundPage() {
  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Header with tabs ── */}
        <FinanceHeader activeTab="refunds" />

        {/* ── Refund Table ── */}
        <RefundTable />
      </div>
    </AdminPageLayout>
  );
}
