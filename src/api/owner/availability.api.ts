import api from '@/lib/axios';

export const availabilityApi = {
  getWeeklyCalendar: async (propertyId: number, baseDate?: string) => {
    const params = new URLSearchParams({ propertyId: propertyId.toString() });
    if (baseDate) params.append('baseDate', baseDate);
    const response = await api.get(`/owner/availability/weekly?${params.toString()}`);
    return response.data;
  },

  getMonthlyCalendar: async (propertyId: number, year: number, month: number) => {
    const response = await api.get(`/owner/availability/monthly?propertyId=${propertyId}&year=${year}&month=${month}`);
    return response.data;
  },

  bulkUpdate: async (payload: {
    propertyId: number;
    dates: string[];
    newStatus: string;
    customPrice?: number;
    notes?: string;
  }) => {
    await api.put('/owner/availability/bulk-update', payload);
  },
};
