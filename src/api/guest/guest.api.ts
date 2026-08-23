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

  getPropertyDetail: (propertyId: number | string, checkIn?: string, checkOut?: string) => {
    const query = new URLSearchParams();
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    const qs = query.toString();
    return api.get(`/guest/properties/${propertyId}${qs ? `?${qs}` : ""}`).then((r) => normalizePropertyDetail(r.data));
  },

  // Booking Methods
  getPricePreview: (roomId: number, checkIn: string, checkOut: string, promoCode?: string) => {
    const params: Record<string, string> = { roomId: String(roomId), checkIn, checkOut };
    if (promoCode) params.promoCode = promoCode;
    return api.get("/guest/bookings/price-preview", { params }).then((r) => r.data);
  },

  getGuestBookings: (email: string) =>
    api.get(`/guest/bookings/guest`, { params: { email } }).then((r) => r.data),

  getBookingByConfirmation: (confirmationNumber: string) =>
    api.get(`/guest/bookings/confirmation/${confirmationNumber}`).then((r) => r.data),

  createBooking: (bookingData: {
    roomId: number;
    propertyId: number;
    roomQuantity: number;
    guestName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number;
    promoCode?: string;
    paymentMethod: "online" | "property";
  }) =>
    api
      .post("/guest/bookings", {
        roomId: bookingData.roomId,
        propertyId: bookingData.propertyId,
        roomQuantity: bookingData.roomQuantity,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        adults: bookingData.adults,
        children: bookingData.children || 0,
        promoCodes: bookingData.promoCode ? [bookingData.promoCode] : undefined,
        paymentMethod: bookingData.paymentMethod === "online" ? "ONLINE_CARD" : "PAY_AT_PROPERTY",
      })
      .then((r) => r.data),

  cancelBooking: (id: string | number, reason: string) =>
    api.patch(`/guest/bookings/${id}/cancel`, { reason }).then((r) => r.data),

  completeBooking: (id: string | number) =>
    api.patch(`/guest/bookings/${id}/complete`).then((r) => r.data),

  modifyBooking: (id: string | number, payload: {
    roomId: number;
    propertyId: number;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    roomQuantity: number;
  }) => api.put(`/guest/bookings/${id}`, payload).then((r) => r.data),

  sendReceipt: (confirmationCode: string) =>
    api.post(`/guest/bookings/${confirmationCode}/send-receipt`).then((r) => r.data),

  // Review Methods
  getPropertyReviews: (propertyId: number) =>
    api.get(`/guest/reviews/property/${propertyId}`).then((r) => r.data),

  uploadImage: async (file: File, folder: string = "reviews") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await api.post("/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { url: "...", message: "..." }
  },

  createReview: (reviewData: {
    bookingId: number;
    propertyId?: number;
    overallRating: number;
    cleanlinessRating?: number;
    comfortRating?: number;
    serviceRating?: number;
    diningRating?: number;
    locationRating?: number;
    valueRating?: number;
    comment?: string;
    photoUrls?: string[];
  }) =>
    api.post("/guest/reviews", reviewData).then((r) => r.data),

  createComplaint: (complaintData: {
    bookingId: number;
    propertyId?: number;
    category: string;
    severity: string;
    description: string;
    relatedOrderRef?: string;
    photoUrls?: string[];
  }) =>
    api.post("/guest/bookings/complaint", complaintData).then((r) => r.data),

  // Message Methods
  getConversation: (bookingId: number | string) =>
    api.get(`/guest/bookings/${bookingId}/messages`).then((r) => r.data),

  getActiveQuickRequests: (bookingId: number | string) =>
    api.get(`/guest/bookings/${bookingId}/messages/quick-requests`).then((r) => r.data),

  sendMessage: (bookingId: number | string, content: string) =>
    api.post(`/guest/bookings/${bookingId}/messages`, { content }).then((r) => r.data),

  // Order Message Methods (public/unauthenticated, scoped by guestSessionId)
  getOrderMessages: (orderId: number | string, guestSessionId?: string) =>
    api
      .get(`/orders/${orderId}/messages`, {
        params: guestSessionId ? { guestSessionId } : undefined,
      })
      .then((r) => r.data),

  sendOrderMessage: (orderId: number | string, content: string, guestSessionId?: string) =>
    api
      .post(
        `/orders/${orderId}/messages`,
        { content },
        { params: guestSessionId ? { guestSessionId } : undefined }
      )
      .then((r) => r.data),

  sendGuestOTP: (guestEmail: string, guestName: string) =>
    api.post("/guest/bookings/send-otp", { guestEmail, guestName }).then((r) => r.data),

  verifyGuestOTP: (guestEmail: string, otp: string) =>
    api.post("/guest/bookings/verify-otp", { guestEmail, otp }).then((r) => r.data),
};
