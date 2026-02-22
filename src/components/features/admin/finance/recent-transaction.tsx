import { ArrowDownLeft, ArrowUpRight, RotateCcw, ArrowDown } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type TransactionType = "payout" | "booking" | "refund" | "fee";

interface Transaction {
    id: string;
    title: string;
    subtitle: string;
    amount: string;
    type: TransactionType;
    positive: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const TRANSACTIONS: Transaction[] = [
    {
        id: "1",
        title: "Payout to Host",
        subtitle: "Today, 10:23 AM",
        amount: "-LKR 1,250.00",
        type: "payout",
        positive: false,
    },
    {
        id: "2",
        title: "Booking #4921",
        subtitle: "Yesterday, 4:15 PM",
        amount: "+LKR 420.00",
        type: "booking",
        positive: true,
    },
    {
        id: "3",
        title: "Booking #4920",
        subtitle: "Yesterday, 2:30 PM",
        amount: "+LKR 850.00",
        type: "booking",
        positive: true,
    },
    {
        id: "4",
        title: "Refund Processed",
        subtitle: "Oct 24, 9:00 AM",
        amount: "-LKR 120.00",
        type: "refund",
        positive: false,
    },
    {
        id: "5",
        title: "Service Fee",
        subtitle: "Oct 23, 11:45 AM",
        amount: "-LKR 15.00",
        type: "fee",
        positive: false,
    },
];

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function TransactionIcon({ type, positive }: { type: TransactionType; positive: boolean }) {
    const base = "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0";

    if (type === "booking") {
        return (
            <div className={`${base} bg-[#DCFCE7]`}>
                <ArrowUpRight size={16} className="text-[#16A34A]" />
            </div>
        );
    }
    if (type === "refund") {
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
    return (
        <div className="w-[300px] flex-shrink-0 bg-white rounded-2xl border border-[#F0EBE7] p-6 shadow-sm flex flex-col gap-4">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-[#1A1A1A]">
                    Recent Transactions
                </h2>
                <button className="text-[13px] font-semibold text-[#C05621] hover:underline">
                    View All
                </button>
            </div>

            {/* ── Transaction list ── */}
            <ul className="flex flex-col gap-4">
                {TRANSACTIONS.map((tx) => (
                    <li key={tx.id} className="flex items-center gap-3">
                        <TransactionIcon type={tx.type} positive={tx.positive} />

                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">
                                {tx.title}
                            </p>
                            <p className="text-[11px] text-[#9E7B6A]">{tx.subtitle}</p>
                        </div>

                        <span
                            className={`text-[13px] font-bold flex-shrink-0 ${tx.positive ? "text-[#16A34A]" : "text-[#1A1A1A]"
                                }`}
                        >
                            {tx.amount}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
