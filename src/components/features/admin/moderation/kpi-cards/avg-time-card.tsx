import { Timer } from "lucide-react";

export default function AvgTimeCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Avg Time
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
          <Timer size={16} className="text-[#6B7280]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        4m
      </p>
    </div>
  );
}
