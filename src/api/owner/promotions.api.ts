import api from "@/lib/axios";

export interface PromoCodeDto {
  id: number;
  code: string;
  description: string;
  discountPercent: number;
  validFrom: string; // YYYY-MM-DD
  validTo: string;   // YYYY-MM-DD
  maxUses: number | null;
  currentUses: number;
  active: boolean;
  isValid: boolean;
  propertyId: number | null;
  propertyName: string | null;
}

export interface CreatePromoPayload {
  code: string;
  description: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxUses?: number | null;
  propertyId?: number | null;
}

export const ownerPromotionsApi = {
  getPromotions: async (propertyId?: number): Promise<PromoCodeDto[]> => {
    const params = propertyId ? { propertyId } : {};
    const res = await api.get<PromoCodeDto[]>("/owner/promotions", { params });
    return res.data;
  },

  createPromotion: async (data: CreatePromoPayload): Promise<PromoCodeDto> => {
    const res = await api.post<PromoCodeDto>("/owner/promotions", data);
    return res.data;
  },

  togglePromotion: async (id: number): Promise<PromoCodeDto> => {
    const res = await api.patch<PromoCodeDto>(`/owner/promotions/${id}/toggle`);
    return res.data;
  },

  deletePromotion: async (id: number): Promise<void> => {
    await api.delete(`/owner/promotions/${id}`);
  },
};
