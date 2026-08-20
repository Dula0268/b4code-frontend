import api from '@/lib/axios';

export const roomsApi = {
  listRooms: async (ownerId: number, status?: string, search?: string) => {
    const params = new URLSearchParams();
    params.append('ownerId', ownerId.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await api.get(`/owner/rooms?${params.toString()}`);
    return response.data;
  },

  getRoom: async (id: number) => {
    const response = await api.get(`/owner/rooms/${id}`);
    return response.data;
  },

  createRoom: async (roomData: Record<string, unknown>) => {
    const response = await api.post('/owner/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id: number, roomData: Record<string, unknown>) => {
    const response = await api.put(`/owner/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id: number) => {
    const response = await api.delete(`/owner/rooms/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/owner/rooms/${id}/status?status=${encodeURIComponent(status)}`);
    return response.data;
  },

  toggleAvailability: async (id: number) => {
    const response = await api.patch(`/owner/rooms/${id}/toggle-availability`);
    return response.data;
  }
};
