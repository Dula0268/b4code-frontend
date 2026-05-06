import { create } from "zustand";

/* ─── Types ─── */

export type ItemReview = {
  id: string;
  itemId: string;
  itemTitle: string;
  rating: number; // 1-5
  reviewText: string;
  guestName: string;
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
    return get().itemReviews.filter((r) => r.itemId === itemId);
  },

  getAverageRating: (itemId: string) => {
    const reviews = get().itemReviews.filter((r) => r.itemId === itemId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return +(sum / reviews.length).toFixed(1);
  },

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
