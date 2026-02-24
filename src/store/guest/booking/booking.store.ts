import { create } from "zustand";

// Booking form & confirmation state

type GuestBookingState = {
  loading: boolean;
  error: string | null;
};

type GuestBookingActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestBookingStore = create<GuestBookingState & GuestBookingActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
