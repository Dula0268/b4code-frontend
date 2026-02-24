import { create } from "zustand";

// Staff inbox state

type StaffInboxState = {
  loading: boolean;
  error: string | null;
};

type StaffInboxActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useStaffInboxStore = create<StaffInboxState & StaffInboxActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
