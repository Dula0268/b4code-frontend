import api from '@/lib/axios';

// ─── DTOs (exactly match what Spring Boot sends) ──────────────────────────────

export interface FinanceSummaryDto {
  totalRevenue: number;
  platformCommission: number;
  totalPayouts: number;
  totalRefunds: number;
  pendingRefunds: number;   // same value, alias used by frontend KPI card
  currency: string;
  revenueGrowth?: string;   // e.g., "+5%", "-3%", "0%"
  payoutGrowth?: string;    // e.g., "+2%", "-1%", "0%"
}

export interface RevenueTrendPointDto {
  month: string;
  revenue: number;
  commission?: number;
}

// Backend TransactionDto fields: id, referenceNumber, amount, currency, type,
// propertyId, propertyName, userId, userName, description, createdAt
export interface TransactionDto {
  id: number;
  referenceNumber: string;   // was: bookingId
  amount: number;
  currency: string;
  type: string;              // BOOKING_PAYMENT | REFUND | PAYOUT | COMMISSION
  propertyId?: number;
  propertyName?: string;
  userId?: number;
  userName?: string;         // was: guestName
  description?: string;
  createdAt: string;         // was: date (ISO datetime from backend)
}

export interface TransactionPageDto {
  content: TransactionDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Backend RefundDto fields: id, transactionId, userId, userName, amount, currency,
// reason, status (RefundStatus enum: PENDING|APPROVED|REJECTED), adminNote, requestedAt
export interface RefundDto {
  id: number;
  transactionId: number;     // was: bookingId
  userId: number;
  userName?: string;         // was: guestName
  amount: number;
  currency: string;
  reason?: string;
  status: string;            // "PENDING" | "APPROVED" | "REJECTED" (uppercase enum)
  adminNote?: string;
  requestedAt: string;       // was: requestDate (ISO datetime from backend)
}

export interface RefundPageDto {
  content: RefundDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Backend PayoutDto fields: id, ownerId, ownerName, amount, currency,
// status (PayoutStatus enum: PENDING|PROCESSED|FAILED), bankReference, requestedAt, processedAt
export interface PayoutDto {
  id: number;
  ownerId: number;
  ownerName: string;         // was: hostName
  amount: number;
  currency: string;
  status: string;            // "PENDING" | "PROCESSED" | "FAILED" (uppercase enum)
  bankReference?: string;    // was: bankDetails / referenceId
  requestedAt: string;       // was: period (ISO datetime from backend)
  processedAt?: string;
}

export interface PayoutPageDto {
  content: PayoutDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

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

  approveRefund: (id: number): Promise<RefundDto> =>
    api.put(`/admin/finance/refunds/${id}/approve`).then((res) => res.data),

  rejectRefund: (id: number, adminNote: string): Promise<RefundDto> =>
    api.put(`/admin/finance/refunds/${id}/reject`, { adminNote }).then((res) => res.data),

  getAllPayouts: (params: { search?: string; status?: string; page?: number; size?: number }): Promise<PayoutPageDto> =>
    api.get('/admin/finance/payouts', { params }).then((res) => res.data),

  processPayout: (id: number, bankReference: string): Promise<PayoutDto> =>
    api.put(`/admin/finance/payouts/${id}/process`, { bankReference }).then((res) => res.data),
};
