import api from '@/lib/axios';

export const staffApi = {
    getPending: async () => {
        const res = await api.get('/owner/staff/pending');
        return res.data;
    },
    getAll: async () => {
        const res = await api.get('/owner/staff/all');
        return res.data;
    },
    invite: async (data: { email: string; firstName: string; lastName: string; phone?: string; propertyId: number }) => {
        const res = await api.post('/owner/staff/invite', data);
        return res.data;
    },
    approve: async (id: number) => {
        await api.put(`/owner/staff/${id}/approve`);
    },
    reject: async (id: number) => {
        await api.put(`/owner/staff/${id}/reject`);
    },
};
