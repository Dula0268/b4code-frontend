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
      className="bg-white/80 backdrop-blur-xl border border-white py-0 gap-0 overflow-hidden cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(192,86,33,0.08)] hover:-translate-y-1 transition-all duration-500 rounded-3xl flex flex-col group relative"
      onClick={onViewDetail}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C05621] opacity-[0.03] blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      
      {/* Card Header */}
      <div className="bg-white/40 border-b border-[#F0EBE7]/50 px-5 py-4 flex items-center justify-between z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#1A1A1A]">{order.id}</span>
            {order.isUrgent && <span className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgb(239,68,68,0.6)] animate-pulse" />}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9E7B6A]">
            <Clock size={12} />
            <span>{order.time}</span>
            <span>•</span>
            <span>{order.timeAgo}</span>
          </div>
        </div>
        <span className={`${badge.bg} ${badge.text} text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm`}>
          {badge.dot && <span className={`w-2 h-2 rounded-full ${badge.dot}`} />}
          {badge.label}
        </span>
      </div>

      {/* Card Body */}
      <CardContent className="px-5 py-4 flex flex-col gap-3 flex-1 z-10">
        <div className="flex items-center justify-between bg-white/50 p-2.5 rounded-xl border border-white shadow-sm">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-[#9E7B6A]" />
            <span className="text-xs font-bold text-[#1A1A1A]">{order.table}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#C05621]">
            <User size={14} />
            <span>{order.guest}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{order.type}</Badge>
        </div>

        <div className="flex flex-col gap-2.5 mt-1">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <div className="bg-[#FFF8F0] border border-[#F0EBE7]/50 rounded-lg w-6 h-6 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-[11px] font-extrabold text-[#C05621]">{item.qty}</span>
                </div>
                <span className="text-[13px] font-semibold text-[#1A1A1A] truncate">{item.name}</span>
              </div>
              {item.note && (
                <span className="text-[11px] font-medium text-[#9E7B6A] italic ml-8 line-clamp-1">{item.note}</span>
              )}
            </div>
          ))}
          {order.items.length > 2 && (
            <span className="text-[11px] font-bold text-[#C05621] ml-8">+{order.items.length - 2} more items</span>
          )}
          {order.note && (
            <div className="mt-2 p-2.5 bg-yellow-50/50 border border-yellow-100 rounded-xl">
              <p className="text-[11px] font-semibold italic text-yellow-800 m-0 leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Card Footer */}
      <div className="bg-white/40 border-t border-[#F0EBE7]/50 px-5 py-4 flex flex-col gap-3.5 z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-[#9E7B6A] uppercase">{order.totalItems} items</span>
          <span className="text-[17px] font-extrabold text-[#1A1A1A] tracking-tight">LKR {order.total.toLocaleString()}</span>
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
      <div className="flex-1 px-6 py-6 overflow-y-auto relative animate-in fade-in zoom-in-95 duration-1000">
        <div className="absolute inset-0 bg-[#F8F6F5]" />
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
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
          <div className="flex flex-col items-center justify-center py-24 text-[#9E7B6A] relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/80 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center">
              <UtensilsCrossed size={32} className="text-[#C05621] opacity-50" />
            </div>
            <p className="text-[15px] font-bold mt-5 m-0">
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
