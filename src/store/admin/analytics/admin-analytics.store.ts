import { create } from "zustand";

// Dashboard analytics

type AdminAnalyticsState = {
  loading: boolean;
  error: string | null;
};

type AdminAnalyticsActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAdminAnalyticsStore = create<AdminAnalyticsState & AdminAnalyticsActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
