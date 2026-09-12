import api from "@/lib/axios";

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const ownerNotificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get("/owner/notifications");
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get("/owner/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/owner/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put("/owner/notifications/read-all");
  }
};
