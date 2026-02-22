import { create } from "zustand";

export type MenuItem = {
  id: string;
  title: string;
  description: string;
  priceLkr: number;
  imageUrl?: string;
  tag?: "POPULAR" | "VEG" | "SPICY" | "NON_VEG";
  category: "All Items" | "Starters" | "Mains" | "Desserts" | "Beverages";
};

type CartLine = {
  item: MenuItem;
  qty: number;
};

type CartState = {
  lines: Record<string, CartLine>;
  serviceChargeRate: number; // 10%
  taxRate: number; // 5%
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
};

export const useCartStore = create<CartState>((set, get) => ({
  lines: {},
  serviceChargeRate: 0.1,
  taxRate: 0.05,

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
    Object.values(get().lines).reduce((sum, l) => sum + l.item.priceLkr * l.qty, 0),

  serviceCharge: () => Math.round(get().subtotal() * get().serviceChargeRate),

  tax: () => Math.round(get().subtotal() * get().taxRate),

  total: () => get().subtotal() + get().serviceCharge() + get().tax(),

  itemCount: () => Object.values(get().lines).reduce((sum, l) => sum + l.qty, 0),

  toArray: () => Object.values(get().lines),
}));
