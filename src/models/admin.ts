// ─── Admin Domain Models ──────────────────────────────────────────────────────

// ── Users ──────────────────────────────────────────────────────────────────
export type UserRole = "OWNER" | "STAFF" | "ADMIN" | "GUEST";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string | null;
}

export interface UserPage {
  content: User[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

// ── Analytics ──────────────────────────────────────────────────────────────
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

// ── Finance ────────────────────────────────────────────────────────────────
export interface FinanceSummaryDto {
  totalRevenue: number;
  revenueGrowth: string;
  platformCommission: number;
  commissionGrowth: string;
  totalPayouts: number;
  payoutGrowth: string;
  pendingRefunds: number;
  refundsGrowth: string;
  pendingPayouts: number;
}

export interface RevenueTrendPointDto {
  month: string;
  revenue: number;
  commission: number;
}

export interface TransactionDto {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  amount: number;
  date: string;
  status: string;
  paymentMethod: string;
}

export interface RefundDto {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  amount: number;
  requestDate: string;
  reason: string;
  status: string;
  adminNote?: string;
}

export interface PayoutDto {
  id: string;
  hostName: string;
  propertyName: string;
  amount: number;
  period: string;
  status: string;
  bankDetails: string;
  processedDate?: string;
  referenceId?: string;
}

// ── Moderation ─────────────────────────────────────────────────────────────
export interface FlaggedReview {
  id: number;
  propertyId: number;
  propertyName: string;
  guestId: number;
  guestName: string;
  guestInitial: string;
  guestAvatarColor: string;
  reviewText: string;
  rating: number;
  flagType: string;
  ownerName?: string;
  status: string;
  adminNote?: string;
  flaggedAt: string;
}

export interface Dispute {
  id: string;
  disputeId: string;
  guestName: string;
  propertyName: string;
  reason: string;
  amount: string;
  status: string;
  bookingId: string;
  stayDates: string;
  cancellationPolicy: string;
  daysUntilAutoClose: number;
}

export interface ModerationHistory {
  id: string;
  resolvedDate: string;
  resolvedTime: string;
  caseId: string;
  actionTaken: string;
  adminInitials: string;
  adminName: string;
  adminColor: string;
  outcome: string;
}

export interface PropertyDto {
  id: number;
  name: string;
  description: string;
  addressLine1: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  status: string;
  mainImageUrl: string;
}
