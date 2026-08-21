"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

// ─── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    BOOKING_PAYMENT: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Payment" },
    PAYOUT: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", label: "Payout" },
    COMMISSION: { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", label: "Commission" },
    REFUND: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", label: "Refund" },
  };
  const s = map[status] || { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: status };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(name?: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name?: string) {
  if (!name) return "#C05621";
  const colors = ["#C05621", "#2563EB", "#7C3AED", "#059669", "#DC2626", "#0891B2", "#CA8A04"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function TransactionTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Types");
  const perPage = 10;

  const { transactions, transactionsTotalElements, transactionsTotalPages, fetchTransactions, transactionsLoading } = useAdminFinanceStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchTransactions({
      page: currentPage - 1,
      size: perPage,
      search: debouncedSearch,
      type: statusFilter === "All Types" ? undefined : statusFilter
    });
  }, [fetchTransactions, currentPage, debouncedSearch, statusFilter]);

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden relative">
      {transactionsLoading && transactions.length === 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      
      {/* ── Filters ── */}
      <div className="p-5 flex items-end gap-4 flex-wrap border-b border-[#F0EBE7]">
        {/* Search */}
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-semibold text-[#9E7B6A] mb-1.5">
            Search Transactions
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5AB]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Booking ID, guest name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] placeholder:text-[#C4B5AB] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition"
            />
          </div>
        </div>

        {/* Status */}
        <div className="min-w-35">
          <label className="block text-xs font-semibold text-[#9E7B6A] mb-1.5">
            Type
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition appearance-none cursor-pointer"
          >
            <option value="All Types">All Types</option>
            <option value="BOOKING_PAYMENT">Payment</option>
            <option value="PAYOUT">Payout</option>
            <option value="COMMISSION">Commission</option>
            <option value="REFUND">Refund</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EBE7]">
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Booking / Order ID
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Property Name
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Guest
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="relative">
            {transactionsLoading && transactions.length > 0 && (
               <tr className="absolute inset-0 bg-white/50 z-10"><td colSpan={5}></td></tr>
            )}
            {transactions.length === 0 && !transactionsLoading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9E7B6A] text-sm">
                  No transactions found.
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-[#F0EBE7] last:border-b-0 hover:bg-[#FDFAF8] transition-colors"
              >
                {/* ID + date */}
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">#{tx.bookingId || tx.referenceNumber || tx.id}</p>
                  <p className="text-[11px] text-[#9E7B6A] mt-0.5">{tx.date || tx.createdAt ? new Date(tx.date || tx.createdAt || "").toLocaleDateString() : "-"}</p>
                </td>

                {/* Property */}
                <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                  {tx.propertyName || "System"}
                </td>

                {/* Guest */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: getColorForName(tx.guestName || tx.userName || "System") }}
                    >
                      {getInitials(tx.guestName || tx.userName || "System")}
                    </div>
                    <span className="text-sm text-[#1A1A1A]">
                      {tx.guestName || tx.userName || "System"}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-sm font-semibold text-[#1A1A1A]">
                  LKR {(tx.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>

                {/* Status/Type */}
                <td className="px-6 py-4">
                  <StatusBadge status={tx.type || tx.status || "Unknown"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {transactionsTotalPages > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#F0EBE7]">
          <p className="text-sm text-[#9E7B6A]">
            Showing{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {Math.min(currentPage * perPage, transactionsTotalElements)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#C05621]">{transactionsTotalElements}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-xl border border-[#E8DDD8] flex items-center justify-center text-[#9E7B6A] hover:bg-[#FAF5F2] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Simple page numbers */}
            {Array.from({ length: Math.min(5, transactionsTotalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (transactionsTotalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > transactionsTotalPages) return null;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#F59E0B] text-white border border-[#F59E0B]"
                      : "border border-[#E8DDD8] text-[#1A1A1A] hover:bg-[#FAF5F2]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {transactionsTotalPages > 5 && currentPage < transactionsTotalPages - 2 && (
               <span className="w-9 h-9 flex items-center justify-center text-sm text-[#9E7B6A] font-bold">
                 …
               </span>
            )}

            <button
              disabled={currentPage === transactionsTotalPages}
              onClick={() => setCurrentPage((p) => Math.min(transactionsTotalPages, p + 1))}
              className="w-9 h-9 rounded-xl border border-[#E8DDD8] flex items-center justify-center text-[#9E7B6A] hover:bg-[#FAF5F2] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
