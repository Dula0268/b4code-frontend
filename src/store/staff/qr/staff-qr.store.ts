import { create } from "zustand";
import api, { BASE_URL } from "@/lib/axios";

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
  qrImageUrl?: string;
}

// API Response types
interface QRResponse {
  id: number;
  uniqueQrId: string;
  name: string;
  location: string;
  type: string;
  status: string;
  description: string;
  qrId?: string; // For backward compatibility
  instructionText: string;
  showRoomNumber: boolean;
  showLogo: boolean;
  propertyId: number;
  createdBy: number;
  createdAt: string;
  expiresAt: string | null;
  scans: number;
  lastScannedAt: string | null;
  qrImageUrl: string;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

interface StaffQRState {
  qrs: QRContext[];
  successMsg: string | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

interface StaffQRActions {
  fetchQRs: (propertyId: number, page?: number, size?: number) => Promise<void>;
  getQR: (id: string) => QRContext | undefined;
  addQR: (data: Omit<QRContext, "id" | "qrId" | "createdAt">, propertyId: number) => Promise<string>;
  updateQR: (id: string, data: Partial<QRContext>) => Promise<void>;
  deleteQR: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  setSuccess: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

function mapQRResponseToContext(data: any, tab: QRTab): QRContext {
  // Ensure the image URL is absolute
  let qrImageUrl = data.qrImageUrl || data.qr_image_url;
  
  if (qrImageUrl && qrImageUrl.startsWith("/")) {
    qrImageUrl = `${BASE_URL}${qrImageUrl}`;
  }

  console.log('Mapping QR Response:', { original: data.qrImageUrl || data.qr_image_url, mapped: qrImageUrl });

  return {
    id: (data.id || "").toString(),
    name: data.name || "",
    location: data.location || "",
    type: (data.type || "Dining Table") as QRType,
    tab,
    status: (data.status?.toLowerCase() === "active" ? "active" : "inactive") as QRStatus,
    description: data.description || "",
    qrId: data.uniqueQrId || data.qrId || "",
    createdAt: data.createdAt ? (new Date(data.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " at " + new Date(data.createdAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })) : "N/A",
    instructionText: data.instructionText || "",
    showRoomNumber: !!data.showRoomNumber,
    showLogo: data.showLogo !== false,
    qrImageUrl: qrImageUrl,
  };
}

export const useStaffQRStore = create<StaffQRState & StaffQRActions>((set, get) => ({
  qrs: [],
  successMsg: null,
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalItems: 0,

  fetchQRs: async (propertyId, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      // Trying both common patterns observed in the codebase
      const response = await api.get("/qr/list", {
        params: { propertyId, page, size },
      }).catch(async () => {
        // Fallback to the other common pattern
        return await api.get(`/staff/qr/property/${propertyId}?skip=${page * size}&limit=${size}`);
      });
      
      const data = response.data;
      
      // Handle array or paginated response
      const items = Array.isArray(data) ? data : (data.content || []);
      const totalElements = Array.isArray(data) ? data.length : (data.totalElements || data.length);

      const qrs = items.map((item: any) => {
        const tab = item.type === "ROOM" ? "Room" : "Table";
        return mapQRResponseToContext(item, tab);
      });

      set({ qrs, currentPage: page, totalItems: totalElements, loading: false });
    } catch (error: any) {
      console.error("Failed to fetch QRs:", error);
      const errorMsg = error.response?.data?.message || "Failed to fetch QR codes";
      set({ error: errorMsg, loading: false });
    }
  },

  getQR: (id) => get().qrs.find((q) => q.id === id),

  addQR: async (data, propertyId) => {
    set({ loading: true, error: null });
    try {
      const typeMap: Record<QRType, string> = {
        "Dining Table": "DINING_TABLE",
        Room: "ROOM",
        Outdoor: "OUTDOOR",
        Bar: "BAR",
      };

      const payload = {
        propertyId,
        name: data.name,
        location: data.location,
        type: typeMap[data.type],
        description: data.description,
        instructionText: data.instructionText,
        showRoomNumber: data.showRoomNumber,
        showLogo: data.showLogo,
      };

      const response = await api.post("/qr/generate", payload);
      const tab = data.type === "Room" ? "Room" : "Table";
      const newQR = mapQRResponseToContext(response.data, tab);
      set((s) => ({
        qrs: [newQR, ...s.qrs],
        successMsg: "QR code created successfully",
        loading: false,
      }));
      return newQR.id;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create QR code";
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  updateQR: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const typeMap: Record<QRType, string> = {
        "Dining Table": "DINING_TABLE",
        Room: "ROOM",
        Outdoor: "OUTDOOR",
        Bar: "BAR",
      };

      const payload: any = {};
      if (data.name) payload.name = data.name;
      if (data.location) payload.location = data.location;
      if (data.type) payload.type = typeMap[data.type];
      if (data.description !== undefined) payload.description = data.description;
      if (data.instructionText) payload.instructionText = data.instructionText;
      if (data.showRoomNumber !== undefined) payload.showRoomNumber = data.showRoomNumber;
      if (data.showLogo !== undefined) payload.showLogo = data.showLogo;

      const response = await api.put(`/qr/${id}`, payload);
      const tab = response.data.type === "ROOM" ? "Room" : "Table";
      const updatedQR = mapQRResponseToContext(response.data, tab);
      set((s) => ({
        qrs: s.qrs.map((q) => (q.id === id ? updatedQR : q)),
        successMsg: "QR code updated successfully",
        loading: false,
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to update QR code";
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  deleteQR: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/qr/${id}`);
      set((s) => ({
        qrs: s.qrs.filter((q) => q.id !== id),
        successMsg: "QR code deleted successfully",
        loading: false,
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to delete QR code";
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  toggleStatus: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/qr/${id}/toggle-status`);
      const qr = get().qrs.find((q) => q.id === id);
      const tab = qr ? qr.tab : "Table";
      const updatedQR = mapQRResponseToContext(response.data, tab);
      set((s) => ({
        qrs: s.qrs.map((q) => (q.id === id ? updatedQR : q)),
        successMsg: "QR code status updated successfully",
        loading: false,
      }));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to toggle QR code status";
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  setSuccess: (msg) => set({ successMsg: msg }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
