import { CreditCard, TrendingUp } from "lucide-react";

export default function TotalPayoutCard() {
    const trend = 8.1;

    return (
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#F0EBE7] p-5 flex flex-col gap-3 shadow-sm">
            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FDEADE] flex items-center justify-center">
                    <CreditCard size={18} className="text-[#C05621]" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                    <TrendingUp size={13} />
                    <span>+{trend}%</span>
                </div>
            </div>

            {/* Label */}
            <p className="text-[13px] text-[#9E7B6A] font-normal leading-none">
                Total Payouts
            </p>

            {/* Value */}
            <p className="text-[22px] font-bold text-[#1A1A1A] leading-none tracking-tight">
                LKR 950,200
            </p>
        </div>
    );
}
