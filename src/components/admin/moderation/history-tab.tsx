"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Download, Loader2 } from "lucide-react";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";

// ─── Action Badge ─────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: string }) {
  const cfg: Record<string, string> = {
    "Review Removed": "bg-red-50 text-red-600 border-red-200",
    "Refund Issued": "bg-orange-50 text-orange-600 border-orange-200",
    "Review Kept": "bg-green-50 text-green-600 border-green-200",
    "Appeal Denied": "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  const bgClass = cfg[action] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${bgClass}`}
    >
      {action}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HistoryTabPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [actionOpen, setActionOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const actionOptions = [
    "All Actions",
    "Review Removed",
    "Refund Issued",
    "Review Kept",
    "Appeal Denied",
  ];

  const { history, historyTotalPages, historyLoading, isExporting, fetchHistory } = useAdminModerationStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const actionMap: Record<string, string> = {
        "Review Removed": "REVIEW_REMOVED",
        "Refund Issued": "REFUND_ISSUED",
        "Review Kept": "REVIEW_KEPT",
        "Appeal Denied": "APPEAL_DENIED",
      };

      fetchHistory({
        search: search || undefined,
        action: actionFilter !== "All Actions" ? actionMap[actionFilter] : undefined,
        page: currentPage - 1,
        size: 5,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchHistory, search, actionFilter, currentPage]);

  const goPage = (p: number) => setCurrentPage(Math.max(1, Math.min(historyTotalPages, p)));

  const startIndex = (currentPage - 1) * 5 + 1;
  const endIndex = Math.max(0, startIndex + history.length - 1);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] m-0">
            Moderation & Dispute History
          </h2>
          <p className="text-[13px] text-[#9E7B6A] mt-1 m-0">
            Historical audit of moderated content for PRIME STAY.
          </p>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex gap-3 items-center flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-65">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D1D5DB] pointer-events-none"
            size={14}
          />
          <input
            placeholder="Search case ID, administrator or outcome..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 pl-9 rounded-[10px] border-[1.5px] border-[#E8DDD8] text-[13px] text-[#1A1A1A] bg-white outline-none box-border focus:border-[#C05621]"
          />
        </div>

        {/* Action Filter */}
        <div className="relative">
          <button
            onClick={() => setActionOpen(!actionOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] border-[1.5px] border-[#E8DDD8] bg-white text-[13px] font-semibold text-[#1A1A1A] cursor-pointer"
          >
            {actionFilter}
            <ChevronRight size={14} className="rotate-90" />
          </button>
          {actionOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 bg-white border-[1.5px] border-[#E8DDD8] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] z-50 min-w-45 overflow-hidden">
              {actionOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setActionFilter(opt);
                    setActionOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3.5 py-2 border-none text-[13px] cursor-pointer ${
                    actionFilter === opt
                      ? "bg-[rgba(149,48,2,0.05)] text-[#953002] font-semibold"
                      : "bg-white text-[#6B7280] font-normal hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── History Table ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#F6F8F7]">
                {[
                  "RESOLVED DATE",
                  "CASE ID",
                  "ACTION TAKEN",
                  "ADMINISTRATOR",
                  "OUTCOME",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-left text-[11px] font-bold text-[#9E7B6A] tracking-wider uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="animate-spin inline-block text-[var(--brand-primary)]" size={24} />
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[#9E7B6A] text-sm"
                  >
                    No history entries found.
                  </td>
                </tr>
              ) : (
                history.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={`border-t border-[#F0EBE7] transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    } hover:bg-[#f5efec]`}
                  >
                    {/* Resolved Date */}
                    <td className="px-5 py-3.5">
                      <p className="m-0 font-semibold text-[#1A1A1A] text-[13px]">
                        {entry.resolvedDate}
                      </p>
                      <p className="m-0 text-xs text-[#9E7B6A]">
                        {entry.resolvedTime}
                      </p>
                    </td>
                    {/* Case ID */}
                    <td className="px-5 py-3.5 font-semibold text-[#6B7280]">
                      {entry.caseId}
                    </td>
                    {/* Action Taken */}
                    <td className="px-5 py-3.5">
                      <ActionBadge action={entry.actionTaken} />
                    </td>
                    {/* Administrator */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                          style={{ backgroundColor: entry.adminColor || '#C05621' }}
                        >
                          {entry.adminInitials || (entry.adminName ? entry.adminName.charAt(0) : '?')}
                        </div>
                        <span className="font-medium text-[#1A1A1A] text-[13px]">
                          {entry.adminName}
                        </span>
                      </div>
                    </td>
                    {/* Outcome */}
                    <td className="px-5 py-3.5 text-[13px] text-[#6B7280]">
                      {entry.outcome}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex justify-between items-center px-5 py-3.5 border-t border-[#F0EBE7]">
          <span className="text-[13px] text-[#9E7B6A]">
            Page <strong className="text-[#1A1A1A]">{currentPage}</strong> of{" "}
            <strong className="text-[#1A1A1A]">{historyTotalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-md border border-[#E8DDD8] bg-white flex items-center justify-center ${
                currentPage === 1
                  ? "cursor-not-allowed text-[#D1D5DB]"
                  : "cursor-pointer text-[#6B7280]"
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            {(() => {
              const pages: (number | "...")[] = [];
              if (historyTotalPages <= 5) {
                for (let i = 1; i <= historyTotalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push("...");
                for (
                  let i = Math.max(2, currentPage - 1);
                  i <= Math.min(historyTotalPages - 1, currentPage + 1);
                  i++
                )
                  pages.push(i);
                if (currentPage < historyTotalPages - 2) pages.push("...");
                pages.push(historyTotalPages);
              }
              return pages.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`e${i}`}
                    className="w-8 h-8 flex items-center justify-center text-[13px] text-[#9E7B6A]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goPage(p as number)}
                    className={`w-8 h-8 rounded-md border cursor-pointer text-[13px] ${
                      currentPage === p
                        ? "border-[#E5A93D] bg-[#E5A93D] text-white font-bold"
                        : "border-[#E8DDD8] bg-white text-[#6B7280] font-normal"
                    }`}
                  >
                    {p}
                  </button>
                ),
              );
            })()}
            <button
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage === historyTotalPages || historyTotalPages === 0}
              className={`w-8 h-8 rounded-md border border-[#E8DDD8] bg-white flex items-center justify-center ${
                currentPage === historyTotalPages || historyTotalPages === 0
                  ? "cursor-not-allowed text-[#D1D5DB]"
                  : "cursor-pointer text-[#6B7280]"
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
