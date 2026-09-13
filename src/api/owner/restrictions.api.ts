import api from "@/lib/axios";

export interface ReservationRestriction {
  id: number;
  propertyId: number;
  roomTypeId?: number | null;
  roomTypeName?: string | null;
  name: string;
  type: "MIN_STAY" | "MAX_STAY" | "CLOSED_TO_ARRIVAL" | "CLOSED_TO_DEPARTURE" | "BLACKOUT" | string;
  minStay?: number | null;
  maxStay?: number | null;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
  startDate: string;
  endDate: string;
  reason?: string | null;
  isActive: boolean;
}

export interface RoomInventoryLock {
  roomTypeId: number;
  roomTypeName: string;
  configuredInventory: number;
  physicalRoomCount: number;
  doorNumbers: string[];
  activeBookingsCount: number;
  availableCount: number;
  isOverbookingLocked: boolean;
}

export interface IcalSyncChannel {
  id: number;
  propertyId: number;
  roomTypeId?: number | null;
  roomTypeName?: string | null;
  channelName: string;
  feedUrl: string;
  lastSyncAt?: string | null;
  syncStatus: "SUCCESS" | "FAILED" | "PENDING" | string;
  syncError?: string | null;
  eventsImported: number;
  isActive: boolean;
  exportFeedUrl: string;
}

export interface CreateRestrictionPayload {
  propertyId: number;
  roomTypeId?: number | null;
  name: string;
  type: string;
  minStay?: number | null;
  maxStay?: number | null;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
  startDate: string;
  endDate: string;
  reason?: string;
  isActive?: boolean;
}

export interface AddIcalFeedPayload {
  propertyId: number;
  roomTypeId?: number | null;
  channelName: string;
  feedUrl: string;
  isActive?: boolean;
}

export const restrictionsApi = {
  // Restrictions
  async getRestrictions(propertyId: number): Promise<ReservationRestriction[]> {
    const res = await api.get(`/api/v1/owner/settings/restrictions?propertyId=${propertyId}`);
    return res.data;
  },

  async createRestriction(payload: CreateRestrictionPayload): Promise<ReservationRestriction> {
    const res = await api.post("/api/v1/owner/settings/restrictions", payload);
    return res.data;
  },

  async updateRestriction(id: number, payload: Partial<CreateRestrictionPayload>): Promise<ReservationRestriction> {
    const res = await api.put(`/api/v1/owner/settings/restrictions/${id}`, payload);
    return res.data;
  },

  async deleteRestriction(id: number): Promise<void> {
    await api.delete(`/api/v1/owner/settings/restrictions/${id}`);
  },

  // Physical Room Inventory Locks
  async getInventoryLocks(propertyId: number): Promise<RoomInventoryLock[]> {
    const res = await api.get(`/api/v1/owner/settings/inventory-locks?propertyId=${propertyId}`);
    return res.data;
  },

  // iCal Calendar Feeds
  async getIcalFeeds(propertyId: number): Promise<IcalSyncChannel[]> {
    const res = await api.get(`/api/v1/owner/settings/ical?propertyId=${propertyId}`);
    return res.data;
  },

  async addIcalFeed(payload: AddIcalFeedPayload): Promise<IcalSyncChannel> {
    const res = await api.post("/api/v1/owner/settings/ical", payload);
    return res.data;
  },

  async syncIcalFeed(id: number): Promise<IcalSyncChannel> {
    const res = await api.post(`/api/v1/owner/settings/ical/${id}/sync`);
    return res.data;
  },

  async deleteIcalFeed(id: number): Promise<void> {
    await api.delete(`/api/v1/owner/settings/ical/${id}`);
  },
};
