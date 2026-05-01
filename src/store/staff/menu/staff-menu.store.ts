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

// ─── Store ─────────────────────────────────────────────────────────────────────

interface StaffMenuState {
  menus: Menu[];
  successMsg: string | null;
  errorMsg: string | null;
  isLoading: boolean;
}

interface StaffMenuActions {
  fetchMenus: (propertyId: number) => Promise<void>;
  fetchMenuItems: (propertyId: number) => Promise<void>;
  getMenu: (id: string) => Menu | undefined;
  addMenu: (menu: Omit<Menu, "id" | "itemCount" | "priceRange" | "items">, items?: Omit<MenuItem, "id">[]) => string;
  updateMenu: (id: string, data: Partial<Menu>) => void;
  deleteMenu: (id: string) => void;
  toggleVisibility: (id: string) => void;
  addItem: (menuId: string, item: Omit<MenuItem, "id">) => void;
  updateItem: (menuId: string, itemId: string, data: Partial<MenuItem>) => void;
  deleteItem: (menuId: string, itemId: string) => void;
  toggleItemStatus: (menuId: string, itemId: string) => void;
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

let nextMenuId = 5;
let nextItemId = 100;

// Start with empty array - menus will be fetched from API
const MOCK_MENUS: Menu[] = [];

export const useStaffMenuStore = create<StaffMenuState & StaffMenuActions>((set, get) => ({
  menus: MOCK_MENUS,
  successMsg: null,
  errorMsg: null,
  isLoading: false,

  fetchMenus: async (propertyId: number) => {
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.get(`/menu-items/property/${propertyId}`);
      const menuItems = response.data;
      
      // Convert backend menu items to frontend format
      const menuItemMap = menuItems.reduce((acc: Record<string, MenuItem[]>, item: any) => {
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

      // Create frontend menus from grouped items
      const menus: Menu[] = Object.entries(menuItemMap).map(([category, items], idx) => ({
        id: String(idx),
        name: category,
        description: `${category} items`,
        type: category,
        status: "active",
        isVisible: true,
        priceRange: calcPriceRange(items as MenuItem[]),
        itemCount: (items as MenuItem[]).length,
        items: items as MenuItem[],
      }));

      set({ menus, isLoading: false });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to fetch menus";
      set({ errorMsg, isLoading: false });
      console.error("Failed to fetch menus:", error);
    }
  },

  fetchMenuItems: async (propertyId: number) => {
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.get(`/menu-items/property/${propertyId}`);
      const backendItems = response.data;
      
      set((state) => ({
        menus: state.menus.map((menu) => ({
          ...menu,
          items: backendItems
            .filter((item: any) => item.category === menu.type || menu.type === item.category)
            .map((item: any) => ({
              id: String(item.id),
              name: item.name,
              price: item.price,
              description: item.description || "",
              category: item.category || "General",
              status: item.isAvailable ? "active" : "draft",
              availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
              variants: [],
              modifiers: [],
            })),
        })),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to fetch menu items";
      set({ errorMsg, isLoading: false });
      console.error("Failed to fetch menu items:", error);
    }
  },

  getMenu: (id) => get().menus.find((m) => m.id === id),

  addMenu: (data, initialItems) => {
    const id = String(nextMenuId++);
    const items: MenuItem[] = (initialItems ?? []).map((it) => ({ ...it, id: String(nextItemId++) }));
    const menu: Menu = { ...data, id, itemCount: items.length, priceRange: calcPriceRange(items), items };
    set((s) => ({ menus: [menu, ...s.menus] }));
    return id;
  },

  updateMenu: (id, data) =>
    set((s) => ({
      menus: s.menus.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),

  deleteMenu: (id) =>
    set((s) => ({ menus: s.menus.filter((m) => m.id !== id) })),

  toggleVisibility: (id) =>
    set((s) => ({
      menus: s.menus.map((m) =>
        m.id === id ? { ...m, isVisible: !m.isVisible, status: !m.isVisible ? "active" : "draft" } : m
      ),
    })),

  addItem: (menuId, item) => {
    const id = String(nextItemId++);
    set((s) => ({
      menus: s.menus.map((m) => {
        if (m.id !== menuId) return m;
        const items = [...m.items, { ...item, id }];
        return { ...m, items, itemCount: items.length, priceRange: calcPriceRange(items) };
      }),
    }));
  },

  updateItem: (menuId, itemId, data) =>
    set((s) => ({
      menus: s.menus.map((m) => {
        if (m.id !== menuId) return m;
        const items = m.items.map((i) => (i.id === itemId ? { ...i, ...data } : i));
        return { ...m, items, itemCount: items.length, priceRange: calcPriceRange(items) };
      }),
    })),

  deleteItem: (menuId, itemId) =>
    set((s) => ({
      menus: s.menus.map((m) => {
        if (m.id !== menuId) return m;
        const items = m.items.filter((i) => i.id !== itemId);
        return { ...m, items, itemCount: items.length, priceRange: calcPriceRange(items) };
      }),
    })),

  toggleItemStatus: (menuId, itemId) =>
    set((s) => ({
      menus: s.menus.map((m) => {
        if (m.id !== menuId) return m;
        const items = m.items.map((i) =>
          i.id === itemId ? { ...i, status: i.status === "active" ? ("draft" as const) : ("active" as const) } : i
        );
        return { ...m, items };
      }),
    })),

  setSuccess: (msg) => set({ successMsg: msg }),
  setError: (msg) => set({ errorMsg: msg }),
}));
