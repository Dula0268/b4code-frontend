import { create } from "zustand";

// User management

type AdminUsersState = {
  loading: boolean;
  error: string | null;
};

type AdminUsersActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAdminUsersStore = create<AdminUsersState & AdminUsersActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
