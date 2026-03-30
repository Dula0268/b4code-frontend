"use client";

import { useRouter, usePathname } from "next/navigation";

interface FinanceHeaderProps {
  activeTab?: "overview" | "transaction" | "refunds";
}

export default function FinanceHeader({ activeTab }: FinanceHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab =
    activeTab ??
    (pathname.includes("/refund")
      ? "refunds"
      : pathname.includes("/transaction")
        ? "transaction"
        : "overview");

  return (
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
            onClick={() => router.push("/admin/finance")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              currentTab === "overview"
                ? "bg-[#C05621] text-white"
                : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => router.push("/admin/finance/transaction")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              currentTab === "transaction"
                ? "bg-[#C05621] text-white"
                : "bg-transparent text-[#9E7B6A] hover:bg-[#FAF5F2]"
            }`}
          >
            Transaction
          </button>
          <button
            onClick={() => router.push("/admin/finance/refund")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              currentTab === "refunds"
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
          <span className="w-5 h-5 rounded-full bg-[#C05621] text-white text-[11px] font-bold flex items-center justify-center">
            8
          </span>
        </button>
      </div>
    </div>
  );
}
