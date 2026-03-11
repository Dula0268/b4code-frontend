"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import TotalDisputesCard from "./kpi-cards/total-disputes-card";
import UrgentCard from "./kpi-cards/urgent-card";
import RemovedTodayCard from "./kpi-cards/removed-today-card";
import AvgTimeCard from "./kpi-cards/avg-time-card";
import {
  useAdminModerationStore,
  type FlaggedReview,
  type FlagStatus,
} from "@/store/admin/moderation/admin-moderation.store";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const FLAGGED_REVIEWS: FlaggedReview[] = [
  {
    id: "1",
    reviewerName: "Jane Doe",
    timeAgo: "2h ago",
    rating: 1,
    propertyName: "Seaside Villa #402",
    propertyId: "88321",
    contentSnippet:
      "...location was okay, but the host was incredibly rude and aggressive when...",
    fullContent:
      "The location was okay, but the host was incredibly rude and aggressive when we asked for extra towels. The place was dirty. I want a full refund immediately! #terrible",
    highlightedTerms: ["rude and aggressive"],
    flagStatus: "Harassment",
  },
  {
    id: "2",
    reviewerName: "Mike Smith",
    timeAgo: "5h ago",
    rating: 5,
    propertyName: "Downtown Loft",
    propertyId: "19283",
    contentSnippet: "Crypto Investment Opportunities at...",
    fullContent:
      "Great place! Also check out these amazing Crypto Investment Opportunities at our website for guaranteed returns!",
    highlightedTerms: ["Crypto", "Investment Opportunities"],
    flagStatus: "Spam / Scam",
  },
  {
    id: "3",
    reviewerName: "John Doe",
    timeAgo: "1d ago",
    rating: 1,
    propertyName: "Mountain Cabin",
    propertyId: "44219",
    contentSnippet:
      "I hated this place! The owner is a complete liar and thief. Do not book!.",
    fullContent:
      "I hated this place! The owner is a complete liar and thief. Do not book!. The worst experience ever.",
    highlightedTerms: ["liar and thief"],
    flagStatus: "Profanity",
  },
  {
    id: "4",
    reviewerName: "Alice Springs",
    timeAgo: "2d ago",
    rating: 3,
    propertyName: "City Center Apt",
    propertyId: "33102",
    contentSnippet: "...contact me 555-0192 for direct Off-platform..",
    fullContent:
      "Nice place overall. Contact me at 555-0192 for direct bookings off-platform to avoid fees.",
    highlightedTerms: ["Off-platform"],
    flagStatus: "Policy Violation",
  },
];

const PAGE_SIZE = 4;

// ─── Flag Badge ───────────────────────────────────────────────────────────────
function FlagBadge({ status }: { status: FlagStatus }) {
  const cfg: Record<FlagStatus, { bg: string; text: string; icon: string }> = {
    Harassment: { bg: "bg-red-50", text: "text-red-600", icon: "🚩" },
    "Spam / Scam": { bg: "bg-yellow-50", text: "text-yellow-700", icon: "⚠" },
    Profanity: { bg: "bg-orange-50", text: "text-orange-600", icon: "🚫" },
    "Policy Violation": { bg: "bg-blue-50", text: "text-blue-600", icon: "⊘" },
  };
  const c = cfg[status];
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

// ─── Highlighted Text ─────────────────────────────────────────────────────────
function HighlightedSnippet({
  text,
  terms,
}: {
  text: string;
  terms: string[];
}) {
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
            className="bg-[#FEF3C7] text-[#92400E] px-1 py-0.5 rounded font-semibold text-[12px]"
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
export default function ReviewsQueue() {
  const [currentPage, setCurrentPage] = useState(1);
  const [flagFilter, setFlagFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("Any");
  const [flagOpen, setFlagOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const setSelectedReview = useAdminModerationStore((s) => s.setSelectedReview);

  const filtered = FLAGGED_REVIEWS.filter((r) => {
    if (flagFilter !== "All" && r.flagStatus !== flagFilter) return false;
    if (ratingFilter !== "Any" && r.rating !== Number(ratingFilter))
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goPage = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  const startIndex =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const flagOptions: string[] = [
    "All",
    "Harassment",
    "Spam / Scam",
    "Profanity",
    "Policy Violation",
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
                  "REVIEWER",
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
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[#9E7B6A] text-sm"
                  >
                    No flagged reviews found.
                  </td>
                </tr>
              ) : (
                paged.map((review, idx) => (
                  <tr
                    key={review.id}
                    onClick={() => setSelectedReview(review)}
                    className={`border-t border-[#F0EBE7] transition-colors cursor-pointer ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    } hover:bg-[#f5efec]`}
                  >
                    {/* Reviewer */}
                    <td className="px-5 py-3.5 min-w-40">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 rounded-full bg-[#FDEADE] flex items-center justify-center text-[#C05621] font-bold text-[13px] shrink-0">
                          {review.reviewerName.charAt(0)}
                        </div>
                        <div>
                          <p className="m-0 font-semibold text-[#1A1A1A]">
                            {review.reviewerName}
                          </p>
                          <p className="m-0 text-xs text-[#9E7B6A]">
                            {review.timeAgo}
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
                        <HighlightedSnippet
                          text={review.contentSnippet}
                          terms={review.highlightedTerms}
                        />
                      </p>
                    </td>
                    {/* Flag Status */}
                    <td className="px-5 py-3.5">
                      <FlagBadge status={review.flagStatus} />
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
            Showing <strong className="text-[#1A1A1A]">{startIndex}</strong> to{" "}
            <strong className="text-[#1A1A1A]">{endIndex}</strong> of{" "}
            <strong className="text-[#1A1A1A]">{filtered.length}</strong>{" "}
            flagged reviews
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-md border border-[#E8DDD8] bg-white flex items-center justify-center ${
                currentPage === totalPages
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
