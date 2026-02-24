import { create } from "zustand";

// Dispute workflows

type AdminDisputesState = {
  loading: boolean;
  error: string | null;
};

type AdminDisputesActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAdminDisputesStore = create<AdminDisputesState & AdminDisputesActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
