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
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex items-center justify-center shadow-sm h-[120px]">
                <Loader2 className="animate-spin text-[#C05621]" size={24} />
            </div>
        );
    }

    const trendStr = summary.refundsGrowth || "0%";
    const isUp = !trendStr.startsWith("-");
    
    const typedSummary = summary as FinanceSummaryWithTotalRefunds;
    const totalRefundsFallback = typeof typedSummary.totalRefunds === "number" ? typedSummary.totalRefunds : undefined;
    const pendingRefundsValue = summary.pendingRefunds ?? totalRefundsFallback ?? 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-[136px]">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm text-gray-500 font-medium">Pending Refunds</h3>
                <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                    <RefreshCcw size={16} className="text-[#DC2626]" />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <p className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
                    {pendingRefundsValue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className={`flex items-center text-sm font-semibold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                        {isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {trendStr}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">vs last month</span>
                </div>
            </div>
        </div>
    );
}
