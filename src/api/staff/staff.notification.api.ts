import api from "@/lib/axios";

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  isRead: boolean;
  createdAt: string;
}

export const staffNotificationApi = {
  getNotifications: async () => {
    const res = await api.get<Notification[]>("/staff/notifications");
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get<number>("/staff/notifications/unread-count");
    return res.data;
  },
  markAsRead: async (id: number) => {
    await api.put(`/staff/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.put("/staff/notifications/read-all");
  },
};
