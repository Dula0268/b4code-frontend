"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Lock,
  Receipt,
  XCircle,
  ChefHat,
  PackageCheck,
  Truck,
  CircleCheckBig,
  ArrowRight,
  MessageCircle,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  useStaffOrdersStore,
  type OrderStatus,
} from "@/store/staff/orders/staff-orders.store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Confirmed",
  "in-progress": "Preparing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_BADGE_STYLE: Record<OrderStatus, string> = {
  placed: "bg-[rgba(47,128,237,0.12)] text-[var(--state-info)]",
  accepted: "bg-[rgba(39,174,96,0.12)] text-[var(--state-success)]",
  "in-progress": "bg-[rgba(255,180,1,0.12)] text-[var(--brand-secondary)]",
  delivered: "bg-[rgba(39,174,96,0.12)] text-[var(--state-success)]",
  cancelled: "bg-[rgba(235,87,87,0.12)] text-[var(--state-error)]",
};

const NEXT_ACTION: Record<string, { label: string; subtitle: string }> = {
  placed: { label: "Accept Order", subtitle: "Confirm this order" },
  accepted: { label: "Set to Preparing", subtitle: "Next logical step" },
  "in-progress": { label: "Mark Delivered", subtitle: "Final step" },
};

interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}

const FUTURE_STEPS: StatusStep[] = [
  { status: "in-progress", label: "Set to Preparing", icon: <ChefHat size={16} /> },
  { status: "delivered", label: "Mark Delivered", icon: <Truck size={16} /> },
];

export default function StaffOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const order = useStaffOrdersStore((s) => s.getOrder(`#${orderId}`));
  const advanceStatus = useStaffOrdersStore((s) => s.advanceStatus);
  const rejectOrder = useStaffOrdersStore((s) => s.rejectOrder);
  const addInternalNote = useStaffOrdersStore((s) => s.addInternalNote);

  const handleAdvance = () => { if (order) advanceStatus(order.id); };
  const handleReject = () => {
    if (!order || !rejectReason.trim()) return;
    rejectOrder(order.id, rejectReason);
    setIsRejectOpen(false);
    setRejectReason("");
  };
  const handleAddNote = () => {
    if (!noteText.trim() || !order) return;
    addInternalNote(order.id, noteText.trim());
    setNoteText("");
  };

  // Match the guest checkout's formatLkr rounding (0dp) — the raw toLocaleString()
  // this replaced showed fractional LKR amounts (e.g. "82.5") that guests never see,
  // making the same persisted order look like it had a different price on each screen.
  const fmt = (n: number) => `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--gray-3)]">
        <Receipt size={40} className="mb-3 opacity-40" />
        <p className="text-sm font-medium">Order not found</p>
      </div>
    );
  }

  const isTerminal = order.status === "delivered" || order.status === "cancelled";
  const canReject = ["placed", "accepted", "in-progress"].includes(order.status);
  const nextAction = NEXT_ACTION[order.status];

  const statusOrder: OrderStatus[] = ["placed", "accepted", "in-progress", "delivered"];
  const currentIdx = statusOrder.indexOf(order.status);
  const futureSteps = FUTURE_STEPS.filter((step) => {
    const stepIdx = statusOrder.indexOf(step.status);
    return stepIdx > currentIdx + 1;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#f8fafc]">
      {/* Header */}
      <header className="flex-none bg-white border-b border-[var(--gray-5)] px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push("/staff/orders")}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[var(--black-2)] leading-none">Order {order.id}</h1>
              <Badge variant="outline" className={`px-2 py-px text-[9px] font-bold uppercase tracking-wider border-0 ${STATUS_BADGE_STYLE[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[var(--gray-3)]">
              <span className="flex items-center gap-1"><MapPin size={10} /> {order.room || order.table}</span>
              <span className="flex items-center gap-1"><User size={10} /> {order.guest}</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {order.timeAgo}</span>
            </div>
          </div>
        </div>
        {canReject && (
          <Button variant="outline" size="sm" className="text-[var(--state-error)] border-[var(--state-error)] hover:bg-[rgba(235,87,87,0.06)] text-[11px] h-7 px-2.5" onClick={() => setIsRejectOpen(true)}>
            <XCircle size={12} className="mr-1" /> Reject
          </Button>
        )}
      </header>

      {/* Body: 2-column layout */}
      <div className="flex-1 flex gap-3 overflow-hidden p-3">

        {/* Left Column: Items + Guest Notes + Internal Notes */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-w-0">

          {/* Order Items Card */}
          <Card className="bg-white border-0 py-0 gap-0">
            <CardHeader className="px-4 py-2 flex-row items-center justify-between border-b border-[#f1f5f9]">
              <h3 className="text-xs font-bold text-[var(--black-2)]">Order Items</h3>
              <span className="text-[10px] text-[var(--gray-3)] font-medium">{order.items.length} Items</span>
            </CardHeader>

            <div className="divide-y divide-[#f1f5f9]">
              {order.items.map((item, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[6px] bg-[rgba(149,48,2,0.06)] flex items-center justify-center shrink-0 overflow-hidden">
                      <span className="text-[var(--brand-primary)] text-sm font-bold opacity-40">{item.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--black-2)]">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.tag && (
                          <Badge variant="secondary" className={`text-[10px] font-medium px-1.5 py-px ${item.tagColor || ""}`}>
                            {item.tag}
                          </Badge>
                        )}
                        {item.note && (
                          <span className="text-[10px] text-[var(--gray-3)] italic">{item.note}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-medium text-[var(--gray-3)]">×{item.qty}</span>
                    <span className="text-sm font-semibold text-[var(--black-2)]">{fmt(item.price * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#f1f5f9] bg-[#f8fafc] px-4 py-2.5">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center justify-between w-[220px]">
                  <span className="text-xs text-[var(--gray-3)]">Subtotal</span>
                  <span className="text-xs font-medium text-[var(--black-2)]">{fmt(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between w-[220px]">
                  <span className="text-xs text-[var(--gray-3)]">Service Charge</span>
                  <span className="text-xs font-medium text-[var(--black-2)]">{fmt(order.serviceCharge)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex items-center justify-between w-[220px]">
                    <span className="text-xs text-[var(--gray-3)]">Tax</span>
                    <span className="text-xs font-medium text-[var(--black-2)]">{fmt(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex items-center justify-between w-[220px]">
                    <span className="text-xs text-[var(--gray-3)]">Discount</span>
                    <span className="text-xs font-medium text-[var(--black-2)]">-{fmt(order.discount)}</span>
                  </div>
                )}
                <Separator className="w-[220px] my-0.5" />
                <div className="flex items-center justify-between w-[220px]">
                  <span className="text-sm font-bold text-[var(--black-2)]">Total</span>
                  <span className="text-sm font-bold text-[var(--brand-secondary)]">{fmt(order.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Guest Notes */}
          {order.note && (
            <div className="bg-[rgba(255,180,1,0.06)] border border-[rgba(255,180,1,0.2)] rounded-[var(--radius)] px-4 py-2.5 flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-[rgba(255,180,1,0.15)] flex items-center justify-center shrink-0">
                <MessageCircle size={13} className="text-[var(--brand-secondary)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[var(--brand-secondary)]">Guest Note</h3>
                  <span className="text-[10px] text-[var(--gray-3)]">from {order.guest}</span>
                </div>
                <p className="text-xs text-[var(--black-3)] leading-relaxed mt-0.5">{order.note}</p>
              </div>
            </div>
          )}

          {/* Internal Notes Card */}
          <Card className="bg-white border-0 py-0 gap-0">
            <CardHeader className="px-4 py-2 flex-row items-center gap-2">
              <Lock size={14} className="text-[var(--gray-3)]" />
              <h3 className="text-xs font-bold text-[var(--black-2)]">Internal Notes</h3>
            </CardHeader>

            <CardContent className="px-4 pb-2.5 pt-0 flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center shrink-0">
                <User size={13} className="text-[var(--gray-3)]" />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a private note for staff..."
                  className="bg-[#f8fafc] resize-none h-[48px] text-xs"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="bg-[var(--black-2)] text-white text-[11px] h-7 px-3 hover:bg-[var(--black-3)]"
                  >
                    Post Note
                  </Button>
                </div>
              </div>
            </CardContent>

            {order.internalNotes.length > 0 && (
              <CardContent className="px-4 pb-2.5 pt-0 flex flex-col gap-2">
                {order.internalNotes.map((note, i) => (
                  <div key={i} className="flex gap-3 pt-1">
                    <div className="w-6 h-6 rounded-full bg-[rgba(149,48,2,0.08)] flex items-center justify-center shrink-0 text-[var(--brand-primary)] text-[10px] font-bold">
                      {note.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--black-2)]">{note.author}</span>
                        <span className="text-[10px] text-[var(--gray-4)]">{note.timeAgo}</span>
                      </div>
                      <p className="text-xs text-[var(--gray-2)] mt-0.5 leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column: Status + History */}
        <div className="w-[300px] shrink-0 flex flex-col gap-3 overflow-y-auto">

          {/* Update Status Card */}
          <Card className="bg-white border-0 py-0 gap-0 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--black-2)]">Update Status</h3>
              <Badge variant="outline" className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0 ${STATUS_BADGE_STYLE[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </Badge>
            </div>

            {order.status === "cancelled" ? (
              <div className="flex flex-col items-center py-4 text-center">
                <XCircle size={28} className="text-[var(--state-error)] opacity-30 mb-1" />
                <p className="text-sm font-bold text-[var(--state-error)]">Order Rejected</p>
              </div>
            ) : isTerminal ? (
              <div className="flex flex-col items-center py-4 text-center">
                <CircleCheckBig size={28} className="text-[var(--state-success)] opacity-30 mb-1" />
                <p className="text-sm font-bold text-[var(--state-success)]">Order Completed</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {nextAction && (
                  <button
                    onClick={handleAdvance}
                    className="w-full flex items-center justify-between bg-[var(--brand-secondary)] rounded-[10px] px-4 py-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:brightness-105 transition-all"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-[var(--black-2)]">{nextAction.label}</span>
                      <span className="text-[10px] font-medium text-[var(--black-2)] opacity-70">{nextAction.subtitle}</span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--black-2)]" />
                  </button>
                )}

                {futureSteps.map((step) => (
                  <div
                    key={step.status}
                    className="w-full flex items-center justify-between bg-[#f1f5f9] rounded-[10px] px-4 py-2.5"
                  >
                    <span className="text-xs font-bold text-[var(--gray-3)]">{step.label}</span>
                    <span className="text-[var(--gray-3)]">{step.icon}</span>
                  </div>
                ))}
              </div>
            )}

            {/* History Timeline */}
            {order.history.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-[var(--black-2)]">History</h4>
                  <div className="border-l-2 border-[#e2e8f0] pl-4 flex flex-col gap-4 relative">
                    {order.history.map((entry, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[22px] top-0.5 w-2.5 h-2.5 rounded-full shadow-[0_0_0_3px_white] ${
                          entry.color === "green" ? "bg-[#22c55e]" : "bg-[#cbd5e1]"
                        }`} />
                        <p className="text-xs font-medium text-[var(--black-2)]">{entry.label}</p>
                        <p className="text-[10px] text-[var(--gray-3)]">{entry.time} &bull; {entry.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Out of stock, Kitchen too busy..."
              className="resize-none"
              rows={3}
            />
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="bg-[var(--state-error)] hover:bg-[rgba(235,87,87,0.85)]"
            >
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
