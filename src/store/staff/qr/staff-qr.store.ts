import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type QRType = "Dining Table" | "Room" | "Outdoor" | "Bar";
export type QRStatus = "active" | "inactive";
export type QRTab = "Table" | "Room";

export interface QRContext {
  id: string;
  name: string;
  location: string;
  type: QRType;
  tab: QRTab;
  status: QRStatus;
  description: string;
  qrId: string;
  createdAt: string;
  instructionText: string;
  showRoomNumber: boolean;
  showLogo: boolean;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_QRS: QRContext[] = [
  { id: "qr-1", name: "Table 01", location: "Main Hall", type: "Dining Table", tab: "Table", status: "active", description: "", qrId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", createdAt: "Oct 24, 2023 at 10:45 AM", instructionText: "Scan to Order Food", showRoomNumber: true, showLogo: true },
  { id: "qr-2", name: "Patio A", location: "Outdoor Garden", type: "Outdoor", tab: "Table", status: "inactive", description: "Outdoor seating area near the pool", qrId: "b2c3d4e5-f6a7-8901-bcde-f12345678901", createdAt: "Oct 22, 2023 at 3:30 PM", instructionText: "Scan to Order Food", showRoomNumber: true, showLogo: true },
  { id: "qr-3", name: "Table 02", location: "Main Hall", type: "Dining Table", tab: "Table", status: "active", description: "", qrId: "c3d4e5f6-a7b8-9012-cdef-123456789012", createdAt: "Oct 20, 2023 at 9:00 AM", instructionText: "Scan to Order Food", showRoomNumber: true, showLogo: true },
  { id: "qr-4", name: "Pool Bar 01", location: "Poolside", type: "Bar", tab: "Table", status: "active", description: "Main poolside bar counter", qrId: "d4e5f6a7-b8c9-0123-defa-234567890123", createdAt: "Oct 18, 2023 at 11:15 AM", instructionText: "Scan to Order Drinks", showRoomNumber: true, showLogo: true },
  { id: "qr-5", name: "Room 101", location: "1st Floor", type: "Room", tab: "Room", status: "active", description: "Standard room", qrId: "e5f6a7b8-c9d0-1234-efab-345678901234", createdAt: "Oct 15, 2023 at 2:00 PM", instructionText: "Scan for Room Service", showRoomNumber: true, showLogo: true },
  { id: "qr-6", name: "Room 205", location: "2nd Floor", type: "Room", tab: "Room", status: "active", description: "Deluxe suite", qrId: "f6a7b8c9-d0e1-2345-fabc-456789012345", createdAt: "Oct 12, 2023 at 8:30 AM", instructionText: "Scan for Room Service", showRoomNumber: true, showLogo: true },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

interface StaffQRState {
  qrs: QRContext[];
  successMsg: string | null;
}

interface StaffQRActions {
  getQR: (id: string) => QRContext | undefined;
  addQR: (data: Omit<QRContext, "id" | "qrId" | "createdAt">) => string;
  updateQR: (id: string, data: Partial<QRContext>) => void;
  deleteQR: (id: string) => void;
  toggleStatus: (id: string) => void;
  setSuccess: (msg: string | null) => void;
}

let nextId = 100;

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const useStaffQRStore = create<StaffQRState & StaffQRActions>((set, get) => ({
  qrs: MOCK_QRS,
  successMsg: null,

  getQR: (id) => get().qrs.find((q) => q.id === id),

  addQR: (data) => {
    const id = `qr-${nextId++}`;
    const now = new Date();
    const createdAt = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " at " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const qr: QRContext = { ...data, id, qrId: generateUUID(), createdAt };
    set((s) => ({ qrs: [qr, ...s.qrs] }));
    return id;
  },

  updateQR: (id, data) =>
    set((s) => ({ qrs: s.qrs.map((q) => (q.id === id ? { ...q, ...data } : q)) })),

  deleteQR: (id) => set((s) => ({ qrs: s.qrs.filter((q) => q.id !== id) })),

  toggleStatus: (id) =>
    set((s) => ({
      qrs: s.qrs.map((q) =>
        q.id === id ? { ...q, status: q.status === "active" ? "inactive" : "active" } : q
      ),
    })),

  setSuccess: (msg) => set({ successMsg: msg }),
}));

