import { create } from "zustand";

// Staff menu CRUD state

type StaffMenuState = {
  loading: boolean;
  error: string | null;
};

type StaffMenuActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useStaffMenuStore = create<StaffMenuState & StaffMenuActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
