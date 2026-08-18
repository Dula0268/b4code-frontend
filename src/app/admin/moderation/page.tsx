"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminPageLayout from "@/components/admin/admin-page-layout";
import ReviewsQueue from "@/components/admin/moderation/reports-table";
import HistoryTab from "@/components/admin/moderation/history-tab";
import FlaggedReviewDetail from "@/components/admin/moderation/action-panel";
import {
  useAdminModerationStore,
  type ModerationTab,
} from "@/store/admin/moderation/admin-moderation.store";
import { MessageSquareWarning, Scale, History } from "lucide-react";

// ─── Tab Config Base ────────────────────────────────────────────────────────
const getTabs = (badgeCounts: { pendingReviews: number }) => [
  {
    key: "reviews" as ModerationTab,
    label: "Reviews Queue",
    badge: badgeCounts.pendingReviews > 0 ? badgeCounts.pendingReviews : undefined,
    icon: MessageSquareWarning,
  },
  { key: "history" as ModerationTab, label: "History", icon: History },
];

// ─── Main Page Content ─────────────────────────────────────────────────────────
function ModerationPageContent() {
  const { activeTab, setActiveTab, selectedReview, badgeCounts, fetchBadgeCounts, reviews, setSelectedReview } = useAdminModerationStore();
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
    fetchBadgeCounts();
  }, [fetchBadgeCounts]);

  useEffect(() => {
    const reviewId = searchParams?.get("reviewId");
    if (reviewId && reviews.length > 0 && !selectedReview) {
      const found = reviews.find(r => r.id.toString() === reviewId);
      if (found) {
        setSelectedReview(found);
      }
    }
  }, [searchParams, reviews, selectedReview, setSelectedReview]);

  if (!isMounted) return null; // Prevent hydration mismatch on tabs

  const tabs = getTabs(badgeCounts);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Page Header ── */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight m-0">
              Moderation Dashboard
            </h1>
            <p className="text-[13px] text-[#9E7B6A] mt-1 mb-0">
              Manage pending guest reviews.
            </p>
          </div>
          
          {/* ── Go to Disputes Link ── */}
          <a href="/admin/moderation/disputes" className="flex items-center gap-2 bg-[#C05621] hover:bg-[#A84A1C] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors no-underline">
            <Scale size={16} />
            Resolve Disputes
            {badgeCounts.openDisputes > 0 && (
              <span className="bg-white text-[#C05621] px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {badgeCounts.openDisputes}
              </span>
            )}
          </a>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 border-b-2 border-[#F0EBE7]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium border-b-[3px] -mb-0.5 bg-transparent cursor-pointer transition-colors ${
                  isActive
                    ? "text-[#C05621] border-[#C05621] font-semibold"
                    : "text-[#9E7B6A] border-transparent hover:text-[#C05621]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`min-w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center px-1.5 ${
                      isActive
                        ? "bg-[#16A34A] text-white"
                        : "bg-[#E8DDD8] text-[#9E7B6A]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        {selectedReview ? (
          <FlaggedReviewDetail />
        ) : (
          <>
            {activeTab === "reviews" && <ReviewsQueue />}
            {activeTab === "history" && <HistoryTab />}
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}

export default function ModerationPage() {
  return (
    <Suspense fallback={null}>
      <ModerationPageContent />
    </Suspense>
  );
}
