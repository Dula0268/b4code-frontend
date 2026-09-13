import api from "@/lib/axios";

export interface OwnerConversationDto {
  bookingId: number;
  confirmationCode: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  latestMessageContent: string;
  latestMessageAt: string;
  latestMessageSenderRole: string;
}

export interface OwnerMessageDto {
  id: number;
  bookingId: number;
  senderEmail: string;
  senderRole: string;
  targetRole: string;
  content: string;
  createdAt: string;
}

export const ownerMessageApi = {
  getConversations: async (propertyId: number): Promise<OwnerConversationDto[]> => {
    const response = await api.get(`/owner/messages/property/${propertyId}/conversations`);
    return response.data;
  },

  getAllConversations: async (): Promise<OwnerConversationDto[]> => {
    const response = await api.get(`/owner/messages/conversations`);
    return response.data;
  },

  getConversation: async (bookingId: string | number): Promise<OwnerMessageDto[]> => {
    const response = await api.get(`/owner/messages/booking/${bookingId}`);
    return response.data;
  },

  sendMessage: async (bookingId: string | number, content: string): Promise<OwnerMessageDto> => {
    const response = await api.post(`/owner/messages/booking/${bookingId}`, { content });
    return response.data;
  },
};
