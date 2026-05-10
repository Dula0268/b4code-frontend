import api from '@/lib/axios';

// DTOs
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
  internalNote?: string;
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

export const ModerationApi = {
  getBadgeCounts: (): Promise<{ pendingReviews: number; openDisputes: number; removedToday: number }> =>
    api.get('/admin/moderation/counts').then((res) => res.data),

  getReviews: (params: { flagReason?: string; rating?: number; search?: string; page?: number; size?: number }): Promise<PageResponse<FlaggedReview>> =>
    api.get('/admin/moderation/reviews', { params }).then((res) => res.data),

  approveReview: (id: number): Promise<FlaggedReview> =>
    api.put(`/admin/moderation/reviews/${id}/approve`).then((res) => res.data),

  removeReview: (id: number, adminNote: string): Promise<FlaggedReview> =>
    api.put(`/admin/moderation/reviews/${id}/remove`, { adminNote }).then((res) => res.data),

  getDisputes: (params: { status?: string; search?: string; page?: number; size?: number }): Promise<PageResponse<Dispute>> =>
    api.get('/admin/moderation/disputes', { params }).then((res) => res.data),

  resolveDispute: (id: string, resolution: string, refundApproved: boolean): Promise<Dispute> =>
    api.put(`/admin/moderation/disputes/${id}/resolve`, { resolution, refundApproved }).then((res) => res.data),

  saveDisputeNote: (id: string, note: string): Promise<Dispute> =>
    api.put(`/admin/moderation/disputes/${id}/note`, { note }).then((res) => res.data),

  getHistory: (params: { action?: string; search?: string; from?: string; to?: string; page?: number; size?: number }): Promise<PageResponse<ModerationHistory>> =>
    api.get('/admin/moderation/history', { params }).then((res) => res.data),
};
