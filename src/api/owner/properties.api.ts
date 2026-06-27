import api from '@/lib/axios';

export const propertiesApi = {
  listProperties: async (ownerId = 1, page = 1, size = 10, search?: string, status?: string) => {
    const params = new URLSearchParams();
    params.append('ownerId', ownerId.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get(`/owner/properties?${params.toString()}`);
    return response.data;
  },

  getProperty: async (id: number, ownerId = 1) => {
    const response = await api.get(`/owner/properties/${id}?ownerId=${ownerId}`);
    return response.data;
  },

  createProperty: async (ownerId = 1, propertyData: Record<string, unknown>) => {
    const response = await api.post(`/owner/properties?ownerId=${ownerId}`, propertyData);
    return response.data;
  },

  updateProperty: async (id: number, ownerId = 1, propertyData: Record<string, unknown>) => {
    const response = await api.put(`/owner/properties/${id}?ownerId=${ownerId}`, propertyData);
    return response.data;
  },

  deleteProperty: async (id: number, ownerId = 1) => {
    const response = await api.delete(`/owner/properties/${id}?ownerId=${ownerId}`);
    return response.data;
  },

  toggleStatus: async (id: number, ownerId = 1) => {
    const response = await api.patch(`/owner/properties/${id}/toggle-status?ownerId=${ownerId}`);
    return response.data;
  }
};
