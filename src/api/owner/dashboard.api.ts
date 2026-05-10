import api from '@/lib/axios';

export const dashboardApi = {
  getDashboard: async (ownerId?: number, calYear?: number, calMonth?: number) => {
    const params = new URLSearchParams();
    if (ownerId) params.append('ownerId', ownerId.toString());
    if (calYear) params.append('calYear', calYear.toString());
    if (calMonth) params.append('calMonth', calMonth.toString());
    
    const response = await api.get(`/owner/dashboard?${params.toString()}`);
    return response.data;
  }
};
