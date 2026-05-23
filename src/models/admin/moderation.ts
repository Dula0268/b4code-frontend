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
  flagReason: string;
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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
