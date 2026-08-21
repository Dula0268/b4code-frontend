"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, Check, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(name?: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name?: string) {
  if (!name) return "#C05621";
  const colors = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#0891B2", "#CA8A04", "#C05621"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Status badge ───────────────────────────────────────────────────────────────
function RefundStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
    Approved: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
    Rejected: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
  };
  const s = map[status] || { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {status}
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function RefundTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isResolved, setIsResolved] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
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
      search: debouncedSearch,
      resolved: isResolved ? true : false,
    });
  }, [fetchRefunds, currentPage, debouncedSearch, isResolved]);

  const confirmApprove = async () => {
    if (approvingId) {
      await approveRefund(approvingId);
      setApprovingId(null);
    }
  };

  const confirmReject = async () => {
    if (rejectingId) {
      await rejectRefund(rejectingId, rejectReason || "Rejected by Admin");
      setRejectingId(null);
      setRejectReason("");
    }
  };

  const handleApprove = (id: string) => setApprovingId(id);
  
  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden relative">
      {(refundsLoading || actionLoading) && refunds.length === 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      
      {/* ── Filters ── */}
      <div className="p-5 flex items-center justify-between border-b border-[#F0EBE7]">
        {/* Search */}
        <div className="flex-1 max-w-[360px] relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E7B6A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Case ID, Guest..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8DDD8] text-[14px] text-[#1A1A1A] placeholder:text-[#9E7B6A] focus:outline-none focus:ring-4 focus:ring-[#C05621]/10 focus:border-[#C05621] transition-all bg-white shadow-sm"
          />
        </div>
        
        {/* Resolved Cases toggle */}
        <button
          onClick={() => {
            setIsResolved(!isResolved);
            setCurrentPage(1);
          }}
          className={`px-5 py-3 rounded-xl border text-[14px] font-bold transition-all flex items-center gap-2 ${
            isResolved 
              ? "bg-[#FFF8F5] border-[#C05621] text-[#C05621]" 
              : "bg-white border-[#E8DDD8] text-[#1A1A1A] hover:bg-[#FAF5F2]"
          }`}
        >
          Resolved Cases
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EBE7] bg-[#FAFAFA]">
              <th className="text-left px-6 py-4 text-[12px] font-extrabold text-[#9E7B6A] uppercase tracking-widest">
                Case ID
              </th>
              <th className="text-left px-6 py-4 text-[12px] font-extrabold text-[#9E7B6A] uppercase tracking-widest">
                Guest & Property
              </th>
              <th className="text-left px-6 py-4 text-[12px] font-extrabold text-[#9E7B6A] uppercase tracking-widest">
                Reason / Severity
              </th>
              <th className="text-left px-6 py-4 text-[12px] font-extrabold text-[#9E7B6A] uppercase tracking-widest">
                Amount
              </th>
              <th className="text-left px-6 py-4 text-[12px] font-extrabold text-[#9E7B6A] uppercase tracking-widest">
                Status
              </th>
              <th className="text-right px-6 py-4 text-[12px] font-extrabold text-[#9E7B6A] uppercase tracking-widest">
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
                  #{r.bookingId}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ backgroundColor: getColorForName(r.guestName || "Guest") }}
                    >
                      {getInitials(r.guestName || "Guest")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">{r.guestName || "Guest"}</p>
                      <p className="text-[11px] text-[#9E7B6A]">{r.propertyName || "Property"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-start">
                    <p className="text-sm font-medium text-[#1A1A1A] max-w-[220px] truncate" title={r.reason}>
                      {r.reason || "No reason provided"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldAlert size={12} className="text-[#D97706]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
                        Medium
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">
                  LKR {(r.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <RefundStatusBadge status={r.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {r.status === 'Pending' ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(r.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg bg-[#10B981]/10 text-[#10B981] font-semibold text-[13px] flex items-center gap-1.5 hover:bg-[#10B981]/20 disabled:opacity-50 transition cursor-pointer"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(r.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] font-semibold text-[13px] flex items-center gap-1.5 hover:bg-[#EF4444]/20 disabled:opacity-50 transition cursor-pointer"
                      >
                        <X size={14} />
                        Reject
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

      {/* Approve Dialog */}
      <DeleteConfirmationDialog 
        isOpen={approvingId !== null}
        onClose={() => setApprovingId(null)}
        onConfirm={confirmApprove}
        title="Approve Refund"
        description="Are you sure you want to approve this refund? This will process the payout."
        confirmText="Approve"
        loadingText="Approving..."
        loading={actionLoading}
      />

      {/* Reject Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 relative">
            <button
              onClick={() => setRejectingId(null)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={actionLoading}
            >
              <X size={20} className="text-gray-400" />
            </button>
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Reject Refund</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Please provide a reason for rejecting this refund request.
                </p>
              </div>
            </div>
            
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid claim, past 24 hours..."
              className="w-full mb-6"
            />
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12 text-sm font-semibold border-gray-200 hover:bg-gray-50 transition-all"
                onClick={() => setRejectingId(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 transition-all"
                onClick={confirmReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Reject Refund"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
