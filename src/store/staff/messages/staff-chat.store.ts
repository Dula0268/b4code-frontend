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

// ─── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    roomName: "Room 304",
    guestName: "Mr. Thompson",
    guestInitials: "RT",
    lastMessage: "I need extra cutlery please.",
    lastMessageTime: "Just now",
    unread: 1,
    isOnline: true,
    status: "active",
    checkedIn: "2 days ago",
    messages: [
      { id: "m1", sender: "staff", text: "Hello Mr. Thompson, how is your stay going? Do you need any assistance with your dinner order?", time: "18:30" },
      { id: "m2", sender: "guest", text: "Everything is great, thanks! Actually, we just realized we are missing a set of cutlery for the room service we just received.", time: "18:42" },
      { id: "m3", sender: "guest", text: "I need extra cutlery please.", time: "18:43" },
    ],
  },
  {
    id: "conv-2",
    roomName: "Table 12 - Poolside",
    guestName: "Sarah Jenkins",
    guestInitials: "SJ",
    lastMessage: "Is the kitchen still open for...",
    lastMessageTime: "5m ago",
    unread: 0,
    isOnline: true,
    status: "active",
    checkedIn: "4 hours ago",
    messages: [
      { id: "m4", sender: "guest", text: "Hi, is the kitchen still open for ordering?", time: "18:35" },
      { id: "m5", sender: "staff", text: "Yes! The kitchen is open until 10 PM. Would you like to see the menu?", time: "18:36" },
      { id: "m6", sender: "guest", text: "Is the kitchen still open for late-night snacks?", time: "18:40" },
    ],
  },
  {
    id: "conv-3",
    roomName: "Room 102",
    guestName: "Dr. Ray",
    guestInitials: "DR",
    lastMessage: "Thank you for the quick service!",
    lastMessageTime: "2h ago",
    unread: 0,
    isOnline: true,
    status: "active",
    checkedIn: "1 day ago",
    messages: [
      { id: "m7", sender: "guest", text: "Could I get some extra towels please?", time: "16:10" },
      { id: "m8", sender: "staff", text: "Of course! We'll send them right up.", time: "16:12" },
      { id: "m9", sender: "guest", text: "Thank you for the quick service!", time: "16:20" },
    ],
  },
  {
    id: "conv-4",
    roomName: "Room 505 (Checkout)",
    guestName: "Mrs. Kim",
    guestInitials: "MK",
    lastMessage: "We left the key at reception.",
    lastMessageTime: "Yesterday",
    unread: 0,
    isOnline: false,
    status: "checkout",
    checkedIn: "3 days ago",
    messages: [
      { id: "m10", sender: "guest", text: "We're checking out now. Thank you for a wonderful stay!", time: "09:00" },
      { id: "m11", sender: "staff", text: "Thank you for staying with us! Have a safe trip.", time: "09:05" },
      { id: "m12", sender: "guest", text: "We left the key at reception.", time: "09:10" },
    ],
  },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

interface StaffChatState {
  conversations: Conversation[];
  activeConvId: string | null;
}

interface StaffChatActions {
  selectConversation: (id: string) => void;
  sendMessage: (convId: string, text: string) => void;
  markRead: (convId: string) => void;
  getActiveConversation: () => Conversation | undefined;
}

let nextMsgId = 500;

export const useStaffChatStore = create<StaffChatState & StaffChatActions>((set, get) => ({
  conversations: MOCK_CONVERSATIONS,
  activeConvId: MOCK_CONVERSATIONS[0].id,

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

