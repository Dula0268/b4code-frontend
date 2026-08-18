import api from "@/lib/axios";

export interface OwnerReservationDto {
  id: number;
  propertyName: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  confirmationCode: string;
}

export const staffApi = {
  getAllProperties: () =>
    api.get("/staff/all-properties").then((r) => r.data),

  getMyProperties: (staffId: number) =>
    api.get(`/staff/properties/${staffId}`).then((r) => r.data),

  // Message Methods
  getConversations: (propertyId: number | string) =>
    api.get(`/staff/messages/property/${propertyId}/conversations`).then((r) => r.data),

  getConversation: (bookingId: number | string) =>
    api.get(`/staff/messages/booking/${bookingId}`).then((r) => r.data),

  sendMessage: (bookingId: number | string, content: string) =>
    api.post(`/staff/messages/booking/${bookingId}`, { content }).then((r) => r.data),

  // Auto-Reply Rules
  getAutoReplyRules: (propertyId: number | string) =>
    api.get(`/staff/properties/${propertyId}/auto-reply-rules`).then((r) => r.data),
    
  createAutoReplyRule: (propertyId: number | string, payload: { keyword: string; replyMessage: string; isActive: boolean }) =>
    api.post(`/staff/properties/${propertyId}/auto-reply-rules`, payload).then((r) => r.data),
    
  updateAutoReplyRule: (propertyId: number | string, ruleId: number | string, payload: { keyword: string; replyMessage: string; isActive: boolean }) =>
    api.put(`/staff/properties/${propertyId}/auto-reply-rules/${ruleId}`, payload).then((r) => r.data),
    
  deleteAutoReplyRule: (propertyId: number | string, ruleId: number | string) =>
    api.delete(`/staff/properties/${propertyId}/auto-reply-rules/${ruleId}`).then((r) => r.data),
  // Staff Reservations
  getReservations: async (propertyId: number, search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    
    const response = await api.get<OwnerReservationDto[]>(
      `/staff/properties/${propertyId}/reservations?${params.toString()}`
    );
    return response.data;
  },

  checkInReservation: async (propertyId: number, reservationId: number) => {
    const response = await api.patch<OwnerReservationDto>(
      `/staff/properties/${propertyId}/reservations/${reservationId}/check-in`
    );
    return response.data;
  },

  checkOutReservation: async (propertyId: number, reservationId: number) => {
    const response = await api.patch<OwnerReservationDto>(
      `/staff/properties/${propertyId}/reservations/${reservationId}/check-out`
    );
    return response.data;
  },
};
