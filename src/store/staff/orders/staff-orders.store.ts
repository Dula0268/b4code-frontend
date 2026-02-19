import { create } from "zustand";

// Staff order list

type StaffOrdersState = {
  loading: boolean;
  error: string | null;
};

type StaffOrdersActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useStaffOrdersStore = create<StaffOrdersState & StaffOrdersActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
