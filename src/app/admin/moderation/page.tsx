"use client";

import AdminPageLayout from "@/components/features/admin/admin-page-layout";
import ReviewsQueue from "@/components/features/admin/moderation/reports-table";
import DisputesHub from "@/app/admin/moderation/dispute-hub/page";
import HistoryTab from "@/app/admin/moderation/history-tab/page";
import FlaggedReviewDetail from "@/components/features/admin/moderation/action-panel";
import {
  useAdminModerationStore,
  type ModerationTab,
} from "@/store/admin/moderation/admin-moderation.store";
import { MessageSquareWarning, Scale, History } from "lucide-react";

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS: {
  key: ModerationTab;
  label: string;
  badge?: number;
  icon: React.ElementType;
}[] = [
  {
    key: "reviews",
    label: "Reviews Queue",
    badge: 24,
    icon: MessageSquareWarning,
  },
  { key: "disputes", label: "Disputes", badge: 8, icon: Scale },
  { key: "history", label: "History", icon: History },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ModerationPage() {
  const { activeTab, setActiveTab, selectedReview } = useAdminModerationStore();

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1A1A] leading-tight m-0">
            Moderation Dashboard
          </h1>
          <p className="text-[13px] text-[#9E7B6A] mt-1 mb-0">
            Manage pending guest reviews and resolve open property disputes.
          </p>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 border-b-2 border-[#F0EBE7]">
          {TABS.map((tab) => {
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
            {activeTab === "disputes" && <DisputesHub />}
            {activeTab === "history" && <HistoryTab />}
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
