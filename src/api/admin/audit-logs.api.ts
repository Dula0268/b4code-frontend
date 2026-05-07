import api from '@/lib/axios';

export interface AuditLogDto {
  id: string;
  userName: string;
  userRole: string;
  avatarColor: string;
  avatarInitial: string;
  ip: string;
  action: string;
  entity: string;
  entityDetail: string;
  timestamp: string;
}

export interface AuditLogPageDto {
  content: AuditLogDto[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export const AuditLogsApi = {
  getAuditLogs: (params: { role?: string; search?: string; page?: number; size?: number }): Promise<AuditLogPageDto> =>
    api.get('/api/admin/audit-logs', { params }).then((res) => res.data),
};
