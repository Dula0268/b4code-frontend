"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type PayoutStatus = "Hold" | "Rejected";
type PaymentModel = "Commission" | "Flat Fee";

interface PayoutRow {
  id: string;
  propertyName: string;
  propertyImage: string;
  pvId: string;
  ownerName: string;
  ownerRole: string;
  ownerInitials: string;
  ownerColor: string;
  paymentModel: PaymentModel;
  avbBalance: string;
  reqBalance: string;
  status: PayoutStatus;
}

// ─── Static data ────────────────────────────────────────────────────────────────
const PAYOUTS: PayoutRow[] = [
  {
    id: "1",
    propertyName: "City Loft, NY",
    propertyImage: "",
    pvId: "#PV-2935",
    ownerName: "Harvey Specter",
    ownerRole: "Owner",
    ownerInitials: "HS",
    ownerColor: "#7C3AED",
    paymentModel: "Commission",
    avbBalance: "LKR 23 562",
    reqBalance: "LKR 5 000",
    status: "Hold",
  },
  {
    id: "2",
    propertyName: "Ocean View Apt",
    propertyImage: "",
    pvId: "#PV-2937",
    ownerName: "Mike Ross",
    ownerRole: "Owner",
    ownerInitials: "MR",
    ownerColor: "#2563EB",
    paymentModel: "Commission",
    avbBalance: "LKR 23 562",
    reqBalance: "LKR 5 000",
    status: "Hold",
  },
  {
    id: "3",
    propertyName: "Mountain Retreat",
    propertyImage: "",
    pvId: "#PV-2936",
    ownerName: "Jessica Pearson",
    ownerRole: "Owner",
    ownerInitials: "JP",
    ownerColor: "#DC2626",
    paymentModel: "Flat Fee",
    avbBalance: "LKR 23 562",
    reqBalance: "LKR 5 000",
    status: "Rejected",
  },
  {
    id: "4",
    propertyName: "City Loft, NY",
    propertyImage: "",
    pvId: "#PV-2935",
    ownerName: "Harvey Specter",
    ownerRole: "Owner",
    ownerInitials: "HS",
    ownerColor: "#7C3AED",
    paymentModel: "Commission",
    avbBalance: "LKR 23 562",
    reqBalance: "LKR 5 000",
    status: "Hold",
  },
];

// ─── Badges ─────────────────────────────────────────────────────────────────────
function PaymentModelBadge({ model }: { model: PaymentModel }) {
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

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const map: Record<PayoutStatus, { bg: string; text: string; dot: string }> = {
    Hold: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", dot: "bg-[#D97706]" },
    Rejected: {
      bg: "bg-[#FEF2F2]",
      text: "text-[#DC2626]",
      dot: "bg-[#DC2626]",
    },
  };
  const s = map[status];

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

// ─── Component ──────────────────────────────────────────────────────────────────
interface PayoutTableProps {
  onRowClick: () => void;
}

export default function PayoutTable({ onRowClick }: PayoutTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalEntries = 24;
  const perPage = 4;
  const totalPages = Math.ceil(totalEntries / perPage);

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm overflow-hidden">
      {/* ── Search & Filter ── */}
      <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px] max-w-[420px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5AB]"
          />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] placeholder:text-[#C4B5AB] focus:outline-none focus:ring-2 focus:ring-[#C05621]/20 focus:border-[#C05621] transition"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DDD8] text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF5F2] transition">
          <SlidersHorizontal size={15} />
          Filter by Status
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-[#F0EBE7]">
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Property
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Owner
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Payment Model
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Avb. Balance
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Req. Balance
              </th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((p, idx) => (
              <tr
                key={p.id + "-" + idx}
                className="border-b border-[#F0EBE7] last:border-b-0 hover:bg-[#FDFAF8] transition-colors cursor-pointer"
                onClick={onRowClick}
              >
                {/* Property */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shrink-0"
                      style={{
                        backgroundColor:
                          PROPERTY_COLORS[idx % PROPERTY_COLORS.length],
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {p.propertyName}
                      </p>
                      <p className="text-[11px] text-[#9E7B6A]">ID: {p.pvId}</p>
                    </div>
                  </div>
                </td>

                {/* Owner */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: p.ownerColor }}
                    >
                      {p.ownerInitials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {p.ownerName}
                      </p>
                      <p className="text-[11px] text-[#9E7B6A]">
                        {p.ownerRole}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Payment Model */}
                <td className="px-6 py-4">
                  <PaymentModelBadge model={p.paymentModel} />
                </td>

                {/* Avb. Balance */}
                <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                  {p.avbBalance}
                </td>

                {/* Req. Balance */}
                <td className="px-6 py-4 text-sm text-[#1A1A1A]">
                  {p.reqBalance}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <PayoutStatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-[#F0EBE7]">
        <p className="text-sm text-[#9E7B6A]">
          Showing <span className="font-semibold text-[#1A1A1A]">1</span> to{" "}
          <span className="font-semibold text-[#1A1A1A]">4</span> of{" "}
          <span className="font-semibold text-[#C05621]">{totalEntries}</span>{" "}
          entries
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
