import { AlertTriangle, TrendingUp } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

export default function UrgentCard() {
  const { reviews } = useAdminModerationStore();
  const urgentCount = reviews.filter(r => r.flagType === 'HARASSMENT' || r.flagType === 'SPAM_SCAM').length;

  return (
    <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(220,38,38,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
      {urgentCount > 0 && <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#DC2626] opacity-[0.04] blur-2xl rounded-full group-hover:scale-150 group-hover:opacity-[0.08] transition-all duration-700" />}
      <div className="flex items-start justify-between mb-2 z-10">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">
          Urgent
        </h3>
        <div className="p-2.5 bg-[#FEF2F2] rounded-xl self-start group-hover:scale-110 transition-transform">
          <AlertTriangle size={18} className="text-[#DC2626]" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-2 z-10">
        <p className="text-[24px] font-bold text-[#DC2626] tracking-tight m-0">
          {urgentCount}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="flex items-center text-[12px] font-medium text-[#27ae60]">
            <TrendingUp size={14} className="mr-1" /> Live
          </span>
        </div>
      </div>
    </div>
  );
}
