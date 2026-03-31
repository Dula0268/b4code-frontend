"use client";

import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import FinanceHeader from "@/components/features/admin/finance/finance-header";
import TransactionTable from "./transaction-table";

export default function TransactionPage() {
  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Header with tabs ── */}
        <FinanceHeader activeTab="transaction" />

        {/* ── Transaction Table ── */}
        <TransactionTable />
      </div>
    </AdminPageLayout>
  );
}
