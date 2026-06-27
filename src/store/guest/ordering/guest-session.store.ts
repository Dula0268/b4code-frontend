import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

type GuestSessionState = {
  sessionId: string | null;
  propertyId: number | null;
  tableNumber: string | null;
  createdAt: number | null;

  guestName: string | null;
  guestPhone: string | null;

  initializeSession: (propertyId: number, tableNumber: string) => void;
  setGuestDetails: (name: string, phone: string) => void;
  clearSession: () => void;
};

// 12 hours in milliseconds
const SESSION_EXPIRY = 12 * 60 * 60 * 1000;

export const useGuestSessionStore = create<GuestSessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      propertyId: null,
      tableNumber: null,
      createdAt: null,

      guestName: null,
      guestPhone: null,

      initializeSession: (propertyId, tableNumber) => {
        const now = Date.now();
        const state = get();

        // Check if session exists and is not expired
        if (state.sessionId && state.createdAt && now - state.createdAt < SESSION_EXPIRY) {
          // Update table and property if they changed
          if (state.tableNumber !== tableNumber || state.propertyId !== propertyId) {
            set({ propertyId, tableNumber, createdAt: now });
          }
          return;
        }

        // Create new session
        set({
          sessionId: uuidv4(),
          propertyId,
          tableNumber,
          createdAt: now,
          // Do not clear guestName/guestPhone here so it survives across sessions if wanted, 
          // or we can clear them. We'll let them persist for convenience.
        });
      },

      setGuestDetails: (name, phone) => {
        set({ guestName: name, guestPhone: phone });
      },

      clearSession: () => {
        set({
          sessionId: null,
          propertyId: null,
          tableNumber: null,
          createdAt: null,
          guestName: null,
          guestPhone: null,
        });
      },
    }),
    {
      name: "guest-session-store",
    }
  )
);
