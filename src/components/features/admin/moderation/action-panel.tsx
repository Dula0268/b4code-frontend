"use client";

import {
  Star,
  ShieldCheck,
  Ban,
  CheckCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import {
  useAdminModerationStore,
  type FlagStatus,
} from "@/store/admin/moderation/admin-moderation.store";

// ─── Flag Badge (Larger) ──────────────────────────────────────────────────────
function FlagBadge({ status }: { status: FlagStatus }) {
  const cfg: Record<FlagStatus, { bg: string; text: string; icon: string }> = {
    Harassment: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-600",
      icon: "🚩",
    },
    "Spam / Scam": {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-700",
      icon: "⚠",
    },
    Profanity: {
      bg: "bg-orange-50 border-orange-200",
      text: "text-orange-600",
      icon: "🚫",
    },
    "Policy Violation": {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-600",
      icon: "⊘",
    },
  };
  const c = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap border ${c.bg} ${c.text}`}
    >
      <span className="text-[12px]">{c.icon}</span>
      {status}
    </span>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={
            i <= rating
              ? "text-[#F59E0B] fill-[#F59E0B]"
              : "text-[#D1D5DB] fill-[#D1D5DB]"
          }
        />
      ))}
    </div>
  );
}

// ─── Highlighted Text ─────────────────────────────────────────────────────────
function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <span>{text}</span>;

  const regex = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        const isHighlighted = terms.some(
          (t) => t.toLowerCase() === part.toLowerCase(),
        );
        return isHighlighted ? (
          <span
            key={i}
            className="bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded font-semibold"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FlaggedReviewDetail() {
  const {
    selectedReview,
    setSelectedReview,
    toast,
    showToast,
    dismissToast,
    banner,
    showBanner,
    dismissBanner,
  } = useAdminModerationStore();

  if (!selectedReview) return null;

  const handleKeepReview = () => {
    showToast({
      id: "keep",
      type: "success",
      title: "Success",
      message: "Review has been kept successfully",
    });
    setTimeout(() => {
      dismissToast();
    }, 3000);
  };

  const handleRemoveContent = () => {
    showToast({
      id: "remove",
      type: "success",
      title: "Success",
      message: "Removed content successfully",
    });
    showBanner(
      `The review from property "${selectedReview.propertyName}" has been removed due to policy violation. The user has been notified via email.`,
    );
    setTimeout(() => {
      dismissToast();
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Back Button + Title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setSelectedReview(null);
            dismissToast();
            dismissBanner();
          }}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9E7B6A] cursor-pointer bg-transparent border-none hover:text-[#C05621] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-[20px] font-bold text-[#1A1A1A] m-0">
          Flagged Reviews
        </h2>
      </div>

      {/* ── Toast Notification (top-right) ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-9999 animate-[slideInRight_0.3s_ease-out]">
          <div
            className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border min-w-70 ${
              toast.type === "success"
                ? "bg-white border-green-200"
                : "bg-white border-red-200"
            }`}
          >
            <CheckCircle
              size={20}
              className={
                toast.type === "success"
                  ? "text-green-500 shrink-0 mt-0.5"
                  : "text-red-500 shrink-0 mt-0.5"
              }
            />
            <div className="flex-1">
              <p className="m-0 font-bold text-[14px] text-[#1A1A1A]">
                {toast.title}
              </p>
              <p className="m-0 text-[12px] text-[#6B7280] mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={dismissToast}
              className="bg-transparent border-none cursor-pointer text-[#D1D5DB] hover:text-[#6B7280] p-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Review Card ── */}
      <div className="max-w-170 mx-auto w-full">
        <div className="bg-white rounded-2xl border border-[#F0EBE7] shadow-sm p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FDEADE] flex items-center justify-center text-[#C05621] font-bold text-[15px] shrink-0">
                {selectedReview.reviewerName.charAt(0)}
              </div>
              <div>
                <p className="m-0 font-bold text-[15px] text-[#1A1A1A]">
                  {selectedReview.reviewerName}
                </p>
                <p className="m-0 text-[12px] text-[#9E7B6A]">
                  {selectedReview.timeAgo}
                  <span className="mx-1.5">•</span>
                  Stayed at{" "}
                  <span className="text-[#C05621] font-medium">
                    {selectedReview.propertyName}
                  </span>
                </p>
              </div>
            </div>
            <FlagBadge status={selectedReview.flagStatus} />
          </div>

          {/* Star Rating */}
          <div className="mb-4">
            <StarRating rating={selectedReview.rating} />
          </div>

          {/* Review Content */}
          <div className="mb-6">
            <p className="m-0 text-[14px] text-[#4B5563] leading-relaxed">
              <HighlightedText
                text={selectedReview.fullContent}
                terms={selectedReview.highlightedTerms}
              />
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-[#F0EBE7] pt-4">
            <button
              onClick={handleKeepReview}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-[1.5px] border-[#E8DDD8] bg-white text-[14px] font-semibold text-[#1A1A1A] cursor-pointer hover:bg-[#F6F8F7] transition-colors"
            >
              <ShieldCheck size={16} className="text-[#6B7280]" />
              Keep Review
            </button>
            <button
              onClick={handleRemoveContent}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-none bg-[#DC2626] text-white text-[14px] font-semibold cursor-pointer hover:bg-[#B91C1C] transition-colors"
            >
              <Ban size={16} />
              Remove Content
            </button>
          </div>
        </div>
      </div>

      {/* ── Banner Notification (bottom) ── */}
      {banner && (
        <div className="max-w-170 mx-auto w-full animate-[slideInUp_0.3s_ease-out]">
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
            <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="m-0 font-semibold text-[14px] text-green-700">
                Content Removed
              </p>
              <p className="m-0 text-[13px] text-green-600 mt-0.5">
                {banner.message}
              </p>
            </div>
            <button
              onClick={dismissBanner}
              className="bg-transparent border-none cursor-pointer text-green-400 hover:text-green-600 p-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
