import { create } from "zustand";

// Authentication state (user, token)

type AuthState = {
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
