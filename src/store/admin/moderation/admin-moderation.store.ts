import { create } from "zustand";

// Moderation state

type AdminModerationState = {
  loading: boolean;
  error: string | null;
};

type AdminModerationActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAdminModerationStore = create<AdminModerationState & AdminModerationActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
