"use client";

import { Wallet, Waves, CircleDollarSign, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function PayoutKpiCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* All Payouts */}
      <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#9E7B6A] font-medium">All Payouts</p>
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
            <Wallet size={18} className="text-[#2563EB]" />
          </div>
        </div>
        <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight">
          14
        </p>
        <p className="text-[12px] text-[#9E7B6A]">
          All payouts in whole system
        </p>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#9E7B6A] font-medium">Pending Payouts</p>
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
            <Waves size={18} className="text-[#EA580C]" />
          </div>
        </div>
        <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight">
          5
        </p>
        <p className="text-[12px] text-[#DC2626] font-semibold flex items-center gap-1">
          <AlertTriangle size={12} />
          3 Urgent
        </p>
      </div>

      {/* Total Payouts */}
      <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#9E7B6A] font-medium">Total Payouts</p>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
            <CircleDollarSign size={18} className="text-[#16A34A]" />
          </div>
        </div>
        <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight">
          LKR 45,000
        </p>
        <p className="text-[12px] text-[#16A34A] font-semibold flex items-center gap-1">
          <TrendingUp size={12} />
          +2.1k this week
        </p>
      </div>

      {/* Total Revenue */}
      <div className="bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#9E7B6A] font-medium">Total Revenue</p>
          <div className="w-10 h-10 rounded-xl bg-[#FDEADE] flex items-center justify-center">
            <DollarSign size={18} className="text-[#C05621]" />
          </div>
        </div>
        <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight">
          LKR 124,500
        </p>
        <p className="text-[12px] text-[#9E7B6A] font-semibold flex items-center gap-1">
          <TrendingDown size={12} />
          ~-10% vs last month
        </p>
      </div>
    </div>
  );
}
