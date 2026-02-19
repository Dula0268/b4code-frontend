import { create } from "zustand";

// Booking search filters and results

type GuestBookingSearchState = {
  loading: boolean;
  error: string | null;
};

type GuestBookingSearchActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestBookingSearchStore = create<GuestBookingSearchState & GuestBookingSearchActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
