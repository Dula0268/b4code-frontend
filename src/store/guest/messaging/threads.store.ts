import { create } from "zustand";

// Guest message threads

type GuestThreadsState = {
  loading: boolean;
  error: string | null;
};

type GuestThreadsActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestThreadsStore = create<GuestThreadsState & GuestThreadsActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
