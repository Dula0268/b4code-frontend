import api from '@/lib/axios';

export const reservationsApi = {
  listReservations: async (ownerId = 1, page = 1, size = 10, search?: string, status?: string) => {
    const params = new URLSearchParams();
    params.append('ownerId', ownerId.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await api.get(`/owner/reservations?${params.toString()}`);
    return response.data;
  },

  getReservation: async (id: number, ownerId = 1) => {
    const response = await api.get(`/owner/reservations/${id}?ownerId=${ownerId}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string, ownerId = 1) => {
    const response = await api.patch(`/owner/reservations/${id}/status?status=${status}&ownerId=${ownerId}`);
    return response.data;
  }
};
