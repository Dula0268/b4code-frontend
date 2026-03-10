import { Gavel } from "lucide-react";

export default function PendingDecisionCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#9E7B6A] font-normal leading-none m-0">
          Pending Decision
        </p>
        <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
          <Gavel size={18} className="text-[#DC2626]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        5
      </p>
      <p className="text-[12px] text-[#DC2626] font-semibold m-0">
        <span className="mr-1">!</span>3 Urgent
      </p>
    </div>
  );
}
