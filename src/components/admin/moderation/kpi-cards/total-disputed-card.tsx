import { DollarSign, TrendingUp } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

export default function TotalDisputedCard() {
  const { disputes } = useAdminModerationStore();
  
  const totalAmount = disputes.reduce((sum, d) => {
    const num = parseFloat(d.amount.replace(/[^0-9.-]+/g,""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedAmount = totalAmount >= 1000 
    ? (totalAmount / 1000).toFixed(1) + 'k'
    : totalAmount.toFixed(0);

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider m-0">
          Total Disputed
        </p>
        <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
          <DollarSign size={16} className="text-[#3B82F6]" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-[#1A1A1A] leading-none tracking-tight m-0">
        {totalAmount > 0 ? `$${formattedAmount}` : '-'}
      </p>
      <div className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
        <TrendingUp size={13} />
        <span>Live sum</span>
      </div>
    </div>
  );
}
