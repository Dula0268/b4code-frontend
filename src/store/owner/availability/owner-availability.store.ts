import { create } from "zustand";

// Availability & pricing

type OwnerAvailabilityState = {
  loading: boolean;
  error: string | null;
};

type OwnerAvailabilityActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useOwnerAvailabilityStore = create<OwnerAvailabilityState & OwnerAvailabilityActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
