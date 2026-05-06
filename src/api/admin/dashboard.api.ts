import api from '@/lib/axios';

export interface KpiValue {
  value: string;
  change: string;
  positive: boolean;
}

export interface DashboardKpi {
  totalRevenue: KpiValue;
  occupancyRate: KpiValue;
  activeBookings: KpiValue;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
}

export interface RecentVerification {
  id: string;
  name: string;
  entityId: string;
  type: string;
  dateSubmitted: string;
  status: string;
  action: string;
  icon: string;
}

export const DashboardApi = {
  getKpis: (): Promise<DashboardKpi> =>
    api.get('/api/admin/dashboard/kpis').then((res) => res.data),

  getRevenueTrend: (): Promise<RevenueTrendPoint[]> =>
    api.get('/api/admin/dashboard/revenue-trend').then((res) => res.data),

  getRecentVerifications: (): Promise<RecentVerification[]> =>
    api.get('/api/admin/dashboard/recent-verifications').then((res) => res.data),
};
