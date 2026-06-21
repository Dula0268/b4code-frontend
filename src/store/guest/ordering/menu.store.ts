import { create } from "zustand";
import api from "@/lib/axios";

export interface MenuItem {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  priceLkr: number;
  imageUrl?: string;
  imageUrls?: string[];
  category: string;
  categoryName?: string; // From normalized backend DTO
  isAvailable: boolean;
  tag?: string;
  variants?: { id: string; label: string; price: number }[];
  modifiers?: { id: string; name: string; options: { label: string; price: number }[] }[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

type ApiVariant = {
  id?: string | number;
  label?: string;
  price?: number;
};

type ApiModifierOption = {
  label?: string;
  price?: number;
};

type ApiModifier = {
  id?: string | number;
  name?: string;
  options?: ApiModifierOption[];
};

type ApiMenuItem = {
  id?: string | number;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  imageUrls?: string[];
  category?: string;
  categoryName?: string;
  isAvailable?: boolean;
  tag?: string;
  variants?: ApiVariant[];
  modifiers?: ApiModifier[];
};

type GuestMenuState = {
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
  propertyId: number | null;
  roomId: number | null;
};

type GuestMenuActions = {
  fetchMenu: (propertyId: number, roomId?: number) => Promise<void>;
  getItemById: (id: string) => MenuItem | undefined;
  getCategoryItems: (categoryName: string) => MenuItem[];
  searchItems: (query: string) => MenuItem[];
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useGuestMenuStore = create<GuestMenuState & GuestMenuActions>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  propertyId: null,
  roomId: null,

  fetchMenu: async (propertyId: number, roomId?: number) => {
    try {
      set({ loading: true, error: null, propertyId, roomId: roomId || null });
      
      let url = `/menu-items/property/${propertyId}`;
      if (roomId) {
        url += `?roomId=${roomId}`;
      }
      
      const response = await api.get(url);
      const rawItems: any[] = response.data;

      // Map backend fields to frontend MenuItem shape
      const items: MenuItem[] = rawItems.map((item) => ({
        id: String(item.id),
        name: item.name || "",
        title: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        priceLkr: item.price || 0,
        imageUrl: item.imageUrl,
        // Use categoryName (from normalized schema) as the category for tab grouping
        category: item.categoryName || item.category || "Other",
        isAvailable: item.isAvailable !== false,
        tag: item.tag,
        imageUrls: item.imageUrls || [],
        variants: item.variants?.map((v, idx: number) => ({
          id: String(v.id ?? `var-${idx}`),
          label: v.label || "",
          price: v.price || 0,
        })) || [],
        modifiers: item.modifiers?.map((m, mIdx: number) => ({
          id: String(m.id ?? `mod-${mIdx}`),
          name: m.name || "",
          options: m.options?.map((o) => ({
            label: o.label || "",
            price: o.price || 0,
          })) || [],
        })) || [],
      }));

      // Group items by categoryName (dynamic categories created by staff)
      const categoryMap = new Map<string, MenuItem[]>();
      items.forEach((item) => {
        const category = item.category || "Other";
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(item);
      });

      // Convert map to categories array
      const categories: MenuCategory[] = Array.from(categoryMap).map(([name, catItems], idx) => ({
        id: `cat-${idx}`,
        name,
        items: catItems.filter((item) => item.isAvailable),
      }));

      set({ categories, loading: false });

    } catch (error: unknown) {
      let errorMsg = "Failed to fetch menu";
      if (typeof error === "object" && error !== null) {
        const response = (error as { response?: { data?: unknown } }).response;
        if (response && typeof response.data === "object" && response.data !== null) {
          const data = response.data as Record<string, unknown>;
          if (typeof data.message === "string") {
            errorMsg = data.message;
          }
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      set({ error: errorMsg, loading: false });
      console.error("Failed to fetch menu:", error);
    }
  },

  getItemById: (id: string) => {
    const categories = get().categories;
    for (const cat of categories) {
      const item = cat.items.find((i) => i.id === id);
      if (item) return item;
    }
    return undefined;
  },

  getCategoryItems: (categoryName: string) => {
    const categories = get().categories;
    const category = categories.find((c) => c.name === categoryName);
    return category ? category.items : [];
  },

  searchItems: (query: string) => {
    const q = query.toLowerCase();
    const categories = get().categories;
    const results: MenuItem[] = [];
    for (const cat of categories) {
      results.push(
        ...cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        )
      );
    }
    return results;
  },

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  reset: () => set({ loading: false, error: null, categories: [], propertyId: null, roomId: null }),
}));
