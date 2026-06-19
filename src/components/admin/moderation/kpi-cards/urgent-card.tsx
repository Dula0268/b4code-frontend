import { AlertTriangle } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

export default function UrgentCard() {
  const { reviews } = useAdminModerationStore();
  const urgentCount = reviews.filter(r => r.flagType === 'HARASSMENT' || r.flagType === 'SPAM_SCAM').length;

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Urgent
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center">
          <AlertTriangle size={16} className="text-[#DC2626]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#DC2626] leading-none tracking-tight m-0">
        {urgentCount}
      </p>
    </div>
  );
}
