import { PieChart, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

export default function PlatformCommissionCard() {
    const { summary, summaryLoading } = useAdminFinanceStore();

    if (summaryLoading || !summary) {
        return (
            <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-sm flex items-center justify-center min-h-[140px]">
                <Loader2 className="animate-spin text-[#C05621]" size={24} />
            </div>
        );
    }

    const trendStr = summary.commissionGrowth || "0%";
    const isUp = !trendStr.startsWith("-");
    const TrendIcon = isUp ? TrendingUp : TrendingDown;
    const trendColor = isUp ? "text-[#27ae60]" : "text-[#EB5757]";

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[140px] group">
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#9E7B6A] uppercase mb-1">Platform Commission</h3>
                <div className="p-2.5 bg-[#E6F5EF] rounded-xl self-start group-hover:scale-110 transition-transform">
                    <PieChart size={18} className="text-[#2D7D5C]" />
                </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
                <p className="text-[24px] font-bold text-[#1A1A1A] tracking-tight m-0">
                    LKR {summary.platformCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className={`flex items-center text-[12px] font-medium ${trendColor}`}>
                        <TrendIcon size={14} className="mr-1" />
                        {trendStr}
                    </span>
                    <span className="text-[12px] font-medium text-[#6B7280]">vs last month</span>
                </div>
            </div>
        </div>
    );
}
