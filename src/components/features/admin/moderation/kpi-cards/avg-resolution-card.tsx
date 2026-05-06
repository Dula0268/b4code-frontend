import { Clock, TrendingDown } from "lucide-react";

export default function AvgResolutionCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Avg. Resolution
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
          <Clock size={16} className="text-[#6B7280]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        -
      </p>
      <div className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
        <TrendingDown size={13} />
        <span>N/A</span>
      </div>
    </div>
  );
}
