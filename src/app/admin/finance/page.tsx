"use client";

import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import RevenueCard from "@/components/features/admin/finance/kpi-cards/revenue-card";
import PlatformCommissionCard from "@/components/features/admin/finance/kpi-cards/platform-commission-card";
import TotalPayoutCard from "@/components/features/admin/finance/kpi-cards/total-payout";
import RefundsCard from "@/components/features/admin/finance/kpi-cards/refunds";
import RevenueTrendChart from "@/components/features/admin/finance/revenue-trend-chart";
import RecentTransactions from "@/components/features/admin/finance/recent-transaction";
import { useState } from "react";

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<"transaction" | "refunds">("transaction");

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

                    {/* Tabs + Payout button */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Transaction / Refunds tabs */}
                        <div className="flex items-center border border-[#E8DDD8] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setActiveTab("transaction")}
                                className={`px-5 py-2 text-sm font-medium transition-colors ${activeTab === "transaction"
                                        ? "bg-white text-[#1A1A1A]"
                                        : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
                                    }`}
                            >
                                Transaction
                            </button>
                            <button
                                onClick={() => setActiveTab("refunds")}
                                className={`px-5 py-2 text-sm font-medium transition-colors ${activeTab === "refunds"
                                        ? "bg-white text-[#1A1A1A]"
                                        : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
                                    }`}
                            >
                                Refunds
                            </button>
                        </div>

                        {/* Payout button with badge */}
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#C05621] text-[#C05621] text-sm font-semibold hover:bg-[#FDEADE] transition-colors">
                            Payout
                            <span className="w-5 h-5 rounded-full bg-[#C05621] text-white text-[11px] font-bold flex items-center justify-center">
                                8
                            </span>
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="flex gap-4">
                    <RevenueCard />
                    <PlatformCommissionCard />
                    <TotalPayoutCard />
                    <RefundsCard />
                </div>

                {/* ── Chart + Recent Transactions ── */}
                <div className="flex gap-5 items-stretch">
                    <RevenueTrendChart />
                    <RecentTransactions />
                </div>

            </div>
        </AdminPageLayout>
    );
}
