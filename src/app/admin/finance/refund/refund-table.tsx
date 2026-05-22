"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, Check, X } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

// ─── Status badge ───────────────────────────────────────────────────────────────
function RefundStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PENDING:  { bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
    APPROVED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
    REJECTED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
  };
  const s = map[status] || { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" };
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {label}
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function RefundTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const perPage = 10;

  const { refunds, refundsTotalElements, refundsTotalPages, fetchRefunds, refundsLoading, approveRefund, rejectRefund, actionLoading } = useAdminFinanceStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchRefunds({
      page: currentPage - 1,
      size: perPage,
      search: debouncedSearch
    });
  }, [fetchRefunds, currentPage, debouncedSearch]);

  const handleApprove = async (id: number) => {
    if (confirm("Are you sure you want to approve this refund?")) {
      await approveRefund(id);
    }
  };

  const handleReject = async (id: number) => {
    const note = prompt("Please provide a reason for rejection:");
    if (note !== null) {
      await rejectRefund(id, note || "Rejected by Admin");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden relative">
      {(refundsLoading || actionLoading) && refunds.length === 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      
      {/* ── Filters ── */}
      <div className="p-5 flex items-end gap-4 flex-wrap border-b border-[#F0EBE7]">
        {/* Search */}
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-bold text-[#C05621] mb-1.5 uppercase tracking-wider">
            Search
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
              placeholder="Search by Booking Ref or User..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] placeholder:text-[#C4B5AB] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition"
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EBE7]">
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#C05621] uppercase tracking-wider">
                Booking Ref
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#C05621] uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#C05621] uppercase tracking-wider">
                Reason
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#C05621] uppercase tracking-wider">
                Requested
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#C05621] uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-4 text-[11px] font-bold text-[#C05621] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="relative">
            {(refundsLoading || actionLoading) && refunds.length > 0 && (
               <tr className="absolute inset-0 bg-white/50 z-10"><td colSpan={6}></td></tr>
            )}
            {refunds.length === 0 && !refundsLoading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#9E7B6A] text-sm">
                  No refund requests found.
                </td>
              </tr>
            )}
            {refunds.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[#F0EBE7] last:border-b-0 hover:bg-[#FDFAF8] transition-colors"
              >
                <td className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">
                  #{r.transactionId}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">
                  LKR {r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-[#6B7280] max-w-75 truncate" title={r.reason}>
                  {r.reason}
                </td>
                <td className="px-6 py-4 text-sm text-[#9E7B6A]">
                  {new Date(r.requestedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <RefundStatusBadge status={r.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {r.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(r.id)}
                        disabled={actionLoading}
                        className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center hover:bg-[#D1FAE5] disabled:opacity-50 transition cursor-pointer"
                        title="Approve Refund"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => handleReject(r.id)}
                        disabled={actionLoading}
                        className="w-8 h-8 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center hover:bg-[#FEE2E2] disabled:opacity-50 transition cursor-pointer"
                        title="Reject Refund"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-[#9E7B6A]">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {refundsTotalPages > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#F0EBE7]">
          <p className="text-sm text-[#9E7B6A]">
            Showing{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#1A1A1A]">
              {Math.min(currentPage * perPage, refundsTotalElements)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#C05621]">{refundsTotalElements}</span>{" "}
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
            {Array.from({ length: Math.min(5, refundsTotalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (refundsTotalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > refundsTotalPages) return null;
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

            {refundsTotalPages > 5 && currentPage < refundsTotalPages - 2 && (
               <span className="w-9 h-9 flex items-center justify-center text-sm text-[#9E7B6A] font-bold">
                 …
               </span>
            )}

            <button
              disabled={currentPage === refundsTotalPages}
              onClick={() => setCurrentPage((p) => Math.min(refundsTotalPages, p + 1))}
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
