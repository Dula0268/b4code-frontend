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

export interface StaffConversationDto {
  staffId: number;
  staffName: string;
  staffRole: string;
  propertyId: number;
  propertyName: string;
  latestMessageContent: string;
  latestMessageAt: string;
  unreadCount: number;
}

export interface InternalMessageDto {
  id: number;
  propertyId: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface StaffQuickReplyDto {
  id: number;
  propertyId: number;
  name: string;
  message: string;
  isActive: boolean;
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

  getStaffConversations: async (propertyId?: number): Promise<StaffConversationDto[]> => {
    const params = propertyId ? { propertyId } : {};
    const response = await api.get(`/owner/internal-messages/conversations`, { params });
    return response.data;
  },

  getStaffMessages: async (staffId: number, propertyId: number): Promise<InternalMessageDto[]> => {
    const response = await api.get(`/owner/internal-messages/staff/${staffId}`, { params: { propertyId } });
    return response.data;
  },

  sendStaffMessage: async (staffId: number, propertyId: number, content: string): Promise<InternalMessageDto> => {
    const response = await api.post(`/owner/internal-messages/staff/${staffId}`, { content }, { params: { propertyId } });
    return response.data;
  },

  getStaffQuickReplies: async (propertyId: number): Promise<StaffQuickReplyDto[]> => {
    const response = await api.get(`/owner/properties/${propertyId}/staff-quick-replies`);
    return response.data;
  },

  createStaffQuickReply: async (propertyId: number, data: { name: string; message: string; isActive: boolean }): Promise<StaffQuickReplyDto> => {
    const response = await api.post(`/owner/properties/${propertyId}/staff-quick-replies`, data);
    return response.data;
  },

  updateStaffQuickReply: async (propertyId: number, replyId: number, data: { name: string; message: string; isActive: boolean }): Promise<StaffQuickReplyDto> => {
    const response = await api.put(`/owner/properties/${propertyId}/staff-quick-replies/${replyId}`, data);
    return response.data;
  },

  deleteStaffQuickReply: async (propertyId: number, replyId: number): Promise<void> => {
    await api.delete(`/owner/properties/${propertyId}/staff-quick-replies/${replyId}`);
  },
};
