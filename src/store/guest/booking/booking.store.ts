import { create } from "zustand";

// ─── Booking Types ────────────────────────────────────────────────────────────
export type BookingStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "online" | "property";

export interface StoredBooking {
  id: string;
  confirmationCode: string;
  status: BookingStatus;
  property: string;
  propertyId: string;
  location: string;
  imageSrc: string;
  roomName: string;
  roomId: string;
  checkIn: string;       // ISO date string e.g. "2026-10-12"
  checkOut: string;      // ISO date string e.g. "2026-10-16"
  checkInFormatted: string;  // "Oct 12"
  checkOutFormatted: string; // "Oct 16, 2026"
  guests: number;
  guestsLabel: string;
  nights: number;
  nightsLabel: string;
  totalPrice: number;
  basePrice: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  paymentMethod: PaymentMethod;
  paidInFull: boolean;
  nationalId?: string;
  bookedAt: string;      // ISO timestamp
  userEmail: string;
}

// ─── State & Actions ──────────────────────────────────────────────────────────
type GuestBookingState = {
  bookings: StoredBooking[];
  loading: boolean;
  error: string | null;
};

type GuestBookingActions = {
  addBooking: (booking: StoredBooking) => void;
  getBookingByCode: (code: string) => StoredBooking | undefined;
  getBookingsByEmail: (email: string) => StoredBooking[];
  cancelBooking: (id: string) => void;
  modifyBooking: (id: string, updates: Partial<StoredBooking>) => void;
  updateBookingStatus: (code: string, updates: Partial<StoredBooking>) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  fetchUserBookings: (email: string) => Promise<void>;
  reset: () => void;
};

// ─── LocalStorage persistence ─────────────────────────────────────────────────
const STORAGE_KEY = "PRIMESTAY_BOOKINGS";

const loadBookings = (): StoredBooking[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveBookings = (bookings: StoredBooking[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useGuestBookingStore = create<GuestBookingState & GuestBookingActions>(
  (set, get) => ({
    bookings: loadBookings(),
    loading: false,
    error: null,

    addBooking: (booking) => {
      const updated = [booking, ...get().bookings];
      saveBookings(updated);
      set({ bookings: updated });
    },

    getBookingByCode: (code) => {
      return get().bookings.find((b) => b.confirmationCode === code);
    },

    getBookingsByEmail: (email) => {
      return get().bookings.filter(
        (b) => b.userEmail.toLowerCase() === email.toLowerCase()
      );
    },

    updateBookingStatus: (code, updates) => {
      const updated = get().bookings.map((b) =>
        b.confirmationCode === code ? { ...b, ...updates } : b
      );
      saveBookings(updated);
      set({ bookings: updated });
    },

    cancelBooking: (id) => {
      const updated = get().bookings.map((b) =>
        b.id === id ? { ...b, status: "CANCELLED" as BookingStatus } : b
      );
      saveBookings(updated);
      set({ bookings: updated });
    },

    modifyBooking: (id, updates) => {
      const updated = get().bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveBookings(updated);
      set({ bookings: updated });
    },

    setLoading: (value) => set({ loading: value }),
    setError: (message) => set({ error: message }),

    fetchUserBookings: async (email) => {
      if (!email) return;
      set({ loading: true, error: null });
      try {
        const { guestApi } = await import("@/lib/api");
        const data = await guestApi.getGuestBookings(email);
        
        // Map backend BookingResponse to StoredBooking
        const mapped: StoredBooking[] = data.map((b: any) => ({
          id: String(b.bookingId),
          confirmationCode: b.confirmationNumber,
          status: b.status,
          property: b.propertyName,
          propertyId: String(b.propertyId),
          location: b.propertyAddress,
          imageSrc: "", // Backend doesn't return property image in booking response currently
          roomName: b.roomName,
          roomId: String(b.roomId),
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          checkInFormatted: new Date(b.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          checkOutFormatted: new Date(b.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          guests: b.guestCount,
          guestsLabel: `${b.guestCount} Guest${b.guestCount !== 1 ? "s" : ""}`,
          nights: b.nights,
          nightsLabel: `${b.nights} Night${b.nights !== 1 ? "s" : ""}`,
          totalPrice: b.totalAmount,
          basePrice: b.totalAmount, // Backend summary doesn't separate these
          taxes: 0,
          serviceFee: 0,
          discount: 0,
          paymentMethod: b.paymentMethod === "ONLINE_CARD" ? "online" : "property",
          paidInFull: b.paymentMethod === "ONLINE_CARD",
          bookedAt: b.createdAt,
          userEmail: b.guestEmail
        }));

        set({ bookings: mapped, loading: false });
        saveBookings(mapped);
      } catch (err: any) {
        set({ error: err.message || "Failed to fetch bookings", loading: false });
      }
    },

    reset: () => set({ loading: false, error: null }),
  })
);
