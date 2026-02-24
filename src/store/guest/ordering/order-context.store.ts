import { create } from "zustand";

// QR session context

type OrderContextState = {
  loading: boolean;
  error: string | null;
};

type OrderContextActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useOrderContextStore = create<OrderContextState & OrderContextActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
