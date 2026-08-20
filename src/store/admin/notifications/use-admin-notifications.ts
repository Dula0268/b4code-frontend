import { create } from 'zustand';
import { AdminNotification, AdminNotificationApi } from '@/api/admin/admin-notification.api';
import { toast } from 'sonner';

interface AdminNotificationState {
  notifications: AdminNotification[];
  loading: boolean;
  unreadCount: number;
  lastSeenNotifId: number;
  
  fetchNotifications: (isPolling?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useAdminNotifications = create<AdminNotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,
  lastSeenNotifId: 0,

  fetchNotifications: async (isPolling = false) => {
    try {
      if (!isPolling) set({ loading: true });
      const res = await AdminNotificationApi.getNotifications(0, 50);
      const notifs = res.content || [];
      const unreadCount = notifs.filter(n => !n.isRead).length;
      
      const { lastSeenNotifId } = get();
      
      if (isPolling) {
        const newNotifs = notifs.filter(n => !n.isRead && n.id > lastSeenNotifId);
        if (newNotifs.length > 0) {
          newNotifs.forEach(notif => {
            toast.info(notif.title, {
              description: notif.message,
              position: "bottom-right",
              duration: 5000,
            });
          });
        }
      }

      let newLastSeenId = lastSeenNotifId;
      if (notifs.length > 0) {
        newLastSeenId = Math.max(...notifs.map(n => n.id));
      }

      set({ notifications: notifs, unreadCount, lastSeenNotifId: newLastSeenId, loading: false });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      if (!isPolling) set({ loading: false });
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
