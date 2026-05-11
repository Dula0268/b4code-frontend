import { apiFetch } from "@/lib/api";

interface QrRequest {
  propertyId: number;
  name: string;
  location: string;
  type: string;
  description: string;
  instructionText: string;
  showRoomNumber: boolean;
  showLogo: boolean;
  tableId?: number;
  roomNumber?: string;
}

interface QrUpdates {
  name?: string;
  location?: string;
  type?: string;
  description?: string;
  instructionText?: string;
  showRoomNumber?: boolean;
  showLogo?: boolean;
}

export const staffQrApi = {
  /**
   * Generate a new QR code for a table or room.
   */
  generateQr: async (request: QrRequest) => {
    const response = await apiFetch("/api/qr/generate", {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Failed to generate QR code");
    return response.json();
  },

  /**
   * List all QR codes for a property.
   */
  getQrList: async (propertyId: number, page = 0, size = 10) => {
    const response = await apiFetch(`/api/qr/list?propertyId=${propertyId}&page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch QR list");
    return response.json();
  },

  /**
   * Toggle the active status of a specific QR code.
   */
  toggleStatus: async (id: number) => {
    const response = await apiFetch(`/api/qr/${id}/toggle-status`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to toggle QR status");
    return response.json();
  },

  /**
   * Delete a specific QR code.
   */
  deleteQr: async (id: number) => {
    const response = await apiFetch(`/api/qr/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete QR code");
    return response;
  },

  /**
   * Update details of an existing QR code.
   */
  updateQr: async (id: number, updates: QrUpdates) => {
    const response = await apiFetch(`/api/qr/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update QR code");
    return response.json();
  },
};
