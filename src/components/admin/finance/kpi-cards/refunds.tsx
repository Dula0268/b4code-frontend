import { RefreshCcw, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

interface FinanceSummaryWithTotalRefunds {
  pendingRefunds?: number;
  totalRefunds?: number;
  refundsGrowth?: string;
}

export default function RefundsCard() {
  const { summary, summaryLoading } = useAdminFinanceStore();

  if (summaryLoading || !summary) {
    return (
      <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-sm flex items-center justify-center min-h-[140px]">
        <Loader2 className="animate-spin text-[#C05621]" size={24} />
      </div>
    );
  }

  // Use payout growth if available, otherwise default to 0%
  const trendStr = summary.payoutGrowth || "0%";
  const isUp = !trendStr.startsWith("-");
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  const pendingPayoutsValue = summary.pendingPayouts || 0;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(235,87,87,0.1)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#EB5757] opacity-[0.04] blur-2xl rounded-full group-hover:scale-150 group-hover:opacity-[0.08] transition-all duration-700" />
      <div className="flex items-start justify-between mb-2 z-10">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Pending Payouts</h3>
        <div className="p-2.5 bg-red-50 rounded-xl self-start group-hover:scale-110 transition-transform">
          <RefreshCcw size={18} className="text-[#EB5757]" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-2 z-10">
        <p className="text-[24px] font-bold text-[#EB5757] tracking-tight m-0">
          {pendingPayoutsValue.toLocaleString()} <span className="text-[14px] font-medium text-[#9E7B6A] tracking-normal">Requests</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`flex items-center text-[12px] font-medium ${isUp ? "text-[#27ae60]" : "text-[#EB5757]"}`}
          >
            <TrendIcon size={14} className="mr-1" />
            {trendStr}
          </span>
          <span className="text-[12px] font-medium text-[#6B7280]">
            vs last month
          </span>
        </div>
      </div>
    </div>
  );
}
