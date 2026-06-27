import api from '@/lib/axios';

export const ratesApi = {
  getRateOverview: async (propertyId: number) => {
    const response = await api.get(`/owner/rates?propertyId=${propertyId}`);
    return response.data;
  },

  createRatePlan: async (data: Record<string, unknown>) => {
    const response = await api.post('/owner/rates', data);
    return response.data;
  },

  updateRatePlan: async (id: number, data: Record<string, unknown>) => {
    const response = await api.put(`/owner/rates/${id}`, data);
    return response.data;
  },

  deleteRatePlan: async (id: number) => {
    await api.delete(`/owner/rates/${id}`);
  },

  createDiscount: async (data: Record<string, unknown>) => {
    const response = await api.post('/owner/rates/discounts', data);
    return response.data;
  },

  updateDiscount: async (id: number, data: Record<string, unknown>) => {
    const response = await api.put(`/owner/rates/discounts/${id}`, data);
    return response.data;
  },

  deleteDiscount: async (id: number) => {
    await api.delete(`/owner/rates/discounts/${id}`);
  },
};
