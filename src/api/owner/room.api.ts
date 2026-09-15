import api from "@/lib/axios";

export interface OwnerRoomType {
  id: number;
  propertyId: number;
  propertyName: string;
  name: string;
  roomCategory: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  description?: string;
  inventory: number;
  status: string;
  isAvailable: boolean;
  amenities: string[];
  bedConfigurations: string[];
}

export interface OwnerRoomTypeListResponse {
  roomTypes: OwnerRoomType[];
  totalCount: number;
  occupiedCount: number;
  maintenanceCount: number;
  vacantCount: number;
}

export const ownerRoomApi = {
  listRooms: (propertyId?: number): Promise<OwnerRoomTypeListResponse> =>
    api
      .get("/owner/rooms", {
        params: {
          ...(propertyId ? { propertyId } : {}),
        },
      })
      .then((res) => res.data),
};
