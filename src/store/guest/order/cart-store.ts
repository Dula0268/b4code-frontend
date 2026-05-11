import { create } from "zustand";
import api from "@/lib/axios";

export type MenuItem = {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  priceLkr: number;
  imageUrl?: string;
  imageUrls?: string[];
  tag?: string;
  category: string;
  variants?: { id: string; label: string; price: number }[];
  modifiers?: { id: string; name: string; options: { label: string; price: number }[] }[];
};

type CartLine = {
  item: MenuItem;
  qty: number;
  selectedVariantId?: string;
  selectedModifiers?: { modifierId: string; optionLabel: string }[];
};

type CartState = {
  lines: Record<string, CartLine>;
  serviceChargeRate: number;
  taxRate: number;
  propertyId: number | null;
  isLoadingRates: boolean;
  add: (item: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  serviceCharge: () => number;
  tax: () => number;
  total: () => number;
  itemCount: () => number;
  toArray: () => CartLine[];
  fetchChargesFromApi: (propertyId: number) => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
  lines: {},
  serviceChargeRate: 0.1,
  taxRate: 0.05,
  propertyId: null,
  isLoadingRates: false,

  add: (item) =>
    set((state) => {
      const existing = state.lines[item.id];
      const qty = existing ? existing.qty + 1 : 1;
      return {
        lines: {
          ...state.lines,
          [item.id]: { item, qty },
        },
      };
    }),

  remove: (id) =>
    set((state) => {
      const copy = { ...state.lines };
      delete copy[id];
      return { lines: copy };
    }),

  setQty: (id, qty) =>
    set((state) => {
      const copy = { ...state.lines };
      if (!copy[id]) return state;

      if (qty <= 0) {
        delete copy[id];
        return { lines: copy };
      }

      copy[id] = { ...copy[id], qty };
      return { lines: copy };
    }),

  clear: () => set({ lines: {} }),

  subtotal: () =>
    Object.values(get().lines).reduce((sum, l) => sum + l.item.price * l.qty, 0),

  serviceCharge: () => Math.round(get().subtotal() * get().serviceChargeRate),

  tax: () => Math.round(get().subtotal() * get().taxRate),

  total: () => get().subtotal() + get().serviceCharge() + get().tax(),

  itemCount: () => Object.values(get().lines).reduce((sum, l) => sum + l.qty, 0),

  toArray: () => Object.values(get().lines),

  fetchChargesFromApi: async (propertyId: number) => {
    try {
      set({ isLoadingRates: true });
      const response = await api.get(`/properties/${propertyId}/charges`);
      const { serviceChargeRate = 0.1, taxRate = 0.05 } = response.data;
      set({
        serviceChargeRate: serviceChargeRate / 100, // Convert percentage to decimal
        taxRate: taxRate / 100,
        propertyId,
        isLoadingRates: false,
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch charges, using defaults";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.warn(errorMessage, error);
      set({ propertyId, isLoadingRates: false });
    }
  },
}));
