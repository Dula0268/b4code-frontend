import api from "@/lib/axios";

export interface AvailableRoomDto {
  id: number;
  doorNumber: string;
}

export const roomsApi = {
  getAvailableRooms: async (roomTypeId: number) => {
    const response = await api.get<AvailableRoomDto[]>(
      `/rooms/room-type/${roomTypeId}/available`
    );
    return response.data;
  },
};
