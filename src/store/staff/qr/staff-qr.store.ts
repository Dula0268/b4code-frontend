import { create } from "zustand";

// QR management state

type StaffQRState = {
  loading: boolean;
  error: string | null;
};

type StaffQRActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useStaffQRStore = create<StaffQRState & StaffQRActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
