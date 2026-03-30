import { DollarSign, TrendingUp } from "lucide-react";

export default function TotalDisputedCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#9E7B6A] font-normal leading-none m-0">
          Total Disputed
        </p>
        <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center">
          <DollarSign size={18} className="text-[#2563EB]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        12.4k
      </p>
      <div className="flex items-center gap-1 text-[12px] font-semibold text-[#16A34A]">
        <TrendingUp size={12} />
        <span>+2.1k this week</span>
      </div>
    </div>
  );
}
