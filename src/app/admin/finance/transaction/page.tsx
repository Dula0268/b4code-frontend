"use client";

import AdminPageLayout from "@/components/admin/admin-page-layout";
import FinanceHeader from "@/components/admin/finance/finance-header";
import TransactionTable from "@/components/admin/finance/transaction/transaction-table";

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
