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
  avgRating?: number;
  reviewCount?: number;
};

type CartLine = {
  item: MenuItem;
  qty: number;
  selectedVariantId?: string;
  selectedModifiers?: { modifierId: string; optionLabel: string }[];
};

/**
 * Resolves the correct unit price for a cart line, taking the selected
 * variant (overrides base price) and selected modifiers (additive) into
 * account. This is the single source of truth for line pricing — use it
 * anywhere a line's price is displayed or sent to the backend instead of
 * duplicating this logic or falling back to `item.price`/`item.priceLkr`.
 */
export function getLineUnitPrice(line: {
  item: MenuItem;
  selectedVariantId?: string;
  selectedModifiers?: { modifierId: string; optionLabel: string }[];
}): number {
  let price = line.item.price;

  // Variant price overrides base price
  if (line.selectedVariantId && line.item.variants) {
    const variant = line.item.variants.find((v) => v.id === line.selectedVariantId);
    if (variant) {
      price = variant.price;
    }
  }

  // Add modifier option prices
  if (line.selectedModifiers && line.item.modifiers) {
    line.selectedModifiers.forEach((sm) => {
      const modifier = line.item.modifiers?.find((m) => m.id === sm.modifierId);
      if (modifier) {
        const option = modifier.options.find((o) => o.label === sm.optionLabel);
        if (option) {
          price += option.price;
        }
      }
    });
  }

  return price;
}

/** Matches the backend's BigDecimal HALF_UP 2dp rounding on every money component. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

type CartState = {
  lines: Record<string, CartLine>;
  serviceChargeRate: number;
  taxRate: number;
  propertyId: number | null;
  isLoadingRates: boolean;
  add: (
    item: MenuItem,
    qty?: number,
    selectedVariantId?: string,
    selectedModifiers?: { modifierId: string; optionLabel: string }[]
  ) => void;
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

function getLineKey(
  item: MenuItem,
  selectedVariantId?: string,
  selectedModifiers?: { modifierId: string; optionLabel: string }[]
): string {
  let key = item.id;
  if (selectedVariantId) {
    key += `-${selectedVariantId}`;
  }
  if (selectedModifiers && selectedModifiers.length > 0) {
    const sorted = [...selectedModifiers].sort(
      (a, b) => a.modifierId.localeCompare(b.modifierId) || a.optionLabel.localeCompare(b.optionLabel)
    );
    sorted.forEach((sm) => {
      key += `-${sm.modifierId}:${sm.optionLabel}`;
    });
  }
  return key;
}

import { persist } from "zustand/middleware";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  lines: {},
  serviceChargeRate: 0.1,
  taxRate: 0.05,
  propertyId: null,
  isLoadingRates: false,

  add: (item, qty = 1, selectedVariantId, selectedModifiers) =>
    set((state) => {
      const lineKey = getLineKey(item, selectedVariantId, selectedModifiers);
      const existing = state.lines[lineKey];
      const newQty = existing ? existing.qty + qty : qty;
      return {
        lines: {
          ...state.lines,
          [lineKey]: { item, qty: newQty, selectedVariantId, selectedModifiers },
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

  // ─────────────────────────────────────────────────────────────────────────
  // PRE-ORDER ESTIMATE ONLY.
  //
  // These selectors exist to preview a cart that has no order behind it yet.
  // They deliberately mirror GuestOrderService#applyPricing exactly — same
  // rates (fetched from /properties/public/{id}/charges), same per-component
  // 2dp rounding, same "total = subtotal + serviceCharge + tax - discount".
  // The moment an order is created, the server's persisted breakdown is the
  // only thing that may be displayed; do NOT use these to render a placed
  // order, and do NOT change the formula here without changing applyPricing.
  // ─────────────────────────────────────────────────────────────────────────
  subtotal: () =>
    round2(Object.values(get().lines).reduce((sum, l) => sum + getLineUnitPrice(l) * l.qty, 0)),

  serviceCharge: () => round2(get().subtotal() * get().serviceChargeRate),

  // Tax is applied server-side at the property's configured rate. It was
  // previously hardcoded to 0 here, which is exactly why the guest saw a
  // smaller total than the one the server persisted and staff displayed.
  tax: () => round2(get().subtotal() * get().taxRate),

  total: () => round2(get().subtotal() + get().serviceCharge() + get().tax()),

  itemCount: () => Object.values(get().lines).reduce((sum, l) => sum + l.qty, 0),

  toArray: () => Object.values(get().lines),

  fetchChargesFromApi: async (propertyId: number) => {
    try {
      set({ isLoadingRates: true });
      const response = await api.get(`/properties/public/${propertyId}/charges`);
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
}),
    {
      name: "cart-storage",
    }
  )
);
