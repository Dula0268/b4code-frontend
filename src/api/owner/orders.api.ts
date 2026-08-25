import api from '@/lib/axios';

export const ownerOrdersApi = {
  getOrdersByProperty: async (propertyId: number, page = 0, size = 15) => {
    const response = await api.get(`/owner/orders/property/${propertyId}?page=${page}&size=${size}`);
    return response.data;
  },

  getAllOrders: async (page = 0, size = 15) => {
    const response = await api.get(`/owner/orders/all?page=${page}&size=${size}`);
    return response.data;
  },
};
