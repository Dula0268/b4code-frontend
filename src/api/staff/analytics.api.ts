import api from '@/lib/axios';

export interface OrderSummary {
  totalRevenue: number;
  totalOrders: number;
  completedCount: number;
  rejectedCount: number;
  averageOrderValue: number;
}

export interface OrderTrend {
  timestamp: string;
  count: number;
  revenue: number;
}

export interface TopMenuItem {
  menuItemId: number;
  name: string;
  volume: number;
  revenue: number;
}

export const analyticsApi = {
  getOrderSummary: async (propertyId: number, startDate?: string, endDate?: string) => {
    const response = await api.get<OrderSummary>('/staff/analytics/orders/summary', {
      params: { propertyId, startDate, endDate }
    });
    return response.data;
  },

  getOrderTrends: async (propertyId: number, startDate?: string, endDate?: string, interval: string = 'day') => {
    const response = await api.get<OrderTrend[]>('/staff/analytics/orders/trends', {
      params: { propertyId, startDate, endDate, interval }
    });
    return response.data;
  },

  getTopMenuItems: async (propertyId: number, startDate?: string, endDate?: string, limit: number = 5) => {
    const response = await api.get<TopMenuItem[]>('/staff/analytics/menu/top-items', {
      params: { propertyId, startDate, endDate, limit }
    });
    return response.data;
  }
};
