import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  categoryId: string;
  categoryName: string;
  menuId: string;
  menuName: string;
  status: MenuStatus;
  tag?: string;
  calories?: number;
  imageUrls: string[];
  availability: AvailabilityWindow;
  variants: Variant[];
  modifiers: Modifier[];
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  status: MenuStatus;
  isVisible: boolean;
  isNew?: boolean;
  priceRange: string;
  itemCount: number;
  items: MenuItem[];
}

export interface MenuCategory {
  id: string;
  name: string;
  propertyId: number;
}

export interface BackendMenuItem {
  id: number;
  propertyId: number;
  menuId?: number;
  menuName?: string;
  categoryId?: number;
  categoryName?: string;
  name: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  imageUrls?: string[];
  imageUrl?: string;
  tag?: string;
  calories?: number;
  variants?: Variant[];
  modifiers?: Modifier[];
}

export interface BackendMenu {
  id: number;
  propertyId: number;
  name: string;
  description?: string;
  status: string;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

interface StaffMenuState {
  menus: Menu[];
  categories: MenuCategory[];
  propertyId: number | null;
  successMsg: string | null;
  errorMsg: string | null;
  isLoading: boolean;
  categoriesLoading: boolean;
  serviceChargeRate: number;
}

interface StaffMenuActions {
  fetchMenus: (propertyId: number) => Promise<void>;
  fetchCategories: (propertyId: number) => Promise<void>;
  getMenu: (id: string) => Menu | undefined;
  addMenu: (data: { name: string; description: string; status: MenuStatus }, propId?: number) => Promise<string>;
  updateMenu: (id: string, data: Partial<{ name: string; description: string; status: MenuStatus }>) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  addCategory: (name: string, propId?: number) => Promise<MenuCategory | null>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addItem: (menuId: string, item: {
    name: string; price: number; description: string;
    categoryId: string; status: MenuStatus; tag?: string;
    calories?: number; imageUrls: string[];
    availability: AvailabilityWindow; variants: Variant[]; modifiers: Modifier[];
  }, propId?: number) => Promise<void>;
  updateItem: (menuId: string, itemId: string, data: Partial<MenuItem>) => Promise<void>;
  deleteItem: (menuId: string, itemId: string) => Promise<void>;
  toggleItemStatus: (menuId: string, itemId: string) => Promise<void>;
  setSuccess: (msg: string | null) => void;
  setError: (msg: string | null) => void;
  fetchServiceCharge: (propertyId: number) => Promise<void>;
  updateServiceCharge: (propertyId: number, rate: number) => Promise<void>;
}

function calcPriceRange(items: MenuItem[]): string {
  if (items.length === 0) return "—";
  const prices = items.map((i) => i.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `LKR ${min.toLocaleString()}` : `LKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

function sanitizeErrorMessage(message: string, context: string): string {
  const msg = message.toLowerCase();
  
  if (
    msg.includes("constraint") ||
    msg.includes("duplicate") ||
    msg.includes("foreign key") ||
    msg.includes("sql") ||
    msg.includes("hibernate") ||
    msg.includes("database") ||
    msg.includes("persistence") ||
    msg.includes("query") ||
    msg.includes("nullpointer") ||
    msg.includes("npe")
  ) {
    return "We encountered a temporary database update issue. Please refresh and try again.";
  }
  
  if (
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("refused") ||
    msg.includes("500") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504") ||
    msg.includes("connect") ||
    msg.includes("socket") ||
    msg.includes("http") ||
    msg.includes("request failed")
  ) {
    return "Offline: Viewing offline data. Changes will sync when connection is restored.";
  }
  
  if (
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    msg.includes("401") ||
    msg.includes("403") ||
    msg.includes("token") ||
    msg.includes("jwt")
  ) {
    return "Access issue. Please verify your credentials or sign in again.";
  }
  
  if (
    msg.includes("exception") ||
    msg.includes("failed with status") ||
    msg.includes("internal server error")
  ) {
    return `We couldn't complete the request: ${context}. Please try again.`;
  }
  
  return message;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  let message = fallback;
  
  if (error instanceof Error) {
    message = error.message;
  }
  
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response && typeof response.data === "object" && response.data !== null) {
      const data = response.data as Record<string, unknown>;
      if (typeof data.message === "string") {
        message = data.message;
      }
    }
  }
  
  return sanitizeErrorMessage(message, fallback);
}

export const useStaffMenuStore = create<StaffMenuState & StaffMenuActions>()(
  persist(
    (set, get) => ({
  menus: [],
  categories: [],
  propertyId: null,
  successMsg: null,
  errorMsg: null,
  isLoading: false,
  categoriesLoading: false,
  serviceChargeRate: 10,

  // ─── Fetch Menus (from real /api/menus) ──────────────────────────────────────
  fetchMenus: async (propertyId: number) => {
    try {
      set({ isLoading: true, errorMsg: null, propertyId });

      // Fetch menus and items in parallel
      const [menusRes, itemsRes] = await Promise.all([
        api.get(`/menus/property/${propertyId}`),
        api.get(`/menu-items/property/${propertyId}`),
      ]);

      const backendMenus = menusRes.data as BackendMenu[];
      const backendItems = itemsRes.data as BackendMenuItem[];

      // Build menus with their items
      const menus: Menu[] = backendMenus.map((bm) => {
        const menuItems: MenuItem[] = backendItems
          .filter((bi) => bi.menuId === bm.id)
          .map((bi) => ({
            id: String(bi.id),
            name: bi.name,
            price: bi.price,
            description: bi.description || "",
            categoryId: bi.categoryId ? String(bi.categoryId) : "",
            categoryName: bi.categoryName || "",
            menuId: String(bm.id),
            menuName: bm.name,
            status: bi.isAvailable ? "active" as const : "draft" as const,
            imageUrls: bi.imageUrls || (bi.imageUrl ? [bi.imageUrl] : []),
            tag: bi.tag,
            calories: bi.calories,
            availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
            variants: bi.variants || [],
            modifiers: bi.modifiers || [],
          }));

        return {
          id: String(bm.id),
          name: bm.name,
          description: bm.description || "",
          status: (bm.status === "active" ? "active" : "draft") as MenuStatus,
          isVisible: bm.status === "active",
          priceRange: calcPriceRange(menuItems),
          itemCount: menuItems.length,
          items: menuItems,
        };
      });

      set({ menus, isLoading: false });
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to fetch menus"), isLoading: false });
    }
  },

  // ─── Fetch Categories ─────────────────────────────────────────────────────────
  fetchCategories: async (propertyId: number) => {
    try {
      set({ categoriesLoading: true });
      const response = await api.get(`/menu-categories/property/${propertyId}`);
      const cats = (response.data as { id: number; propertyId: number; name: string }[]).map((c) => ({
        id: String(c.id),
        name: c.name,
        propertyId: c.propertyId,
      }));
      set({ categories: cats, categoriesLoading: false });
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to fetch categories"), categoriesLoading: false });
    }
  },

  getMenu: (id) => get().menus.find((m) => m.id === id),

  // ─── Add Menu ────────────────────────────────────────────────────────────────
  addMenu: async (data, propId) => {
    const propertyId = propId || get().propertyId;
    if (!propertyId) {
      set({ errorMsg: "No property selected. Please try re-logging." });
      return "";
    }
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.post("/menus", {
        propertyId,
        name: data.name,
        description: data.description,
        status: data.status || "active",
      });
      const created = response.data as BackendMenu;
      const newMenu: Menu = {
        id: String(created.id),
        name: created.name,
        description: created.description || "",
        status: (created.status === "active" ? "active" : "draft") as MenuStatus,
        isVisible: created.status === "active",
        isNew: true,
        priceRange: "—",
        itemCount: 0,
        items: [],
      };
      set((s) => ({ menus: [newMenu, ...s.menus], isLoading: false }));
      return String(created.id);
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to create menu"), isLoading: false });
      return "";
    }
  },

  // ─── Update Menu ─────────────────────────────────────────────────────────────
  updateMenu: async (id, data) => {
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.put(`/menus/${id}`, data);
      const updated = response.data as BackendMenu;
      set((s) => ({
        menus: s.menus.map((m) =>
          m.id === id
            ? { ...m, name: updated.name, description: updated.description || m.description, status: updated.status as MenuStatus, isVisible: updated.status === "active" }
            : m
        ),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to update menu"), isLoading: false });
    }
  },

  // ─── Delete Menu ─────────────────────────────────────────────────────────────
  deleteMenu: async (id) => {
    try {
      set({ isLoading: true, errorMsg: null });
      // The backend handles unlinking the items, so just delete the menu.
      await api.delete(`/menus/${id}`);
      set((s) => ({ menus: s.menus.filter((m) => m.id !== id), isLoading: false }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to delete menu"), isLoading: false });
    }
  },

  // ─── Toggle Visibility ───────────────────────────────────────────────────────
  toggleVisibility: async (id) => {
    const menu = get().menus.find((m) => m.id === id);
    if (!menu) return;
    const newStatus = menu.isVisible ? "draft" : "active";
    try {
      await api.put(`/menus/${id}`, { status: newStatus });
      set((s) => ({
        menus: s.menus.map((m) =>
          m.id === id ? { ...m, isVisible: !m.isVisible, status: newStatus as MenuStatus } : m
        ),
      }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to toggle visibility") });
    }
  },

  // ─── Add Category ─────────────────────────────────────────────────────────────
  addCategory: async (name, propId) => {
    const propertyId = propId || get().propertyId;
    if (!propertyId) {
      set({ errorMsg: "No property selected." });
      return null;
    }
    try {
      const response = await api.post("/menu-categories", { propertyId, name });
      const created = response.data as { id: number; propertyId: number; name: string };
      const newCat: MenuCategory = { id: String(created.id), name: created.name, propertyId: created.propertyId };
      set((s) => ({ categories: [...s.categories, newCat] }));
      return newCat;
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to create category") });
      return null;
    }
  },

  // ─── Delete Category ──────────────────────────────────────────────────────────
  deleteCategory: async (categoryId) => {
    try {
      await api.delete(`/menu-categories/${categoryId}`);
      set((s) => ({ categories: s.categories.filter((c) => c.id !== categoryId) }));
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to delete category") });
    }
  },

  // ─── Add Item ────────────────────────────────────────────────────────────────
  addItem: async (menuId, item, propId) => {
    const propertyId = propId || get().propertyId;
    const menu = get().menus.find((m) => m.id === menuId);
    if (!propertyId || !menu) {
      set({ errorMsg: "No property or menu selected" });
      return;
    }
    try {
      set({ isLoading: true, errorMsg: null });
      const response = await api.post("/menu-items", {
        propertyId,
        menuId: Number(menuId),
        categoryId: Number(item.categoryId),
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: item.status === "active",
        tag: item.tag,
        calories: item.calories,
        imageUrls: item.imageUrls,
        variants: item.variants,
        modifiers: item.modifiers,
      });
      const saved = response.data as BackendMenuItem;
      const newItem: MenuItem = {
        id: String(saved.id),
        name: saved.name,
        price: saved.price,
        description: saved.description || "",
        categoryId: item.categoryId,
        categoryName: saved.categoryName || "",
        menuId,
        menuName: menu.name,
        status: item.status,
        tag: item.tag,
        calories: item.calories,
        imageUrls: saved.imageUrls || [],
        availability: item.availability,
        variants: item.variants,
        modifiers: item.modifiers,
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

  // ─── Update Item ─────────────────────────────────────────────────────────────
  updateItem: async (menuId, itemId, data) => {
    try {
      set({ isLoading: true, errorMsg: null });
      const updateData: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        price: data.price,
        tag: data.tag,
        calories: data.calories,
      };
      if (data.categoryId !== undefined) updateData.categoryId = Number(data.categoryId);
      if (data.menuId !== undefined) updateData.menuId = Number(data.menuId);
      if (data.status !== undefined) updateData.isAvailable = data.status === "active";
      if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls;
      if (data.variants !== undefined) updateData.variants = data.variants;
      if (data.modifiers !== undefined) updateData.modifiers = data.modifiers;

      await api.put(`/menu-items/${itemId}`, updateData);
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

  // ─── Delete Item ─────────────────────────────────────────────────────────────
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

  // ─── Toggle Item Status ───────────────────────────────────────────────────────
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

  // ─── Service Charge ──────────────────────────────────────────────────────────
  fetchServiceCharge: async (propertyId) => {
    try {
      const response = await api.get(`/staff/properties/${propertyId}/service-charge`);
      set({ serviceChargeRate: response.data.serviceChargeRate });
    } catch (error: unknown) {
      console.warn("Failed to fetch service charge", error);
    }
  },
  
  updateServiceCharge: async (propertyId, rate) => {
    try {
      set({ isLoading: true });
      const response = await api.put(`/staff/properties/${propertyId}/service-charge`, {
        serviceChargeRate: rate,
      });
      set({ serviceChargeRate: response.data.serviceChargeRate, isLoading: false, successMsg: "Service charge updated successfully" });
    } catch (error: unknown) {
      set({ errorMsg: extractApiErrorMessage(error, "Failed to update service charge"), isLoading: false });
    }
  },
  }),
  {
    name: 'staff-menu-storage',
    partialize: (state) => ({ menus: state.menus, categories: state.categories, serviceChargeRate: state.serviceChargeRate }),
  }
)
);
