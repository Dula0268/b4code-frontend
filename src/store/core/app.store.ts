import { create } from "zustand";

// Global application state (theme, layout)

type AppState = {
  loading: boolean;
  error: string | null;
};

type AppActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
