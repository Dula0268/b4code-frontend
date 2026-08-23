import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import axios from "axios";
import { useAuthStore } from "@/store/auth/auth.store";
import { getToken } from "@/lib/token";


// ─── Types ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "placed"
  | "accepted"
  | "in-progress"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  qty: number;
  name: string;
  price: number;
  tag?: string;
  tagColor?: string;
  note?: string;
}

export interface HistoryEntry {
  label: string;
  time: string;
  detail: string;
  color: "green" | "yellow" | "gray";
}

export interface Order {
  id: string;
  time: string;
  timeAgo: string;
  table: string;
  type: string;
  room?: string;
  guest?: string;
  items: OrderItem[];
  note?: string;
  /** All money fields below are the server's persisted, authoritative values. */
  subtotal: number;
  serviceCharge: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
  status: OrderStatus;
  isUrgent: boolean;
  prepTime?: string;
  history: HistoryEntry[];
  internalNotes: { author: string; text: string; timeAgo: string }[];
  createdAt: string;
}

// ─── Next status mapping ───────────────────────────────────────────────────────
const STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "accepted",
  accepted: "in-progress",
  "in-progress": "delivered",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  accepted: "Order Confirmed",
  "in-progress": "Order Preparing",
  delivered: "Order Delivered",
  cancelled: "Order Rejected",
};

// ─── Initialize empty orders (populated from API) ─────────────────────────────
let staffEventSource: EventSource | null = null;
let activeAbortController: AbortController | null = null;
let activeQueueAbortController: AbortController | null = null;


// ─── State ─────────────────────────────────────────────────────────────────────
export const ORDER_PAGE_SIZE = 12;

/**
 * Backend statuses that make up each frontend queue tab. `in-progress` covers two
 * backend statuses, which is why the list endpoint takes a `statuses` list.
 */
const BACKEND_STATUSES_BY_TAB: Record<OrderStatus, string[]> = {
  placed: ["PLACED"],
  accepted: ["ACCEPTED"],
  "in-progress": ["IN_PROGRESS", "READY"],
  delivered: ["DELIVERED"],
  cancelled: ["CANCELLED"],
};

/** One server-paginated page of the staff order queue (Spring `Page` contract). */
export type OrderQueuePage = {
  items: Order[];
  status: OrderStatus;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
};

type StaffOrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  toast: { type: "success" | "error"; message: string; detail: string } | null;
  /** Paginated slice used by the staff orders queue page. */
  queue: OrderQueuePage;
  /** Total order count per frontend status tab, independent of the current page. */
  statusCounts: Partial<Record<OrderStatus, number>>;
};

type StaffOrdersActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  fetchOrders: (propertyId: number) => Promise<void>;
  fetchOrderPage: (
    propertyId: number,
    options?: { page?: number; size?: number; status?: OrderStatus }
  ) => Promise<void>;
  fetchStatusCounts: (propertyId: number) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  advanceStatus: (orderId: string) => Promise<void>;
  clearToast: () => void;
  addInternalNote: (orderId: string, note: string) => void;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getCountByStatus: (status: OrderStatus) => number;
  setupSse: (propertyId: number) => void;
  stopSse: () => void;
  reset: () => void;
};

// Helper function to map backend status to frontend status
function mapBackendStatusToFrontend(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    // Current Backend Statuses (Uppercase)
    PLACED: "placed",
    ACCEPTED: "accepted",
    IN_PROGRESS: "in-progress",
    READY: "in-progress",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",

    // Obsolete/Alternative format mappings
    NEW: "placed",
    PREPARING: "accepted",
    PAYMENT_PENDING: "placed",
    payment_pending: "placed",

    // Lowercase mappings
    placed: "placed",
    accepted: "accepted",
    "in-progress": "in-progress",
    in_progress: "in-progress",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return statusMap[status] || (statusMap[status.toLowerCase()] as OrderStatus) || "placed";
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

interface BackendOrderItem {
  id: number;
  quantity: number;
  priceAtOrder: number;
  note?: string;
  menuItem: {
    name: string;
    tag?: string;
  };
}

interface BackendOrderResponse {
  id: number;
  location: string;
  guestName: string;
  guestId: number;
  guestInstructions?: string;
  totalAmount: number;
  subtotalAmount?: number;
  serviceChargeAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  status: string;
  createdAt: string | number[];
  items?: BackendOrderItem[];
}
function convertBackendOrder(backendOrder: BackendOrderResponse): Order {
  let createdAt: Date;
  if (Array.isArray(backendOrder.createdAt)) {
    const [y, m, d, hr = 0, min = 0, sec = 0] = backendOrder.createdAt;
    createdAt = new Date(y, m - 1, d, hr, min, sec);
  } else if (backendOrder.createdAt) {
    createdAt = new Date(backendOrder.createdAt);
  } else {
    createdAt = new Date();
  }
  
  const status = mapBackendStatusToFrontend(backendOrder.status);
  
  const items: OrderItem[] = (backendOrder.items || []).map((it) => ({
    qty: it.quantity,
    name: it.menuItem?.name || "Unknown Item",
    price: it.priceAtOrder,
    tag: it.menuItem?.tag || undefined,
    note: it.note || undefined,
  }));

  const totalItems = items.reduce((acc, it) => acc + it.qty, 0);

  const rawLocation = (backendOrder.location || "").trim();
  const isTable = rawLocation.toLowerCase().startsWith("t");
  
  let formattedLocation = rawLocation;
  let orderType = "Room Order";

  if (isTable) {
    const numMatch = rawLocation.match(/\d+/);
    formattedLocation = "Table " + (numMatch ? numMatch[0] : rawLocation);
    orderType = "Table Order";
  } else if (rawLocation) {
    const numMatch = rawLocation.match(/\d+/);
    formattedLocation = "Room " + (numMatch ? numMatch[0] : rawLocation);
    orderType = "Room Order";
  } else {
    formattedLocation = "Unknown";
    orderType = "Order";
  }

  return {
    id: `#ORD-${backendOrder.id}`,
    time: createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    timeAgo: getTimeAgo(createdAt),
    table: formattedLocation,
    type: orderType,
    room: formattedLocation,
    guest: backendOrder.guestName || `Guest ${backendOrder.guestId}`,
    items,
    note: backendOrder.guestInstructions,
    // Server-persisted breakdown only. This previously guessed subtotal as
    // totalAmount * 0.9 and service charge as totalAmount * 0.01, which matched
    // neither the real charges nor what the guest was shown.
    subtotal: backendOrder.subtotalAmount ?? 0,
    serviceCharge: backendOrder.serviceChargeAmount ?? 0,
    tax: backendOrder.taxAmount ?? 0,
    discount: backendOrder.discountAmount ?? 0,
    total: backendOrder.totalAmount,
    totalItems,
    status,
    isUrgent: status === "placed" || status === "in-progress",
    history: [
      {
        label: STATUS_LABELS[status],
        time: createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        detail: `By ${backendOrder.guestName || "Guest"}`,
        color: (status === "in-progress" ? "yellow" : "green") as "yellow" | "green",
      },
    ],
    internalNotes: [],
    createdAt: createdAt.toISOString(),
  };
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const useStaffOrdersStore = create<StaffOrdersState & StaffOrdersActions>()(
  persist(
    (set, get) => ({
    orders: [],
    loading: false,
    error: null,
    toast: null,
    queue: {
      items: [],
      status: "placed",
      page: 0,
      size: ORDER_PAGE_SIZE,
      totalPages: 0,
      totalElements: 0,
      loading: false,
      error: null,
    },
    statusCounts: {},

    setLoading: (value) => set({ loading: value }),
    setError: (message) => set({ error: message }),

    fetchOrders: async (propertyId: number) => {
      if (!propertyId || isNaN(propertyId)) {
        console.warn("⚠️ fetchOrders called with invalid propertyId:", propertyId);
        set({ loading: false });
        return;
      }

      // Abort previous pending fetch request to avoid race conditions
      if (activeAbortController) {
        activeAbortController.abort();
      }

      const controller = new AbortController();
      activeAbortController = controller;

      set({ loading: true, error: null });
      console.log(`🔄 Fetching orders for property ${propertyId}...`);
      try {
        const response = await api.get(`/staff/orders/property/${propertyId}`, {
          params: { size: 100 },
          signal: controller.signal
        });
        
        // Only apply results if this is the latest fetch request
        if (activeAbortController === controller) {
          // Backend returns a Spring Page object: {content: [], totalPages, ...}
          // Extract the content array, or fall back to the raw data if it's already an array
          const raw = response.data;
          const backendOrders: BackendOrderResponse[] = Array.isArray(raw) ? raw : (raw?.content ?? []);
          console.log(`✅ Received ${backendOrders.length} orders from backend:`, backendOrders);
          const orders = backendOrders
            .filter((o) => o.status !== "PAYMENT_PENDING" && o.status !== "payment_pending")
            .map(convertBackendOrder);
          console.log(`✅ Converted to frontend format:`, orders);
          set({ orders, loading: false });
        }
      } catch (error: unknown) {
        // A newer fetchOrders call already superseded this one and aborted it —
        // that's expected, not a real failure, regardless of how axios/the
        // browser happens to shape the resulting error for this abort.
        if (activeAbortController !== controller || axios.isCancel(error)) {
          console.log("🔄 Stale fetch orders request aborted successfully.");
          return;
        }
        const errorMessage = extractApiErrorMessage(error, "Failed to fetch orders");
        console.error(`❌ Failed to fetch orders:`, error);
        set({ error: errorMessage, loading: false });
      }
    },

    /**
     * Fetches ONE page of orders for a single queue tab straight from the backend's
     * existing `Page<OrderResponse>` endpoint (page / size / totalPages / totalElements).
     * Deliberately kept separate from `orders`, which is the global cache the sidebar
     * badge, dashboard and notification provider read from.
     */
    fetchOrderPage: async (propertyId, options = {}) => {
      if (!propertyId || isNaN(propertyId)) {
        set((state) => ({ queue: { ...state.queue, loading: false } }));
        return;
      }

      const current = get().queue;
      const status = options.status ?? current.status;
      const size = options.size ?? current.size ?? ORDER_PAGE_SIZE;
      const page = Math.max(options.page ?? current.page, 0);

      if (activeQueueAbortController) {
        activeQueueAbortController.abort();
      }
      const controller = new AbortController();
      activeQueueAbortController = controller;

      set((state) => ({
        queue: { ...state.queue, status, page, size, loading: true, error: null },
      }));

      try {
        const response = await api.get(`/staff/orders/property/${propertyId}`, {
          params: { page, size, statuses: BACKEND_STATUSES_BY_TAB[status] },
          paramsSerializer: { indexes: null },
          signal: controller.signal,
        });

        if (activeQueueAbortController !== controller) return;

        const raw = response.data;
        const content: BackendOrderResponse[] = Array.isArray(raw) ? raw : (raw?.content ?? []);
        const totalElements: number = Array.isArray(raw)
          ? content.length
          : (raw?.totalElements ?? content.length);
        const totalPages: number = Array.isArray(raw)
          ? 1
          : (raw?.totalPages ?? (size > 0 ? Math.ceil(totalElements / size) : 1));

        set((state) => ({
          queue: {
            ...state.queue,
            items: content.map(convertBackendOrder),
            status,
            page,
            size,
            totalPages,
            totalElements,
            loading: false,
            error: null,
          },
        }));
      } catch (error: unknown) {
        if (activeQueueAbortController !== controller || axios.isCancel(error)) return;
        const errorMessage = extractApiErrorMessage(error, "Failed to fetch orders");
        set((state) => ({ queue: { ...state.queue, loading: false, error: errorMessage } }));
      }
    },

    /**
     * Per-status totals so the queue tabs stay accurate while only one page of rows
     * is loaded. Falls back silently to the cache-derived counts if unavailable.
     */
    fetchStatusCounts: async (propertyId) => {
      if (!propertyId || isNaN(propertyId)) return;
      try {
        const response = await api.get(`/staff/orders/property/${propertyId}/status-counts`);
        const raw = (response.data ?? {}) as Record<string, number>;
        const counts: Partial<Record<OrderStatus, number>> = {};
        for (const [backendStatus, count] of Object.entries(raw)) {
          if (backendStatus === "PAYMENT_PENDING" || backendStatus === "payment_pending") continue;
          const tab = mapBackendStatusToFrontend(backendStatus);
          counts[tab] = (counts[tab] ?? 0) + Number(count || 0);
        }
        set({ statusCounts: counts });
      } catch {
        // Counts are a nicety - keep the cache-derived fallback rather than surfacing an error.
      }
    },

    acceptOrder: async (orderId) => {
      try {
        const orderIdNum = parseInt(orderId.replace("#ORD-", ""));
        const response = await api.patch(`/staff/orders/${orderIdNum}/accept`);
        const updated = convertBackendOrder(response.data);
        
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...updated, internalNotes: o.internalNotes } : o
          ),
          toast: {
            type: "success",
            message: "Order Accepted",
            detail: `Order ${orderId} accepted`,
          },
        }));
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to accept order");
        set({
          error: errorMessage,
          toast: { type: "error", message: "Action Failed", detail: errorMessage }
        });
      }
    },

    rejectOrder: async (orderId, reason) => {
      try {
        const orderIdNum = parseInt(orderId.replace("#ORD-", ""));
        const response = await api.post(`/staff/orders/${orderIdNum}/reject`, {
          confirm: true,
          reason: reason || "Rejected via notification"
        });
        const updated = convertBackendOrder(response.data);
        
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...updated, internalNotes: o.internalNotes } : o
          ),
          toast: {
            type: "error",
            message: "Order Rejected",
            detail: `Order ${orderId} Rejected`,
          },
        }));
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to reject order");
        set({
          error: errorMessage,
          toast: { type: "error", message: "Action Failed", detail: errorMessage }
        });
      }
    },

    advanceStatus: async (orderId) => {
      try {
        const orderIdNum = parseInt(orderId.replace("#ORD-", ""));
        const currentOrder = get().orders.find((o) => o.id === orderId);
        if (!currentOrder) return;

        let endpoint = "";
        const status = currentOrder.status;
        
        if (status === "placed") {
          endpoint = `/staff/orders/${orderIdNum}/accept`;
        } else if (status === "accepted") {
          endpoint = `/staff/orders/${orderIdNum}/ready`;
        } else if (status === "in-progress") {
          endpoint = `/staff/orders/${orderIdNum}/deliver`;
        }

        if (endpoint) {
          const response = await api.patch(endpoint);
          const updated = convertBackendOrder(response.data);
          
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...updated, internalNotes: o.internalNotes } : o
            ),
          }));
        }
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to advance order status");
        set({
          error: errorMessage,
          toast: { type: "error", message: "Action Failed", detail: errorMessage }
        });
      }
    },

    clearToast: () => set({ toast: null }),

    addInternalNote: (orderId, note) => {
      const user = useAuthStore.getState().user;
      const author = user?.profile?.firstName 
        ? `${user.profile.firstName} ${user.profile.lastName?.charAt(0) || ""}`.trim()
        : "Staff";

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                internalNotes: [
                  {
                    author,
                    text: note,
                    timeAgo: "Just now",
                  },
                  ...o.internalNotes,
                ],
              }
            : o
        ),
      }));
    },

    getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
    getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),
    getCountByStatus: (status) => {
      const serverCount = get().statusCounts[status];
      if (serverCount !== undefined) return serverCount;
      return get().orders.filter((o) => o.status === status).length;
    },

    setupSse: (propertyId) => {
      if (typeof window === "undefined") return;
      
      // Clean up previous event source if any
      if (staffEventSource) {
        staffEventSource.close();
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
      const token = getToken() || "";
      console.log(`🔌 Establishing Staff SSE connection to property ${propertyId}...`);
      
      const es = new EventSource(`${apiBase}/staff/orders/property/${propertyId}/stream?token=${token}`);
      staffEventSource = es;

      es.addEventListener("new-order", (event) => {
        try {
          const backendOrder = JSON.parse(event.data);
          if (backendOrder.status === "PAYMENT_PENDING" || backendOrder.status === "payment_pending") return;
          console.log("📩 Staff SSE: new-order received:", backendOrder);
          const converted = convertBackendOrder(backendOrder);
          
          set((state) => {
            if (state.orders.some((o) => o.id === converted.id)) {
              return state;
            }
            return {
              orders: [converted, ...state.orders],
            };
          });
        } catch (err) {
          console.error("❌ Failed to parse new-order SSE event:", err);
        }
      });

      es.addEventListener("status-update", (event) => {
        try {
          const backendOrder = JSON.parse(event.data);
          if (backendOrder.status === "PAYMENT_PENDING" || backendOrder.status === "payment_pending") return;
          console.log("📩 Staff SSE: status-update received:", backendOrder);
          const converted = convertBackendOrder(backendOrder);
          
          set((state) => {
            const exists = state.orders.some((o) => o.id === converted.id);
            if (!exists) {
              return {
                orders: [converted, ...state.orders],
              };
            }
            return {
              orders: state.orders.map((o) =>
                o.id === converted.id ? { ...o, status: converted.status, history: converted.history } : o
              ),
            };
          });
        } catch (err) {
          console.error("❌ Failed to parse status-update SSE event:", err);
        }
      });

      let reconnectDelay = 1000;
      es.onerror = (err) => {
        console.warn("⚠️ Staff SSE connection error (will auto-reconnect):", err);
        // Close current connection - browser will auto-reconnect for EventSource
        // If it keeps failing, we just log it silently
        if (staffEventSource?.readyState === EventSource.CLOSED) {
          console.log(`🔌 SSE closed, reconnecting in ${reconnectDelay}ms...`);
          setTimeout(() => {
            if (reconnectDelay < 30000) reconnectDelay *= 2;
            get().setupSse(propertyId);
          }, reconnectDelay);
        }
      };
    },

    stopSse: () => {
      if (staffEventSource) {
        console.log("🔌 Closing Staff SSE connection...");
        staffEventSource.close();
        staffEventSource = null;
      }
    },

    reset: () => {
      if (staffEventSource) {
        staffEventSource.close();
        staffEventSource = null;
      }
      if (activeQueueAbortController) {
        activeQueueAbortController.abort();
        activeQueueAbortController = null;
      }
      set({
        orders: [],
        loading: false,
        error: null,
        toast: null,
        statusCounts: {},
        queue: {
          items: [],
          status: "placed",
          page: 0,
          size: ORDER_PAGE_SIZE,
          totalPages: 0,
          totalElements: 0,
          loading: false,
          error: null,
        },
      });
    },
  }),
  {
    name: 'staff-orders-storage',
    partialize: (state) => ({ orders: state.orders }),
  }
)
);
