import api from "@/lib/axios";

export interface AvailabilityDay {
  roomId: number;
  roomName: string;
  basePrice?: number;
  date: string;
  status: "AVAILABLE" | "BLOCKED" | string;
  customPrice?: string | null;
  notes?: string | null;
  availabilityId?: number | null;
}

export interface BulkPriceUpdateRequest {
  propertyId: number;
  roomId?: number | null;
  dates: string[];
  newStatus?: string;
  customPrice?: number | null;
  notes?: string;
}

export interface RatePlan {
  id?: number;
  propertyId: number;
  name: string;
  type: string;
  basePrice: number;
  minNights?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface Discount {
  id?: number;
  propertyId: number;
  name: string;
  type: string;
  percentage: number;
  minNights?: number;
  daysInAdvance?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface RateOverview {
  propertyId: number;
  ratePlans: RatePlan[];
  discounts: Discount[];
}

export interface SeasonalRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priceAdjustmentPercent: number; // e.g. 20 for +20%, -15 for -15%
  roomId?: number | null;
  description?: string;
}

export const ownerPricingApi = {
  // Fetch properties owned by the authenticated owner
  getOwnerProperties: async (): Promise<Array<{ id: number; name: string }>> => {
    const res = await api.get<any>("/owner/properties", {
      params: { page: 1, size: 50 },
    });
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.properties)) return res.data.properties;
    return [];
  },

  // Monthly calendar of daily room prices & blackout status
  getMonthlyCalendar: async (
    propertyId: number,
    year: number,
    month: number
  ): Promise<AvailabilityDay[]> => {
    const res = await api.get<AvailabilityDay[]>("/owner/availability/monthly", {
      params: { propertyId, year, month },
    });
    return res.data;
  },

  // Bulk update date prices or blackout status
  bulkUpdateAvailability: async (payload: BulkPriceUpdateRequest): Promise<void> => {
    await api.put("/owner/availability/bulk-update", payload);
  },

  // Rates & Discounts overview
  getRateOverview: async (propertyId: number): Promise<RateOverview> => {
    const res = await api.get<RateOverview>("/owner/rates", {
      params: { propertyId },
    });
    return res.data;
  },

  // Rate Plans CRUD
  createRatePlan: async (payload: Partial<RatePlan>): Promise<RatePlan> => {
    const res = await api.post<RatePlan>("/owner/rates", payload);
    return res.data;
  },

  updateRatePlan: async (id: number, payload: Partial<RatePlan>): Promise<RatePlan> => {
    const res = await api.put<RatePlan>(`/owner/rates/${id}`, payload);
    return res.data;
  },

  deleteRatePlan: async (id: number): Promise<void> => {
    await api.delete(`/owner/rates/${id}`);
  },

  // Discounts CRUD
  createDiscount: async (payload: Partial<Discount>): Promise<Discount> => {
    const res = await api.post<Discount>("/owner/rates/discounts", payload);
    return res.data;
  },

  updateDiscount: async (id: number, payload: Partial<Discount>): Promise<Discount> => {
    const res = await api.put<Discount>(`/owner/rates/discounts/${id}`, payload);
    return res.data;
  },

  deleteDiscount: async (id: number): Promise<void> => {
    await api.delete(`/owner/rates/discounts/${id}`);
  },
};
