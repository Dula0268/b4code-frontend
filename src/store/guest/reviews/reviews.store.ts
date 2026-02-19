import { create } from "zustand";

// Review state

type GuestReviewsState = {
  loading: boolean;
  error: string | null;
};

type GuestReviewsActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestReviewsStore = create<GuestReviewsState & GuestReviewsActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
