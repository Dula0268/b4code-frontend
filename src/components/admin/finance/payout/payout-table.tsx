"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";
import type { PayoutDto } from "@/api/admin/finance.api";

// ─── Badges ─────────────────────────────────────────────────────────────────────
function PaymentModelBadge({ model }: { model: string }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
        model === "Commission"
          ? "bg-[#EFF6FF] text-[#2563EB]"
          : "bg-[#FFF7ED] text-[#EA580C]"
      }`}
    >
      {model}
    </span>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    HOLD: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", dot: "bg-[#D97706]" },
    PENDING: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", dot: "bg-[#D97706]" },
    PROCESSED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
    REJECTED: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  };
  const s = map[status?.toUpperCase()] || { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", dot: "bg-[#6B7280]" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Property placeholder images ────────────────────────────────────────────────
const PROPERTY_COLORS = ["#E8DDD8", "#D4C5BC", "#C4B5AB", "#B5A59B"];

function getInitials(name: string) {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name: string) {
  const colors = ["#C05621", "#2563EB", "#7C3AED", "#059669", "#DC2626", "#0891B2", "#CA8A04"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Component ──────────────────────────────────────────────────────────────────
interface PayoutTableProps {
  onRowClick: (payout: PayoutDto) => void;
  selectedPayoutId?: string;
}

export default function PayoutTable({ onRowClick, selectedPayoutId }: PayoutTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const perPage = 10;

  const { payouts, payoutsTotalElements, payoutsTotalPages, fetchPayouts, payoutsLoading } = useAdminFinanceStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const params: any = {
      page: currentPage - 1,
      size: perPage,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.status = statusFilter;
    
    fetchPayouts(params);
  }, [fetchPayouts, currentPage, debouncedSearch, statusFilter]);

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden relative">
      {payoutsLoading && payouts.length === 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}
      
      {/* ── Search & Filter ── */}
      <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-62.5 max-w-105">
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
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] placeholder:text-[#C4B5AB] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="appearance-none flex items-center gap-2 pl-9 pr-10 py-2.5 rounded-xl border border-[#E8DDD8] text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF5F2] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition cursor-pointer bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSED">Processed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A] pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="border-y border-[#F0EBE7]">
              {(selectedPayoutId
                ? ["Property", "Owner", "Period", "Req. Balance"]
                : ["Property", "Owner", "Period", "Req. Balance", "Status"]
              ).map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="relative">
            {payoutsLoading && payouts.length > 0 && (
               <tr className="absolute inset-0 bg-white/50 z-10"><td colSpan={5}></td></tr>
            )}
            {payouts.length === 0 && !payoutsLoading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#9E7B6A] text-sm">
                  No payout requests found.
                </td>
              </tr>
            )}
            {payouts.map((p, idx) => {
              const isSelected = selectedPayoutId === p.id;
              return (
              <tr
                key={p.id}
                className={`border-b border-[#F0EBE7] last:border-b-0 transition-colors cursor-pointer hover:bg-[#f5efec] ${
                  isSelected ? "border-l-[3px] border-l-[#C05621] bg-[#FFF8F5]" : "bg-white"
                }`}
                onClick={() => onRowClick(p)}
              >
                {/* Property */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shrink-0"
                      style={{
                        backgroundColor: PROPERTY_COLORS[idx % PROPERTY_COLORS.length],
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {p.propertyName}
                      </p>
                      <p className="text-[11px] text-[#9E7B6A]">ID: #{p.id}</p>
                    </div>
                  </div>
                </td>

                {/* Owner */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: getColorForName(p.hostName) }}
                    >
                      {getInitials(p.hostName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {p.hostName}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Period */}
                <td className="px-6 py-4">
                  <span className="text-sm text-[#1A1A1A]">
                    {p.period}
                  </span>
                </td>

                {/* Req. Balance */}
                <td className="px-6 py-4 text-sm text-[#1A1A1A] font-medium whitespace-nowrap">
                  LKR {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>

                {/* Status */}
                {!selectedPayoutId && (
                  <td className="px-6 py-4">
                    <PayoutStatusBadge status={p.status} />
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {payoutsTotalPages > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#F0EBE7]">
          <p className="text-sm text-[#9E7B6A]">
            Showing <span className="font-semibold text-[#1A1A1A]">{(currentPage - 1) * perPage + 1}</span> to{" "}
            <span className="font-semibold text-[#1A1A1A]">{Math.min(currentPage * perPage, payoutsTotalElements)}</span> of{" "}
            <span className="font-semibold text-[#C05621]">{payoutsTotalElements}</span>{" "}
            entries
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
            {Array.from({ length: Math.min(5, payoutsTotalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (payoutsTotalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > payoutsTotalPages) return null;
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

            {payoutsTotalPages > 5 && currentPage < payoutsTotalPages - 2 && (
               <span className="w-9 h-9 flex items-center justify-center text-sm text-[#9E7B6A] font-bold">
                 …
               </span>
            )}

            <button
              disabled={currentPage === payoutsTotalPages}
              onClick={() => setCurrentPage((p) => Math.min(payoutsTotalPages, p + 1))}
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
