import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { propertiesApi, type RoomStatus } from "@/api/properties/properties.api";

// QR session context

export interface QRContextData {
  qrId: string; // Unique QR ID
  propertyId: number; // Property ID for fetching menu
  location?: string; // Unified location string from QR
  propertyName: string; // Name of the property
  locationLabel: string; // Location/Table name or Room number
  type: string; // QR type (DINING_TABLE, ROOM, etc.)
  name: string; // Full name of the QR context
  status: string; // ACTIVE or INACTIVE
}

type OrderContextState = {
  loading: boolean;
  error: string | null;
  qrContext: QRContextData | null;
  roomStatus: RoomStatus | null;
  roomStatusLoading: boolean;
};

type OrderContextActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  setQRContext: (context: QRContextData | null) => void;
  /** For ROOM-type QR contexts: looks up whether that room number is currently
   * checked in at the front desk. Ordering to a room is gated on this. */
  fetchRoomStatus: (propertyId: number, roomNumber: string) => Promise<void>;
  reset: () => void;
};

export const useOrderContextStore = create<OrderContextState & OrderContextActions>()(
  persist(
    (set) => ({
      loading: false,
      error: null,
      qrContext: null,
      roomStatus: null,
      roomStatusLoading: false,

      setLoading: (value) => set({ loading: value }),
      setError: (message) => set({ error: message }),
      setQRContext: (context) => set({ qrContext: context, roomStatus: null }),

      fetchRoomStatus: async (propertyId, roomNumber) => {
        set({ roomStatusLoading: true });
        try {
          const status = await propertiesApi.getRoomStatus(propertyId, roomNumber);
          set({ roomStatus: status, roomStatusLoading: false });
        } catch {
          set({ roomStatus: null, roomStatusLoading: false });
        }
      },

      reset: () => set({ loading: false, error: null, qrContext: null, roomStatus: null, roomStatusLoading: false }),
    }),
    {
      name: "order-context-storage",
      storage: createJSONStorage(() => sessionStorage),
      // Room status is live, session-transient state — always re-fetch fresh
      // rather than trusting a stale cached "checked in" flag from storage.
      partialize: (state) => ({ qrContext: state.qrContext }),
    }
  )
);
