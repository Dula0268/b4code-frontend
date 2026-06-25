import { create } from "zustand";
import {
  FinanceApi,
  FinanceSummaryDto,
  RevenueTrendPointDto,
  TransactionDto,
  RefundDto,
  PayoutDto
} from "@/api/admin/finance.api";

interface FinanceState {
  // Global loading
  summaryLoading: boolean;
  trendLoading: boolean;
  transactionsLoading: boolean;
  refundsLoading: boolean;
  payoutsLoading: boolean;
  actionLoading: boolean;
  isExporting: boolean;
  error: string | null;

  // Data
  summary: FinanceSummaryDto | null;
  revenueTrend: RevenueTrendPointDto[];
  
  transactions: TransactionDto[];
  transactionsTotalPages: number;
  transactionsTotalElements: number;
  
  refunds: RefundDto[];
  refundsTotalPages: number;
  refundsTotalElements: number;
  
  payouts: PayoutDto[];
  payoutsTotalPages: number;
  payoutsTotalElements: number;

  // Actions
  fetchSummary: () => Promise<void>;
  fetchRevenueTrend: () => Promise<void>;
  fetchTransactions: (params: { search?: string; type?: string; page?: number; size?: number }) => Promise<void>;
  fetchRefunds: (params: { search?: string; status?: string; page?: number; size?: number }) => Promise<void>;
  fetchPayouts: (params: { search?: string; status?: string; page?: number; size?: number }) => Promise<void>;
  
  approveRefund: (id: string) => Promise<void>;
  rejectRefund: (id: string, adminNote: string) => Promise<void>;
  processPayout: (id: string, bankReference: string, commissionRate?: number) => Promise<void>;
  rejectPayout: (id: string) => Promise<void>;
  downloadPayoutExport: (params: { search?: string; status?: string }) => Promise<void>;
}

export const useAdminFinanceStore = create<FinanceState>((set, get) => ({
  summaryLoading: false,
  trendLoading: false,
  transactionsLoading: false,
  refundsLoading: false,
  payoutsLoading: false,
  actionLoading: false,
  isExporting: false,
  error: null,

  summary: null,
  revenueTrend: [],
  transactions: [],
  transactionsTotalPages: 0,
  transactionsTotalElements: 0,
  refunds: [],
  refundsTotalPages: 0,
  refundsTotalElements: 0,
  payouts: [],
  payoutsTotalPages: 0,
  payoutsTotalElements: 0,

  fetchSummary: async () => {
    set({ summaryLoading: true, error: null });
    try {
      const data = await FinanceApi.getSummary();
      set({ summary: data, summaryLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch summary";
      set({ error: message, summaryLoading: false });
    }
  },

  fetchRevenueTrend: async () => {
    set({ trendLoading: true, error: null });
    try {
      const data = await FinanceApi.getRevenueTrend();
      set({ revenueTrend: data, trendLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch revenue trend";
      set({ error: message, trendLoading: false });
    }
  },

  fetchTransactions: async (params) => {
    set({ transactionsLoading: true, error: null });
    try {
      const data = await FinanceApi.getAllTransactions(params);
      set({ 
        transactions: data.content,
        transactionsTotalPages: data.totalPages,
        transactionsTotalElements: data.totalElements,
        transactionsLoading: false 
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch transactions";
      set({ error: message, transactionsLoading: false });
    }
  },

  fetchRefunds: async (params) => {
    set({ refundsLoading: true, error: null });
    try {
      const data = await FinanceApi.getAllRefunds(params);
      set({ 
        refunds: data.content,
        refundsTotalPages: data.totalPages,
        refundsTotalElements: data.totalElements,
        refundsLoading: false 
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch refunds";
      set({ error: message, refundsLoading: false });
    }
  },

  fetchPayouts: async (params) => {
    set({ payoutsLoading: true, error: null });
    try {
      const data = await FinanceApi.getAllPayouts(params);
      set({ 
        payouts: data.content,
        payoutsTotalPages: data.totalPages,
        payoutsTotalElements: data.totalElements,
        payoutsLoading: false 
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch payouts";
      set({ error: message, payoutsLoading: false });
    }
  },

  approveRefund: async (id: string) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await FinanceApi.approveRefund(id);
      set((state) => ({
        refunds: state.refunds.map(r => r.id === id ? updated : r),
        actionLoading: false
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve refund";
      set({ error: message, actionLoading: false });
      throw err;
    }
  },

  rejectRefund: async (id: string, adminNote: string) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await FinanceApi.rejectRefund(id, adminNote);
      set((state) => ({
        refunds: state.refunds.map(r => r.id === id ? updated : r),
        actionLoading: false
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject refund";
      set({ error: message, actionLoading: false });
      throw err;
    }
  },

  processPayout: async (id: string, bankReference: string, commissionRate?: number) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await FinanceApi.processPayout(id, { bankReference, commissionRate });
      set((state) => ({
        payouts: state.payouts.map(p => p.id === id ? updated : p),
        actionLoading: false
      }));
      get().fetchSummary();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process payout";
      set({ error: message, actionLoading: false });
      throw err;
    }
  },

  rejectPayout: async (id: string) => {
    set({ actionLoading: true, error: null });
    try {
      const updated = await FinanceApi.rejectPayout(id);
      set((state) => ({
        payouts: state.payouts.map(p => p.id === id ? updated : p),
        actionLoading: false
      }));
      get().fetchSummary();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject payout";
      set({ error: message, actionLoading: false });
      throw err;
    }
  },

  downloadPayoutExport: async (params) => {
    set({ isExporting: true, error: null });
    try {
      const blob = await FinanceApi.exportPayouts(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "payout-report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      set({ isExporting: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to export payouts";
      set({ error: message, isExporting: false });
    }
  }
}));
