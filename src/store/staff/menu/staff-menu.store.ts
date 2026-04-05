import { create } from "zustand";

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
}

interface StaffMenuActions {
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

const MOCK_MENUS: Menu[] = [
  {
    id: "1",
    name: "Breakfast Delight",
    description: "Traditional string hoppers, dhal curry, and pol sambol.",
    type: "Sri Lankan",
    status: "active",
    isVisible: true,
    isNew: true,
    priceRange: "LKR 1,500 - 2,200",
    itemCount: 12,
    items: [
      {
        id: "1", name: "Margherita Pizza", price: 3000, description: "Classic tomato sauce, fresh mozzarella, basil.", category: "Main", status: "active", calories: 450,
        availability: { startTime: "08:00", endTime: "22:00", allDays: true, days: [] },
        variants: [{ id: "v1", label: "Small", price: 2000 }, { id: "v2", label: "Large", price: 3500 }],
        modifiers: [{ id: "m1", name: "Spice Level", options: [{ label: "Mild", price: 0 }, { label: "Hot", price: 50 }] }],
      },
      {
        id: "2", name: "Classic Beef Burger", price: 1200, description: "Angus beef patty, cheddar, lettuce, tomato.", category: "Main", status: "active", calories: 620,
        availability: { startTime: "11:00", endTime: "23:00", allDays: true, days: [] },
        variants: [], modifiers: [],
      },
      {
        id: "3", name: "Tropical Smoothie", price: 400, description: "Mango, pineapple, coconut milk blend.", category: "Drink", status: "draft", tag: "Drink",
        availability: { startTime: "08:00", endTime: "18:00", allDays: true, days: [] },
        variants: [], modifiers: [],
      },
      {
        id: "4", name: "Caesar Salad", price: 600, description: "Romaine, parmesan, croutons, caesar dressing.", category: "Starter", status: "active", calories: 320,
        availability: { startTime: "11:00", endTime: "22:00", allDays: true, days: [] },
        variants: [], modifiers: [],
      },
      {
        id: "5", name: "Spaghetti Carbonara", price: 900, description: "Pancetta, egg, parmesan, black pepper.", category: "Main", status: "active", calories: 550,
        availability: { startTime: "11:00", endTime: "22:00", allDays: true, days: [] },
        variants: [], modifiers: [],
      },
      {
        id: "6", name: "Tiramisu", price: 850, description: "Mascarpone, espresso soaked ladyfingers.", category: "Dessert", status: "active", calories: 300, tag: "Seasonal",
        availability: { startTime: "11:00", endTime: "22:00", allDays: true, days: [] },
        variants: [], modifiers: [],
      },
    ],
  },
  {
    id: "2",
    name: "Standard Lunch Buffet",
    description: "Red rice, 5 vegetable curries, fish/chicken options.",
    type: "Buffet",
    status: "active",
    isVisible: true,
    priceRange: "LKR 2,500 pp",
    itemCount: 25,
    items: [],
  },
  {
    id: "3",
    name: "Western Start",
    description: "Toast, eggs benedict, sausages, and fresh fruit.",
    type: "Western",
    status: "draft",
    isVisible: false,
    priceRange: "LKR 1,800",
    itemCount: 8,
    items: [],
  },
  {
    id: "4",
    name: "High Tea Platter",
    description: "Scones, mini sandwiches, Ceylon tea pot.",
    type: "Snacks",
    status: "active",
    isVisible: true,
    priceRange: "LKR 3,000 for 2",
    itemCount: 6,
    items: [],
  },
];

export const useStaffMenuStore = create<StaffMenuState & StaffMenuActions>((set, get) => ({
  menus: MOCK_MENUS,
  successMsg: null,

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
}));
