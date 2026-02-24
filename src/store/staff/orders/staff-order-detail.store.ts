import { create } from "zustand";

// Staff single order view

type StaffOrderDetailState = {
  loading: boolean;
  error: string | null;
};

type StaffOrderDetailActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useStaffOrderDetailStore = create<StaffOrderDetailState & StaffOrderDetailActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
