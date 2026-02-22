import { create } from "zustand";
import type { MenuItem } from "./cart-store";

/* ─── Types ─── */

export type OrderStatus =
  | "Placed"
  | "Accepted"
  | "In-Progress"
  | "Delivered"
  | "Rejected";

export type OrderLine = {
  item: MenuItem;
  qty: number;
};

export type TimelineStep = {
  status: OrderStatus;
  time: string; // e.g. "10:30 AM"
  timestamp: number; // Date.now()
};

export type Order = {
  id: string;
  roomNumber: string;
  guestName: string;
  paymentMethod: "card" | "room-charge";
  lines: OrderLine[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  currentStatus: OrderStatus;
  timeline: TimelineStep[];
  placedAt: string; // formatted date string
  rejectionReason?: string;
};

type OrderState = {
  currentOrder: Order | null;
  orderHistory: Order[];

  /** Call from checkout to create the order from cart data */
  placeOrder: (opts: {
    lines: OrderLine[];
    subtotal: number;
    serviceCharge: number;
    tax: number;
    total: number;
    roomNumber: string;
    guestName: string;
    paymentMethod: "card" | "room-charge";
  }) => void;

  /** Advance the order to the next status */
  advanceStatus: (status: OrderStatus, rejectionReason?: string) => void;

  /** Move current order to history (call after order lifecycle ends) */
  addToHistory: () => void;

  /** Clear current order */
  clearOrder: () => void;
};

/* ─── Helpers ─── */

function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `#ORD-${num}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPlacedAt(date: Date): string {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return `Today at ${formatTime(date)}`;
  }
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${formatTime(date)}`;
}

/* ─── Seed history for demo ─── */

const SEED_HISTORY: Order[] = [
  {
    id: "#ORD-2938",
    roomNumber: "304",
    guestName: "John Smith",
    paymentMethod: "room-charge",
    lines: [
      { item: { id: "h1", title: "Chicken Kottu Roti", description: "Chopped roti stir-fried with spices", priceLkr: 1800, category: "Mains" }, qty: 2 },
      { item: { id: "h2", title: "Fresh Lime Juice", description: "Freshly squeezed lime with sugar", priceLkr: 450, category: "Beverages" }, qty: 2 },
    ],
    subtotal: 4500,
    serviceCharge: 450,
    tax: 225,
    total: 5175,
    currentStatus: "Delivered",
    timeline: [
      { status: "Placed", time: "7:30 PM", timestamp: new Date("2023-10-24T19:30:00").getTime() },
      { status: "Accepted", time: "7:33 PM", timestamp: new Date("2023-10-24T19:33:00").getTime() },
      { status: "In-Progress", time: "7:45 PM", timestamp: new Date("2023-10-24T19:45:00").getTime() },
      { status: "Delivered", time: "8:05 PM", timestamp: new Date("2023-10-24T20:05:00").getTime() },
    ],
    placedAt: "Oct 24 at 7:30 PM",
  },
  {
    id: "#ORD-2937",
    roomNumber: "304",
    guestName: "John Smith",
    paymentMethod: "card",
    lines: [
      { item: { id: "h3", title: "Egg Hoppers", description: "Bowl-shaped crispy pancake with egg", priceLkr: 600, category: "Mains" }, qty: 2 },
    ],
    subtotal: 1200,
    serviceCharge: 120,
    tax: 60,
    total: 1380,
    currentStatus: "Delivered",
    timeline: [
      { status: "Placed", time: "8:15 AM", timestamp: new Date("2023-10-23T08:15:00").getTime() },
      { status: "Accepted", time: "8:18 AM", timestamp: new Date("2023-10-23T08:18:00").getTime() },
      { status: "In-Progress", time: "8:25 AM", timestamp: new Date("2023-10-23T08:25:00").getTime() },
      { status: "Delivered", time: "8:40 AM", timestamp: new Date("2023-10-23T08:40:00").getTime() },
    ],
    placedAt: "Oct 23 at 8:15 AM",
  },
  {
    id: "#ORD-2935",
    roomNumber: "304",
    guestName: "John Smith",
    paymentMethod: "room-charge",
    lines: [
      { item: { id: "h4", title: "Arrack Sour Cocktail", description: "Sri Lankan arrack with lime & sugar", priceLkr: 1500, category: "Beverages" }, qty: 1 },
      { item: { id: "h5", title: "Cheese Platter", description: "Assorted local and imported cheeses", priceLkr: 1750, category: "Starters" }, qty: 1 },
    ],
    subtotal: 3250,
    serviceCharge: 325,
    tax: 163,
    total: 3738,
    currentStatus: "Delivered",
    timeline: [
      { status: "Placed", time: "6:45 PM", timestamp: new Date("2023-10-20T18:45:00").getTime() },
      { status: "Accepted", time: "6:48 PM", timestamp: new Date("2023-10-20T18:48:00").getTime() },
      { status: "In-Progress", time: "6:55 PM", timestamp: new Date("2023-10-20T18:55:00").getTime() },
      { status: "Delivered", time: "7:15 PM", timestamp: new Date("2023-10-20T19:15:00").getTime() },
    ],
    placedAt: "Oct 20 at 6:45 PM",
  },
  {
    id: "#ORD-2934",
    roomNumber: "304",
    guestName: "John Smith",
    paymentMethod: "room-charge",
    lines: [
      { item: { id: "h6", title: "Rice & Curry Plate", description: "Traditional rice with 3 curries", priceLkr: 2500, category: "Mains" }, qty: 1 },
    ],
    subtotal: 2500,
    serviceCharge: 250,
    tax: 125,
    total: 2875,
    currentStatus: "Delivered",
    timeline: [
      { status: "Placed", time: "9:00 AM", timestamp: new Date("2023-10-19T09:00:00").getTime() },
      { status: "Accepted", time: "9:05 AM", timestamp: new Date("2023-10-19T09:05:00").getTime() },
      { status: "In-Progress", time: "9:15 AM", timestamp: new Date("2023-10-19T09:15:00").getTime() },
      { status: "Delivered", time: "9:35 AM", timestamp: new Date("2023-10-19T09:35:00").getTime() },
    ],
    placedAt: "Oct 19 at 9:00 AM",
  },
  {
    id: "#ORD-2930",
    roomNumber: "304",
    guestName: "John Smith",
    paymentMethod: "card",
    lines: [
      { item: { id: "h7", title: "Fish Ambul Thiyal", description: "Sour fish curry with goraka", priceLkr: 2200, category: "Mains" }, qty: 1 },
      { item: { id: "h8", title: "King Coconut Water", description: "Fresh king coconut", priceLkr: 350, category: "Beverages" }, qty: 2 },
    ],
    subtotal: 2900,
    serviceCharge: 290,
    tax: 145,
    total: 3335,
    currentStatus: "Delivered",
    timeline: [
      { status: "Placed", time: "12:30 PM", timestamp: new Date("2023-10-18T12:30:00").getTime() },
      { status: "Accepted", time: "12:35 PM", timestamp: new Date("2023-10-18T12:35:00").getTime() },
      { status: "In-Progress", time: "12:45 PM", timestamp: new Date("2023-10-18T12:45:00").getTime() },
      { status: "Delivered", time: "1:05 PM", timestamp: new Date("2023-10-18T13:05:00").getTime() },
    ],
    placedAt: "Oct 18 at 12:30 PM",
  },
];

/* ─── Store ─── */

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  orderHistory: SEED_HISTORY,

  placeOrder: (opts) => {
    const now = new Date();
    const order: Order = {
      id: generateOrderId(),
      roomNumber: opts.roomNumber,
      guestName: opts.guestName,
      paymentMethod: opts.paymentMethod,
      lines: opts.lines,
      subtotal: opts.subtotal,
      serviceCharge: opts.serviceCharge,
      tax: opts.tax,
      total: opts.total,
      currentStatus: "Placed",
      timeline: [
        {
          status: "Placed",
          time: formatTime(now),
          timestamp: now.getTime(),
        },
      ],
      placedAt: formatPlacedAt(now),
    };
    set({ currentOrder: order });
  },

  advanceStatus: (status, rejectionReason) =>
    set((state) => {
      if (!state.currentOrder) return state;
      const now = new Date();
      return {
        currentOrder: {
          ...state.currentOrder,
          currentStatus: status,
          rejectionReason:
            status === "Rejected" ? rejectionReason : state.currentOrder.rejectionReason,
          timeline: [
            ...state.currentOrder.timeline,
            {
              status,
              time: formatTime(now),
              timestamp: now.getTime(),
            },
          ],
        },
      };
    }),

  addToHistory: () =>
    set((state) => {
      if (!state.currentOrder) return state;
      return {
        orderHistory: [state.currentOrder, ...state.orderHistory],
        currentOrder: null,
      };
    }),

  clearOrder: () => set({ currentOrder: null }),
}));
