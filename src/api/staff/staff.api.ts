import api from "@/lib/axios";

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
};
