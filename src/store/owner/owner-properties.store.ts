import { create } from "zustand";
import { ownerPropertyApi, ListPropertiesParams } from "@/api/owner/property.api";
import { formatApiError } from "@/lib/error-formatter";
import type { OwnerProperty, OwnerPropertyUpdateRequest } from "@/models/owner";

interface OwnerPropertiesState {
  // ── Data ────────────────────────────────────────────────────────────────
  properties: OwnerProperty[];
  activeProperty: OwnerProperty | null;
  totalPages: number;
  totalItems: number;
  currentPage: number;

  // ── UI State ─────────────────────────────────────────────────────────────
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  fetchProperties: (params?: ListPropertiesParams) => Promise<void>;
  fetchProperty: (id: number) => Promise<void>;
  updateProperty: (id: number, data: OwnerPropertyUpdateRequest) => Promise<boolean>;
  deleteProperty: (id: number) => Promise<boolean>;
  toggleStatus: (id: number) => Promise<boolean>;
  resubmitProperty: (id: number) => Promise<boolean>;
  setActiveProperty: (property: OwnerProperty | null) => void;
  clearError: () => void;
}

export const useOwnerPropertiesStore = create<OwnerPropertiesState>((set, get) => ({
  properties: [],
  activeProperty: null,
  totalPages: 0,
  totalItems: 0,
  currentPage: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchProperties: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ownerPropertyApi.listProperties(params);
      set({
        properties: data.properties ?? [],
        totalPages: data.totalPages ?? 0,
        totalItems: data.totalItems ?? 0,
        currentPage: data.currentPage ?? 0,
      });
    } catch (err) {
      set({ error: formatApiError(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProperty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ownerPropertyApi.getProperty(id);
      set({ activeProperty: data });
    } catch (err) {
      set({ error: formatApiError(err) });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProperty: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await ownerPropertyApi.updateProperty(id, data);
      set((state) => ({
        activeProperty: updated,
        properties: state.properties.map((p) => (p.id === id ? updated : p)),
      }));
      return true;
    } catch (err) {
      set({ error: formatApiError(err) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteProperty: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await ownerPropertyApi.deleteProperty(id);
      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id),
        activeProperty: state.activeProperty?.id === id ? null : state.activeProperty,
      }));
      return true;
    } catch (err) {
      set({ error: formatApiError(err) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  toggleStatus: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await ownerPropertyApi.toggleStatus(id);
      set((state) => ({
        activeProperty: state.activeProperty?.id === id ? updated : state.activeProperty,
        properties: state.properties.map((p) => (p.id === id ? updated : p)),
      }));
      return true;
    } catch (err) {
      set({ error: formatApiError(err) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  resubmitProperty: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await ownerPropertyApi.resubmitProperty(id);
      set((state) => ({
        activeProperty: state.activeProperty?.id === id ? updated : state.activeProperty,
        properties: state.properties.map((p) => (p.id === id ? updated : p)),
      }));
      return true;
    } catch (err) {
      set({ error: formatApiError(err) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  setActiveProperty: (property) => set({ activeProperty: property }),
  clearError: () => set({ error: null }),
}));
