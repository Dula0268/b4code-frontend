"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { staffApi } from "@/api/staff/staff.api";
import { useAuthStore } from "@/store/auth/auth.store";
import { getWsBrokerUrl } from "@/lib/ws";
import {
  Send,
  RefreshCw,
  MessageSquare,
  Settings,
  BedDouble,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Hash,
  ClipboardList,
  MapPin,
  Receipt,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@stomp/stompjs";
import { useStaffBookingsStore } from "@/store/staff/bookings/staff-bookings.store";
import AutoReplyClient from "../auto-reply/auto-reply-client";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BookingConversation {
  bookingId: number;
  confirmationCode: string;
  guestName: string;
  propertyName: string;
  roomName?: string;
  roomNumber?: string;
  checkIn?: string;
  checkOut?: string;
  latestMessageContent: string;
  latestMessageAt: string;
  latestMessageSenderRole: string;
}

interface BookingMessage {
  id: number;
  content: string;
  senderRole: "GUEST" | "STAFF";
  createdAt: string;
}

type OrderStatusValue = "PLACED" | "ACCEPTED" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED" | string;

interface OrderConversation {
  orderId: number;
  guestName: string;
  location: string;
  orderStatus: OrderStatusValue;
  totalAmount: number;
  itemsSummary: string;
  latestMessageContent: string;
  latestMessageAt: string;
  latestMessageSenderRole: string;
}

interface OrderMessage {
  id: number;
  orderId: number;
  senderIdentifier: string;
  senderRole: "GUEST" | "STAFF";
  content: string;
  createdAt: string;
}

type Domain = "booking" | "order";

// ─── Shared helpers ─────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-8 h-8 text-[11px]" : "w-10 h-10 text-sm";
  return (
    <div className={`${dims} shrink-0 rounded-full bg-[#9a3300] text-white flex items-center justify-center font-bold`}>
      {getInitials(name)}
    </div>
  );
}

const ORDER_STATUS_BADGE: Record<string, { label: string; bg: string; text: string; dot?: string }> = {
  PLACED: { label: "New", bg: "bg-[rgba(154,51,0,0.1)]", text: "text-[#9a3300]" },
  ACCEPTED: { label: "Accepted", bg: "bg-[rgba(39,174,96,0.1)]", text: "text-[#27ae60]", dot: "bg-[#27ae60]" },
  IN_PROGRESS: { label: "Preparing", bg: "bg-[#fefce8]", text: "text-[#ca8a04]", dot: "bg-[#ca8a04]" },
  DELIVERED: { label: "Delivered", bg: "bg-[rgba(39,174,96,0.1)]", text: "text-[#27ae60]" },
  CANCELLED: { label: "Cancelled", bg: "bg-[rgba(235,87,87,0.1)]", text: "text-[#eb5757]" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS_BADGE[status] || { label: status, bg: "bg-[#f4eee6]", text: "text-[#8b7d6d]" };
  return (
    <span className={`${cfg.bg} ${cfg.text} text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0`}>
      {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {cfg.label}
    </span>
  );
}

function timeAgoOrDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

/** Groups messages from the same sender sent within 3 minutes of each other. */
function isSameGroup(a: { senderRole: string; createdAt: string }, b: { senderRole: string; createdAt: string }): boolean {
  if (a.senderRole !== b.senderRole) return false;
  const diff = Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return diff < 3 * 60 * 1000;
}

// ─── Skeletons & Empty states ───────────────────────────────────────────────

function ConversationListSkeleton() {
  return (
    <div className="p-2.5 flex flex-col gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl animate-pulse">
          <div className="w-8 h-8 rounded-full bg-[#eadfce] shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
            <div className="h-2.5 w-2/3 rounded bg-[#eadfce]" />
            <div className="h-2 w-full rounded bg-[#f0e9db]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 justify-end">
      {[
        { align: "start", w: "w-40" },
        { align: "start", w: "w-56" },
        { align: "end", w: "w-48" },
        { align: "start", w: "w-32" },
      ].map((b, i) => (
        <div key={i} className={`flex ${b.align === "end" ? "justify-end" : "justify-start"}`}>
          <div className={`h-9 ${b.w} rounded-2xl bg-[#f0e9db] animate-pulse`} />
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Inbox;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-[#f4eee6] border border-[#eadfce] flex items-center justify-center mb-4">
        <Icon size={26} className="text-[#9a3300]/60" />
      </div>
      <h3 className="text-sm font-bold text-[#2d2116]">{title}</h3>
      <p className="text-xs text-[#8b7d6d] mt-1 max-w-[240px]">{subtitle}</p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function StaffMessagesClient() {
  const user = useAuthStore((state) => state.user);
  const staffRole = user?.profile?.staffRole || "Staff Admin";

  // Property Staff → booking inbox only. Kitchen Staff → order inbox only. Everyone else (Staff Admin / unset) → both.
  const canBooking = staffRole !== "Kitchen Staff";
  const canOrders = staffRole !== "Property Staff";

  const [activeDomain, setActiveDomain] = useState<Domain>(canBooking ? "booking" : "order");

  const setUnreadMessagesCount = useStaffBookingsStore((state) => state.setUnreadMessagesCount);
  const setUnreadOrderMessagesCount = useStaffBookingsStore((state) => state.setUnreadOrderMessagesCount);

  // ── Booking (guest-stay) state ──
  const [bookingConversations, setBookingConversations] = useState<BookingConversation[]>([]);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [bookingMessages, setBookingMessages] = useState<BookingMessage[]>([]);
  const [loadingBookingConv, setLoadingBookingConv] = useState(canBooking);
  const [loadingBookingMsg, setLoadingBookingMsg] = useState(false);
  const [showGuestDetails, setShowGuestDetails] = useState(false);
  const activeBookingIdRef = useRef<number | null>(null);

  // ── Read State (Local Storage) ──
  const [readTimestamps, setReadTimestamps] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("staffReadTimestamps");
    if (saved) {
      try {
        setReadTimestamps(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const markAsRead = (domain: "booking" | "order", id: number, timestamp: string) => {
    setReadTimestamps((prev) => {
      const key = `${domain}_${id}`;
      if (prev[key] === timestamp) return prev;
      const next = { ...prev, [key]: timestamp };
      localStorage.setItem("staffReadTimestamps", JSON.stringify(next));
      return next;
    });
  };

  // ── Order state ──
  const [orderConversations, setOrderConversations] = useState<OrderConversation[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>([]);
  const [loadingOrderConv, setLoadingOrderConv] = useState(canOrders);
  const [loadingOrderMsg, setLoadingOrderMsg] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const activeOrderIdRef = useRef<number | null>(null);

  // ── Composer state ──
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const bookingEndRef = useRef<HTMLDivElement>(null);
  const orderEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeBookingIdRef.current = activeBookingId;
    setShowGuestDetails(false);
  }, [activeBookingId]);

  useEffect(() => {
    activeOrderIdRef.current = activeOrderId;
    setShowOrderDetails(false);
  }, [activeOrderId]);

  // ── Fetchers ──
  const fetchBookingConversations = async () => {
    if (!user?.propertyId) return;
    try {
      const data = await staffApi.getConversations(user.propertyId);
      setBookingConversations(data);
      const unrepliedCount = data.filter((c: BookingConversation) => c.latestMessageSenderRole === "GUEST").length;
      setUnreadMessagesCount(unrepliedCount);
    } catch (error) {
      console.error("Failed to load booking conversations", error);
    } finally {
      setLoadingBookingConv(false);
    }
  };

  const fetchOrderConversations = async () => {
    if (!user?.propertyId) return;
    try {
      const data = await staffApi.getOrderConversations(user.propertyId);
      setOrderConversations(data);
      const unrepliedCount = data.filter((c: OrderConversation) => c.latestMessageSenderRole === "GUEST").length;
      setUnreadOrderMessagesCount(unrepliedCount);
    } catch (error) {
      console.error("Failed to load order conversations", error);
    } finally {
      setLoadingOrderConv(false);
    }
  };

  useEffect(() => {
    if (!user?.propertyId) return;
    if (canBooking) fetchBookingConversations();
    if (canOrders) fetchOrderConversations();

    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Staff WS Connected");
        if (canBooking) {
          client.subscribe(`/topic/property/${user.propertyId}/messages`, (message) => {
            if (!message.body) return;
            const newMsg = JSON.parse(message.body);
            if (activeBookingIdRef.current && activeBookingIdRef.current.toString() === newMsg.bookingId?.toString()) {
              setBookingMessages((prev) => (prev.find((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
            }
            fetchBookingConversations();
          });
        }
        if (canOrders) {
          client.subscribe(`/topic/property/${user.propertyId}/order-messages`, (message) => {
            if (!message.body) return;
            const newMsg = JSON.parse(message.body);
            if (activeOrderIdRef.current && activeOrderIdRef.current.toString() === newMsg.orderId?.toString()) {
              setOrderMessages((prev) => (prev.find((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
            }
            fetchOrderConversations();
          });
        }
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [user?.propertyId, canBooking, canOrders]);

  const fetchBookingMessages = async (bookingId: number) => {
    setLoadingBookingMsg(true);
    try {
      const data = await staffApi.getConversation(bookingId);
      setBookingMessages(data);
    } catch (error) {
      console.error("Failed to load booking messages", error);
    } finally {
      setLoadingBookingMsg(false);
    }
  };

  const fetchOrderMessages = async (orderId: number) => {
    setLoadingOrderMsg(true);
    try {
      const data = await staffApi.getOrderConversation(orderId);
      setOrderMessages(data);
    } catch (error) {
      console.error("Failed to load order messages", error);
    } finally {
      setLoadingOrderMsg(false);
    }
  };

  useEffect(() => {
    if (activeBookingId) fetchBookingMessages(activeBookingId);
  }, [activeBookingId]);

  useEffect(() => {
    if (activeOrderId) fetchOrderMessages(activeOrderId);
  }, [activeOrderId]);

  useEffect(() => {
    bookingEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bookingMessages]);

  useEffect(() => {
    orderEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [orderMessages]);

  // Reset composer when switching thread/domain
  useEffect(() => {
    setNewMessage("");
  }, [activeDomain, activeBookingId, activeOrderId]);

  const handleSendBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeBookingId) return;
    setSending(true);
    try {
      const sentMessage = await staffApi.sendMessage(activeBookingId, newMessage);
      setBookingMessages((prev) => (prev.find((m) => m.id === sentMessage.id) ? prev : [...prev, sentMessage]));
      setNewMessage("");
      fetchBookingConversations();
    } catch (error) {
      console.error("Failed to send booking message", error);
    } finally {
      setSending(false);
    }
  };

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeOrderId) return;
    setSending(true);
    try {
      const sentMessage = await staffApi.sendOrderMessage(activeOrderId, newMessage);
      setOrderMessages((prev) => (prev.find((m) => m.id === sentMessage.id) ? prev : [...prev, sentMessage]));
      setNewMessage("");
      fetchOrderConversations();
    } catch (error) {
      console.error("Failed to send order message", error);
    } finally {
      setSending(false);
    }
  };

  const activeBookingConv = useMemo(
    () => bookingConversations.find((c) => c.bookingId === activeBookingId) || null,
    [bookingConversations, activeBookingId]
  );
  const activeOrderConv = useMemo(
    () => orderConversations.find((c) => c.orderId === activeOrderId) || null,
    [orderConversations, activeOrderId]
  );

  useEffect(() => {
    if (activeBookingId && activeBookingConv) {
      markAsRead("booking", activeBookingId, activeBookingConv.latestMessageAt);
    }
  }, [activeBookingId, activeBookingConv]);

  useEffect(() => {
    if (activeOrderId && activeOrderConv) {
      markAsRead("order", activeOrderId, activeOrderConv.latestMessageAt);
    }
  }, [activeOrderId, activeOrderConv]);

  const bookingUnreadCount = bookingConversations.filter((c) => {
    const role = c.latestMessageSenderRole?.toUpperCase();
    const isNew = role === "GUEST" || role === "AUTO_REPLY";
    const hasRead = readTimestamps[`booking_${c.bookingId}`] === c.latestMessageAt;
    return isNew && !hasRead;
  }).length;
  
  const orderUnreadCount = orderConversations.filter((c) => {
    const role = c.latestMessageSenderRole?.toUpperCase();
    const isNew = role === "GUEST" || role === "AUTO_REPLY";
    const hasRead = readTimestamps[`order_${c.orderId}`] === c.latestMessageAt;
    return isNew && !hasRead;
  }).length;

  const sortedBookingConversations = useMemo(() => {
    return [...bookingConversations].sort((a, b) => new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime());
  }, [bookingConversations]);

  const sortedOrderConversations = useMemo(() => {
    return [...orderConversations].sort((a, b) => new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime());
  }, [orderConversations]);

  const showBoth = canBooking && canOrders;
  const loadingConv = activeDomain === "booking" ? loadingBookingConv : loadingOrderConv;

  const hasActiveThread = activeDomain === "booking" ? !!activeBookingId : !!activeOrderId;

  return (
    <div className="bg-white rounded-2xl border border-[#eadfce] flex flex-col md:flex-row h-full min-h-[600px] overflow-hidden shadow-sm">
      {/* Left Sidebar - Conversations List */}
      <div className={`w-full md:w-1/3 border-r border-[#eadfce] flex-col bg-[#fafafa] ${hasActiveThread ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-[#eadfce] bg-white flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#2d2116] flex items-center gap-2">
              <MessageSquare size={18} /> Conversations
            </h2>
            {activeDomain === "booking" && canBooking && (
              <Button
                onClick={() => setActiveBookingId(null)}
                variant={!activeBookingId ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs ${
                  !activeBookingId ? "bg-[#9a3300] hover:bg-[#7a2800] text-white" : "border-[#eadfce] text-[#6f6254] hover:bg-[#f4eee6]"
                }`}
              >
                <Settings size={14} className="mr-1" />
                Auto-Reply
              </Button>
            )}
          </div>

          {showBoth && (
            <div className="flex gap-1 bg-[#f4eee6] rounded-xl p-1">
              <button
                onClick={() => setActiveDomain("booking")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                  activeDomain === "booking" ? "bg-white text-[#9a3300] shadow-sm" : "text-[#8b7d6d] hover:text-[#2d2116]"
                }`}
              >
                Guest Stay
                {bookingUnreadCount > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#9a3300] text-white text-[9px] font-bold flex items-center justify-center">
                    {bookingUnreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveDomain("order")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg transition-colors ${
                  activeDomain === "order" ? "bg-white text-[#9a3300] shadow-sm" : "text-[#8b7d6d] hover:text-[#2d2116]"
                }`}
              >
                Orders
                {orderUnreadCount > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#9a3300] text-white text-[9px] font-bold flex items-center justify-center">
                    {orderUnreadCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConv ? (
            <ConversationListSkeleton />
          ) : activeDomain === "booking" ? (
            sortedBookingConversations.length === 0 ? (
              <EmptyPanel icon={Inbox} title="No conversations yet" subtitle="Guest messages about their stay will show up here." />
            ) : (
              sortedBookingConversations.map((conv) => {
                const role = conv.latestMessageSenderRole?.toUpperCase();
                const isNew = role === "GUEST" || role === "AUTO_REPLY";
                const hasRead = readTimestamps[`booking_${conv.bookingId}`] === conv.latestMessageAt;
                const isUnreplied = isNew && !hasRead;
                const isStaffSent = role === "STAFF";
                const isAutoReply = role === "AUTO_REPLY";
                const isActive = activeBookingId === conv.bookingId;
                return (
                  <button
                    key={conv.bookingId}
                    onClick={() => setActiveBookingId(conv.bookingId)}
                    className={`w-full text-left p-2.5 border-b border-[#eadfce] transition-colors relative flex items-start gap-2.5 ${
                      isActive ? "bg-white border-l-4 border-l-[#9a3300]" : isUnreplied ? "bg-blue-50/60 hover:bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-white border-l-4 border-l-transparent"
                    }`}
                  >
                    <Avatar name={conv.guestName || "Guest"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold text-xs truncate flex items-center gap-1.5 ${isUnreplied ? "text-blue-800" : "text-[#2d2116]"}`}>
                          {conv.guestName}
                          {isUnreplied && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>}
                        </span>
                        <span className={`text-[9px] shrink-0 ${isUnreplied ? "text-blue-600 font-bold" : "text-[#8b7d6d]"}`}>
                          {timeAgoOrDate(conv.latestMessageAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isUnreplied ? "text-blue-900 font-semibold" : "text-[#6f6254]"}`}>
                        {isStaffSent && <span className="font-semibold text-[#8b7d6d]">You: </span>}
                        {isAutoReply && <span className="font-semibold text-blue-700">Auto: </span>}
                        {conv.latestMessageContent}
                      </p>
                    </div>
                  </button>
                );
              })
            )
          ) : sortedOrderConversations.length === 0 ? (
            <EmptyPanel icon={ClipboardList} title="No order chats yet" subtitle="Guest messages about active orders will show up here." />
          ) : (
            sortedOrderConversations.map((conv) => {
              const role = conv.latestMessageSenderRole?.toUpperCase();
              const isNew = role === "GUEST" || role === "AUTO_REPLY";
              const hasRead = readTimestamps[`order_${conv.orderId}`] === conv.latestMessageAt;
              const isUnreplied = isNew && !hasRead;
              const isStaffSent = role === "STAFF";
              const isAutoReply = role === "AUTO_REPLY";
              const isActive = activeOrderId === conv.orderId;
              return (
                <button
                  key={conv.orderId}
                  onClick={() => setActiveOrderId(conv.orderId)}
                  className={`w-full text-left p-2.5 border-b border-[#eadfce] transition-colors relative flex items-start gap-2.5 ${
                    isActive ? "bg-white border-l-4 border-l-[#9a3300]" : isUnreplied ? "bg-blue-50/60 hover:bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-white border-l-4 border-l-transparent"
                  }`}
                >
                  <Avatar name={conv.guestName || "Guest"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-bold text-xs truncate flex items-center gap-1.5 ${isUnreplied ? "text-blue-800" : "text-[#2d2116]"}`}>
                        {conv.guestName}
                        {isUnreplied && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>}
                      </span>
                      <span className={`text-[9px] shrink-0 ${isUnreplied ? "text-blue-600 font-bold" : "text-[#8b7d6d]"}`}>
                        {timeAgoOrDate(conv.latestMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#8b7d6d] flex items-center gap-0.5 truncate">
                        <MapPin size={10} className="shrink-0" />
                        {conv.location}
                      </span>
                      <OrderStatusBadge status={conv.orderStatus} />
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isUnreplied ? "text-blue-900 font-semibold" : "text-[#6f6254]"}`}>
                      {isStaffSent && <span className="font-semibold text-[#8b7d6d]">You: </span>}
                      {isAutoReply && <span className="font-semibold text-blue-700">Auto: </span>}
                      {conv.latestMessageContent}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div className={`flex-1 flex-col bg-white min-w-0 ${hasActiveThread ? "flex" : "hidden md:flex"}`}>
        {activeDomain === "booking" ? (
          !activeBookingId ? (
            <div className="flex-1 overflow-y-auto bg-[#fafafa] p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#2d2116]">Auto-Reply Configuration</h2>
                <p className="text-[#8b7d6d] mt-1">Set up automatic replies to common guest questions using keywords.</p>
              </div>
              <AutoReplyClient />
            </div>
          ) : (
            <>
              {/* Chat Header — click the profile to reveal guest details */}
              {activeBookingConv && (
                <div className="border-b border-[#eadfce]">
                  <div className="w-full flex items-center">
                    <button
                      type="button"
                      onClick={() => setActiveBookingId(null)}
                      className="md:hidden shrink-0 p-3 pr-0 text-[#8b7d6d] hover:text-[#2d2116]"
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  <button
                    onClick={() => setShowGuestDetails((v) => !v)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-[#fafafa] transition-colors text-left min-w-0"
                  >
                    <Avatar name={activeBookingConv.guestName || "Guest"} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-[#2d2116] truncate">{activeBookingConv.guestName}</h3>
                      <p className="text-[11px] text-[#8b7d6d]">Tap for guest details</p>
                    </div>
                    {activeBookingConv.roomNumber && (
                      <div className="mr-2 text-right shrink-0">
                        <p className="text-[10px] uppercase font-bold text-[#8b7d6d] tracking-wider mb-0.5">Room</p>
                        <p className="font-black text-sm text-[#9a3300] leading-none bg-[#f4eee6] px-2 py-1 rounded">{activeBookingConv.roomNumber}</p>
                      </div>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-[#8b7d6d] shrink-0 transition-transform ${showGuestDetails ? "rotate-180" : ""}`}
                    />
                  </button>
                  </div>

                  {showGuestDetails && (
                    <div className="px-4 pb-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                          <Hash size={13} />
                        </span>
                        <span className="font-medium">{activeBookingConv.confirmationCode}</span>
                      </div>
                      {activeBookingConv.roomName && (
                        <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                            <BedDouble size={13} />
                          </span>
                          <span className="font-medium">{activeBookingConv.roomName}</span>
                        </div>
                      )}
                      {(activeBookingConv.checkIn || activeBookingConv.checkOut) && (
                        <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                            <Calendar size={13} />
                          </span>
                          <span className="font-medium">
                            {activeBookingConv.checkIn ? new Date(activeBookingConv.checkIn).toLocaleDateString() : "—"}
                            {" → "}
                            {activeBookingConv.checkOut ? new Date(activeBookingConv.checkOut).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {loadingBookingMsg ? (
                <ChatSkeleton />
              ) : (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                  {bookingMessages.map((msg, i) => {
                    const isStaff = msg.senderRole === "STAFF";
                    const prev = bookingMessages[i - 1];
                    const grouped = prev ? isSameGroup(prev, msg) : false;
                    return (
                      <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3"}`}>
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
                            isStaff
                              ? `bg-[#9a3300] text-white ${grouped ? "rounded-tr-md" : "rounded-tr-sm"}`
                              : `bg-[#f4eee6] text-[#2d2116] border border-[#e8ddcf] ${grouped ? "rounded-tl-md" : "rounded-tl-sm"}`
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <span className={`text-[10px] mt-1 block ${isStaff ? "text-white/70" : "text-[#8b7d6d]"}`}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bookingEndRef} />
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 bg-[#fafafa] border-t border-[#eadfce]">
                <form onSubmit={handleSendBooking} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 rounded-xl bg-white border-[#eadfce] focus-visible:ring-[#9a3300]"
                    disabled={sending || loadingBookingMsg}
                  />
                  <Button
                    type="submit"
                    disabled={sending || loadingBookingMsg || !newMessage.trim()}
                    className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-xl px-4"
                  >
                    {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                  </Button>
                </form>
              </div>
            </>
          )
        ) : !activeOrderId ? (
          <EmptyPanel
            icon={ClipboardList}
            title="Select an order conversation"
            subtitle="Pick a conversation on the left to view and reply to guest questions about their order."
          />
        ) : (
          <>
            {/* Chat Header — click to reveal order details */}
            {activeOrderConv && (
              <div className="border-b border-[#eadfce]">
                <div className="w-full flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveOrderId(null)}
                    className="md:hidden shrink-0 p-3 pr-0 text-[#8b7d6d] hover:text-[#2d2116]"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft size={18} />
                  </button>
                <button
                  onClick={() => setShowOrderDetails((v) => !v)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-[#fafafa] transition-colors text-left min-w-0"
                >
                  <Avatar name={activeOrderConv.guestName || "Guest"} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#2d2116] truncate">{activeOrderConv.guestName}</h3>
                      <OrderStatusBadge status={activeOrderConv.orderStatus} />
                    </div>
                    <p className="text-[11px] text-[#8b7d6d]">Tap for order details</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[#8b7d6d] shrink-0 transition-transform ${showOrderDetails ? "rotate-180" : ""}`}
                  />
                </button>
                </div>

                {showOrderDetails && (
                  <div className="px-4 pb-3 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                        <Hash size={13} />
                      </span>
                      <span className="font-medium">Order #{activeOrderConv.orderId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                        <MapPin size={13} />
                      </span>
                      <span className="font-medium">{activeOrderConv.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                        <ClipboardList size={13} />
                      </span>
                      <span className="font-medium">{activeOrderConv.itemsSummary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#2d2116]">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#f4eee6] text-[#9a3300] shrink-0">
                        <Receipt size={13} />
                      </span>
                      <span className="font-medium">Total: LKR {activeOrderConv.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            {loadingOrderMsg ? (
              <ChatSkeleton />
            ) : (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {orderMessages.map((msg, i) => {
                  const isStaff = msg.senderRole === "STAFF";
                  const prev = orderMessages[i - 1];
                  const grouped = prev ? isSameGroup(prev, msg) : false;
                  return (
                    <div key={msg.id} className={`flex ${isStaff ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3"}`}>
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
                          isStaff
                            ? `bg-[#9a3300] text-white ${grouped ? "rounded-tr-md" : "rounded-tr-sm"}`
                            : `bg-[#f4eee6] text-[#2d2116] border border-[#e8ddcf] ${grouped ? "rounded-tl-md" : "rounded-tl-sm"}`
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isStaff ? "text-white/70" : "text-[#8b7d6d]"}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={orderEndRef} />
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 bg-[#fafafa] border-t border-[#eadfce]">
              <form onSubmit={handleSendOrder} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-xl bg-white border-[#eadfce] focus-visible:ring-[#9a3300]"
                  disabled={sending || loadingOrderMsg}
                />
                <Button
                  type="submit"
                  disabled={sending || loadingOrderMsg || !newMessage.trim()}
                  className="bg-[#9a3300] hover:bg-[#7a2800] text-white rounded-xl px-4"
                >
                  {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
