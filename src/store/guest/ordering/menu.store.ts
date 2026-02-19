import { create } from "zustand";

// Menu categories & items

type GuestMenuState = {
  loading: boolean;
  error: string | null;
};

type GuestMenuActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestMenuStore = create<GuestMenuState & GuestMenuActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
