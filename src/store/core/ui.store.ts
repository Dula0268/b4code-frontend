import { create } from "zustand";

// Shared UI state (modals, drawers)

type UIState = {
  loading: boolean;
  error: string | null;
};

type UIActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
