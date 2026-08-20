import { create } from "zustand";
import { getToken } from "@/lib/token";

let bookingsEventSource: EventSource | null = null;

type StaffBookingsState = {
  unreadCount: number;
  unreadMessagesCount: number;
};

type StaffBookingsActions = {
  setupSse: (propertyId: number, onUpdate?: () => void) => void;
  stopSse: () => void;
  resetUnreadCount: () => void;
  resetUnreadMessagesCount: () => void;
  setUnreadMessagesCount: (count: number) => void;
};

export const useStaffBookingsStore = create<StaffBookingsState & StaffBookingsActions>((set, get) => ({
  unreadCount: 0,
  unreadMessagesCount: 0,

  setupSse: (propertyId, onUpdate) => {
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
      if (onUpdate) onUpdate();
    });

    es.addEventListener("booking-update", (event) => {
      console.log("📩 Staff Bookings SSE: booking-update received:", event.data);
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
      if (onUpdate) onUpdate();
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
          get().setupSse(propertyId, onUpdate);
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
}));
