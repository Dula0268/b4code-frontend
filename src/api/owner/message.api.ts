import api from '@/lib/axios';

export const messageApi = {
    getConversations: async () => {
        const res = await api.get('/owner/messages');
        return res.data;
    },
    getMessages: async (conversationId: number) => {
        const res = await api.get(`/owner/messages/${conversationId}`);
        return res.data;
    },
    sendMessage: async (conversationId: number, content: string) => {
        const res = await api.post('/owner/messages', { conversationId, content });
        return res.data;
    },
    markAsRead: async (conversationId: number) => {
        await api.put(`/owner/messages/${conversationId}/read`);
    },
};
