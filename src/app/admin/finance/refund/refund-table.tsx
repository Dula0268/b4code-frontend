"use client";

import { useState } from "react";
import { Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type RefundStatus = "Pending" | "Approved" | "Rejected";

interface Refund {
  bookingRef: string;
  amount: string;
  reason: string;
  requested: string;
  status: RefundStatus;
}

// ─── Static data ────────────────────────────────────────────────────────────────
const REFUNDS: Refund[] = [
  {
    bookingRef: "#BK-7829",
    amount: "LKR 120.00",
    reason: "Guest cancelled within 24h of booki...",
    requested: "Oct 24, 2023",
    status: "Pending",
  },
  {
    bookingRef: "#BK-9921",
    amount: "LKR 450.50",
    reason: "Double charge system error reported.",
    requested: "Oct 23, 2023",
    status: "Approved",
  },
  {
    bookingRef: "#BK-1102",
    amount: "LKR 85.00",
    reason: "Guest unhappy with amenities provi...",
    requested: "Oct 22, 2023",
    status: "Rejected",
  },
  {
    bookingRef: "#BK-3341",
    amount: "LKR 210.00",
    reason: "Host cancellation due to emergency.",
    requested: "Oct 21, 2023",
    status: "Pending",
  },
  {
    bookingRef: "#BK-5592",
    amount: "LKR 35.00",
    reason: "Cleaning fee dispute.",
    requested: "Oct 20, 2023",
    status: "Pending",
  },
];

// ─── Status badge ───────────────────────────────────────────────────────────────
function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const map: Record<RefundStatus, { bg: string; text: string }> = {
    Pending: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
    Approved: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
    Rejected: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
  };
  const s = map[status];

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
  const totalResults = 128;
  const perPage = 5;
  const totalPages = Math.ceil(totalResults / perPage);

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden">
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
              placeholder="Search by Booking Ref or User..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] placeholder:text-[#C4B5AB] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="min-w-50">
          <label className="block text-xs font-bold text-[#C05621] mb-1.5 uppercase tracking-wider">
            Date Range
          </label>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] hover:bg-[#FAF5F2] transition">
            <Calendar size={15} className="text-[#9E7B6A]" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {REFUNDS.map((r) => (
              <tr
                key={r.bookingRef}
                className="border-b border-[#F0EBE7] last:border-b-0 hover:bg-[#FDFAF8] transition-colors"
              >
                <td className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">
                  {r.bookingRef}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-[#1A1A1A]">
                  {r.amount}
                </td>
                <td className="px-6 py-4 text-sm text-[#6B7280] max-w-75 truncate">
                  {r.reason}
                </td>
                <td className="px-6 py-4 text-sm text-[#9E7B6A]">
                  {r.requested}
                </td>
                <td className="px-6 py-4">
                  <RefundStatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-[#F0EBE7]">
        <p className="text-sm text-[#9E7B6A]">
          Showing{" "}
          <span className="font-semibold text-[#1A1A1A]">
            {(currentPage - 1) * perPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-[#1A1A1A]">
            {Math.min(currentPage * perPage, totalResults)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#C05621]">{totalResults}</span>{" "}
          results
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-9 h-9 rounded-lg border border-[#E8DDD8] flex items-center justify-center text-[#9E7B6A] hover:bg-[#FAF5F2] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page number buttons */}
          <button
            onClick={() => setCurrentPage(1)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors ${
              currentPage === 1
                ? "bg-[#F59E0B] text-white"
                : "border border-[#E8DDD8] text-[#1A1A1A] hover:bg-[#FAF5F2]"
            }`}
          >
            1
          </button>

          <button
            onClick={() => setCurrentPage(2)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors ${
              currentPage === 2
                ? "bg-[#F59E0B] text-white"
                : "border border-[#E8DDD8] text-[#1A1A1A] hover:bg-[#FAF5F2]"
            }`}
          >
            2
          </button>

          <span className="w-9 h-9 flex items-center justify-center text-sm text-[#9E7B6A] font-bold">
            …
          </span>

          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors ${
              currentPage === totalPages
                ? "bg-[#F59E0B] text-white"
                : "border border-[#E8DDD8] text-[#1A1A1A] hover:bg-[#FAF5F2]"
            }`}
          >
            {totalPages}
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-9 h-9 rounded-lg border border-[#E8DDD8] flex items-center justify-center text-[#9E7B6A] hover:bg-[#FAF5F2] disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
