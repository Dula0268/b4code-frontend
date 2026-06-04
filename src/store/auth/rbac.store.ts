import { create } from "zustand";
import { SettingsApi, type RolePermissionsDto } from "@/api/admin/settings.api";

// Role-based access control state

type RBACState = {
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  permissionsData: Record<string, RolePermissionsDto>;
};

type RBACActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
  fetchRolePermissions: (role: string) => Promise<void>;
  updateRolePermissions: (role: string, updates: Record<string, boolean>) => Promise<void>;
};

export const useRBACStore = create<RBACState & RBACActions>((set) => ({
  loading: false,
  actionLoading: false,
  error: null,
  permissionsData: {},

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, actionLoading: false, error: null, permissionsData: {} }),

  fetchRolePermissions: async (role: string) => {
    set({ loading: true, error: null });
    try {
      const data = await SettingsApi.getRolePermissions(role);
      set((state) => ({
        permissionsData: {
          ...state.permissionsData,
          [role]: data,
        },
        loading: false,
      }));
    } catch (err: unknown) {
      console.error("Failed to fetch role permissions:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch permissions";
      set({ error: message, loading: false });
    }
  },

  updateRolePermissions: async (role: string, updates: Record<string, boolean>) => {
    set({ actionLoading: true, error: null });
    try {
      const data = await SettingsApi.updateRolePermissions(role, updates);
      set((state) => ({
        permissionsData: {
          ...state.permissionsData,
          [role]: data,
        },
        actionLoading: false,
      }));
    } catch (err: unknown) {
      console.error("Failed to update role permissions:", err);
      const message = err instanceof Error ? err.message : "Failed to update permissions";
      set({ error: message, actionLoading: false });
      throw err; // Re-throw so UI can handle failure
    }
  },
}));
