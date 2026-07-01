import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import type { MenuItem } from "./cart.store";
const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "sess-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
};

import { useGuestSessionStore } from "./guest-session.store";

/* ─── Types ─── */

export type OrderStatus =
  | "placed"
  | "accepted"
  | "in-progress"
  | "delivered"
  | "cancelled";

export type OrderLine = {
  item: MenuItem;
  qty: number;
  selectedVariantId?: string;
  selectedModifiers?: { modifierId: string; optionLabel: string }[];
};

export type TimelineStep = {
  status: OrderStatus;
  time: string; // e.g. "10:30 AM"
  timestamp: number; // Date.now()
};

export type Order = {
  id: string;
  location: string;
  guestName: string;
  paymentMethod: "cash" | "online" | "pay-at-property" | "card" | "room-charge";
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
    location?: string;
    guestName?: string;
    guestPhone?: string;
    guestInstructions?: string;
    paymentMethod: "cash" | "online" | "pay-at-property" | "card" | "room-charge";
    propertyId: number;
    guestId?: number;
    guestSessionId?: string;
  }) => Promise<string | null>; // Returns order ID or null on error

  /** Fetch order history for a guest or an anonymous session */
  fetchOrderHistory: (guestId?: number, guestSessionId?: string) => Promise<void>;

  /** Sync current order status from backend */
  syncCurrentOrder: () => Promise<void>;

  /** Advance the order to the next status */
  advanceStatus: (status: OrderStatus, rejectionReason?: string) => void;

  /** Update an order's status in the history array directly */
  updateHistoryOrderStatus: (orderId: string, status: OrderStatus) => void;

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
    NEW: "placed",
    PREPARING: "accepted",
    READY: "in-progress",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    PAYMENT_PENDING: "placed",
    payment_pending: "placed",
    placed: "placed",
    accepted: "accepted",
    "in-progress": "in-progress",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return statusMap[backendStatus] || (statusMap[backendStatus.toLowerCase()] as OrderStatus) || "placed";
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
    return "Connection issue. Please check your internet connection or try again shortly.";
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
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (response && typeof response.data === "object" && response.data !== null) {
      const data = response.data as Record<string, unknown>;
      if ("errors" in data && typeof data.errors === "object" && data.errors !== null) {
        message = Object.values(data.errors as Record<string, string>).map(String).join(", ");
      } else if ("message" in data && typeof data.message === "string") {
        message = data.message;
      }
    }
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  return sanitizeErrorMessage(message, fallback);
}

/* ─── Initialize empty history (populated from API) ─── */

/* ─── Store ─── */

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
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
        location: opts.location,
        guestName: opts.guestName,
        guestPhone: opts.guestPhone,
        totalAmount: opts.total,
        status: opts.paymentMethod === "online" ? "PAYMENT_PENDING" : "PLACED",
      });

      const resolvedSessionId = opts.guestSessionId || useGuestSessionStore.getState().sessionId || generateUUID();

        // Call backend API
      const response = await api.post("/orders", {
        propertyId: opts.propertyId,
        guestId: opts.guestId,
        guestSessionId: resolvedSessionId,
        location: opts.location,
        guestName: opts.guestName,
        guestPhone: opts.guestPhone,
        guestInstructions: opts.guestInstructions,
        paymentMethod: opts.paymentMethod,
        totalAmount: opts.total,
        // Online walk-in payments wait for PayHere confirmation before becoming active
        status: opts.paymentMethod === "online" ? "PAYMENT_PENDING" : "PLACED",
        items: opts.lines.map((line) => {
          let note = "";
          if (line.selectedVariantId && line.item.variants) {
            const v = line.item.variants.find((v) => v.id === line.selectedVariantId);
            if (v) note += v.label;
          }
          if (line.selectedModifiers && line.selectedModifiers.length > 0) {
            if (note) note += " • ";
            note += line.selectedModifiers.map(m => m.optionLabel).join(", ");
          }

          return {
            menuItemId: Number(line.item.id.replace(/^(mn-|vn-)/, "")),
            quantity: line.qty,
            priceAtOrder: line.item.price, // NOTE: We don't need to recalculate base price, cart subtotal handles it
            note: note || undefined,
          };
        }),
      });

      console.log("✅ Order placed successfully:", response.data);
      const backendOrder = response.data;
      const now = new Date();
      
      // Map backend response to frontend Order type
      const order: Order = {
        id: `#ORD-${backendOrder.id}`,
        location: opts.location || "",
        guestName: opts.guestName || "Guest",
        paymentMethod: opts.paymentMethod,
        lines: opts.lines,
        subtotal: opts.subtotal,
        serviceCharge: opts.serviceCharge,
        tax: opts.tax,
        total: opts.total,
        currentStatus: "placed",
        timeline: [
          {
            status: "placed",
            time: formatTime(now),
            timestamp: now.getTime(),
          },
        ],
        placedAt: formatPlacedAt(now),
      };
      set((state) => {
        // If there's already a current order, push it to history before replacing
        const nextHistory = state.currentOrder 
          ? [state.currentOrder, ...state.orderHistory] 
          : state.orderHistory;
          
        return { 
          currentOrder: order, 
          orderHistory: nextHistory,
          loading: false 
        };
      });
      return backendOrder.id;
    } catch (error: unknown) {
      let errorMessage = "Failed to place order";
      errorMessage = extractApiErrorMessage(error, errorMessage);
      console.error("❌ Order placement error:", error);
      
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchOrderHistory: async (guestId?: number, guestSessionId?: string) => {
    // As per requirement: "show not from db but from local cookies"
    // We just return immediately to rely entirely on the persisted state
    set({ loading: false });
    return Promise.resolve();
  },

  syncCurrentOrder: async () => {
    const currentOrder = get().currentOrder;
    if (!currentOrder) return;
    const numericOrderId = currentOrder.id.replace('#ORD-', '');
    try {
      const response = await api.get(`/orders/${numericOrderId}`);
      const backendOrder = response.data;
      const mappedStatus = mapBackendStatus(backendOrder.status);
      
      if (mappedStatus !== currentOrder.currentStatus) {
        get().advanceStatus(mappedStatus);
      }
    } catch (error) {
      console.error("Failed to sync current order:", error);
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
            status === "cancelled" ? rejectionReason : state.currentOrder.rejectionReason,
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

  updateHistoryOrderStatus: (orderId, status) =>
    set((state) => {
      const now = new Date();
      return {
        orderHistory: state.orderHistory.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              currentStatus: status,
              timeline: [
                ...order.timeline,
                {
                  status,
                  time: formatTime(now),
                  timestamp: now.getTime(),
                },
              ],
            };
          }
          return order;
        }),
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
    }),
    {
      name: "guest-order-store",
      partialize: (state) => ({
        currentOrder: state.currentOrder,
        orderHistory: state.orderHistory,
      }),
    }
  )
);
