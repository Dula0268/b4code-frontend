import api from '@/lib/axios';

export const reservationsApi = {
  listReservations: async (ownerId = 1, search?: string, status?: string) => {
    const params = new URLSearchParams();
    params.append('ownerId', ownerId.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const response = await api.get(`/owner/reservations?${params.toString()}`);
    return response.data;
  },

  getReservation: async (id: number) => {
    const response = await api.get(`/owner/reservations/${id}`);
    return response.data;
  },

  createManualBooking: async (bookingData: Record<string, unknown>) => {
    const response = await api.post('/owner/reservations', bookingData);
    return response.data;
  },

  checkIn: async (id: number) => {
    const response = await api.patch(`/owner/reservations/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id: number) => {
    const response = await api.patch(`/owner/reservations/${id}/check-out`);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.patch(`/owner/reservations/${id}/cancel`);
    return response.data;
  }
};
