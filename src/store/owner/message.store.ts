import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import { getWsBrokerUrl } from '@/lib/ws';
import { ownerMessageApi, OwnerConversationDto, OwnerMessageDto } from '@/api/owner/owner-message.api';
import { ownerPricingApi } from '@/api/owner/pricing.api';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'owner' | 'guest' | 'staff' | 'system';
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string; // we'll use bookingId as the conversation ID
  guestName: string;
  reservationId: string;
  lastMessage: string;
  unreadCount: number;
  messages: ChatMessage[];
  propertyId: number;
  propertyName: string;
}

export interface PropertyOpt {
  id: number;
  name: string;
}

interface OwnerMessageState {
  conversations: Conversation[];
  activeConversationId: string | null;
  stompClient: Client | null;
  loading: boolean;
  properties: PropertyOpt[];
  selectedPropertyId: number | 'ALL';
  
  connect: (propertyIds: number[]) => void;
  disconnect: () => void;
  setActiveConversation: (id: string) => void;
  setSelectedPropertyId: (id: number | 'ALL') => void;
  fetchPropertiesAndConversations: () => Promise<void>;
  fetchMessages: (bookingId: string) => Promise<void>;
  sendMessage: (bookingId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
}

// Convert DTO to frontend format
const mapMessage = (msg: OwnerMessageDto): ChatMessage => ({
  id: msg.id,
  text: msg.content,
  sender: msg.senderRole === 'OWNER' ? 'owner' : (msg.senderRole === 'GUEST' ? 'guest' : (msg.senderRole === 'STAFF' ? 'staff' : 'system')),
  timestamp: msg.createdAt,
  read: true,
});

export const useOwnerMessageStore = create<OwnerMessageState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  stompClient: null,
  loading: false,
  properties: [],
  selectedPropertyId: 'ALL',

  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),

  fetchPropertiesAndConversations: async () => {
    set({ loading: true });
    try {
      // 1. Fetch properties for dropdown
      const properties = await ownerPricingApi.getOwnerProperties();
      set({ properties });

      // 2. Fetch all conversations
      const dtos = await ownerMessageApi.getAllConversations();
      const convs = dtos.map((dto: any) => ({
        id: dto.bookingId.toString(),
        guestName: dto.guestName || "Guest",
        reservationId: dto.confirmationCode,
        lastMessage: dto.latestMessageContent,
        unreadCount: 0,
        messages: [],
        propertyId: dto.propertyId || properties.find(p => p.name === dto.propertyName)?.id || 0,
        propertyName: dto.propertyName,
      }));
      set({ conversations: convs });
      
      // Connect stomp for all properties
      if (properties.length > 0) {
        get().connect(properties.map(p => p.id));
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (bookingId: string) => {
    try {
      const msgs = await ownerMessageApi.getConversation(bookingId);
      const chatMessages = msgs.map(mapMessage);
      
      set((state) => ({
        conversations: state.conversations.map(c => {
          if (c.id === bookingId) {
            return {
              ...c,
              messages: chatMessages,
              lastMessage: chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : c.lastMessage
            };
          }
          return c;
        })
      }));
    } catch (error) {
      console.error("Failed to fetch messages for booking", bookingId, error);
    }
  },

  connect: (propertyIds: number[]) => {
    if (get().stompClient?.active) return;
    
    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to every property
        propertyIds.forEach(propertyId => {
          client.subscribe(`/topic/property/${propertyId}/messages/owner`, (message) => {
            if (message.body) {
              const dto: OwnerMessageDto = JSON.parse(message.body);
              const newMsg = mapMessage(dto);
              const bookingIdStr = dto.bookingId.toString();

              set((state) => {
                const exists = state.conversations.find(c => c.id === bookingIdStr);
                
                if (exists) {
                  return {
                    conversations: state.conversations.map(c => {
                      if (c.id === bookingIdStr) {
                        if (c.messages.some(m => m.id === newMsg.id)) return c;
                        
                        return {
                          ...c,
                          lastMessage: newMsg.text,
                          messages: [...c.messages, newMsg],
                          unreadCount: state.activeConversationId === bookingIdStr ? 0 : c.unreadCount + 1
                        };
                      }
                      return c;
                    })
                  };
                } else {
                  setTimeout(() => get().fetchPropertiesAndConversations(), 100);
                  return state;
                }
              });
            }
          });
        });
      },
    });

    client.activate();
    set({ stompClient: client });
  },

  disconnect: () => {
    const { stompClient } = get();
    if (stompClient) {
      stompClient.deactivate();
      set({ stompClient: null });
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    get().markAsRead(id);
    get().fetchMessages(id);
  },

  sendMessage: async (bookingId, text) => {
    try {
      const dto = await ownerMessageApi.sendMessage(bookingId, text);
      const newMsg = mapMessage(dto);
      
      set((state) => ({
        conversations: state.conversations.map(c => {
          if (c.id === bookingId) {
            if (c.messages.some(m => m.id === newMsg.id)) return c;
            
            return {
              ...c,
              lastMessage: text,
              messages: [...c.messages, newMsg]
            };
          }
          return c;
        })
      }));
    } catch (error) {
      console.error("Failed to send message", error);
    }
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(c => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    }));
  }
}));
