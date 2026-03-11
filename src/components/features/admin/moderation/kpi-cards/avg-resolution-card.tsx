import { Timer, TrendingDown } from "lucide-react";

export default function AvgResolutionCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#9E7B6A] font-normal leading-none m-0">
          Avg. Resolution
        </p>
        <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
          <Timer size={18} className="text-[#6B7280]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        48h
      </p>
      <div className="flex items-center gap-1 text-[12px] font-semibold text-[#16A34A]">
        <TrendingDown size={12} />
        <span>-10% vs last month</span>
      </div>
    </div>
  );
}
