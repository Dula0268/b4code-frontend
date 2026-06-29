"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";
import OpenCasesCard from "@/components/admin/moderation/kpi-cards/open-cases-card";
import PendingDecisionCard from "@/components/admin/moderation/kpi-cards/pending-decision-card";
import TotalDisputedCard from "@/components/admin/moderation/kpi-cards/total-disputed-card";
import AvgResolutionCard from "@/components/admin/moderation/kpi-cards/avg-resolution-card";
import {
  useAdminModerationStore,
} from "@/store/admin/moderation/admin-moderation.store";
import type { Dispute } from "@/api/admin/moderation.api";
import { ModerationApi } from "@/api/admin/moderation.api";
import ExportButton from "../audit-logs/ExportButton";

// ─── Reason Badge ─────────────────────────────────────────────────────────────
function ReasonBadge({ reason }: { reason: string }) {
  const cfg: Record<string, string> = {
    "Cancellation Policy": "bg-blue-50 text-blue-700 border-blue-200",
    "Payment Issue": "bg-orange-50 text-orange-700 border-orange-200",
    "Property Damage": "bg-red-50 text-red-700 border-red-200",
  };
  const bgClass = cfg[reason] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${bgClass}`}
    >
      {reason}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { dot: string; text: string }> = {
    "Decision Pending": { dot: "bg-red-500", text: "text-red-600" },
    "Evidence Uploaded": { dot: "bg-green-500", text: "text-green-600" },
    Open: { dot: "bg-yellow-500", text: "text-yellow-700" },
    Resolved: { dot: "bg-gray-400", text: "text-gray-500" },
  };
  const c = cfg[status] || { dot: "bg-gray-400", text: "text-gray-600" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${c.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

// ─── Resolution Summary Panel ─────────────────────────────────────────────────
function ResolutionSummary({ dispute }: { dispute: Dispute }) {
  const { setSelectedDispute, setDisputeResolved, resolveDispute, actionLoading } = useAdminModerationStore();
  const [note, setNote] = useState("");

  const handleApprove = async () => {
    await resolveDispute(dispute.id, "Refund Approved", true);
    
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setDisputeResolved({
      amount: dispute.amount,
      bookingId: dispute.bookingId || "#BK-99201",
      caseId: dispute.disputeId,
      time,
    });
    setSelectedDispute(null);
  };

  const handleDeny = async () => {
    await resolveDispute(dispute.id, "Refund Denied (Host Wins)", false);
    
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setDisputeResolved({
      amount: "LKR 0.00",
      bookingId: dispute.bookingId || "#BK-99201",
      caseId: dispute.disputeId,
      time,
    });
    setSelectedDispute(null);
  };

  return (
    <div className="w-85 shrink-0 flex flex-col gap-5 bg-white border border-[#F0EBE7] rounded-2xl shadow-sm overflow-hidden relative">
      {/* ── Header ── */}
      <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-[#F0EBE7] flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center">
            <FileText size={18} className="text-[#92400E]" />
          </div>
          <h3 className="text-[17px] font-bold text-[#1A1A1A] m-0">
            Resolution
            <br />
            Summary
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#9E7B6A]">
            ID: {dispute.bookingId?.replace("#BK-", "#") || "N/A"}
          </span>
          <button
            onClick={() => setSelectedDispute(null)}
            className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition cursor-pointer border-none bg-transparent"
          >
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-250px)]">

      {/* ── Booking Context ── */}
      <div>
        <p className="text-[10px] font-bold text-[#9E7B6A] tracking-wider uppercase m-0 mb-2">
          BOOKING CONTEXT
        </p>
        <div className="bg-[#FAFAF8] border border-[#F0EBE7] rounded-xl p-4 flex justify-between items-start">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[13px] text-[#1A1A1A]">
              {dispute.propertyName}
            </span>
            <span className="text-[12px] text-[#9E7B6A]">
              {dispute.cancellationPolicy || "Strict Cancellation"}
            </span>
            <span className="text-[12px] text-[#9E7B6A]">
              Days until auto-close:{" "}
              <span className="text-[#2563EB] font-semibold">
                {dispute.daysUntilAutoClose ?? 2} days
              </span>
            </span>
          </div>
          <div className="text-right flex flex-col items-end gap-0.5">
            <span className="text-[12px] text-[#9E7B6A]">
              {dispute.stayDates || "Oct 12-15"}
            </span>
            <span className="text-[18px] font-bold text-[#1A1A1A]">
              {dispute.amount}
            </span>
          </div>
        </div>
      </div>

      {/* ── Dispute Claim Timeline ── */}
      <div>
        <p className="text-[10px] font-bold text-[#9E7B6A] tracking-wider uppercase m-0 mb-3">
          DISPUTE CLAIM
        </p>
        <div className="flex flex-col gap-0">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
              <div className="w-0.5 flex-1 bg-[#E5E7EB]" />
            </div>
            <div className="pb-4">
              <p className="m-0 text-[11px] text-[#9E7B6A]">Oct 14, 10:00 AM</p>
              <p className="m-0 text-[13px] font-semibold text-[#1A1A1A]">
                Dispute Opened by Guest
              </p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" />
              <div className="w-0.5 flex-1 bg-[#E5E7EB]" />
            </div>
            <div className="pb-4">
              <p className="m-0 text-[11px] text-[#9E7B6A]">Oct 14, 03:30 PM</p>
              <p className="m-0 text-[13px] font-semibold text-[#1A1A1A]">
                Host Submitted Evidence
              </p>
            </div>
          </div>
          {/* Step 3 – Current Step */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626] shrink-0" />
            </div>
            <div>
              <p className="m-0 text-[11px] text-[#DC2626] font-bold">
                CURRENT STEP
              </p>
              <p className="m-0 text-[13px] font-semibold text-[#1A1A1A]">
                Admin Decision Pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Evidence ── */}
      <div>
        <p className="text-[10px] font-bold text-[#9E7B6A] tracking-wider uppercase m-0 mb-2">
          EVIDENCE
        </p>
        <div className="flex gap-3">
          <div className="relative w-30 h-22.5 rounded-xl overflow-hidden border border-[#E8DDD8]">
            <Image
              src="/evidence-photo.png"
              alt="Evidence Photo"
              fill
              className="object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
              Photo
            </span>
          </div>
          <div className="flex flex-col items-center justify-center w-22.5 h-22.5 rounded-xl border border-[#E8DDD8] bg-[#FAFAF8] cursor-pointer hover:bg-[#f5efec] transition-colors">
            <FileText size={22} className="text-[#9E7B6A] mb-1" />
            <span className="text-[10px] text-[#9E7B6A]">chat_log.pdf</span>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleApprove}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#16A34A] text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#15803D] transition-colors disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          Approve Refund
        </button>
        <button 
          onClick={handleDeny}
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-[#1A1A1A] text-[14px] font-semibold border-[1.5px] border-[#E8DDD8] cursor-pointer hover:border-[#C05621] transition-colors disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
          Deny Refund (Host Wins)
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2 bg-transparent text-[#C05621] text-[13px] font-semibold border-none cursor-pointer hover:underline">
          <Clock size={14} />
          Request More Info
        </button>
      </div>

      {/* ── Internal Notes ── */}
      <div>
        <p className="text-[10px] font-bold text-[#9E7B6A] tracking-wider uppercase m-0 mb-2">
          INTERNAL NOTES
        </p>
        <div className="bg-white border border-[#E8DDD8] rounded-xl p-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a private note for the team..."
            className="w-full h-17.5 border-none outline-none resize-none text-[13px] text-[#1A1A1A] bg-transparent placeholder:text-[#C4B5AC] box-border"
          />
          <div className="flex justify-end">
            <button className="text-[12px] font-bold text-[#C05621] bg-transparent border-none cursor-pointer hover:underline">
              SAVE NOTE
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

// ─── Dispute Resolved Success View ────────────────────────────────────────────
function DisputeResolvedView() {
  const { disputeResolved, setDisputeResolved } = useAdminModerationStore();
  if (!disputeResolved) return null;

  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE7] w-full max-w-130 flex flex-col items-center">
        <div className="flex flex-col items-center py-12 px-8 gap-4">
          {/* Green Check */}
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center">
            <CheckCircle2 size={36} className="text-[#16A34A]" />
          </div>
          <h2 className="text-[22px] font-bold text-[#1A1A1A] m-0 text-center">
            Dispute Resolved Successfully
          </h2>
          <p className="text-[14px] text-[#9E7B6A] m-0 text-center">
            Refund of{" "}
            <span className="font-bold text-[#C05621]">
              {disputeResolved.amount}
            </span>{" "}
            approved for Booking
            <br />
            <span className="text-[#6B7280]">{disputeResolved.bookingId}</span>
          </p>

          {/* Back Button */}
          <button
            onClick={() => setDisputeResolved(null)}
            className="mt-2 w-full max-w-[320px] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#7C2D12] text-white text-[14px] font-semibold border-none cursor-pointer hover:bg-[#6C2710] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Queue
          </button>
        </div>

        {/* Footer */}
        <div className="w-full flex items-center justify-between px-6 py-3.5 border-t border-[#F0EBE7]">
          <span className="flex items-center gap-1.5 text-[12px] text-[#9E7B6A]">
            <Clock size={12} />
            Action recorded at {disputeResolved.time}
          </span>
          <span className="text-[12px] text-[#9E7B6A]">
            Case {disputeResolved.caseId}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DisputeHubPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    selectedDispute, 
    setSelectedDispute, 
    disputeResolved, 
    disputes, 
    disputesTotalPages, 
    fetchDisputes,
    disputesLoading,
    badgeCounts 
  } = useAdminModerationStore();

  useEffect(() => {
    fetchDisputes({ page: currentPage - 1, size: 4 });
  }, [fetchDisputes, currentPage]);

  const goPage = (p: number) => setCurrentPage(Math.max(1, Math.min(disputesTotalPages, p)));

  const startIndex = (currentPage - 1) * 4 + 1;
  const endIndex = Math.max(0, startIndex + disputes.length - 1);

  // ── Resolved View ──
  if (disputeResolved) {
    return <DisputeResolvedView />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Section Header ── */}
      <div>
        <h2 className="text-[20px] font-bold text-[#1A1A1A] m-0">
          Dispute Resolution Hub
        </h2>
        <p className="text-[13px] text-[#9E7B6A] mt-1 m-0">
          Manage, review, and resolve open disputes between Guests and Hosts.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="flex gap-4">
        <OpenCasesCard />
        <PendingDecisionCard />
        <TotalDisputedCard />
        <AvgResolutionCard />
      </div>

      {/* ── Sub-Tab ── */}
      <div className="flex items-center gap-2 border-b-2 border-[#F0EBE7]">
        <button className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-[#C05621] border-b-[3px] border-[#C05621] -mb-0.5 bg-transparent cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="1"
              y="2"
              width="14"
              height="12"
              rx="2"
              stroke="#C05621"
              strokeWidth="1.5"
            />
            <path d="M1 6h14" stroke="#C05621" strokeWidth="1.5" />
            <path
              d="M5 2V0M11 2V0"
              stroke="#C05621"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          All Open Cases
          <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white text-[11px] font-bold flex items-center justify-center">
            {badgeCounts.openDisputes}
          </span>
        </button>
        <div className="ml-auto pb-2">
          <ExportButton
            filenamePrefix="disputes"
            onExportCsv={() => ModerationApi.exportDisputesCsv({})}
            onExportPdf={() => ModerationApi.exportDisputesPdf({})}
          />
        </div>
      </div>

      {/* ── Content: Table + Detail Panel ── */}
      <div className="flex gap-6 items-start">
        {/* ── Disputes Table ── */}
        <div
          className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${selectedDispute ? "flex-1 min-w-0" : "w-full"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#F6F8F7]">
                  {(selectedDispute
                    ? ["DISPUTE ID", "PARTIES", "REASON", "AMOUNT"]
                    : [
                        "DISPUTE ID",
                        "PARTIES",
                        "REASON",
                        "AMOUNT",
                        "STATUS",
                        "",
                      ]
                  ).map((h) => (
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
                {disputesLoading ? (
                  <tr>
                    <td colSpan={selectedDispute ? 4 : 6} className="py-12 text-center">
                      <Loader2 className="animate-spin inline-block text-[var(--brand-primary)]" size={24} />
                    </td>
                  </tr>
                ) : disputes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={selectedDispute ? 4 : 6}
                      className="py-12 text-center text-[#9E7B6A] text-sm"
                    >
                      No open disputes found.
                    </td>
                  </tr>
                ) : (
                  disputes.map((dispute) => {
                    const isSelected = selectedDispute?.id === dispute.id;
                    return (
                      <tr
                        key={dispute.id}
                        onClick={() => setSelectedDispute(dispute)}
                        className={`border-t border-[#F0EBE7] transition-colors cursor-pointer hover:bg-[#f5efec] ${
                          isSelected
                            ? "border-l-[3px] border-l-[#C05621] bg-[#FFF8F5]"
                            : "bg-white"
                        }`}
                      >
                        {/* Dispute ID */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`font-bold ${
                              dispute.status === "Decision Pending" ||
                              isSelected
                                ? "text-[#C05621]"
                                : "text-[#6B7280]"
                            }`}
                          >
                            {dispute.disputeId}
                          </span>
                        </td>
                        {/* Parties */}
                        <td className="px-5 py-3.5 min-w-45">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[13px] text-[#1A1A1A]">
                              <User size={12} className="text-[#9E7B6A]" />
                              <span className="font-semibold">
                                {dispute.guestName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#9E7B6A]">
                              <Home size={12} className="text-[#9E7B6A]" />
                              <span>{dispute.propertyName}</span>
                            </div>
                          </div>
                        </td>
                        {/* Reason */}
                        <td className="px-5 py-3.5">
                          <ReasonBadge reason={dispute.reason} />
                        </td>
                        {/* Amount */}
                        <td className="px-5 py-3.5 font-semibold text-[#1A1A1A] whitespace-nowrap">
                          {dispute.amount}
                        </td>
                        {/* Status – hidden when panel open */}
                        {!selectedDispute && (
                          <td className="px-5 py-3.5">
                            <StatusBadge status={dispute.status} />
                          </td>
                        )}
                        {/* Chevron – hidden when panel open */}
                        {!selectedDispute && (
                          <td className="px-5 py-3.5">
                            <ChevronRight
                              size={16}
                              className="text-[#D1D5DB]"
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex justify-between items-center px-5 py-3.5 border-t border-[#F0EBE7]">
            <span className="text-[13px] text-[#9E7B6A]">
              Page <strong className="text-[#1A1A1A]">{currentPage}</strong>{" "}
              of <strong className="text-[#1A1A1A]">{disputesTotalPages}</strong>
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
              {Array.from({ length: disputesTotalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`w-8 h-8 rounded-md border cursor-pointer text-[13px] ${
                    currentPage === p
                      ? "border-[#E5A93D] bg-[#E5A93D] text-white font-bold"
                      : "border-[#E8DDD8] bg-white text-[#6B7280] font-normal"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage === disputesTotalPages || disputesTotalPages === 0}
                className={`w-8 h-8 rounded-md border border-[#E8DDD8] bg-white flex items-center justify-center ${
                  currentPage === disputesTotalPages || disputesTotalPages === 0
                    ? "cursor-not-allowed text-[#D1D5DB]"
                    : "cursor-pointer text-[#6B7280]"
                }`}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Resolution Summary Panel ── */}
        {selectedDispute && <ResolutionSummary dispute={selectedDispute} />}
      </div>
    </div>
  );
}
