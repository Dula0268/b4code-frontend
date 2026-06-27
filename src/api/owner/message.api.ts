import api from '@/lib/axios';

export const messageApi = {
  getConversations: async (ownerId: number) => {
    const response = await api.get(`/owner/messages?ownerId=${ownerId}`);
    return response.data;
  },

  getMessages: async (conversationId: number) => {
    const response = await api.get(`/owner/messages/${conversationId}`);
    return response.data;
  },

  sendMessage: async (ownerId: number, conversationId: number, content: string) => {
    const response = await api.post(`/owner/messages?ownerId=${ownerId}`, { conversationId, content });
    return response.data;
  },

  markAsRead: async (conversationId: number) => {
    await api.put(`/owner/messages/${conversationId}/read`);
  },
};
