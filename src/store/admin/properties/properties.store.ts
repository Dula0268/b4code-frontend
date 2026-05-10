import { create } from "zustand";
import { PropertyApi, PropertyDto } from "@/api/admin/properties.api";

interface PropertiesState {
  // Data
  properties: PropertyDto[];
  propertiesTotalPages: number;
  propertiesTotalElements: number;
  selectedProperty: PropertyDto | null;

  // Loading states
  loading: boolean;
  actionLoading: boolean;
  error: string | null;

  // Actions
  fetchProperties: (params: { search?: string; status?: string; page?: number; size?: number }) => Promise<void>;
  getPropertyById: (id: number) => Promise<void>;
  approveProperty: (id: number) => Promise<void>;
  rejectProperty: (id: number, reason: string) => Promise<void>;
  markUnderReview: (id: number) => Promise<void>;
  setSelectedProperty: (prop: PropertyDto | null) => void;
}

// ─── Helper Function ─────────────────────────────────────────────────────────
const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Request failed";

export const useAdminPropertiesStore = create<PropertiesState>((set) => ({
  properties: [],
  propertiesTotalPages: 0,
  propertiesTotalElements: 0,
  selectedProperty: null,
  
  loading: false,
  actionLoading: false,
  error: null,

  fetchProperties: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await PropertyApi.getAllProperties(params);
      set({ 
        properties: data.content,
        propertiesTotalPages: data.totalPages,
        propertiesTotalElements: data.totalElements,
        loading: false 
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  getPropertyById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const data = await PropertyApi.getPropertyById(id);
      set({ selectedProperty: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  approveProperty: async (id: number) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await PropertyApi.approveProperty(id);
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? updated : p),
        selectedProperty: state.selectedProperty?.id === id ? updated : state.selectedProperty,
        actionLoading: false
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), actionLoading: false });
      throw err;
    }
  },

  rejectProperty: async (id: number, reason: string) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await PropertyApi.rejectProperty(id, reason);
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? updated : p),
        selectedProperty: state.selectedProperty?.id === id ? updated : state.selectedProperty,
        actionLoading: false
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), actionLoading: false });
      throw err;
    }
  },

  markUnderReview: async (id: number) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await PropertyApi.markUnderReview(id);
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? updated : p),
        selectedProperty: state.selectedProperty?.id === id ? updated : state.selectedProperty,
        actionLoading: false
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), actionLoading: false });
      throw err;
    }
  },
  
  setSelectedProperty: (prop) => set({ selectedProperty: prop }),
}));
