import { create } from "zustand";
import { guestOrderApi } from "@/api/guest/order.api";
import api from "@/lib/axios";
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
  loading: boolean;
  error: string | null;

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
    propertyId: number;
    guestId: number;
  }) => Promise<string | null>; // Returns order ID or null on error

  /** Fetch order history for a guest */
  fetchOrderHistory: (guestId: number) => Promise<void>;

  /** Advance the order to the next status */
  advanceStatus: (status: OrderStatus, rejectionReason?: string) => void;

  /** Move current order to history (call after order lifecycle ends) */
  addToHistory: () => void;

  /** Clear current order */
  clearOrder: () => void;

  /** Set loading state */
  setLoading: (value: boolean) => void;

  /** Set error state */
  setError: (message: string | null) => void;
};

/* ─── Helpers ─── */


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

function mapBackendStatus(backendStatus: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    NEW: "Placed",
    PREPARING: "In-Progress",
    READY: "Accepted",
    DELIVERED: "Delivered",
    CANCELLED: "Rejected",
  };
  return statusMap[backendStatus] || "Placed";
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response && typeof response.data === "object" && response.data !== null) {
      const data = response.data as Record<string, unknown>;
      if ("errors" in data && typeof data.errors === "object" && data.errors !== null) {
        return Object.values(data.errors as Record<string, string>).map(String).join(", ");
      }
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

/* ─── Initialize empty history (populated from API) ─── */

/* ─── Store ─── */

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  orderHistory: [],
  loading: false,
  error: null,

  placeOrder: async (opts) => {
    set({ loading: true, error: null });
    try {
      // Debug: Log the API endpoint being called
      console.log("🔵 Attempting to place order...");
      console.log("📍 API Base URL:", api.defaults.baseURL);
      console.log("📍 Full URL:", `${api.defaults.baseURL}/orders`);
      console.log("📤 Request Payload:", {
        propertyId: opts.propertyId,
        guestId: opts.guestId,
      });
      // Call backend API
      const backendOrder = await guestOrderApi.placeOrder({
        propertyId: opts.propertyId,
        guestId: opts.guestId,
        roomNumber: opts.roomNumber,
        totalAmount: opts.total,
        status: "NEW",
        items: opts.lines.map(line => ({
          menuItemId: line.item.id,
          quantity: line.qty,
          priceAtOrder: line.item.price
        }))
      });

      const now = new Date();
      
      // Map backend response to frontend Order type
      const order: Order = {
        id: `#ORD-${backendOrder.id}`,
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
      set({ currentOrder: order, loading: false });
      return backendOrder.id;
    } catch (error: unknown) {
      let errorMessage = "Failed to place order";
      errorMessage = extractApiErrorMessage(error, errorMessage);
      console.error("❌ Order placement error:", error);
      
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchOrderHistory: async (guestId: number) => {
    set({ loading: true, error: null });
    try {
      const data = await guestOrderApi.getOrderHistory(guestId);
      
      // Handle paginated response
      const backendOrders = Array.isArray(data) ? data : (data.content || []);

      // Map backend orders to frontend format
      interface BackendOrder {
        id: number;
        roomNumber: string;
        totalAmount: number;
        status: string;
        createdAt: string;
      }
      const orderHistory: Order[] = (backendOrders as BackendOrder[]).map((backendOrder) => ({
        id: `#ORD-${backendOrder.id}`,
        roomNumber: backendOrder.roomNumber,
        guestName: "Guest", // Backend doesn't have guest name - will be added later
        paymentMethod: "room-charge" as const,
        lines: [], // Will be populated from separate API call
        subtotal: backendOrder.totalAmount * 0.9,
        serviceCharge: backendOrder.totalAmount * 0.1 * 0.1,
        tax: backendOrder.totalAmount * 0.1 * 0.05,
        total: backendOrder.totalAmount,
        currentStatus: mapBackendStatus(backendOrder.status),
        timeline: [
          {
            status: mapBackendStatus(backendOrder.status),
            time: formatTime(new Date(backendOrder.createdAt)),
            timestamp: new Date(backendOrder.createdAt).getTime(),
          },
        ],
        placedAt: formatPlacedAt(new Date(backendOrder.createdAt)),
      }));

      set({ orderHistory, loading: false });
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch orders";
      errorMessage = extractApiErrorMessage(error, errorMessage);
      set({ error: errorMessage, loading: false });
    }
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

  setLoading: (value) => set({ loading: value }),

  setError: (message) => set({ error: message }),
}));
