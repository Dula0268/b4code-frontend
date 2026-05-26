"use client";

import { Wallet, Waves, CircleDollarSign, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

export default function PayoutKpiCards() {
  const { summary, summaryLoading, payoutsTotalElements, payouts } = useAdminFinanceStore();

  const pendingPayouts = payouts.filter(p => p.status === "Hold" || p.status === "Pending").length;

  if (summaryLoading || !summary) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-[#F0EBE7] p-5 flex items-center justify-center shadow-sm h-[130px]">
             <Loader2 className="animate-spin text-[#C05621]" size={24} />
          </div>
        ))}
      </div>
    );
  }

  const revenueTrendStr = summary.revenueGrowth || "0%";
  const revenueUp = !revenueTrendStr.startsWith("-");
  
  const payoutTrendStr = summary.payoutGrowth || "0%";
  const payoutUp = !payoutTrendStr.startsWith("-");

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* All Payouts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-[136px]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm text-gray-500 font-medium">All Payouts</h3>
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Wallet size={16} className="text-[#2563EB]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
            {payoutsTotalElements}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm text-gray-400 font-medium">All payouts in whole system</span>
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-[136px]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm text-gray-500 font-medium">Pending Payouts</h3>
          <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
            <Waves size={16} className="text-[#EA580C]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
            {pendingPayouts}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {pendingPayouts > 0 ? (
              <span className="flex items-center text-sm font-semibold text-red-500">
                <AlertTriangle size={14} className="mr-1" /> Action required
              </span>
            ) : (
              <span className="flex items-center text-sm font-semibold text-emerald-500">
                All cleared
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Total Payouts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-[136px]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm text-gray-500 font-medium">Total Payouts</h3>
          <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
            <CircleDollarSign size={16} className="text-[#16A34A]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
            LKR {(summary.totalPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`flex items-center text-sm font-semibold ${payoutUp ? "text-emerald-500" : "text-red-500"}`}>
              {payoutUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />} 
              {payoutTrendStr}
            </span>
            <span className="text-sm text-gray-400 font-medium">vs last month</span>
          </div>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-[136px]">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm text-gray-500 font-medium">Total Revenue</h3>
          <div className="w-8 h-8 rounded-lg bg-[#FDEADE] flex items-center justify-center">
            <DollarSign size={16} className="text-[#C05621]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
            LKR {(summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`flex items-center text-sm font-semibold ${revenueUp ? "text-emerald-500" : "text-red-500"}`}>
              {revenueUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />} 
              {revenueTrendStr}
            </span>
            <span className="text-sm text-gray-400 font-medium">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
