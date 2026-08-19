import { ArrowUpRight, RotateCcw, ArrowDown, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function TransactionIcon({ type }: { type?: string }) {
  const base =
    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0";
  const normalizedType = (type || "").toLowerCase();

  if (normalizedType.includes("booking") || normalizedType === "payment" || normalizedType === "completed" || normalizedType === "success") {
    return (
      <div className={`${base} bg-[#DCFCE7]`}>
        <ArrowUpRight size={16} className="text-[#16A34A]" />
      </div>
    );
  }
  if (normalizedType.includes("refund")) {
    return (
      <div className={`${base} bg-[#FEE2E2]`}>
        <RotateCcw size={15} className="text-[#DC2626]" />
      </div>
    );
  }
  // payout / fee
  return (
    <div className={`${base} bg-[#F3F4F6]`}>
      <ArrowDown size={15} className="text-[#6B7280]" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecentTransactions({ onViewAll }: { onViewAll?: () => void }) {
  const { payouts, refunds, fetchPayouts, fetchRefunds, payoutsLoading, refundsLoading } = useAdminFinanceStore();

  useEffect(() => {
    fetchPayouts({ status: 'PROCESSED', size: 5, page: 0 });
    fetchRefunds({ status: 'APPROVED', size: 5, page: 0 });
  }, [fetchPayouts, fetchRefunds]);

  const isLoading = payoutsLoading || refundsLoading;

  // Combine and sort
  const combined = [
    ...payouts.map(p => ({
      id: `p-${p.id}`,
      type: 'payout',
      title: `Payout to ${p.propertyName || p.hostName || 'Host'}`,
      date: p.processedAt || p.requestedAt || new Date().toISOString(),
      amount: p.amount,
      isPositive: false
    })),
    ...refunds.map(r => ({
      id: `r-${r.id}`,
      type: 'refund',
      title: `Refund for Booking #${r.bookingId}`,
      date: r.requestDate,
      amount: r.amount,
      isPositive: false
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="w-full lg:w-[380px] flex-shrink-0 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(192,86,33,0.12)] transition-all duration-500 flex flex-col gap-6 relative overflow-hidden min-h-[400px]">
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#C05621] opacity-[0.03] blur-3xl rounded-full" />
      {isLoading && combined.length === 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20 rounded-3xl">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between z-10">
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#1A1A1A] tracking-tight">
            Recent Activity
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-1 font-medium">
            Payouts & Refunds
          </p>
        </div>
        <button 
          onClick={() => {
            if (onViewAll) onViewAll();
          }}
          className="text-[13px] font-semibold text-[#C05621] hover:underline cursor-pointer bg-transparent border-none"
        >
          View All
        </button>
      </div>

      {/* ── Transaction list ── */}
      <ul className="flex flex-col gap-5 mt-2 z-10">
        {combined.length === 0 && !isLoading && (
           <li className="text-[13px] font-medium text-[#9E7B6A] text-center py-8 bg-[#F8F6F5] rounded-2xl border border-[#E8DDD8]/50">No recent activity.</li>
        )}
        {combined.map((tx) => {
          const amountDisplay = `${tx.isPositive ? '+' : '-'}LKR ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
          
          return (
            <li key={tx.id} className="flex items-center gap-4 group">
              <div className="group-hover:scale-110 transition-transform">
                <TransactionIcon type={tx.type} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1A1A1A] truncate group-hover:text-[#C05621] transition-colors">
                  {tx.title}
                </p>
                <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
                  {new Date(tx.date).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`text-[14px] font-extrabold flex-shrink-0 tracking-tight ${
                  tx.isPositive ? "text-[#16A34A]" : "text-[#1A1A1A]"
                }`}
              >
                {amountDisplay}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
