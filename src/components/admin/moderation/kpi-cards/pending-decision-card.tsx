import { Gavel } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

export default function PendingDecisionCard() {
  const { disputes } = useAdminModerationStore();
  const pendingCount = disputes.filter(d => d.status === "Pending Decision" || d.status === "Decision Pending" || d.status === "Awaiting Evidence").length;

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Pending Decision
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center">
          <Gavel size={16} className="text-[#DC2626]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        {pendingCount}
      </p>
      {pendingCount > 0 && (
        <div className="flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
          <span>! Urgent</span>
        </div>
      )}
    </div>
  );
}
