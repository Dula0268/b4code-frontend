import { create } from "zustand";

// QR session context

export interface QRContextData {
  qrId: string; // Unique QR ID
  propertyId: number; // Property ID for fetching menu
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
};

type OrderContextActions = {
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  setQRContext: (context: QRContextData | null) => void;
  reset: () => void;
};

export const useOrderContextStore = create<OrderContextState & OrderContextActions>((set) => ({
  loading: false,
  error: null,
  qrContext: null,

  setLoading: (value) => set({ loading: value }),
  setError: (message) => set({ error: message }),
  setQRContext: (context) => set({ qrContext: context }),
  reset: () => set({ loading: false, error: null, qrContext: null }),
}));

