"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type TxStatus = "Completed" | "Pending" | "Failed" | "Refunded";

interface Transaction {
  id: string;
  date: string;
  propertyName: string;
  guestName: string;
  guestInitials: string;
  guestColor: string;
  amount: string;
  status: TxStatus;
}

// ─── Static data ────────────────────────────────────────────────────────────────
const TRANSACTIONS: Transaction[] = [
  {
    id: "#TRX-9821",
    date: "Oct 24, 2023",
    propertyName: "Sunset Villa, Apt 4B",
    guestName: "John Doe",
    guestInitials: "JD",
    guestColor: "#C05621",
    amount: "LKR 1,250.00",
    status: "Completed",
  },
  {
    id: "#TRX-9820",
    date: "Oct 24, 2023",
    propertyName: "Ocean View Loft",
    guestName: "Alice Smith",
    guestInitials: "AS",
    guestColor: "#2563EB",
    amount: "LKR 450.00",
    status: "Pending",
  },
  {
    id: "#TRX-9819",
    date: "Oct 23, 2023",
    propertyName: "Mountain Retreat, Cabin 2",
    guestName: "Robert King",
    guestInitials: "RK",
    guestColor: "#7C3AED",
    amount: "LKR 890.50",
    status: "Completed",
  },
  {
    id: "#TRX-9818",
    date: "Oct 23, 2023",
    propertyName: "Downtown Studio",
    guestName: "Emily Moore",
    guestInitials: "EM",
    guestColor: "#059669",
    amount: "LKR 210.00",
    status: "Failed",
  },
  {
    id: "#TRX-9817",
    date: "Oct 22, 2023",
    propertyName: "Lakeside Cottage",
    guestName: "Michael Chen",
    guestInitials: "MC",
    guestColor: "#DC2626",
    amount: "LKR 1,500.00",
    status: "Refunded",
  },
  {
    id: "#TRX-9816",
    date: "Oct 22, 2023",
    propertyName: "City Center Penthouse",
    guestName: "Sarah Lee",
    guestInitials: "SL",
    guestColor: "#0891B2",
    amount: "LKR 3,200.00",
    status: "Completed",
  },
  {
    id: "#TRX-9815",
    date: "Oct 21, 2023",
    propertyName: "Sunset Villa, Apt 2A",
    guestName: "David Park",
    guestInitials: "DP",
    guestColor: "#CA8A04",
    amount: "LKR 750.00",
    status: "Completed",
  },
];

// ─── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: TxStatus }) {
  const map: Record<TxStatus, { bg: string; text: string }> = {
    Completed: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
    Pending: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
    Failed: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
    Refunded: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
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
export default function TransactionTable() {
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
              placeholder="Booking ID, guest name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] placeholder:text-[#C4B5AB] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="min-w-45">
          <label className="block text-xs font-semibold text-[#9E7B6A] mb-1.5">
            Date Range
          </label>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] hover:bg-[#FAF5F2] transition">
            <Calendar size={15} className="text-[#9E7B6A]" />
            Last 30 days
          </button>
        </div>

        {/* Status */}
        <div className="min-w-35">
          <label className="block text-xs font-semibold text-[#9E7B6A] mb-1.5">
            Status
          </label>
          <select className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition appearance-none cursor-pointer">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
            <option>Refunded</option>
          </select>
        </div>

        {/* Filter btn */}
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8DDD8] text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF5F2] transition">
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
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
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-[#F0EBE7] last:border-b-0 hover:bg-[#FDFAF8] transition-colors"
              >
                {/* ID + date */}
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[#1A1A1A]">{tx.id}</p>
                  <p className="text-[11px] text-[#9E7B6A] mt-0.5">{tx.date}</p>
                </td>

                {/* Property */}
                <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                  {tx.propertyName}
                </td>

                {/* Guest */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: tx.guestColor }}
                    >
                      {tx.guestInitials}
                    </div>
                    <span className="text-sm text-[#1A1A1A]">
                      {tx.guestName}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 text-sm font-semibold text-[#1A1A1A]">
                  {tx.amount}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge status={tx.status} />
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
