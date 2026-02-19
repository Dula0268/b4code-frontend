import { create } from "zustand";

// Cart items and totals

type GuestCartState = {
  loading: boolean;
  error: string | null;
};

type GuestCartActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestCartStore = create<GuestCartState & GuestCartActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
