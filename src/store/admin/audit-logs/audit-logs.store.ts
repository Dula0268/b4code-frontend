import { create } from "zustand";
import { AuditLogsApi, AuditLogDto } from "@/api/admin/audit-logs.api";

interface AuditLogsState {
  logs: AuditLogDto[];
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;

  fetchLogs: (params: { role?: string; search?: string; page?: number; size?: number }) => Promise<void>;
}

export const useAdminAuditLogsStore = create<AuditLogsState>((set) => ({
  logs: [],
  totalElements: 0,
  totalPages: 0,
  loading: false,
  error: null,

  fetchLogs: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await AuditLogsApi.getAuditLogs(params);
      set({ 
        logs: data.content,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
