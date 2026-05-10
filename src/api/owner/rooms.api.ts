import api from '@/lib/axios';

export const roomsApi = {
  listRooms: async (propertyId: number) => {
    const response = await api.get(`/owner/rooms/property/${propertyId}`);
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

  toggleAvailability: async (id: number) => {
    const response = await api.patch(`/owner/rooms/${id}/toggle-availability`);
    return response.data;
  }
};
