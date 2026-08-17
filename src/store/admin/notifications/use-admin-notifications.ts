import { create } from 'zustand';
import { AdminNotification, AdminNotificationApi } from '@/api/admin/admin-notification.api';

interface AdminNotificationState {
  notifications: AdminNotification[];
  loading: boolean;
  unreadCount: number;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useAdminNotifications = create<AdminNotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await AdminNotificationApi.getNotifications(0, 50);
      const notifs = res.content || [];
      const unreadCount = notifs.filter(n => !n.isRead).length;
      set({ notifications: notifs, unreadCount, loading: false });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ loading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await AdminNotificationApi.markAsRead(id);
      const updated = get().notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = updated.filter(n => !n.isRead).length;
      set({ notifications: updated, unreadCount });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await AdminNotificationApi.markAllAsRead();
      const updated = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },
}));
