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
import { useCartStore } from "./cart.store";

/* ─── Types ─── */

export type OrderStatus =
  | "placed"
  | "accepted"
  | "in-progress"
  | "delivered"
  | "cancelled"
  | "payment-pending";

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
    PAYMENT_PENDING: "payment-pending",
    payment_pending: "payment-pending",
    placed: "placed",
    accepted: "accepted",
    "in-progress": "in-progress",
    delivered: "delivered",
    cancelled: "cancelled",
    "payment-pending": "payment-pending",
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
        guestSessionId: opts.guestSessionId,
        location: opts.location,
        guestName: opts.guestName,
        guestPhone: opts.guestPhone,
        totalAmount: opts.total,
        status: (opts.paymentMethod === "online" || opts.paymentMethod === "card") ? "PAYMENT_PENDING" : "PLACED",
      });

        // Call backend API
      const response = await api.post("/orders", {
        propertyId: opts.propertyId,
        guestId: opts.guestId,
        guestSessionId: opts.guestSessionId,
        location: opts.location,
        guestName: opts.guestName,
        guestPhone: opts.guestPhone,
        guestInstructions: opts.guestInstructions,
        paymentMethod: opts.paymentMethod,
        totalAmount: opts.total,
        // Online/card payments wait for PayHere confirmation before becoming active
        status: (opts.paymentMethod === "online" || opts.paymentMethod === "card") ? "PAYMENT_PENDING" : "PLACED",
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
        currentStatus: mapBackendStatus(backendOrder.status),
        timeline: [
          {
            status: mapBackendStatus(backendOrder.status),
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
    // Fetch from backend using session ID or guest ID
    if (!guestSessionId && !guestId) {
      set({ loading: false });
      return Promise.resolve();
    }
    set({ loading: true });
    try {
      let response;
      if (guestSessionId) {
        response = await api.get(`/orders/session/${guestSessionId}`, { params: { size: 50 } });
      } else {
        response = await api.get(`/orders/guest/${guestId}`, { params: { size: 50 } });
      }
      const raw = response.data;
      const backendOrders = Array.isArray(raw) ? raw : (raw?.content ?? []);
      
      // Map backend orders to frontend Order type, excluding payment-pending ones
      const now = new Date();
      
      const { serviceChargeRate = 0.1, taxRate = 0.05 } = useCartStore.getState();
      const combinedRate = 1 + serviceChargeRate + taxRate;

      const mapped: Order[] = backendOrders
        .filter((bo: { status: string }) => bo.status !== 'PAYMENT_PENDING' && bo.status !== 'payment_pending')
        .map((bo: { id: number; status: string; createdAt: string; location?: string; guestName?: string; totalAmount?: number; paymentMethod?: string; items?: Array<{ menuItem: { name: string; imageUrl?: string; priceLkr?: number }; quantity: number; priceAtOrder: number; note?: string }> }) => {
          const createdDate = bo.createdAt ? new Date(bo.createdAt) : now;
          const mappedStatus = mapBackendStatus(bo.status);
          const lines: OrderLine[] = (bo.items || []).map((it) => ({
            item: {
              id: String(it.menuItem ? (it.menuItem as { name: string; imageUrl?: string; priceLkr?: number }).name : 'item'),
              title: it.menuItem?.name || 'Item',
              priceLkr: it.priceAtOrder,
              category: '',
              imageUrl: it.menuItem?.imageUrl,
              price: it.priceAtOrder,
            } as MenuItem,
            qty: it.quantity,
          }));
          const subtotal = (bo.totalAmount ?? 0) / combinedRate;
          const serviceCharge = subtotal * serviceChargeRate;
          const tax = subtotal * taxRate;
          return {
            id: `#ORD-${bo.id}`,
            location: bo.location || '',
            guestName: bo.guestName || 'Guest',
            paymentMethod: (bo.paymentMethod || 'cash') as Order['paymentMethod'],
            lines,
            subtotal,
            serviceCharge,
            tax,
            total: bo.totalAmount ?? 0,
            currentStatus: mappedStatus,
            timeline: [{ status: mappedStatus, time: formatTime(createdDate), timestamp: createdDate.getTime() }],
            placedAt: formatPlacedAt(createdDate),
          } as Order;
        });
      
      set((state) => {
        // Merge with currentOrder to avoid duplicates
        const currentId = state.currentOrder?.id;
        const filtered = mapped.filter((o) => o.id !== currentId);
        return { orderHistory: filtered, loading: false };
      });
    } catch {
      set({ loading: false });
    }
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
      
      // Always update from backend — ensures payment-pending -> placed transition is reflected
      set((state) => {
        if (!state.currentOrder) return state;
        const alreadyHasStatus = state.currentOrder.timeline.some((t) => t.status === mappedStatus);
        const now = new Date();
        return {
          currentOrder: {
            ...state.currentOrder,
            currentStatus: mappedStatus,
            timeline: alreadyHasStatus
              ? state.currentOrder.timeline
              : [
                  ...state.currentOrder.timeline,
                  { status: mappedStatus, time: formatTime(now), timestamp: now.getTime() },
                ],
          },
        };
      });
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
