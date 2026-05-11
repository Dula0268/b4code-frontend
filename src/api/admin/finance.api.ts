import api from '@/lib/axios';

// DTOs
export interface FinanceSummaryDto {
  totalRevenue: number;
  revenueGrowth: string;
  platformCommission: number;
  commissionGrowth: string;
  totalPayouts: number;
  payoutGrowth: string;
  pendingRefunds: number;
  refundsGrowth: string;
  pendingPayouts: number;
}

export interface RevenueTrendPointDto {
  month: string;
  revenue: number;
  commission: number;
}

export interface TransactionDto {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

export interface TransactionPageDto {
  content: TransactionDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RefundDto {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  amount: number;
  requestDate: string;
  reason: string;
  status: string;
  adminNote?: string;
}

export interface RefundPageDto {
  content: RefundDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PayoutDto {
  id: string;
  hostName: string;
  propertyName: string;
  amount: number;
  period: string;
  status: string;
  bankDetails: string;
  processedDate?: string;
  referenceId?: string;
}

export interface PayoutPageDto {
  content: PayoutDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const FinanceApi = {
  getSummary: (): Promise<FinanceSummaryDto> =>
    api.get('/admin/finance/summary').then((res) => res.data),

  getRevenueTrend: (): Promise<RevenueTrendPointDto[]> =>
    api.get('/admin/finance/revenue-trend').then((res) => res.data),

  getAllTransactions: (params: { search?: string; type?: string; from?: string; to?: string; page?: number; size?: number }): Promise<TransactionPageDto> =>
    api.get('/admin/finance/transactions', { params }).then((res) => res.data),

  getTransactionById: (id: string): Promise<TransactionDto> =>
    api.get(`/admin/finance/transactions/${id}`).then((res) => res.data),

  getAllRefunds: (params: { search?: string; status?: string; page?: number; size?: number }): Promise<RefundPageDto> =>
    api.get('/admin/finance/refunds', { params }).then((res) => res.data),

  approveRefund: (id: string): Promise<RefundDto> =>
    api.put(`/admin/finance/refunds/${id}/approve`).then((res) => res.data),

  rejectRefund: (id: string, adminNote: string): Promise<RefundDto> =>
    api.put(`/admin/finance/refunds/${id}/reject`, { adminNote }).then((res) => res.data),

  getAllPayouts: (params: { search?: string; status?: string; page?: number; size?: number }): Promise<PayoutPageDto> =>
    api.get('/admin/finance/payouts', { params }).then((res) => res.data),

  processPayout: (id: string, bankReference: string): Promise<PayoutDto> =>
    api.put(`/admin/finance/payouts/${id}/process`, { bankReference }).then((res) => res.data),
};
