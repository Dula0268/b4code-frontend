"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Star, Loader2 } from "lucide-react";
import TotalDisputesCard from "./kpi-cards/total-disputes-card";
import UrgentCard from "./kpi-cards/urgent-card";
import RemovedTodayCard from "./kpi-cards/removed-today-card";
import AvgTimeCard from "./kpi-cards/avg-time-card";
import { useAdminModerationStore } from "@/store/admin/moderation/admin-moderation.store";
import type { FlaggedReview } from "@/api/admin/moderation.api";

// ─── Flag Badge ───────────────────────────────────────────────────────────────
function FlagBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; icon: string }> = {
    HARASSMENT: { bg: "bg-red-50", text: "text-red-600", icon: "🚩" },
    SPAM_SCAM: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "⚠" },
    PROFANITY: { bg: "bg-orange-50", text: "text-orange-600", icon: "🚫" },
    POLICY_VIOLATION: { bg: "bg-blue-50", text: "text-blue-600", icon: "⊘" },
  };
  const c = cfg[status] || { bg: "bg-gray-50", text: "text-gray-600", icon: "•" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${c.bg} ${c.text}`}
    >
      <span className="text-[10px]">{c.icon}</span>
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
          size={14}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReviewsQueue() {
  const [currentPage, setCurrentPage] = useState(1);
  const [flagFilter, setFlagFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("Any");
  const [flagOpen, setFlagOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  
  const { reviews, reviewsTotalPages, reviewsLoading, fetchReviews, setSelectedReview } = useAdminModerationStore();
  const startIndex = (currentPage - 1) * 4 + 1;
  const endIndex = Math.max(0, startIndex + reviews.length - 1);

  useEffect(() => {
    fetchReviews({
      flagType: flagFilter !== "All" ? flagFilter : undefined,
      rating: ratingFilter !== "Any" ? parseInt(ratingFilter) : undefined,
      page: currentPage - 1,
      size: 4,
    });
  }, [fetchReviews, flagFilter, ratingFilter, currentPage]);

  const goPage = (p: number) => setCurrentPage(Math.max(1, Math.min(reviewsTotalPages, p)));

  const flagOptions: string[] = [
    "All",
    "HARASSMENT",
    "SPAM_SCAM",
    "PROFANITY",
    "POLICY_VIOLATION",
  ];
  const ratingOptions: string[] = ["Any", "1", "2", "3", "4", "5"];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Section Header + Filters ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1A1A] m-0">
            Review Management Queue
          </h2>
          <p className="text-[13px] text-[#9E7B6A] mt-1 m-0">
            Moderation queue for flagged guest reviews and policy violations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Flag Type Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setFlagOpen(!flagOpen);
                setRatingOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] border-[1.5px] border-[#E8DDD8] bg-white text-[13px] font-semibold text-[#1A1A1A] cursor-pointer"
            >
              Flag Type: {flagFilter}
              <ChevronDown size={14} />
            </button>
            {flagOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 bg-white border-[1.5px] border-[#E8DDD8] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] z-50 min-w-45 overflow-hidden">
                {flagOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFlagFilter(opt);
                      setFlagOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3.5 py-2 border-none text-[13px] cursor-pointer ${
                      flagFilter === opt
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
          {/* Rating Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setRatingOpen(!ratingOpen);
                setFlagOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] border-[1.5px] border-[#E8DDD8] bg-white text-[13px] font-semibold text-[#1A1A1A] cursor-pointer"
            >
              Rating: {ratingFilter}
              <ChevronDown size={14} />
            </button>
            {ratingOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 bg-white border-[1.5px] border-[#E8DDD8] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.10)] z-50 min-w-30 overflow-hidden">
                {ratingOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setRatingFilter(opt);
                      setRatingOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3.5 py-2 border-none text-[13px] cursor-pointer ${
                      ratingFilter === opt
                        ? "bg-[rgba(149,48,2,0.05)] text-[#953002] font-semibold"
                        : "bg-white text-[#6B7280] font-normal hover:bg-gray-50"
                    }`}
                  >
                    {opt === "Any"
                      ? "Any"
                      : `${opt} Star${opt === "1" ? "" : "s"}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="flex gap-4">
        <TotalDisputesCard />
        <UrgentCard />
        <RemovedTodayCard />
        <AvgTimeCard />
      </div>

      {/* ── Reviews Table ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#F6F8F7]">
                {[
                  "FLAGGED BY",
                  "RATING",
                  "PROPERTY",
                  "CONTENT SNIPPET",
                  "FLAG STATUS",
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
              {reviewsLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="animate-spin inline-block text-[var(--brand-primary)]" size={24} />
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[#9E7B6A] text-sm"
                  >
                    No flagged reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review, idx) => (
                  <tr
                    key={review.id}
                    onClick={() => setSelectedReview(review)}
                    className={`border-t border-[#F0EBE7] transition-colors cursor-pointer ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    } hover:bg-[#f5efec]`}
                  >
                    {/* Flagged By */}
                    <td className="px-5 py-3.5 min-w-40">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0 bg-[#C05621]"
                        >
                          {review.ownerName ? review.ownerName.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="m-0 font-semibold text-[#1A1A1A]">
                            {review.ownerName || "Unknown Owner"}
                          </p>
                          <p className="m-0 text-xs text-[#9E7B6A]">
                            {review.flaggedAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Rating */}
                    <td className="px-5 py-3.5">
                      <StarRating rating={review.rating} />
                    </td>
                    {/* Property */}
                    <td className="px-5 py-3.5">
                      <p className="m-0 font-semibold text-[#C05621]">
                        {review.propertyName}
                      </p>
                      <p className="m-0 text-xs text-[#9E7B6A]">
                        ID: {review.propertyId}
                      </p>
                    </td>
                    {/* Content Snippet */}
                    <td className="px-5 py-3.5 max-w-70">
                      <p className="m-0 text-[13px] text-[#6B7280] truncate">
                        {review.reviewText}
                      </p>
                    </td>
                    {/* Flag Status */}
                    <td className="px-5 py-3.5">
                      <FlagBadge status={review.flagType} />
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
            <strong className="text-[#1A1A1A]">{reviewsTotalPages}</strong>
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
            {Array.from({ length: reviewsTotalPages }, (_, i) => i + 1).map((p) => (
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
              disabled={currentPage === reviewsTotalPages || reviewsTotalPages === 0}
              className={`w-8 h-8 rounded-md border border-[#E8DDD8] bg-white flex items-center justify-center ${
                currentPage === reviewsTotalPages || reviewsTotalPages === 0
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
