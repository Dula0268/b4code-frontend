"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  ChefHat,
  Truck,
  CircleCheck,
  Eye,
  Play,
  User,
} from "lucide-react";
import {
  useStaffOrdersStore,
  type Order,
  type OrderStatus,
} from "@/store/staff/orders/staff-orders.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_TABS: { label: string; value: OrderStatus }[] = [
  { label: "Placed", value: "placed" },
  { label: "Accepted", value: "accepted" },
  { label: "In-Progress", value: "in-progress" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE: Record<OrderStatus, { label: string; bg: string; text: string; dot?: string }> = {
  placed: { label: "New", bg: "bg-[rgba(151,49,2,0.1)]", text: "text-[var(--brand-primary)]" },
  accepted: { label: "Accepted", bg: "bg-[rgba(39,174,96,0.1)]", text: "text-[var(--state-success)]", dot: "bg-[var(--state-success)]" },
  "in-progress": { label: "Preparing", bg: "bg-[#fefce8]", text: "text-[#ca8a04]", dot: "bg-[#ca8a04]" },
  delivered: { label: "Delivered", bg: "bg-[rgba(39,174,96,0.1)]", text: "text-[var(--state-success)]" },
  cancelled: { label: "Rejected", bg: "bg-[rgba(235,87,87,0.1)]", text: "text-[var(--state-error)]" },
};

// ─── Order Card Component ──────────────────────────────────────────────────────
function OrderCard({
  order,
  onAccept,
  onReject,
  onAdvance,
  onViewDetail,
}: {
  order: Order;
  onAccept?: () => void;
  onReject?: () => void;
  onAdvance?: () => void;
  onViewDetail: () => void;
}) {
  const badge = STATUS_BADGE[order.status];

  const renderActions = () => {
    switch (order.status) {
      case "placed":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onReject?.(); }}>
              <XCircle size={14} /> Reject
            </Button>
            <Button size="sm" className="flex-1 bg-[var(--brand-primary)] text-white text-xs gap-1" onClick={(e) => { e.stopPropagation(); onAccept?.(); }}>
              <CheckCircle2 size={14} /> Accept
            </Button>
          </div>
        );
      case "accepted":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); onReject?.(); }}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1 bg-[var(--brand-primary)] text-white text-xs gap-1" onClick={(e) => { e.stopPropagation(); onAdvance?.(); }}>
              <Play size={14} /> Start Preparation
            </Button>
          </div>
        );
      case "in-progress":
        return (
          <Button size="sm" className="w-full bg-[var(--brand-primary)] text-white text-xs gap-1" onClick={(e) => { e.stopPropagation(); onAdvance?.(); }}>
            <Truck size={14} /> Mark Delivered
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={(e) => { e.stopPropagation(); onViewDetail(); }}>
            <Eye size={14} /> View Details
          </Button>
        );
    }
  };

  return (
    <Card
      className="bg-white border-0 py-0 gap-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onViewDetail}
    >
      {/* Card Header */}
      <div className="bg-[#fafaf9] border-b border-[#f5f5f4] px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#1c1917]">{order.id}</span>
            {order.isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#78716c]">
            <Clock size={10} />
            <span>{order.time}</span>
            <span>•</span>
            <span>{order.timeAgo}</span>
          </div>
        </div>
        <span className={`${badge.bg} ${badge.text} text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1`}>
          {badge.dot && <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />}
          {badge.label}
        </span>
      </div>

      {/* Card Body */}
      <CardContent className="px-3.5 py-2.5 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UtensilsCrossed size={14} className="text-[#a8a29e]" />
            <span className="text-xs font-semibold text-[#292524]">{order.table}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)]">
            <User size={12} />
            <span>{order.guest}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium">{order.type}</Badge>
        </div>

        <div className="flex flex-col gap-1.5">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div className="bg-[#f5f5f4] rounded w-4 h-4 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#57534e]">{item.qty}</span>
              </div>
              <span className="text-xs text-[#44403c] truncate">{item.name}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <span className="text-[10px] text-[#a8a29e] ml-5">+{order.items.length - 2} more items</span>
          )}
          {order.note && (
            <p className="text-[10px] italic text-[#a8a29e] ml-5 m-0">{order.note}</p>
          )}
        </div>
      </CardContent>

      {/* Card Footer */}
      <div className="bg-[#fafaf9] border-t border-[#f5f5f4] px-3.5 py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#78716c]">{order.totalItems} items</span>
          <span className="text-sm font-bold text-[#1c1917]">LKR {order.total.toLocaleString()}</span>
        </div>
        {renderActions()}
      </div>
    </Card>
  );
}

// ─── Toast Component ───────────────────────────────────────────────────────────
function StaffToast({ type, message, detail, onClose }: { type: "success" | "error"; message: string; detail: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
      type === "success"
        ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
        : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
    }`}>
      {type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{message}</span>
        <span className="text-xs opacity-80">{detail}</span>
      </div>
      <button onClick={onClose} className="ml-3 text-current opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
    </div>
  );
}

// ─── Reject Modal Component ────────────────────────────────────────────────────
function RejectModal({ orderId, onClose, onConfirm }: { orderId: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const quickTags = ["86'd Item", "Duplicate Order", "Customer Left", "Kitchen Closed", "Out of Stock"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[440px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[rgba(235,87,87,0.1)] flex items-center justify-center">
              <XCircle size={20} className="text-[var(--state-error)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1c1917] m-0">Reject Order {orderId}?</h3>
              <p className="text-xs text-[#78716c] m-0">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 flex flex-col gap-3">
          <label className="text-sm font-medium text-[#44403c]">Reason for rejection</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="resize-none h-20"
          />
          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setReason(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                  reason === tag
                    ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                    : "bg-white text-[#57534e] border-[#d6d3d1] hover:bg-[#f5f5f4]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Keep Order</Button>
          <Button className="flex-1 bg-[var(--state-error)] text-white hover:bg-[rgba(235,87,87,0.85)]" onClick={() => onConfirm(reason || "No reason provided")}>
            Reject Order
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StaffOrderQueue() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrderStatus>("placed");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingOrder, setRejectingOrder] = useState<string | null>(null);

  const orders = useStaffOrdersStore((s) => s.orders);
  const toast = useStaffOrdersStore((s) => s.toast);
  const fetchOrders = useStaffOrdersStore((s) => s.fetchOrders);
  const acceptOrder = useStaffOrdersStore((s) => s.acceptOrder);
  const rejectOrder = useStaffOrdersStore((s) => s.rejectOrder);
  const advanceStatus = useStaffOrdersStore((s) => s.advanceStatus);
  const clearToast = useStaffOrdersStore((s) => s.clearToast);
  const getCountByStatus = useStaffOrdersStore((s) => s.getCountByStatus);
  const setupSse = useStaffOrdersStore((s) => s.setupSse);
  const stopSse = useStaffOrdersStore((s) => s.stopSse);

  const { user } = useAuthStore();

  // Orders and SSE are now fetched and managed globally via StaffGlobalOrdersProvider

  const filteredOrders = orders.filter(
    (o) =>
      o.status === activeTab &&
      (searchQuery === "" ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.table.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header Area */}
      <div className="bg-white px-6 pt-5 pb-0 flex flex-col gap-4">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold text-[#1c1917] m-0 leading-7">Orders Queue</h1>
            <p className="text-xs text-[#78716c] m-0">Manage incoming kitchen orders in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID or Table..."
                className="pl-8 h-9 text-xs"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <SlidersHorizontal size={16} className="text-[#78716c]" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="border-b border-[#e7e5e4] flex items-start gap-0 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = getCountByStatus(tab.value);
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 pb-3 px-1 mr-5 cursor-pointer bg-transparent border-0 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold"
                    : "border-transparent text-[#78716c] font-medium hover:text-[#44403c]"
                } text-xs`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0 ${
                    isActive ? "bg-[var(--brand-primary)] text-white" : "bg-[#e7e5e4] text-[#57534e]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 bg-[#f8f6f5] px-6 py-4 overflow-y-auto">
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => acceptOrder(order.id)}
                onReject={() => setRejectingOrder(order.id)}
                onAdvance={() => advanceStatus(order.id)}
                onViewDetail={() => router.push(`/staff/orders/${order.id.replace("#", "")}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[#78716c]">
            <div className="w-14 h-14 rounded-full bg-[#f5f5f4] flex items-center justify-center">
              <UtensilsCrossed size={24} className="text-[#a8a29e]" />
            </div>
            <p className="text-sm mt-3 m-0">
              No orders in &ldquo;{STATUS_TABS.find((t) => t.value === activeTab)?.label}&rdquo; status
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingOrder && (
        <RejectModal
          orderId={rejectingOrder}
          onClose={() => setRejectingOrder(null)}
          onConfirm={(reason) => {
            rejectOrder(rejectingOrder, reason);
            setRejectingOrder(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <StaffToast
          type={toast.type}
          message={toast.message}
          detail={toast.detail}
          onClose={clearToast}
        />
      )}
    </div>
  );
}
