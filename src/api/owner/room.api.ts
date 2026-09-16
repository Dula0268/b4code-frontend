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
  imageUrl?: string;
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

export interface OwnerRoomTypeRequest {
  propertyId: number;
  name: string;
  roomCategory: string;
  basePrice: number;
  maxAdults: number;
  maxChildren: number;
  description?: string;
  inventory: number;
  amenities: string[];
  bedConfigurations: string[];
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

  createRoom: (data: Partial<OwnerRoomType>): Promise<OwnerRoomType> =>
    api.post("/owner/rooms", data).then((res) => res.data),

  updateRoom: (id: number, data: Partial<OwnerRoomType>): Promise<OwnerRoomType> =>
    api.put(`/owner/rooms/${id}`, data).then((res) => res.data),
};
