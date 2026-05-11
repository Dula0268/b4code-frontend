import { apiFetch } from "@/lib/api";

export const guestMenuApi = {
  /**
   * Fetch paginated menu items for a property.
   * Supports optional tableId and roomNumber for context-aware menus.
   */
  getMenu: async (propertyId: number, tableId?: number, roomNumber?: string, page = 0, size = 20) => {
    const params = new URLSearchParams({
      propertyId: propertyId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    
    if (tableId) params.append("tableId", tableId.toString());
    if (roomNumber) params.append("roomNumber", roomNumber);

    const response = await apiFetch(`/api/guest/order/menu?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch menu");
    return response.json();
  },
};
