import { create } from "zustand";

// Audit logs

type AdminAuditState = {
  loading: boolean;
  error: string | null;
};

type AdminAuditActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useAdminAuditStore = create<AdminAuditState & AdminAuditActions>((set) => ({
  loading: false,
  error: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null }),
}));
