import api from "@/lib/axios";

export interface RoomStatus {
  checkedIn: boolean;
  roomNumber: string;
  roomTypeName?: string;
  guestName?: string;
  checkOutDate?: string;
}

export const propertiesApi = {
  getPublicList: (): Promise<Array<{ id: number; name: string }>> =>
    api.get("/properties/public/list").then((r) => r.data),

  getRoomStatus: (propertyId: number, roomNumber: string): Promise<RoomStatus> =>
    api.get(`/properties/public/${propertyId}/room-status`, { params: { roomNumber } }).then((r) => r.data),
};
