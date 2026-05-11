import { DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

export default function RevenueCard() {
    const { summary, summaryLoading } = useAdminFinanceStore();

    if (summaryLoading || !summary) {
        return (
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex items-center justify-center shadow-sm h-[120px]">
                <Loader2 className="animate-spin text-[#C05621]" size={24} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-[136px] min-w-0 overflow-hidden">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm text-gray-500 font-medium truncate">Total Revenue</h3>
                <div className="w-8 h-8 rounded-lg bg-[#FDEADE] flex items-center justify-center shrink-0">
                    <DollarSign size={16} className="text-[#C05621]" />
                </div>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xl font-bold text-gray-900 leading-none tracking-tight truncate">
                    LKR {summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="flex items-center text-xs font-semibold text-emerald-500 whitespace-nowrap">
                        <TrendingUp size={12} className="mr-1" />
                        Platform Revenue
                    </span>
                    <span className="text-xs text-gray-400 font-medium">this period</span>
                </div>
            </div>
        </div>
    );
}
