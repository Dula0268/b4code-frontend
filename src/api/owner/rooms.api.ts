import api from '@/lib/axios';

export const roomsApi = {
  listRooms: async (status?: string, search?: string, page = 1, size = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('size', size.toString());
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
  },

  getPhysicalRooms: async (roomId: number) => {
    const response = await api.get(`/owner/rooms/${roomId}/units`);
    return response.data;
  },

  getPhysicalRoomsByProperty: async (propertyId: number) => {
    const response = await api.get(`/owner/rooms/units/by-property?propertyId=${propertyId}`);
    return response.data;
  },

  updatePhysicalRoomStatus: async (roomId: number, unitId: number, status: string) => {
    const response = await api.patch(`/owner/rooms/${roomId}/units/${unitId}/status?status=${encodeURIComponent(status)}`);
    return response.data;
  },
};
