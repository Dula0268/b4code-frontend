import { create } from "zustand";

// Active chat session

type GuestChatState = {
  loading: boolean;
  error: string | null;
};

type GuestChatActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestChatStore = create<GuestChatState & GuestChatActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
