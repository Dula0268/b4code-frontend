import { RotateCcw, TrendingDown } from "lucide-react";

export default function RefundsCard() {
    const trend = 2.4;

    return (
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
                    <RotateCcw size={18} className="text-[#DC2626]" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#DC2626]">
                    <TrendingDown size={13} />
                    <span>-{trend}%</span>
                </div>
            </div>

            {/* Label */}
            <p className="text-[13px] text-[#9E7B6A] font-normal leading-none">
                Pending Refunds
            </p>

            {/* Value */}
            <p className="text-[22px] font-bold text-[#1A1A1A] leading-none tracking-tight">
                LKR 3,400
            </p>
        </div>
    );
}
