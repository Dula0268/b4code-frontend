import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  sender: "staff" | "guest";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  roomName: string;
  guestName: string;
  guestInitials: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isOnline: boolean;
  status: "active" | "checkout";
  checkedIn: string;
  messages: ChatMessage[];
}

// ─── Quick replies ─────────────────────────────────────────────────────────────

export const QUICK_REPLIES = ["On our way", "Sorry for the delay", "Is there anything else?"];

export interface StaffChatState {
  conversations: Conversation[];
  activeConvId: string | null;
}

export interface StaffChatActions {
  selectConversation: (id: string) => void;
  sendMessage: (convId: string, text: string) => void;
  markRead: (convId: string) => void;
  getActiveConversation: () => Conversation | undefined;
}

let nextMsgId = 1;

export const useStaffChatStore = create<StaffChatState & StaffChatActions>((set, get) => ({
  conversations: [],
  activeConvId: null,

  selectConversation: (id) => {
    set({ activeConvId: id });
    // Auto mark read
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    }));
  },

  sendMessage: (convId, text) => {
    const msg: ChatMessage = {
      id: `msg-${nextMsgId++}`,
      sender: "staff",
      text,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastMessageTime: "Just now" }
          : c
      ),
    }));
  },

  markRead: (convId) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)),
    })),

  getActiveConversation: () => {
    const { conversations, activeConvId } = get();
    return conversations.find((c) => c.id === activeConvId);
  },
}));

