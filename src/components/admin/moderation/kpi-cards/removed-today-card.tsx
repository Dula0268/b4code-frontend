import { ClipboardCheck } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

export default function RemovedTodayCard() {
  const { badgeCounts } = useAdminModerationStore();

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Removed Today
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
          <ClipboardCheck size={16} className="text-[#EA580C]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        {badgeCounts.removedToday || "0"}
      </p>
    </div>
  );
}
