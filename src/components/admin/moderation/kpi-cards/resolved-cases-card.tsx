import { CheckCircle2, TrendingUp } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

export default function ResolvedCasesCard() {
  const { badgeCounts } = useAdminModerationStore();
  const resolvedCount = badgeCounts?.resolvedDisputes || 0;

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Resolved Cases
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
          <CheckCircle2 size={16} className="text-[#16A34A]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        {resolvedCount}
      </p>
      <div className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
        <TrendingUp size={13} />
        <span>All time</span>
      </div>
    </div>
  );
}
