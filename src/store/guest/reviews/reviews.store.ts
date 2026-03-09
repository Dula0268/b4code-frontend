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

/* ─── Seed data - demo reviews from other guests ─── */
const SEED_REVIEWS: ItemReview[] = [
  {
    id: "rev1",
    itemId: "1",
    itemTitle: "Chicken Kottu Roti",
    rating: 5,
    reviewText:
      "Amazing spice blend! Perfect flavors and very filling. Highly recommend to everyone.",
    guestName: "Sarah Kumar",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    helpful: 12,
  },
  {
    id: "rev2",
    itemId: "1",
    itemTitle: "Chicken Kottu Roti",
    rating: 4,
    reviewText:
      "Good portion size and taste, but a bit too spicy for my liking. Still enjoyed it.",
    guestName: "Michael Chen",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    helpful: 5,
  },
  {
    id: "rev3",
    itemId: "3",
    itemTitle: "Egg Hoppers",
    rating: 5,
    reviewText: "Crispy on the outside, soft on the inside. Best breakfast item!",
    guestName: "Emma Wilson",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    helpful: 8,
  },
  {
    id: "rev4",
    itemId: "5",
    itemTitle: "Cheese Platter",
    rating: 4,
    reviewText:
      "Nice variety of cheeses, fresh and well-presented. Would add more local varieties.",
    guestName: "David Fernandez",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    helpful: 3,
  },
];

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
