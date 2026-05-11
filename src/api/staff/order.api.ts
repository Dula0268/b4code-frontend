import { apiFetch } from "@/lib/api";

export const staffOrderApi = {
  /**
   * List all orders for a property, sorted by recency.
   */
  getOrders: async (propertyId: number) => {
    const response = await apiFetch(`/api/staff/orders/property/${propertyId}`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  /**
   * Update order status to PREPARING.
   */
  acceptOrder: async (orderId: number) => {
    const response = await apiFetch(`/api/staff/orders/${orderId}/accept`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to accept order");
    return response.json();
  },

  /**
   * Update order status to READY.
   */
  markAsReady: async (orderId: number) => {
    const response = await apiFetch(`/api/staff/orders/${orderId}/ready`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to mark order as ready");
    return response.json();
  },

  /**
   * Update order status to DELIVERED.
   */
  markAsDelivered: async (orderId: number) => {
    const response = await apiFetch(`/api/staff/orders/${orderId}/deliver`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to mark order as delivered");
    return response.json();
  },

  /**
   * Reject an order (set to CANCELLED).
   */
  rejectOrder: async (orderId: number) => {
    const response = await apiFetch(`/api/staff/orders/${orderId}/reject`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to reject order");
    return response.json();
  },
};
