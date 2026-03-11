import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ModerationTab = "reviews" | "disputes" | "history";

export type FlagStatus = "Harassment" | "Spam / Scam" | "Profanity" | "Policy Violation";

export interface FlaggedReview {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  timeAgo: string;
  rating: number;
  propertyName: string;
  propertyId: string;
  contentSnippet: string;
  fullContent: string;
  highlightedTerms: string[];
  flagStatus: FlagStatus;
}

export type DisputeStatus = "Decision Pending" | "Evidence Uploaded" | "Open" | "Resolved";
export type DisputeReason = "Cancellation Policy" | "Payment Issue" | "Property Damage";

export interface DisputeCase {
  id: string;
  disputeId: string;
  guestName: string;
  propertyName: string;
  reason: DisputeReason;
  amount: string;
  status: DisputeStatus;
  bookingId?: string;
  stayDates?: string;
  cancellationPolicy?: string;
  daysUntilAutoClose?: number;
}

export type HistoryAction = "Review Removed" | "Refund Issued" | "Review Kept" | "Appeal Denied";

export interface HistoryEntry {
  id: string;
  resolvedDate: string;
  resolvedTime: string;
  caseId: string;
  actionTaken: HistoryAction;
  adminInitials: string;
  adminName: string;
  adminColor: string;
  outcome: string;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

// ─── State ────────────────────────────────────────────────────────────────────
type AdminModerationState = {
  activeTab: ModerationTab;
  selectedReview: FlaggedReview | null;
  selectedDispute: DisputeCase | null;
  disputeResolved: { amount: string; bookingId: string; caseId: string; time: string } | null;
  loading: boolean;
  error: string | null;
  toast: ToastNotification | null;
  banner: { message: string } | null;
};

type AdminModerationActions = {
  setActiveTab: (tab: ModerationTab) => void;
  setSelectedReview: (review: FlaggedReview | null) => void;
  setSelectedDispute: (dispute: DisputeCase | null) => void;
  setDisputeResolved: (data: { amount: string; bookingId: string; caseId: string; time: string } | null) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  showToast: (toast: ToastNotification) => void;
  dismissToast: () => void;
  showBanner: (message: string) => void;
  dismissBanner: () => void;
  reset: () => void;
};

export const useAdminModerationStore = create<AdminModerationState & AdminModerationActions>((set) => ({
  activeTab: "reviews",
  selectedReview: null,
  selectedDispute: null,
  disputeResolved: null,
  loading: false,
  error: null,
  toast: null,
  banner: null,

  setActiveTab: (tab) => set({ activeTab: tab, selectedReview: null, selectedDispute: null, disputeResolved: null }),
  setSelectedReview: (review) => set({ selectedReview: review }),
  setSelectedDispute: (dispute) => set({ selectedDispute: dispute, disputeResolved: null }),
  setDisputeResolved: (data) => set({ disputeResolved: data }),
  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  showToast: (toast) => set({ toast }),
  dismissToast: () => set({ toast: null }),
  showBanner: (message) => set({ banner: { message } }),
  dismissBanner: () => set({ banner: null }),
  reset: () => set({ activeTab: "reviews", selectedReview: null, selectedDispute: null, disputeResolved: null, loading: false, error: null, toast: null, banner: null }),
}));
