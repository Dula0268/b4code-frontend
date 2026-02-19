import { create } from "zustand";

// Role-based access control state

type RBACState = {
  loading: boolean;
  error: string | null;
};

type RBACActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useRBACStore = create<RBACState & RBACActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
