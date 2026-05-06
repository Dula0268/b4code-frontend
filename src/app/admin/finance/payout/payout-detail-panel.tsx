"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  CircleCheck,
  XCircle,
  Loader2
} from "lucide-react";
import Toast from "@/components/ui/toast";
import type { PayoutDto } from "@/api/admin/finance.api";
import { useAdminFinanceStore } from "@/store/admin/finance/finance.store";

interface PayoutDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutDto | null;
}

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

export default function PayoutDetailPanel({
  isOpen,
  onClose,
  payout,
}: PayoutDetailPanelProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { processPayout, actionLoading } = useAdminFinanceStore();

  if (!isOpen || !payout) return null;

  const handleApprove = async () => {
    try {
      const ref = prompt("Enter bank reference ID (optional):");
      if (ref === null) return; // cancelled
      
      await processPayout(payout.id, ref);
      setToastMessage("Payout approved successfully.");
      setTimeout(() => {
        setToastMessage(null);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process payout";
      alert(message);
    }
  };

  const isPending = payout.status === "Hold" || payout.status === "Pending";
  const isProcessed = payout.status === "Processed";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-105 bg-white z-50 shadow-2xl overflow-y-auto animate-slideIn relative">
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
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-[#F0EBE7] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">
              Payout Request
            </h2>
            <span className="text-xs text-[#9E7B6A] font-medium">#{payout.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* ── Owner Info ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: getColorForName(payout.hostName) }}
              >
                {getInitials(payout.hostName)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">{payout.hostName}</p>
                <p className="text-[11px] text-[#9E7B6A]">{payout.propertyName}</p>
              </div>
            </div>
            {/* View Profile Link */}
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-[#C05621] flex items-center gap-1 hover:underline"
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
                  {isProcessed && <div className="w-px h-full bg-[#E5E7EB] absolute top-5 left-[9.5px]" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Balance Validated
                  </p>
                  <p className="text-[11px] text-[#9E7B6A]">Bank: {payout.bankDetails}</p>
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
                      Ref: {payout.referenceId || "N/A"}
                    </p>
                  </div>
                </div>
              ) : isPending ? (
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-[#D97706] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      Awaiting Admin Approval
                    </p>
                    <p className="text-[11px] text-[#16A34A] font-medium">
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

            <div className="border border-[#F0EBE7] rounded-xl overflow-hidden">
              {/* Table header */}
              <div className="flex items-center px-4 py-3 bg-[#FDFAF8] border-b border-[#F0EBE7]">
                <span className="flex-1 text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                  Description
                </span>
                <span className="text-[11px] font-bold text-[#9E7B6A] uppercase tracking-wider">
                  Amount
                </span>
              </div>

              {/* Gross Amount */}
              <div className="flex items-center px-4 py-3 border-b border-[#F0EBE7] bg-[#FDFAF8]">
                <span className="flex-1 text-sm text-[#6B7280]">
                  Gross Amount
                </span>
                <span className="text-sm font-medium text-[#1A1A1A]">
                  LKR {(payout.amount / 0.85).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Platform Commission */}
              <div className="flex items-center px-4 py-3 border-b border-[#F0EBE7]">
                <div className="flex-1">
                  <p className="text-sm text-[#1A1A1A]">Platform Commission</p>
                  <p className="text-[11px] text-[#C05621] font-medium">
                    15% Standard Rate Deduction
                  </p>
                </div>
                <span className="text-sm font-bold text-[#DC2626]">
                  -LKR {((payout.amount / 0.85) * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <span className="text-lg font-bold text-[#C05621]">
                  LKR {payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          {isPending && (
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="w-full py-3.5 rounded-xl bg-[#C05621] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#A04A1C] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                <CircleCheck size={18} />
                Approve Payout
              </button>
              <button disabled={actionLoading} className="w-full py-3.5 rounded-xl border border-[#E8DDD8] text-[#1A1A1A] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#FEF2F2] disabled:opacity-50 transition-colors cursor-pointer">
                <XCircle size={18} className="text-[#DC2626]" />
                Reject Payout
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
