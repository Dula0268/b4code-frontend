import { create } from "zustand";

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

// ─── Mock Data ─────────────────────────────────────────────────────────────────
function createMockOrders(): Order[] {
  return [
    {
      id: "#ORD-1234",
      time: "12:45 PM",
      timeAgo: "5m ago",
      table: "Table 05",
      type: "Dine-in",
      room: "Room 305",
      guest: "Mr. John Doe",
      items: [
        { qty: 1, name: "Spicy Beef Burger", price: 1900, tag: "Hot", tagColor: "bg-red-100 text-red-700" },
        { qty: 2, name: "French Fries (L)", price: 800 },
        { qty: 1, name: "Coke Zero", price: 400, tag: "Cold", tagColor: "bg-blue-100 text-blue-700" },
      ],
      note: "+ No ice for drinks",
      subtotal: 3900,
      serviceCharge: 390,
      total: 4290,
      totalItems: 3,
      status: "placed",
      isUrgent: true,
      history: [{ label: "Order Placed", time: "12:45 PM", detail: "via Guest App", color: "green" }],
      internalNotes: [
        { author: "Sarah Jenkins", text: "Guest requested extra spicy sauce on the side if possible. Confirmed with kitchen.", timeAgo: "10 mins ago" },
      ],
    },
    {
      id: "#ORD-1235",
      time: "12:40 PM",
      timeAgo: "10m ago",
      table: "Table 12",
      type: "Dine-in",
      room: "Room 202",
      guest: "Ms. Sarah Lee",
      items: [
        { qty: 2, name: "Grilled Chicken Wrap", price: 1600 },
        { qty: 1, name: "Caesar Salad", price: 1200 },
        { qty: 2, name: "Iced Tea", price: 500, tag: "Cold", tagColor: "bg-blue-100 text-blue-700" },
      ],
      subtotal: 4900,
      serviceCharge: 490,
      total: 5390,
      totalItems: 3,
      status: "placed",
      isUrgent: true,
      history: [{ label: "Order Placed", time: "12:40 PM", detail: "via Guest App", color: "green" }],
      internalNotes: [],
    },
    {
      id: "#ORD-1236",
      time: "12:38 PM",
      timeAgo: "12m ago",
      table: "Table 03",
      type: "Dine-in",
      room: "Room 104",
      guest: "Mr. Tom Park",
      items: [
        { qty: 1, name: "Margherita Pizza", price: 1800, tag: "Medium Spice", tagColor: "bg-orange-100 text-orange-700" },
        { qty: 1, name: "Garlic Bread", price: 600 },
        { qty: 1, name: "Sprite", price: 400, tag: "Cold", tagColor: "bg-blue-100 text-blue-700" },
      ],
      note: "+ Extra cheese on pizza",
      subtotal: 2800,
      serviceCharge: 280,
      total: 3080,
      totalItems: 3,
      status: "placed",
      isUrgent: false,
      history: [{ label: "Order Placed", time: "12:38 PM", detail: "via Guest App", color: "green" }],
      internalNotes: [],
    },
    {
      id: "#ORD-1230",
      time: "12:30 PM",
      timeAgo: "20m ago",
      table: "Table 08",
      type: "Dine-in",
      room: "Room 301",
      guest: "Ms. Amy Chen",
      items: [
        { qty: 1, name: "Chicken Kottu", price: 1900, tag: "Medium Spice", tagColor: "bg-orange-100 text-orange-700" },
        { qty: 2, name: "Lime Juice", price: 700, tag: "Cold", tagColor: "bg-blue-100 text-blue-700", note: "No sugar, extra ice" },
      ],
      subtotal: 3300,
      serviceCharge: 330,
      total: 3630,
      totalItems: 3,
      status: "accepted",
      isUrgent: false,
      prepTime: "8m",
      history: [
        { label: "Order Confirmed", time: "12:32 PM", detail: "Auto-confirmed", color: "green" },
        { label: "Payment Authorized", time: "12:30 PM", detail: "Room Charge", color: "gray" },
        { label: "Order Placed", time: "12:30 PM", detail: "via Guest App", color: "green" },
      ],
      internalNotes: [
        { author: "Sarah Jenkins", text: "Guest requested extra spicy sauce on the side if possible. Confirmed with kitchen.", timeAgo: "10 mins ago" },
      ],
    },
    {
      id: "#ORD-1231",
      time: "12:25 PM",
      timeAgo: "25m ago",
      table: "Table 15",
      type: "Dine-in",
      room: "Room 405",
      guest: "Mr. James Wu",
      items: [
        { qty: 3, name: "Fish & Chips", price: 1500 },
        { qty: 3, name: "Lemonade", price: 500, tag: "Cold", tagColor: "bg-blue-100 text-blue-700" },
      ],
      subtotal: 6000,
      serviceCharge: 600,
      total: 6600,
      totalItems: 2,
      status: "accepted",
      isUrgent: false,
      prepTime: "12m",
      history: [
        { label: "Order Confirmed", time: "12:27 PM", detail: "Auto-confirmed", color: "green" },
        { label: "Order Placed", time: "12:25 PM", detail: "via Guest App", color: "green" },
      ],
      internalNotes: [],
    },
    {
      id: "#ORD-1228",
      time: "12:15 PM",
      timeAgo: "35m ago",
      table: "Table 01",
      type: "Dine-in",
      room: "Room 501",
      guest: "Ms. Lisa Kim",
      items: [
        { qty: 1, name: "Steak Medium Rare", price: 3500 },
        { qty: 1, name: "Mashed Potato", price: 800 },
        { qty: 1, name: "Red Wine", price: 2500 },
      ],
      subtotal: 6800,
      serviceCharge: 680,
      total: 7480,
      totalItems: 3,
      status: "in-progress",
      isUrgent: false,
      prepTime: "15m",
      history: [
        { label: "Order Preparing", time: "12:20 PM", detail: "By Joe Ducket", color: "yellow" },
        { label: "Order Confirmed", time: "12:17 PM", detail: "Auto-confirmed", color: "green" },
        { label: "Order Placed", time: "12:15 PM", detail: "via Guest App", color: "green" },
      ],
      internalNotes: [],
    },
    {
      id: "#ORD-1225",
      time: "11:50 AM",
      timeAgo: "1h ago",
      table: "Table 10",
      type: "Dine-in",
      room: "Room 203",
      guest: "Mr. Alex Wong",
      items: [
        { qty: 2, name: "Pad Thai", price: 1600 },
        { qty: 2, name: "Spring Rolls", price: 800 },
        { qty: 2, name: "Thai Iced Tea", price: 500, tag: "Cold", tagColor: "bg-blue-100 text-blue-700" },
      ],
      subtotal: 5800,
      serviceCharge: 580,
      total: 6380,
      totalItems: 3,
      status: "in-progress",
      isUrgent: false,
      prepTime: "10m",
      history: [
        { label: "Order Preparing", time: "11:55 AM", detail: "By Joe Ducket", color: "yellow" },
        { label: "Order Confirmed", time: "11:52 AM", detail: "Auto-confirmed", color: "green" },
        { label: "Order Placed", time: "11:50 AM", detail: "via Guest App", color: "green" },
      ],
      internalNotes: [],
    },
    {
      id: "#ORD-1220",
      time: "11:30 AM",
      timeAgo: "1h 20m ago",
      table: "Table 07",
      type: "Dine-in",
      room: "Room 102",
      guest: "Ms. Nina Patel",
      items: [
        { qty: 1, name: "Seafood Pasta", price: 2200 },
        { qty: 1, name: "Bruschetta", price: 900 },
        { qty: 1, name: "White Wine", price: 2000 },
      ],
      subtotal: 5100,
      serviceCharge: 510,
      total: 5610,
      totalItems: 3,
      status: "ready",
      isUrgent: false,
      prepTime: "18m",
      history: [
        { label: "Order Prepared and Ready", time: "11:48 AM", detail: "By Joe Ducket", color: "green" },
        { label: "Order Preparing", time: "11:35 AM", detail: "By Joe Ducket", color: "yellow" },
        { label: "Order Confirmed", time: "11:32 AM", detail: "Auto-confirmed", color: "green" },
      ],
      internalNotes: [],
    },
    {
      id: "#ORD-1218",
      time: "11:15 AM",
      timeAgo: "1h 35m ago",
      table: "Table 04",
      type: "Dine-in",
      room: "Room 305",
      guest: "Mr. David Chen",
      items: [
        { qty: 1, name: "Lamb Biryani", price: 2500 },
        { qty: 2, name: "Naan Bread", price: 400 },
        { qty: 1, name: "Mango Lassi", price: 600 },
      ],
      subtotal: 3900,
      serviceCharge: 390,
      total: 4290,
      totalItems: 3,
      status: "delivered",
      isUrgent: false,
      prepTime: "20m",
      history: [
        { label: "Order Delivered", time: "11:45 AM", detail: "By David Chen", color: "green" },
        { label: "Order Prepared and Ready", time: "11:35 AM", detail: "By Joe Ducket", color: "green" },
        { label: "Order Preparing", time: "11:20 AM", detail: "By Joe Ducket", color: "yellow" },
      ],
      internalNotes: [],
    },
    {
      id: "#ORD-1215",
      time: "10:45 AM",
      timeAgo: "2h ago",
      table: "Table 02",
      type: "Dine-in",
      room: "Room 401",
      guest: "Ms. Rachel Green",
      items: [
        { qty: 1, name: "Club Sandwich", price: 1400 },
        { qty: 1, name: "French Onion Soup", price: 1100 },
        { qty: 1, name: "Orange Juice", price: 500 },
      ],
      subtotal: 3000,
      serviceCharge: 300,
      total: 3300,
      totalItems: 3,
      status: "completed",
      isUrgent: false,
      prepTime: "12m",
      history: [
        { label: "Order Completed", time: "11:20 AM", detail: "Auto-completed", color: "green" },
        { label: "Order Delivered", time: "11:10 AM", detail: "By David Chen", color: "green" },
        { label: "Order Prepared and Ready", time: "11:00 AM", detail: "By Joe Ducket", color: "green" },
      ],
      internalNotes: [],
    },
  ];
}

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
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  advanceStatus: (orderId: string) => void;
  clearToast: () => void;
  addInternalNote: (orderId: string, note: string) => void;
  getOrder: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getCountByStatus: (status: OrderStatus) => number;
  reset: () => void;
};

export const useStaffOrdersStore = create<StaffOrdersState & StaffOrdersActions>(
  (set, get) => ({
    orders: createMockOrders(),
    loading: false,
    error: null,
    toast: null,

    setLoading: (value) => set({ loading: value }),
    setError: (message) => set({ error: message }),

    acceptOrder: (orderId) => {
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
    },

    rejectOrder: (orderId, reason) => {
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
    },

    advanceStatus: (orderId) => {
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
