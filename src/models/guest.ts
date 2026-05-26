// ─── Guest Domain Models ──────────────────────────────────────────────────────

export interface CreateBookingPayload {
  roomId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  promoCode?: string;
  paymentMethod: "online" | "property";
}

export interface CreateReviewPayload {
  bookingId: number;
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  comment?: string;
  photoUrls?: string[];
}

export interface SendMessagePayload {
  bookingId: number;
  senderType: "GUEST" | "PROPERTY";
  senderName: string;
  content: string;
  attachmentUrl?: string;
}
