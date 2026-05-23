import api from "@/lib/axios";
import {
  normalizePropertyListing,
  normalizePropertyDetail,
} from "@/lib/normalize";

export const guestApi = {
  // Property Methods
  getAllProperties: () =>
    api.get("/guest/properties").then((r) => {
      const data = r.data;
      const items = Array.isArray(data) ? data : (data.content ?? []);
      return items.map(normalizePropertyListing);
    }),

  getPropertyDetail: (propertyId: number | string) =>
    api.get(`/guest/properties/${propertyId}`).then((r) => normalizePropertyDetail(r.data)),

  // Booking Methods
  getPricePreview: (roomId: number, checkIn: string, checkOut: string, promoCode?: string) => {
    const params: Record<string, string> = { roomId: String(roomId), checkIn, checkOut };
    if (promoCode) params.promoCode = promoCode;
    return api.get("/guest/bookings/price-preview", { params }).then((r) => r.data);
  },

  getGuestBookings: (email: string) =>
    api.get(`/guest/bookings/guest`, { params: { email } }).then((r) => r.data),

  createBooking: (bookingData: {
    roomId: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    promoCode?: string;
    paymentMethod: "online" | "property";
  }) =>
    api
      .post("/guest/bookings", {
        roomId: bookingData.roomId,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guestCount: bookingData.guestCount,
        promoCode: bookingData.promoCode,
        paymentMethod: bookingData.paymentMethod === "online" ? "ONLINE_CARD" : "PAY_AT_PROPERTY",
      })
      .then((r) => r.data),

  // Review Methods
  getPropertyReviews: (propertyId: number) =>
    api.get(`/guest/reviews/property/${propertyId}`).then((r) => r.data),

  createReview: (reviewData: {
    bookingId: number;
    overallRating: number;
    cleanlinessRating?: number;
    accuracyRating?: number;
    communicationRating?: number;
    locationRating?: number;
    valueRating?: number;
    comment?: string;
    photoUrls?: string[];
  }) =>
    api.post("/guest/reviews", reviewData).then((r) => r.data),

  // Message Methods
  getConversation: (bookingId: number) =>
    api.get(`/guest/messages/conversation/${bookingId}`).then((r) => r.data),

  sendMessage: (messageData: {
    bookingId: number;
    senderType: "GUEST" | "PROPERTY";
    senderName: string;
    content: string;
    attachmentUrl?: string;
  }) =>
    api.post("/guest/messages", messageData).then((r) => r.data),
};
