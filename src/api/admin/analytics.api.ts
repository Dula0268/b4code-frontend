import api from '@/lib/axios';

export interface PlatformAnalytics {
  grossBookingValue: number;
  grossBookingValueChangePct: number;
  netRevenue: number;
  commissionRate: number;
  occupancyRate: number;
  avgDailyRate: number;
  avgDailyRateGoal: number;
  revpar: number;
  currency: string;
}

export interface PlatformSummary {
  avgLeadTimeDays: number;
  avgLeadTimeChange: number;
  cancellationRate: number;
  totalBookings: number;
  activeBookings: number;
  newListingsThisWeek: number;
  registeredUsers: number;
  registeredUsersGrowthPct: number;
  platformCommission: number;
  currency: string;
}

export interface RevPar {
  propertyId: number;
  propertyName: string;
  type: string;
  roomNumber: string;
  adults: number;
  sqm: number;
  image: string;
  revpar: number;
  avgDailyRate: number;
  occupancyRate: number;
  currency: string;
}

export interface BookingChartPoint {
  month: string;
  value: number;
}

export const AnalyticsApi = {
  getPlatformAnalytics: (): Promise<PlatformAnalytics> =>
    api.get('/api/admin/analytics/platform').then((res) => res.data),

  getPlatformSummary: (): Promise<PlatformSummary> =>
    api.get('/api/admin/analytics/platform-summary').then((res) => res.data),

  getRevPar: (): Promise<RevPar[]> =>
    api.get('/api/admin/analytics/revpar').then((res) => res.data),

  getBookingsChart: (): Promise<BookingChartPoint[]> =>
    api.get('/api/admin/analytics/bookings-chart').then((res) => res.data),
};
