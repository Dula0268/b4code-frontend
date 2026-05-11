import { apiFetch } from "@/lib/api";

export const guestOrderApi = {
  /**
   * Place a new order for a guest.
   */
  placeOrder: async (orderData: any) => {
    const response = await apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error("Failed to place order");
    return response.json();
  },

  /**
   * Retrieve paginated order history for a specific guest.
   */
  getOrderHistory: async (guestId: number, page = 0, size = 10) => {
    const response = await apiFetch(`/api/orders/guest/${guestId}?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch order history");
    return response.json();
  },

  /**
   * Get details of a specific order.
   */
  getOrderDetails: async (orderId: number) => {
    const response = await apiFetch(`/api/orders/${orderId}`);
    if (!response.ok) throw new Error("Failed to fetch order details");
    return response.json();
  },
};
