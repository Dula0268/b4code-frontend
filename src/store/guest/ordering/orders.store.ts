import { create } from "zustand";

// Guest order history & tracking

type GuestOrdersState = {
  loading: boolean;
  error: string | null;
};

type GuestOrdersActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestOrdersStore = create<GuestOrdersState & GuestOrdersActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
