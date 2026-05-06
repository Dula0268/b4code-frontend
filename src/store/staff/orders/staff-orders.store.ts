import { create } from "zustand";
import api from "@/lib/axios";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "placed"
  | "accepted"
  | "in-progress"
  | "ready"
  | "delivered"
  | "completed"
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
  subtotal: number;
  serviceCharge: number;
  total: number;
  totalItems: number;
  status: OrderStatus;
  isUrgent: boolean;
  prepTime?: string;
  history: HistoryEntry[];
  internalNotes: { author: string; text: string; timeAgo: string }[];
}

// ─── Next status mapping ───────────────────────────────────────────────────────
const STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "accepted",
  accepted: "in-progress",
  "in-progress": "ready",
  ready: "delivered",
  delivered: "completed",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  accepted: "Order Confirmed",
  "in-progress": "Order Preparing",
  ready: "Order Prepared and Ready",
  delivered: "Order Delivered",
  completed: "Order Completed",
  cancelled: "Order Rejected",
};

// ─── Initialize empty orders (populated from API) ─────────────────────────────

// ─── State ─────────────────────────────────────────────────────────────────────
type StaffOrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  toast: { type: "success" | "error"; message: string; detail: string } | null;
};

type StaffOrdersActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  fetchOrders: (propertyId: number) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason?: string) => Promise<void>;
  advanceStatus: (orderId: string) => Promise<void>;
  clearToast: () => void;
  addInternalNote: (orderId: string, note: string) => void;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getCountByStatus: (status: OrderStatus) => number;
  reset: () => void;
};

// Helper function to map backend status to frontend status
function mapBackendStatusToFrontend(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    NEW: "placed",
    PREPARING: "in-progress",
    READY: "ready",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };
  return statusMap[status] || "placed";
}

// Helper function to map frontend status to backend status
function mapFrontendStatusToBackend(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    placed: "NEW",
    accepted: "PREPARING",
    "in-progress": "PREPARING",
    ready: "READY",
    delivered: "DELIVERED",
    completed: "DELIVERED",
    cancelled: "CANCELLED",
  };
  return statusMap[status] || "NEW";
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

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

// Helper function to convert backend order to frontend order
interface BackendOrderResponse {
  id: number;
  roomNumber: string;
  guestId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}
function convertBackendOrder(backendOrder: BackendOrderResponse): Order {
  const createdAt = new Date(backendOrder.createdAt);
  const status = mapBackendStatusToFrontend(backendOrder.status);
  
  return {
    id: `#ORD-${backendOrder.id}`,
    time: createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    timeAgo: getTimeAgo(createdAt),
    table: backendOrder.roomNumber || "Unknown",
    type: "Room Service",
    room: backendOrder.roomNumber,
    guest: `Guest ${backendOrder.guestId}`,
    items: [],
    subtotal: backendOrder.totalAmount * 0.9,
    serviceCharge: backendOrder.totalAmount * 0.1 * 0.1,
    total: backendOrder.totalAmount,
    totalItems: 0,
    status,
    isUrgent: status === "placed" || status === "in-progress",
    history: [
      {
        label: STATUS_LABELS[status],
        time: createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        detail: "From Backend",
        color: (status === "in-progress" ? "yellow" : "green") as const,
      },
    ],
    internalNotes: [],
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

export const useStaffOrdersStore = create<StaffOrdersState & StaffOrdersActions>(
  (set, get) => ({
    orders: [],
    loading: false,
    error: null,
    toast: null,

    setLoading: (value) => set({ loading: value }),
    setError: (message) => set({ error: message }),

    fetchOrders: async (propertyId: number) => {
      set({ loading: true, error: null });
      console.log(`🔄 Fetching orders for property ${propertyId}...`);
      try {
        const response = await api.get(`/staff/orders/property/${propertyId}`);
        const backendOrders = response.data;
        console.log(`✅ Received ${backendOrders.length} orders from backend:`, backendOrders);
        const orders = backendOrders.map(convertBackendOrder);
        console.log(`✅ Converted to frontend format:`, orders);
        set({ orders, loading: false });
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to fetch orders");
        console.error(`❌ Failed to fetch orders:`, error);
        set({ error: errorMessage, loading: false });
        // Keep existing orders on error
      }
    },

    acceptOrder: async (orderId) => {
      try {
        const orderIdNum = parseInt(orderId.replace("#ORD-", ""));
        await api.patch(`/staff/orders/${orderIdNum}/accept`);
        
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "accepted" as OrderStatus,
                  history: [
                    {
                      label: "Order Confirmed",
                      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                      detail: "Auto-confirmed",
                      color: "green" as const,
                    },
                    ...o.history,
                  ],
                }
              : o
          ),
          toast: {
            type: "success",
            message: "Order Accepted",
            detail: `Order ${orderId} accepted`,
          },
        }));
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to accept order");
        set({ error: errorMessage });
      }
    },

    rejectOrder: async (orderId, reason) => {
      try {
        const orderIdNum = parseInt(orderId.replace("#ORD-", ""));
        await api.patch(`/staff/orders/${orderIdNum}/reject`);
        
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "cancelled" as OrderStatus,
                  history: [
                    {
                      label: "Order Rejected",
                      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                      detail: reason || "Rejected by staff",
                      color: "gray" as const,
                    },
                    ...o.history,
                  ],
                }
              : o
          ),
          toast: {
            type: "error",
            message: "Order Rejected",
            detail: `Order ${orderId} Rejected`,
          },
        }));
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to reject order");
        set({ error: errorMessage });
      }
    },

    advanceStatus: async (orderId) => {
      try {
        const orderIdNum = parseInt(orderId.replace("#ORD-", ""));
        // Get current order to determine next action
        const currentOrder = get().orders.find((o) => o.id === orderId);
        if (!currentOrder) return;

        let endpoint = "";
        const status = currentOrder.status;
        
        if (status === "placed") {
          endpoint = `/staff/orders/${orderIdNum}/accept`;
        } else if (status === "accepted" || status === "in-progress") {
          endpoint = `/staff/orders/${orderIdNum}/ready`;
        } else if (status === "ready") {
          endpoint = `/staff/orders/${orderIdNum}/deliver`;
        }

        if (endpoint) {
          await api.patch(endpoint);
          
          set((state) => ({
            orders: state.orders.map((o) => {
              if (o.id !== orderId) return o;
              const nextStatus = STATUS_FLOW[o.status];
              if (!nextStatus) return o;
              return {
                ...o,
                status: nextStatus,
                history: [
                  {
                    label: STATUS_LABELS[nextStatus],
                    time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                    detail: nextStatus === "completed" ? "Auto-completed" : "By Staff",
                    color: (nextStatus === "in-progress" ? "yellow" : "green") as "green" | "yellow" | "gray",
                  },
                  ...o.history,
                ],
              };
            }),
          }));
        }
      } catch (error: unknown) {
        const errorMessage = extractApiErrorMessage(error, "Failed to advance order status");
        set({ error: errorMessage });
      }
    },

    clearToast: () => set({ toast: null }),

    addInternalNote: (orderId, note) => {
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                internalNotes: [
                  {
                    author: "Alex M.",
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
    getCountByStatus: (status) => get().orders.filter((o) => o.status === status).length,

    reset: () => set({ orders: createMockOrders(), loading: false, error: null, toast: null }),
  })
);
