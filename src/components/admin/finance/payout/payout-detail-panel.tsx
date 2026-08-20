"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  CircleCheck,
  XCircle,
  Loader2,
  Percent,
} from "lucide-react";
import Toast from "@/components/ui/toast";
import type { PayoutDto } from "@/api/admin/finance.api";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

interface PayoutDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutDto | null;
}

function getInitials(name?: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorForName(name?: string) {
  if (!name) return "#C05621";
  const colors = [
    "#C05621",
    "#2563EB",
    "#7C3AED",
    "#059669",
    "#DC2626",
    "#0891B2",
    "#CA8A04",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function PayoutDetailPanel({
  isOpen,
  onClose,
  payout,
}: PayoutDetailPanelProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { processPayout, rejectPayout, actionLoading } = useAdminFinanceStore();
  const [customCommissionRate, setCustomCommissionRate] = useState<number | "">("");
  const [approving, setApproving] = useState(false);
  const [bankReference, setBankReference] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (payout) {
      setCustomCommissionRate(payout.commissionRate ?? 20);
    }
  }, [payout]);

  if (!isOpen || !payout) return null;

  const handleApproveClick = () => {
    setApproving(true);
    setBankReference("");
  };

  const confirmApprove = async () => {
    if (!bankReference.trim()) {
      alert("Bank reference is required.");
      return;
    }
    try {
      const rateToSend =
        customCommissionRate !== "" ? Number(customCommissionRate) : undefined;
      await processPayout(payout.id, bankReference.trim(), rateToSend);
      setToastMessage("Payout approved successfully.");
      setTimeout(() => {
        setToastMessage(null);
        setApproving(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to process payout";
      alert(message);
      setApproving(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    try {
      await rejectPayout(payout.id, rejectionReason.trim());
      setToastMessage("Payout rejected successfully.");
      setTimeout(() => {
        setToastMessage(null);
        setRejecting(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to reject payout";
      alert(message);
      setRejecting(false);
    }
  };

  const handleRejectClick = () => {
    setRejecting(true);
    setRejectionReason("");
  };

  const statusUpper = payout.status?.toUpperCase() || "";
  const isPending = statusUpper === "HOLD" || statusUpper === "PENDING";
  const isProcessed = statusUpper === "PROCESSED";

  return (
    <div className="w-85 shrink-0 flex flex-col gap-5 bg-white border border-[#F0EBE7] rounded-2xl shadow-sm overflow-hidden relative">
      {actionLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-[#C05621]" size={32} />
        </div>
      )}

      {/* Toast Notification positioned within panel container */}
      <div className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4">
        <Toast
          message={toastMessage || ""}
          type="success"
          isVisible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>

      {/* ── Header ── */}
      <div className="sticky top-0 bg-gradient-to-r from-[#FAFAFA] to-white px-6 pt-6 pb-4 border-b border-[#E8DDD8] flex items-center justify-between z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
            Payout Request
          </h2>
          <span className="text-xs text-[#9E7B6A] font-medium">
            #{payout.id}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition cursor-pointer"
        >
          <X size={18} className="text-[#6B7280]" />
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-250px)]">
        {/* ── Owner Info ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: getColorForName(payout.hostName) }}
            >
              {getInitials(payout.hostName)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">
                {payout.hostName}
              </p>
              <p className="text-[11px] text-[#9E7B6A]">
                {payout.propertyName}
              </p>
            </div>
          </div>
          {/* View Profile Link */}
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-[#C05621] flex items-center gap-1 hover:underline whitespace-nowrap"
          >
            View Profile
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* ── Request Status Timeline ── */}
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">
            Request Status
          </h3>
          <div className="flex flex-col gap-0 relative">
            {/* Step 1 - Completed */}
            <div className="flex items-start gap-3 pb-4 relative">
              <div className="flex flex-col items-center z-10">
                <CheckCircle2 size={20} className="text-[#16A34A] shrink-0" />
                <div className="w-px h-full bg-[#E5E7EB] absolute top-5 left-[9.5px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  Request Received
                </p>
                <p className="text-[11px] text-[#9E7B6A]">{payout.period}</p>
              </div>
            </div>

            {/* Step 2 - Completed */}
            <div className="flex items-start gap-3 pb-4 relative">
              <div className="flex flex-col items-center z-10">
                <CheckCircle2 size={20} className="text-[#16A34A] shrink-0" />
                {isProcessed && (
                  <div className="w-px h-full bg-[#E5E7EB] absolute top-5 left-[9.5px]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  Balance Validated
                </p>
                <p className="text-[11px] text-[#9E7B6A]">
                  {payout.bankName
                    ? `${payout.bankName} — ****${payout.accountNumber?.slice(-4) || ""}`
                    : payout.bankDetails || "No bank account linked"}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            {isProcessed ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#16A34A] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Processed Successfully
                  </p>
                  <p className="text-[11px] text-[#16A34A] font-medium">
                    Ref: {payout.bankReference || payout.id || "N/A"}
                  </p>
                </div>
              </div>
            ) : isPending ? (
              <div className="flex items-start gap-3 pb-4">
                <div className="relative flex flex-col items-center shrink-0">
                  <div className="absolute w-5 h-5 bg-[#D97706]/30 rounded-full animate-ping" />
                  <Clock size={20} className="text-[#D97706] relative z-10" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Awaiting Admin Approval
                  </p>
                  <p className="text-[11px] text-[#D97706] font-medium">
                    Pending Action
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-[#DC2626] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {payout.status}
                  </p>
                  <p className="text-[11px] text-[#DC2626] font-medium">
                    Action Required
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Financial Breakdown ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-[#F3F4F6] flex items-center justify-center">
              <span className="text-[10px]">📄</span>
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              Financial Breakdown
            </h3>
          </div>

          <div className="border border-[#E8DDD8] rounded-xl overflow-hidden shadow-sm bg-gradient-to-b from-[#FAFAFA] to-white">
            {/* Table header */}
            <div className="flex items-center px-4 py-3 border-b border-[#E8DDD8]/50">
              <span className="flex-1 text-[11px] font-extrabold text-[#9E7B6A] uppercase tracking-wider">
                Description
              </span>
              <span className="text-[11px] font-extrabold text-[#9E7B6A] uppercase tracking-wider text-right">
                Amount
              </span>
            </div>

            {/* Hotel Revenue */}
            <div className="flex items-center px-4 py-3 border-b border-[#F0EBE7]">
              <span className="flex-1 text-sm text-[#1A1A1A]">
                Hotel Booking Revenue
              </span>
              <span className="text-sm font-medium text-[#1A1A1A]">
                LKR{" "}
                {payout.hotelAmount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </span>
            </div>

            {/* Platform Commission (Editable if pending) */}
            <div className="flex items-center px-4 py-3 border-b border-[#F0EBE7] bg-[#FDFAF8]">
              <div className="flex-1 pr-4">
                <p className="text-sm text-[#1A1A1A] font-medium flex items-center gap-2">
                  Platform Commission
                </p>
                <p className="text-[11px] text-[#C05621] mt-1">
                  Applies to hotel bookings only
                </p>

                {isPending ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative">
                      <input
                        type="number"
                        value={customCommissionRate}
                        onChange={(e) =>
                          setCustomCommissionRate(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-16 pl-2 pr-5 py-1 text-sm border border-[#E8DDD8] rounded focus:outline-none focus:border-[#C05621]"
                      />
                      <Percent
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9E7B6A]"
                      />
                    </div>
                    <span className="text-xs text-[#9E7B6A]">
                      override rate for this payout
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280] mt-1">
                    Rate: {payout.commissionRate}%
                  </p>
                )}
              </div>
              <span className="text-sm font-bold text-[#DC2626] whitespace-nowrap">
                -LKR{" "}
                {(() => {
                  const rate =
                    customCommissionRate !== ""
                      ? Number(customCommissionRate)
                      : payout.commissionRate || 20;
                  const amt = (payout.hotelAmount || 0) * (rate / 100);
                  return amt.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                })()}
              </span>
            </div>

            {/* Foods Revenue */}
            <div className="flex items-center px-4 py-3 border-b border-[#F0EBE7]">
              <div className="flex-1 pr-4">
                <p className="text-sm text-[#1A1A1A]">Food & F&B Revenue</p>
                <p className="text-[11px] text-[#16A34A] mt-1">
                  Commission-free
                </p>
              </div>
              <span className="text-sm font-medium text-[#1A1A1A] whitespace-nowrap">
                LKR{" "}
                {payout.foodAmount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </span>
            </div>

            {/* Separator */}
            <div className="px-4 py-1">
              <div className="border-t-2 border-dashed border-[#E8DDD8]" />
            </div>

            {/* Net Payout */}
            <div className="flex items-center px-4 py-3">
              <span className="flex-1 text-sm font-bold text-[#1A1A1A]">
                NET PAYOUT
              </span>
              <span className="text-lg font-bold text-[#C05621] whitespace-nowrap">
                LKR{" "}
                {(() => {
                  const rate =
                    customCommissionRate !== ""
                      ? Number(customCommissionRate)
                      : payout.commissionRate || 20;
                  const hotelNet = (payout.hotelAmount || 0) * (1 - rate / 100);
                  const totalNet = hotelNet + (payout.foodAmount || 0);
                  return totalNet.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  });
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        {isPending && (
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleApproveClick}
              disabled={actionLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 hover:from-[#15803D] hover:to-[#16A34A] disabled:opacity-50 transition-all shadow-[0_4px_12px_rgba(22,163,74,0.2)] cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-[150%] skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
              <CircleCheck size={18} className="relative z-10" />
              <span className="relative z-10">Approve Payout</span>
            </button>
            <button
              onClick={handleRejectClick}
              disabled={actionLoading}
              className="w-full py-3.5 rounded-xl border-2 border-[#E8DDD8] bg-white text-[#1A1A1A] text-[14px] font-extrabold flex items-center justify-center gap-2 hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-50 transition-all cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(220,38,38,0.1)]"
            >
              <XCircle size={18} />
              Reject Payout
            </button>
          </div>
        )}
      </div>

      {/* Approval Modal Overlay */}
      {approving && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-sm px-6 py-8 border border-[#F0EBE7] rounded-2xl">
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Complete Payout</h3>
          <p className="text-sm text-[#6B7280] mb-6">
            Please enter the bank transaction reference number for this payout.
          </p>
          
          {/* Bank Details Display */}
          <div className="mb-6 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
            <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Transfer To</h4>
            {payout.bankName ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs text-[#6B7280]">Bank</span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{payout.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#6B7280]">Account Holder</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">{payout.accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-[#6B7280]">Account No.</span>
                  <span className="text-sm font-medium text-[#1A1A1A] tracking-wider">{payout.accountNumber}</span>
                </div>
                {payout.branchCode && (
                  <div className="flex justify-between">
                    <span className="text-xs text-[#6B7280]">Branch Code</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">{payout.branchCode}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-[#DC2626] break-words">
                {payout.bankDetails || "No bank account linked"}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Bank Reference Number</label>
            <input
              type="text"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
              placeholder="e.g. REF-12345678"
              className="w-full px-4 py-3 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C05621] focus:ring-1 focus:ring-[#C05621]"
              autoFocus
            />
          </div>
          <div className="flex gap-3 mt-auto">
            <button onClick={() => setApproving(false)} disabled={actionLoading} className="flex-1 py-3 rounded-xl border border-[#E8DDD8] text-[#1A1A1A] text-sm font-bold hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
            <button onClick={confirmApprove} disabled={actionLoading || !bankReference.trim()} className="flex-1 py-3 rounded-xl bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] disabled:opacity-50 cursor-pointer shadow-sm">Confirm</button>
          </div>
        </div>
      )}

      {/* Rejection Modal Overlay */}
      {rejecting && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-sm px-6 py-8 border border-[#F0EBE7] rounded-2xl">
          <h3 className="text-lg font-bold text-[#DC2626] mb-2">Reject Payout</h3>
          <p className="text-sm text-[#6B7280] mb-6">
            Please provide a reason for rejecting this payout request. This will be sent to the owner.
          </p>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid bank details provided."
              className="w-full px-4 py-3 rounded-xl border border-[#E8DDD8] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] min-h-[100px] resize-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 mt-auto">
            <button onClick={() => setRejecting(false)} disabled={actionLoading} className="flex-1 py-3 rounded-xl border border-[#E8DDD8] text-[#1A1A1A] text-sm font-bold hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
            <button onClick={confirmReject} disabled={actionLoading || !rejectionReason.trim()} className="flex-1 py-3 rounded-xl bg-[#DC2626] text-white text-sm font-bold hover:bg-[#B91C1C] disabled:opacity-50 cursor-pointer shadow-sm">Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}
