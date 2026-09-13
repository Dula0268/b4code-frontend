"use client";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PropertyQAResult } from "@/models/owner";

interface QAValidationPanelProps {
  qaResult: PropertyQAResult;
  onAction?: () => void;
  actionLabel?: string;
  isSubmitting?: boolean;
  showAction?: boolean;
}

export default function QAValidationPanel({
  qaResult,
  onAction,
  actionLabel = "Submit for Review",
  isSubmitting = false,
  showAction = true,
}: QAValidationPanelProps) {
  const { isValid, requirements, passedCount, totalCount } = qaResult;
  const pct = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="rounded-2xl border border-[#E8DDD8] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0EBE7] flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold text-[#1A1A1A]">Listing Readiness</p>
          <p className="text-[12px] text-[#9E7B6A] mt-0.5">{passedCount} of {totalCount} requirements met</p>
        </div>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F0EBE7" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={isValid ? "#059669" : "#D97706"}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#1A1A1A]">
            {pct}%
          </span>
        </div>
      </div>

      {/* Requirements list */}
      <div className="px-5 py-3 space-y-2.5">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-start gap-3">
            {req.passed ? (
              <CheckCircle2 size={16} className="text-[#059669] mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle size={16} className="text-[#DC2626] mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-[13px] font-medium ${req.passed ? "text-[#1A1A1A]" : "text-[#6B7280]"}`}>
                {req.label}
              </p>
              {!req.passed && req.message && (
                <p className="text-[11px] text-[#DC2626] mt-0.5">{req.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      {showAction && onAction && (
        <div className="px-5 py-4 border-t border-[#F0EBE7]">
          <button
            onClick={onAction}
            disabled={!isValid || isSubmitting}
            className={`w-full py-3 rounded-xl text-[14px] font-bold transition-all duration-200 ${
              isValid
                ? "bg-[#953002] text-white hover:opacity-90 shadow-sm shadow-[#953002]/20 hover:-translate-y-0.5"
                : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Submitting…" : actionLabel}
          </button>
          {!isValid && (
            <p className="text-[11px] text-center text-[#9E7B6A] mt-2">
              Complete all requirements to unlock submission.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
