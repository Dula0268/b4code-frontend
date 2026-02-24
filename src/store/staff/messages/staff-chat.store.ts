import { create } from "zustand";

// Staff chat state

type StaffChatState = {
  loading: boolean;
  error: string | null;
};

type StaffChatActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useStaffChatStore = create<StaffChatState & StaffChatActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
