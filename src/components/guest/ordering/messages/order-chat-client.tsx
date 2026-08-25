"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Client } from "@stomp/stompjs";
import { Send, RefreshCw, MessageCircle, ChefHat, Sparkles } from "lucide-react";
import { guestApi } from "@/api/guest/guest.api";
import { getWsBrokerUrl } from "@/lib/ws";
import { useOrderStore, type OrderStatus } from "@/store/guest/ordering/order.store";
import { useGuestSessionStore } from "@/store/guest/ordering/guest-session.store";

interface OrderMessage {
  id: number;
  orderId: number;
  senderIdentifier: string;
  senderRole: "GUEST" | "STAFF";
  content: string;
  createdAt: string;
}

/** Consecutive messages from the same sender within this window are visually grouped. */
const GROUP_WINDOW_MS = 3 * 60 * 1000;

function formatBubbleTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function suggestionsForStatus(status: OrderStatus): string[] {
  const base: string[] = [];
  if (status === "placed" || status === "accepted") {
    base.push("How long will it take?", "Can I add an item?");
  } else if (status === "in-progress") {
    base.push("Is it on its way?");
  } else if (status === "delivered") {
    base.push("Thank you!", "Something's missing from my order");
  }
  base.push("I need to speak to someone urgently");
  return base;
}

function formatLkr(n: number) {
  return `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  "in-progress": "In Progress",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "payment-pending": "Payment Pending",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed: "bg-blue-50/80 border border-blue-100/50 text-blue-700",
  accepted: "bg-orange-50/80 border border-orange-100/50 text-orange-700",
  "in-progress": "bg-orange-50/80 border border-orange-100/50 text-orange-700",
  delivered: "bg-green-50/80 border border-green-100/50 text-green-700",
  cancelled: "bg-red-50/80 border border-red-100/50 text-red-700",
  "payment-pending": "bg-gray-50/80 border border-gray-200/50 text-gray-600",
};

export default function OrderChatClient() {
  const order = useOrderStore((s) => s.currentOrder);
  const guestSessionId = useGuestSessionStore((s) => s.sessionId);

  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const numericOrderId = order?.id?.replace("#ORD-", "");

  // Merges any messages missed while the socket was down (initial load,
  // post-reconnect catch-up, and the poll fallback below all share this).
  const syncMessages = (opts?: { showLoading?: boolean }) => {
    if (!numericOrderId) {
      setLoading(false);
      return;
    }
    if (opts?.showLoading) setLoading(true);
    return guestApi
      .getOrderMessages(numericOrderId, guestSessionId || undefined)
      .then((data) => {
        setMessages((prev) => {
          const byId = new Map(prev.map((m) => [m.id, m]));
          for (const m of data || []) byId.set(m.id, m);
          return Array.from(byId.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load order messages", err);
        if (opts?.showLoading) setError("Couldn't load your conversation. Please try again.");
      })
      .finally(() => {
        if (opts?.showLoading) setLoading(false);
      });
  };

  useEffect(() => {
    syncMessages({ showLoading: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericOrderId, guestSessionId]);

  useEffect(() => {
    if (!numericOrderId) return;

    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      reconnectDelay: 5000,
      onConnect: () => {
        // Re-sync on every (re)connect, not just the first one — a dropped
        // connection (backgrounded tab, brief network blip) would otherwise
        // silently lose any staff reply sent while the socket was down,
        // since the subscription below only sees NEW broadcasts.
        syncMessages();
        client.subscribe(`/topic/order/${numericOrderId}`, (message) => {
          if (!message.body) return;
          try {
            const parsed = JSON.parse(message.body);
            setMessages((prev) => {
              if (!prev.find((m) => m.id === parsed.id)) {
                return [...prev, parsed];
              }
              return prev;
            });
          } catch (err) {
            console.error("Failed to parse order message event", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
      debug: () => {
        // no-op
      },
    });

    client.activate();

    // Poll fallback in case the socket is silently stuck (open but not
    // actually delivering) rather than cleanly disconnected/reconnecting.
    const interval = setInterval(() => syncMessages(), 20000);

    return () => {
      client.deactivate();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericOrderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = newMessage.trim();
    if (!text || !numericOrderId) return;

    setSending(true);
    try {
      const sent = await guestApi.sendOrderMessage(numericOrderId, text, guestSessionId || undefined);
      setMessages((prev) => (prev.find((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send order message", err);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestionTap = (text: string) => {
    setNewMessage(text);
    inputRef.current?.focus();
  };

  /* ── No active order: don't render a broken chat with nothing to reference ── */
  if (!order) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Breadcrumb />
        <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
            <MessageCircle className="w-9 h-9 text-gray-300" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">No active order to message about</p>
            <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
              Place an order first so the kitchen has context on what you&apos;re asking about.
            </p>
          </div>
          <Link
            href="/guest/order/menu"
            className="px-8 py-4 rounded-2xl bg-[var(--brand-primary)] text-white font-bold text-base hover:bg-[#C05621] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-orange-500/20"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const suggestions = suggestionsForStatus(order.currentStatus);
  const itemSummary = order.lines
    .map((line) => `${line.qty}x ${line.item.title}`)
    .join(", ");

  const decorated = messages.map((msg, idx) => {
    const prev = messages[idx - 1];
    const next = messages[idx + 1];
    const sameSenderAsPrev =
      !!prev &&
      prev.senderRole === msg.senderRole &&
      new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;
    const sameSenderAsNext =
      !!next &&
      next.senderRole === msg.senderRole &&
      new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() < GROUP_WINDOW_MS;
    return { msg, isGroupStart: !sameSenderAsPrev, isGroupEnd: !sameSenderAsNext };
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Breadcrumb />
      {/* ── Order context header ── */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] px-5 py-5 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[var(--brand-primary)]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[var(--brand-primary)]">{order.id}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-sm font-semibold text-gray-600 truncate">{order.location}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 truncate">{itemSummary || "No items"}</p>
          </div>
          <span
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ${STATUS_STYLES[order.currentStatus]}`}
          >
            {STATUS_LABELS[order.currentStatus]}
          </span>
        </div>
        <div className="relative z-10 flex justify-between items-center mt-3 pt-3 border-t border-gray-100/80">
          <span className="text-xs font-medium text-gray-400">{order.placedAt}</span>
          <span className="text-sm font-bold text-gray-900">{formatLkr(order.total)}</span>
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden h-[70vh] min-h-[420px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[#C05621] p-4 flex items-center gap-3 text-white shrink-0 shadow-sm">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base leading-tight text-white">Message the Kitchen</h2>
              <span className="flex h-2 w-2 rounded-full bg-green-300 border border-green-100"></span>
            </div>
            <p className="text-white/80 text-[11px] font-medium">Staff usually reply within a few minutes</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50/50">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <RefreshCw size={22} className="animate-spin text-[var(--brand-primary)]" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-[var(--brand-primary)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--brand-primary)]">
                <MessageCircle size={28} />
              </div>
              <p className="text-base font-bold text-gray-900">Have a question about your order?</p>
              <p className="text-gray-500 text-sm mt-1 max-w-[260px]">
                Send a message or tap a suggestion below.
              </p>
            </div>
          ) : (
            decorated.map(({ msg, isGroupStart, isGroupEnd }) => {
              const isGuest = msg.senderRole === "GUEST";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isGuest ? "justify-end" : "justify-start"} ${isGroupStart ? "mt-3" : "mt-0.5"}`}
                >
                  <div className="flex flex-col max-w-[82%] sm:max-w-[70%]">
                    {isGroupStart && !isGuest && (
                      <span className="text-[11px] font-semibold text-[var(--brand-primary)] mb-1 ml-1">
                        Kitchen Staff
                      </span>
                    )}
                    <div
                      className={`px-3.5 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words rounded-2xl ${
                        isGuest
                          ? `bg-[var(--brand-primary)] text-white ${isGroupStart ? "" : "rounded-tr-md"}`
                          : `bg-white text-gray-800 border border-gray-100 ${isGroupStart ? "" : "rounded-tl-md"}`
                      }`}
                    >
                      {msg.content}
                    </div>
                    {isGroupEnd && (
                      <span className={`text-[10px] mt-1 text-gray-400 ${isGuest ? "text-right mr-1" : "ml-1"}`}>
                        {formatBubbleTime(msg.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions + composer */}
        <div className="bg-white border-t border-gray-100/80 shrink-0">
          {suggestions.length > 0 && (
            <div className="px-3 sm:px-4 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Sparkles size={14} className="text-[var(--brand-primary)] shrink-0" />
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestionTap(s)}
                  disabled={sending}
                  className="shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full bg-orange-50/80 border border-orange-100 text-[#C05621] text-xs font-semibold hover:bg-orange-100 hover:border-[var(--brand-primary)]/40 transition-all disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="p-3 sm:p-4 flex gap-2">
            <input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 rounded-full bg-gray-50 border border-gray-200 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:border-[var(--brand-primary)] outline-none px-4 h-11 text-sm disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-[var(--brand-primary)] hover:bg-[#C05621] text-white rounded-full w-11 h-11 shrink-0 shadow-sm flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper components ─── */

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/60 shadow-sm">
      <Link href="/guest/order" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12L12 3L21 12M5 10.5V20.5C5 20.776 5.224 21 5.5 21H10.5V16C10.5 15.724 10.724 15.5 11 15.5H13C13.276 15.5 13.5 15.724 13.5 16V21H18.5C18.776 21 19 20.776 19 20.5V10.5"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <span className="font-medium">Home</span>
      </Link>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400 shrink-0">
        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-semibold text-[var(--brand-primary)]">Message Staff</span>
    </nav>
  );
}
