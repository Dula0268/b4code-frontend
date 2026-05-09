import { create } from "zustand";
import api from "@/lib/axios";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type MenuStatus = "active" | "draft";

export interface AvailabilityWindow {
  startTime: string;
  endTime: string;
  allDays: boolean;
  days: string[];
}

export interface Modifier {
  id: string;
  name: string;
  options: { label: string; price: number }[];
}

export interface Variant {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  status: MenuStatus;
  calories?: number;
  tag?: string;
  availability: AvailabilityWindow;
  variants: Variant[];
  modifiers: Modifier[];
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  type: string;
  status: MenuStatus;
  isVisible: boolean;
  isNew?: boolean;
  priceRange: string;
  itemCount: number;
  items: MenuItem[];
}

export interface BackendMenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  isAvailable: boolean;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

interface StaffMenuState {
  menus: Menu[];
  propertyId: number | null;
  successMsg: string | null;
  errorMsg: string | null;
  isLoading: boolean;
}

interface StaffMenuActions {
  fetchMenus: (propertyId: number) => Promise<void>;
  fetchMenuItems: (propertyId: number) => Promise<void>;
  getMenu: (id: string) => Menu | undefined;
  addMenu: (menu: Omit<Menu, "id" | "itemCount" | "priceRange" | "items">, items?: Omit<MenuItem, "id">[]) => Promise<string>;
  updateMenu: (id: string, data: Partial<Menu>) => void;
  deleteMenu: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  addItem: (menuId: string, item: Omit<MenuItem, "id">) => Promise<void>;
  updateItem: (menuId: string, itemId: string, data: Partial<MenuItem>) => Promise<void>;
  deleteItem: (menuId: string, itemId: string) => Promise<void>;
  toggleItemStatus: (menuId: string, itemId: string) => Promise<void>;
  setSuccess: (msg: string | null) => void;
  setError: (msg: string | null) => void;
}

function calcPriceRange(items: MenuItem[]): string {
  if (items.length === 0) return "—";
  const prices = items.map((i) => i.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `LKR ${min.toLocaleString()}` : `LKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response && typeof response.data === "object" && response.data !== null) {
      const data = response.data as Record<string, unknown>;
      if (typeof data.message === "string") {
        return data.message;
      }
    }
  }
  return fallback;
}


export const useStaffMenuStore = create<StaffMenuState & StaffMenuActions>((set, get) => ({
  menus: [],
  propertyId: null,
  successMsg: null,
  errorMsg: null,
  isLoading: false,

  fetchMenus: async (propertyId: number) => {
    try {
      set({ isLoading: true, errorMsg: null, propertyId });
      const response = await api.get(`/menu-items/property/${propertyId}`);
      const menuItems = response.data;

      const menuItemMap = (menuItems as BackendMenuItem[]).reduce((acc: Record<string, MenuItem[]>, item) => {
        const menuKey = item.category || "General";
        if (!acc[menuKey]) acc[menuKey] = [];
        acc[menuKey].push({
          id: String(item.id),
          name: item.name,
          price: item.price,
          description: item.description || "",
          category: item.category || "General",
          status: item.isAvailable ? "active" : "draft",
          availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
          variants: [],
          modifiers: [],
        });
        return acc;
      }, {});

      const menus: Menu[] = Object.entries(menuItemMap).map(([category, items]) => ({
        id: category,
        name: category,
        description: `${category} items`,
        type: category,
        status: "active" as const,
        isVisible: true,
        priceRange: calcPriceRange(items),
        itemCount: items.length,
        items,
      }));

      set({ menus, isLoading: false });
    } catch (error: unknown) {
      const errorMsg = extractApiErrorMessage(error, "Failed to fetch menus");
      set({ errorMsg, isLoading: false });
    }
  },

  fetchMenuItems: async (propertyId: number) => {
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.get(`/menu-items/property/${propertyId}`);
      const backendItems = response.data as BackendMenuItem[];

      set((state) => ({
        menus: state.menus.map((menu) => {
          const items: MenuItem[] = backendItems
            .filter((item) => (item.category || "General") === menu.type)
            .map((item) => ({
              id: String(item.id),
              name: item.name,
              price: item.price,
              description: item.description || "",
              category: item.category || "General",
              status: item.isAvailable ? ("active" as const) : ("draft" as const),
              availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
              variants: [],
              modifiers: [],
            }));
          return { ...menu, items, itemCount: items.length, priceRange: calcPriceRange(items) };
        }),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMsg = extractApiErrorMessage(error, "Failed to fetch menu items");
      set({ errorMsg, isLoading: false });
    }
  },

  getMenu: (id) => get().menus.find((m) => m.id === id),

  addMenu: async (data, initialItems) => {
    const propertyId = get().propertyId;
    if (!propertyId) {
      set({ errorMsg: "No property selected" });
      return "";
    }
    try {
      set({ isLoading: true, errorMsg: null });
      const category = data.name;

      for (const item of initialItems ?? []) {
        await api.post("/menu-items", {
          propertyId,
          name: item.name,
          description: item.description,
          price: item.price,
          category,
          isAvailable: item.status === "active",
        });
      }

      await get().fetchMenus(propertyId);
      set({ isLoading: false });
      return category;
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to create menu"), isLoading: false });
      return "";
    }
  },

  updateMenu: (id, data) =>
    set((s) => ({
      menus: s.menus.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),

  deleteMenu: async (id) => {
    const propertyId = get().propertyId;
    const menu = get().menus.find((m) => m.id === id);
    if (!propertyId || !menu) return;
    try {
      set({ isLoading: true, errorMsg: null });
      await api.delete(`/menu-items/property/${propertyId}/category/${encodeURIComponent(menu.name)}`);
      set((s) => ({ menus: s.menus.filter((m) => m.id !== id), isLoading: false }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to delete menu"), isLoading: false });
    }
  },

  toggleVisibility: async (id) => {
    const menu = get().menus.find((m) => m.id === id);
    if (!menu) return;
    try {
      const newAvailable = !menu.isVisible;
      await Promise.all(
        menu.items.map((item) =>
          api.patch(`/menu-items/${item.id}/toggle`)
        )
      );
      set((s) => ({
        menus: s.menus.map((m) =>
          m.id === id
            ? {
                ...m,
                isVisible: newAvailable,
                status: newAvailable ? ("active" as const) : ("draft" as const),
                items: m.items.map((i) => ({ ...i, status: newAvailable ? ("active" as const) : ("draft" as const) })),
              }
            : m
        ),
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to toggle visibility") });
    }
  },

  addItem: async (menuId, item) => {
    const propertyId = get().propertyId;
    const menu = get().menus.find((m) => m.id === menuId);
    if (!propertyId || !menu) {
      set({ errorMsg: "No property or menu selected" });
      return;
    }
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.post("/menu-items", {
        propertyId,
        name: item.name,
        description: item.description,
        price: item.price,
        category: menu.name,
        isAvailable: item.status === "active",
      });
      const saved = response.data as BackendMenuItem;
      const newItem: MenuItem = {
        ...item,
        id: String(saved.id),
      };
      set((s) => ({
        menus: s.menus.map((m) => {
          if (m.id !== menuId) return m;
          const items = [...m.items, newItem];
          return { ...m, items, itemCount: items.length, priceRange: calcPriceRange(items) };
        }),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to add item"), isLoading: false });
    }
  },

  updateItem: async (menuId, itemId, data) => {
    try {
      set({ isLoading: true, errorMsg: null });
      await api.put(`/menu-items/${itemId}`, {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        isAvailable: data.status === "active",
      });
      set((s) => ({
        menus: s.menus.map((m) => {
          if (m.id !== menuId) return m;
          const items = m.items.map((i) => (i.id === itemId ? { ...i, ...data } : i));
          return { ...m, items, itemCount: items.length, priceRange: calcPriceRange(items) };
        }),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to update item"), isLoading: false });
    }
  },

  deleteItem: async (menuId, itemId) => {
    try {
      set({ isLoading: true, errorMsg: null });
      await api.delete(`/menu-items/${itemId}`);
      set((s) => ({
        menus: s.menus.map((m) => {
          if (m.id !== menuId) return m;
          const items = m.items.filter((i) => i.id !== itemId);
          return { ...m, items, itemCount: items.length, priceRange: calcPriceRange(items) };
        }),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to delete item"), isLoading: false });
    }
  },

  toggleItemStatus: async (menuId, itemId) => {
    try {
      await api.patch(`/menu-items/${itemId}/toggle`);
      set((s) => ({
        menus: s.menus.map((m) => {
          if (m.id !== menuId) return m;
          const items = m.items.map((i) =>
            i.id === itemId ? { ...i, status: i.status === "active" ? ("draft" as const) : ("active" as const) } : i
          );
          return { ...m, items };
        }),
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to toggle item status") });
    }
  },

  setSuccess: (msg) => set({ successMsg: msg }),
  setError: (msg) => set({ errorMsg: msg }),
}));
