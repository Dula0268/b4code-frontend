import { create } from "zustand";
import api from "@/lib/axios";

/* ─── Types ─── */

export type ItemReview = {
  id: string;
  itemId: string;
  itemTitle: string;
  rating: number; // 1-5
  reviewText: string;
  guestName?: string;
  timestamp: number;
  helpful: number; // count of guests who found it helpful
};

type ReviewsState = {
  itemReviews: ItemReview[];
  loading: boolean;
  error: string | null;
};

type ReviewsActions = {
  addReview: (review: Omit<ItemReview, "id">) => void;
  getReviewsForItem: (itemId: string) => ItemReview[];
  getAverageRating: (itemId: string) => number;
  fetchReviewsForItem: (menuItemId: string) => Promise<void>;
  submitReview: (orderId: string, review: { menuItemId: string; rating: number; comment: string; guestName: string }) => Promise<void>;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

/* ─── Seed data - reviews will be fetched from API ─── */
const SEED_REVIEWS: ItemReview[] = [];

export const useGuestReviewsStore = create<ReviewsState & ReviewsActions>((set, get) => ({
  itemReviews: SEED_REVIEWS,
  loading: false,
  error: null,

  addReview: (review) => {
    const newReview: ItemReview = {
      ...review,
      id: `rev-${Date.now()}`,
    };
    set((state) => ({
      itemReviews: [...state.itemReviews, newReview],
    }));
  },

  getReviewsForItem: (itemId: string) => {
    const numericItemId = itemId.replace(/^mn-/, "");
    return get().itemReviews.filter((r) => r.itemId === numericItemId);
  },

  getAverageRating: (itemId: string) => {
    const numericItemId = itemId.replace(/^mn-/, "");
    const reviews = get().itemReviews.filter((r) => r.itemId === numericItemId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return +(sum / reviews.length).toFixed(1);
  },

  fetchReviewsForItem: async (menuItemId: string) => {
    const numericItemId = menuItemId.replace(/^mn-/, "");
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/menu-items/${numericItemId}/reviews`);
      interface BackendReview {
        id: number;
        menuItemId: number;
        menuItemName?: string;
        rating: number;
        comment: string;
        guestName: string;
        createdAt: string;
        helpful?: number;
      }
      const reviews: ItemReview[] = (response.data as BackendReview[]).map((r) => ({
        id: String(r.id),
        itemId: String(r.menuItemId),
        itemTitle: r.menuItemName || "",
        rating: r.rating,
        reviewText: r.comment,
        guestName: r.guestName || "Guest",
        timestamp: new Date(r.createdAt).getTime(),
        helpful: r.helpful || 0,
      }));
      set({ itemReviews: reviews, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch reviews";
      set({ error: message, loading: false });
    }
  },

  submitReview: async (orderId: string, review: { menuItemId: string; rating: number; comment: string; guestName: string }) => {
    const numericOrderId = orderId.replace(/^#ORD-/, "");
    const numericMenuItemId = review.menuItemId.replace(/^mn-/, "");
    set({ loading: true, error: null });
    try {
      await api.post(`/orders/${numericOrderId}/reviews`, { ...review, menuItemId: Number(numericMenuItemId) });
      const newReview: ItemReview = {
        id: `rev-${Date.now()}`,
        itemId: numericMenuItemId,
        itemTitle: "",
        rating: review.rating,
        reviewText: review.comment,
        guestName: review.guestName || "Guest",
        timestamp: Date.now(),
        helpful: 0,
      };
      set((state) => ({
        itemReviews: [...state.itemReviews, newReview],
        loading: false,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit review";
      set({ error: message, loading: false });
    }
  },

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
