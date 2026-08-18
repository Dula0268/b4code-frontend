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
export default function RecentTransactions() {
  const { transactions, fetchTransactions, transactionsLoading } = useAdminFinanceStore();

  useEffect(() => {
    fetchTransactions({ page: 0, size: 5 });
  }, [fetchTransactions]);

  const recent = (transactions || []).slice(0, 5);

  return (
    <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-4 relative">
      {transactionsLoading && recent.length === 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-2xl">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#1A1A1A]">
          Recent Transactions
        </h2>
        <button className="text-[13px] font-semibold text-[#C05621] hover:underline cursor-pointer bg-transparent border-none">
          View All
        </button>
      </div>

      {/* ── Transaction list ── */}
      <ul className="flex flex-col gap-4 mt-2">
        {recent.length === 0 && !transactionsLoading && (
           <li className="text-[13px] text-[#9E7B6A] text-center py-4">No recent transactions.</li>
        )}
        {recent.map((tx) => {
          const statusStr = (tx.status || "").toString();
          const isRefund = statusStr.toLowerCase().includes("refund");
          const isPayout = statusStr.toLowerCase().includes("payout");
          
          const title = isRefund
            ? "Refund Processed" 
            : tx.bookingId 
              ? `Booking #${tx.bookingId}` 
              : `Transaction #${tx.id}`;

          const isPositive = !isRefund && !isPayout;
          const amountVal = tx.amount ?? 0;
          const amountDisplay = `${isPositive ? "+" : "-"}LKR ${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
          
          return (
            <li key={tx.id} className="flex items-center gap-3">
              <TransactionIcon type={statusStr} />

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">
                  {title}
                </p>
                <p className="text-[11px] text-[#9E7B6A]">
                  {tx.date ? new Date(tx.date).toLocaleDateString() : "-"}
                </p>
              </div>

              <span
                className={`text-[13px] font-bold flex-shrink-0 ${
                  isPositive ? "text-[#16A34A]" : "text-[#1A1A1A]"
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
