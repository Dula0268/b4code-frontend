import { create } from "zustand";

// Owner payouts

type OwnerPayoutsState = {
  loading: boolean;
  error: string | null;
};

type OwnerPayoutsActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useOwnerPayoutsStore = create<OwnerPayoutsState & OwnerPayoutsActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
