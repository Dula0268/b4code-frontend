import { create } from "zustand";
import { getToken } from "@/lib/token";
import { staffApi, type OwnerReservationDto } from "@/api/staff/staff.api";

let bookingsEventSource: EventSource | null = null;

type StaffBookingsState = {
  unreadCount: number;
  unreadMessagesCount: number;
  unreadOrderMessagesCount: number;
  reservations: OwnerReservationDto[];
  loading: boolean;
  error: string | null;
};

type StaffBookingsActions = {
  setupSse: (propertyId: number) => void;
  stopSse: () => void;
  resetUnreadCount: () => void;
  resetUnreadMessagesCount: () => void;
  setUnreadMessagesCount: (count: number) => void;
  setUnreadOrderMessagesCount: (count: number) => void;
  fetchReservations: (propertyId: number) => Promise<void>;
  checkIn: (propertyId: number, id: number, roomNumber: string) => Promise<void>;
  checkOut: (propertyId: number, id: number) => Promise<void>;
  takePayment: (propertyId: number, id: number, nicNumber: string) => Promise<void>;
};

export const useStaffBookingsStore = create<StaffBookingsState & StaffBookingsActions>((set, get) => ({
  unreadCount: 0,
  unreadMessagesCount: 0,
  unreadOrderMessagesCount: 0,
  reservations: [],
  loading: false,
  error: null,

  fetchReservations: async (propertyId) => {
    set({ loading: true, error: null });
    try {
      const data = await staffApi.getReservations(propertyId);
      set({ reservations: data, loading: false });
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || "Unknown error";
      set({ error: errMsg, loading: false });
    }
  },

  checkIn: async (propertyId, id, roomNumber) => {
    const updated = await staffApi.checkInReservation(propertyId, id, roomNumber);
    set((state) => ({
      reservations: state.reservations.map((r) => (r.id === id ? { ...r, status: "CHECKED_IN", roomNumber: updated.roomNumber } : r)),
    }));
  },

  checkOut: async (propertyId, id) => {
    await staffApi.checkOutReservation(propertyId, id);
    set((state) => ({
      reservations: state.reservations.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)),
    }));
  },

  takePayment: async (propertyId, id, nicNumber) => {
    await staffApi.takePayment(propertyId, id, nicNumber);
    set((state) => ({
      reservations: state.reservations.map((r) => (r.id === id ? { ...r, isPaid: true } : r)),
    }));
  },

  setupSse: (propertyId) => {
    if (typeof window === "undefined") return;

    if (bookingsEventSource) {
      bookingsEventSource.close();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
    const token = getToken() || "";

    console.log(`🔌 Establishing Staff Bookings SSE connection to property ${propertyId}...`);

    const es = new EventSource(`${apiBase}/staff/properties/${propertyId}/reservations/stream?token=${token}`);
    bookingsEventSource = es;

    es.addEventListener("new-booking", (event) => {
      console.log("📩 Staff Bookings SSE: new-booking received:", event.data);
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
      get().fetchReservations(propertyId);
    });

    es.addEventListener("booking-update", (event) => {
      console.log("📩 Staff Bookings SSE: booking-update received:", event.data);
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
      get().fetchReservations(propertyId);
    });

    es.addEventListener("new-message", (event) => {
      console.log("📩 Staff Bookings SSE: new-message received:", event.data);
      set((state) => ({ unreadMessagesCount: state.unreadMessagesCount + 1 }));
    });

    let reconnectDelay = 1000;
    es.onerror = (err) => {
      console.warn("⚠️ Staff Bookings SSE connection error (will auto-reconnect):", err);
      if (bookingsEventSource?.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          if (reconnectDelay < 30000) reconnectDelay *= 2;
          get().setupSse(propertyId);
        }, reconnectDelay);
      }
    };
  },

  stopSse: () => {
    if (bookingsEventSource) {
      console.log("🔌 Closing Staff Bookings SSE connection...");
      bookingsEventSource.close();
      bookingsEventSource = null;
    }
  },

  resetUnreadCount: () => set({ unreadCount: 0 }),
  resetUnreadMessagesCount: () => set({ unreadMessagesCount: 0 }),
  setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),
  setUnreadOrderMessagesCount: (count) => set({ unreadOrderMessagesCount: count }),
}));
