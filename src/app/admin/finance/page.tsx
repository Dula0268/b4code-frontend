"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import RevenueCard from "@/components/features/admin/finance/kpi-cards/revenue-card";
import PlatformCommissionCard from "@/components/features/admin/finance/kpi-cards/platform-commission-card";
import TotalPayoutCard from "@/components/features/admin/finance/kpi-cards/total-payout";
import RefundsCard from "@/components/features/admin/finance/kpi-cards/refunds";
import RevenueTrendChart from "@/components/features/admin/finance/revenue-trend-chart";
import RecentTransactions from "@/components/features/admin/finance/recent-transaction";
import TransactionTable from "./transaction/transaction-table";
import RefundTable from "./refund/refund-table";

export default function FinancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "transaction" | "refunds"
  >("overview");

  const { summary, fetchSummary, fetchRevenueTrend } = useAdminFinanceStore();

  useEffect(() => {
    fetchSummary();
    fetchRevenueTrend();
  }, [fetchSummary, fetchRevenueTrend]);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Title + subtitle */}
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight">
              Finance
            </h1>
            <p className="text-[13px] text-[#9E7B6A] mt-1">
              Platform-wide financial oversight
            </p>
          </div>

          {/* Tabs + Payout button - Moved to Right */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Overview / Transaction / Refunds tabs */}
            <div className="flex items-center border border-[#E8DDD8] rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-[#C05621] text-white"
                    : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("transaction")}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === "transaction"
                    ? "bg-[#C05621] text-white"
                    : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
                }`}
              >
                Transaction
              </button>
              <button
                onClick={() => setActiveTab("refunds")}
                className={`px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === "refunds"
                    ? "bg-[#C05621] text-white"
                    : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
                }`}
              >
                Refunds
              </button>
            </div>

            {/* Payout button with badge */}
            <button
              onClick={() => router.push("/admin/finance/payout")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#C05621] text-[#C05621] text-sm font-semibold hover:bg-[#FDEADE] transition-colors"
            >
              Payout
            </button>
          </div>
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 w-full">
              <div className="w-full"><RevenueCard /></div>
              <div className="w-full"><PlatformCommissionCard /></div>
              <div className="w-full"><TotalPayoutCard /></div>
              <div className="w-full"><RefundsCard /></div>
            </div>

            {/* Chart + Recent Transactions */}
            <div className="flex gap-5 items-stretch">
              <RevenueTrendChart />
              <RecentTransactions />
            </div>
          </>
        )}

        {activeTab === "transaction" && <TransactionTable />}

        {activeTab === "refunds" && <RefundTable />}
      </div>
    </AdminPageLayout>
  );
}
