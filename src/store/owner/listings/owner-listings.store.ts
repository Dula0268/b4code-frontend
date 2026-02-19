import { create } from "zustand";

// Owner listings

type OwnerListingsState = {
  loading: boolean;
  error: string | null;
};

type OwnerListingsActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useOwnerListingsStore = create<OwnerListingsState & OwnerListingsActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
