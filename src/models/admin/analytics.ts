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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
