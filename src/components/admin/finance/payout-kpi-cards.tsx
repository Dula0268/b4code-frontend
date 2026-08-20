"use client";

import { Wallet, Waves, CircleDollarSign, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

export default function PayoutKpiCards() {
  const { summary, summaryLoading, payoutsTotalElements, payouts } = useAdminFinanceStore();

  const pendingPayouts = payouts.filter(p => p.status === "Hold" || p.status === "Pending").length;

  if (summaryLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-sm flex items-center justify-center min-h-[140px]">
             <Loader2 className="animate-spin text-[#C05621]" size={24} />
          </div>
        ))}
      </div>
    );
  }

  const revenueTrendStr = summary.revenueGrowth || "0%";
  const revenueUp = !revenueTrendStr.startsWith("-");
  const RevenueTrendIcon = revenueUp ? TrendingUp : TrendingDown;
  
  const payoutTrendStr = summary.payoutGrowth || "0%";
  const payoutUp = !payoutTrendStr.startsWith("-");
  const PayoutTrendIcon = payoutUp ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* All Payouts */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">All Payouts</h3>
          <div className="p-2.5 bg-[#EFF6FF] rounded-xl self-start group-hover:scale-110 transition-transform">
            <Wallet size={18} className="text-[#2563EB]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
            {payoutsTotalElements}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[12px] font-medium text-[#6B7280]">All payouts in whole system</span>
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
        {pendingPayouts > 0 && <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#EA580C] opacity-[0.04] blur-2xl rounded-full group-hover:scale-150 group-hover:opacity-[0.08] transition-all duration-700" />}
        <div className="flex items-start justify-between mb-2 z-10">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Pending Payouts</h3>
          <div className="p-2.5 bg-[#FFF7ED] rounded-xl self-start group-hover:scale-110 transition-transform">
            <Waves size={18} className="text-[#EA580C]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-2 z-10">
          <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
            {pendingPayouts}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {pendingPayouts > 0 ? (
              <span className="flex items-center text-[12px] font-medium text-red-500">
                <AlertTriangle size={14} className="mr-1" /> Action required
              </span>
            ) : (
              <span className="flex items-center text-[12px] font-medium text-emerald-500">
                All cleared
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Total Payouts */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Total Payouts</h3>
          <div className="p-2.5 bg-[#F0FDF4] rounded-xl self-start group-hover:scale-110 transition-transform">
            <CircleDollarSign size={18} className="text-[#16A34A]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
            LKR {(summary.totalPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`flex items-center text-[12px] font-medium ${payoutUp ? "text-[#27ae60]" : "text-[#EB5757]"}`}>
              <PayoutTrendIcon size={14} className="mr-1" />
              {payoutTrendStr}
            </span>
            <span className="text-[12px] font-medium text-[#6B7280]">vs last month</span>
          </div>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Total Revenue</h3>
          <div className="p-2.5 bg-[#FDEADE] rounded-xl self-start group-hover:scale-110 transition-transform">
            <DollarSign size={18} className="text-[#C05621]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
            LKR {(summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`flex items-center text-[12px] font-medium ${revenueUp ? "text-[#27ae60]" : "text-[#EB5757]"}`}>
              <RevenueTrendIcon size={14} className="mr-1" />
              {revenueTrendStr}
            </span>
            <span className="text-[12px] font-medium text-[#6B7280]">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
