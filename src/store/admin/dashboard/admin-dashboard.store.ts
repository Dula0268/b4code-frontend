import { create } from 'zustand';
import {
  DashboardApi,
  type DashboardKpi,
  type RevenueTrendPoint,
  type RecentVerification,
} from '@/api/admin/dashboard.api';

type AdminDashboardState = {
  kpis: DashboardKpi | null;
  revenueTrend: RevenueTrendPoint[];
  recentVerifications: RecentVerification[];
  loading: boolean;
  error: string | null;
};

type AdminDashboardActions = {
  fetchDashboardData: () => Promise<void>;
  reset: () => void;
};

export const useAdminDashboardStore = create<AdminDashboardState & AdminDashboardActions>((set) => ({
  kpis: null,
  revenueTrend: [],
  recentVerifications: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const [kpis, revenueTrend, recentVerifications] = await Promise.all([
        DashboardApi.getKpis(),
        DashboardApi.getRevenueTrend(),
        DashboardApi.getRecentVerifications(),
      ]);

      set({
        kpis,
        revenueTrend,
        recentVerifications,
        loading: false,
      });
    } catch (err) {
      console.error('fetchDashboardData error:', err);
      set({
        error: 'Failed to load dashboard data.',
        loading: false,
      });
    }
  },

  reset: () =>
    set({
      kpis: null,
      revenueTrend: [],
      recentVerifications: [],
      loading: false,
      error: null,
    }),
}));
