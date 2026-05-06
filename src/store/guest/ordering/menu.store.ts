import { create } from "zustand";
import api from "@/lib/axios";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
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

type GuestMenuState = {
  categories: MenuCategory[];
  loading: boolean;
  error: string | null;
  propertyId: number | null;
};

type GuestMenuActions = {
  fetchMenu: (propertyId: number) => Promise<void>;
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

  fetchMenu: async (propertyId: number) => {
    try {
      set({ loading: true, error: null, propertyId });
      const response = await api.get(`/menu-items/property/${propertyId}`);
      const items: MenuItem[] = response.data;

      // Group items by category
      const categoryMap = new Map<string, MenuItem[]>();
      items.forEach((item) => {
        const category = item.category || "Other";
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(item);
      });

      // Convert map to categories array
      const categories: MenuCategory[] = Array.from(categoryMap).map(([name, items], idx) => ({
        id: `cat-${idx}`,
        name,
        items: items.filter((item) => item.isAvailable),
      }));

      set({ categories, loading: false });
    } catch (error: unknown) {
      let errorMsg = "Failed to fetch menu";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        errorMsg = (error as any).response?.data?.message || errorMsg;
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
  reset: () => set({ loading: false, error: null, categories: [], propertyId: null }),
}));
