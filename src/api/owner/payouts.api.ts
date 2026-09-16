import api from "@/lib/axios";

export interface PayoutDto {
  id: number;
  ownerId: number;
  ownerName: string;
  propertyId: number;
  propertyName: string;
  amount: number; // Net payout amount
  hotelAmount: number;
  foodAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: "PENDING" | "PROCESSED" | "REJECTED";
  bankReference?: string;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  branchCode?: string;
  bankDetails?: string;
  hostName?: string;
  period?: string;
}
export const ownerPayoutsApi = {
  requestPayout: async (propertyId?: number, bankAccountId?: number): Promise<PayoutDto> => {
    const params: any = {};
    if (propertyId) params.propertyId = propertyId;
    if (bankAccountId) params.bankAccountId = bankAccountId;
    const res = await api.post<PayoutDto>("/owner/settings/billing/payout-request", null, { params });
    return res.data;
  },

  getPayouts: async (): Promise<PayoutDto[]> => {
    const res = await api.get<PayoutDto[]>("/owner/settings/billing/payouts");
    return res.data;
  },
};
