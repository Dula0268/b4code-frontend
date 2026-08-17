import api from '@/lib/axios';

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: 'FLAGGED_REVIEW' | 'PAYOUT_REQUEST' | 'DISPUTE' | 'NEW_PROPERTY';
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const AdminNotificationApi = {
  getNotifications: (page = 0, size = 50): Promise<PageResponse<AdminNotification>> =>
    api.get('/admin/notifications', { params: { page, size } }).then((res) => res.data),

  markAsRead: (id: number): Promise<void> =>
    api.put(`/admin/notifications/${id}/read`).then((res) => res.data),

  markAllAsRead: (): Promise<void> =>
    api.put('/admin/notifications/read-all').then((res) => res.data),
};
