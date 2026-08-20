import { create } from 'zustand';
import {
  AnalyticsApi,
  type PlatformAnalytics,
  type PlatformSummary,
  type RevPar,
  type BookingChartPoint,
} from '@/api/admin/analytics.api';

type AdminAnalyticsState = {
  platformAnalytics: PlatformAnalytics | null;
  platformSummary: PlatformSummary | null;
  revParBreakdown: RevPar[];
  bookingsChart: BookingChartPoint[];
  loading: boolean;
  error: string | null;
};

type AdminAnalyticsActions = {
  fetchAnalyticsData: () => Promise<void>;
  reset: () => void;
};

export const useAdminAnalyticsStore = create<AdminAnalyticsState & AdminAnalyticsActions>((set) => ({
  platformAnalytics: null,
  platformSummary: null,
  revParBreakdown: [],
  bookingsChart: [],
  loading: false,
  error: null,

  fetchAnalyticsData: async () => {
    set({ loading: true, error: null });
    try {
      const [platformAnalytics, platformSummary, revParBreakdown, bookingsChart] = await Promise.all([
        AnalyticsApi.getPlatformAnalytics(),
        AnalyticsApi.getPlatformSummary(),
        AnalyticsApi.getRevPar(),
        AnalyticsApi.getBookingsChart(),
      ]);

      set({
        platformAnalytics,
        platformSummary,
        revParBreakdown,
        bookingsChart,
        loading: false,
      });
    } catch (err) {
      console.error('fetchAnalyticsData error:', err);
      set({
        error: 'Failed to load analytics data.',
        loading: false,
      });
    }
  },

  reset: () =>
    set({
      platformAnalytics: null,
      platformSummary: null,
      revParBreakdown: [],
      bookingsChart: [],
      loading: false,
      error: null,
    }),
}));
