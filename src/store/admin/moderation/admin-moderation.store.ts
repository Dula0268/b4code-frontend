import { create } from 'zustand';
import {
  ModerationApi,
  type FlaggedReview,
  type Dispute,
  type ModerationHistory,
} from '@/api/admin/moderation.api';

export type ModerationTab = "reviews" | "disputes" | "history";

type AdminModerationState = {
  activeTab: ModerationTab;
  selectedReview: FlaggedReview | null;
  selectedDispute: Dispute | null;
  disputeResolved: { amount: string; bookingId: string; caseId: string; time: string } | null;
  badgeCounts: { pendingReviews: number; openDisputes: number; removedToday: number };
  
  // Reviews
  reviews: FlaggedReview[];
  reviewsTotalPages: number;
  reviewsLoading: boolean;

  // Disputes
  disputes: Dispute[];
  disputesTotalPages: number;
  disputesLoading: boolean;

  // History
  history: ModerationHistory[];
  historyTotalPages: number;
  historyLoading: boolean;

  actionLoading: boolean;
  error: string | null;
};

type AdminModerationActions = {
  setActiveTab: (tab: ModerationTab) => void;
  setSelectedReview: (review: FlaggedReview | null) => void;
  setSelectedDispute: (dispute: Dispute | null) => void;
  setDisputeResolved: (data: { amount: string; bookingId: string; caseId: string; time: string } | null) => void;
  
  fetchBadgeCounts: () => Promise<void>;
  fetchReviews: (params?: { flagType?: string; search?: string; page?: number; size?: number; rating?: number }) => Promise<void>;
  approveReview: (id: number, adminNote?: string) => Promise<void>;
  removeReview: (id: number, adminNote: string) => Promise<void>;

  fetchDisputes: (params?: { status?: string; search?: string; page?: number; size?: number }) => Promise<void>;
  resolveDispute: (id: string, resolution: string, refundApproved: boolean) => Promise<void>;

  fetchHistory: (params?: { action?: string; search?: string; from?: string; to?: string; page?: number; size?: number }) => Promise<void>;
};

export const useAdminModerationStore = create<AdminModerationState & AdminModerationActions>((set, get) => ({
  activeTab: 'reviews',
  selectedReview: null,
  selectedDispute: null,
  disputeResolved: null,
  badgeCounts: { pendingReviews: 0, openDisputes: 0, removedToday: 0 },
  
  reviews: [],
  reviewsTotalPages: 0,
  reviewsLoading: false,

  disputes: [],
  disputesTotalPages: 0,
  disputesLoading: false,

  history: [],
  historyTotalPages: 0,
  historyLoading: false,

  actionLoading: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedReview: (review) => set({ selectedReview: review }),
  setSelectedDispute: (dispute) => set({ selectedDispute: dispute }),
  setDisputeResolved: (data) => set({ disputeResolved: data }),

  fetchBadgeCounts: async () => {
    try {
      const counts = await ModerationApi.getBadgeCounts();
      set({ badgeCounts: counts });
    } catch (err) {
      console.error('fetchBadgeCounts error:', err);
    }
  },

  fetchReviews: async (params) => {
    set({ reviewsLoading: true, error: null });
    try {
      const res = await ModerationApi.getReviews(params || {});
      set({ reviews: res.content, reviewsTotalPages: res.totalPages, reviewsLoading: false });
    } catch (err) {
      console.error('fetchReviews error:', err);
      set({ error: 'Failed to load reviews', reviewsLoading: false });
    }
  },

  approveReview: async (id, adminNote) => {
    set({ actionLoading: true, error: null });
    try {
      await ModerationApi.approveReview(id, adminNote);
      get().fetchBadgeCounts(); // Update counts
      await get().fetchReviews(); // Refetch to update the queue UI
      set({ actionLoading: false });
    } catch (err) {
      console.error('approveReview error:', err);
      set({ error: 'Failed to approve review', actionLoading: false });
    }
  },

  removeReview: async (id, adminNote) => {
    set({ actionLoading: true, error: null });
    try {
      await ModerationApi.removeReview(id, adminNote);
      get().fetchBadgeCounts();
      await get().fetchReviews(); // Refetch to update the queue UI
      set({ actionLoading: false });
    } catch (err) {
      console.error('removeReview error:', err);
      set({ error: 'Failed to remove review', actionLoading: false });
    }
  },

  fetchDisputes: async (params) => {
    set({ disputesLoading: true, error: null });
    try {
      const res = await ModerationApi.getDisputes(params || {});
      set({ disputes: res.content, disputesTotalPages: res.totalPages, disputesLoading: false });
    } catch (err) {
      console.error('fetchDisputes error:', err);
      set({ error: 'Failed to load disputes', disputesLoading: false });
    }
  },

  resolveDispute: async (id, resolution, refundApproved) => {
    set({ actionLoading: true, error: null });
    try {
      await ModerationApi.resolveDispute(id, resolution, refundApproved);
      get().fetchBadgeCounts();
      await get().fetchDisputes(); // Refetch disputes
      set({ actionLoading: false });
    } catch (err) {
      console.error('resolveDispute error:', err);
      set({ error: 'Failed to resolve dispute', actionLoading: false });
    }
  },

  fetchHistory: async (params) => {
    set({ historyLoading: true, error: null });
    try {
      const res = await ModerationApi.getHistory(params || {});
      set({ history: res.content, historyTotalPages: res.totalPages, historyLoading: false });
    } catch (err) {
      console.error('fetchHistory error:', err);
      set({ error: 'Failed to load history', historyLoading: false });
    }
  },
}));
