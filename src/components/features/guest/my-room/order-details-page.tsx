"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Clock, ChefHat, CheckCircle2, Receipt,
  Phone, MessageSquare, Star, Package, Truck,
  ArrowRight, RefreshCw, AlertCircle, Utensils, MapPin
} from "lucide-react"



// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "preparing" | "ready" | "delivering" | "delivered"

const ORDER = {
  id: "#4029",
  status: "preparing" as OrderStatus,
  placedAt: "12:45 PM",
  eta: "12 min",
  etaMins: 12,
  assignedTo: "Chef Marcus",
  deliveredBy: "Room Service – Amal",
  room: "Suite 402",
  items: [
    { name: "Club Sandwich", qty: 1, price: 1850, img: "/images/room/food-beverage.png", description: "Chicken, bacon, lettuce, tomato on toasted bread" },
    { name: "Fresh Mojito", qty: 2, price: 950, img: "/images/room/pool-spa.png", description: "Fresh mint, lime, white rum, sparkling water" },
    { name: "Caesar Salad", qty: 1, price: 1200, img: "/images/room/food-order-hero.png", description: "Romaine lettuce, croutons, parmesan, caesar dressing" },
  ],
  subtotal: 4950,
  serviceCharge: 495,
  tax: 198,
  total: 5643,
  paymentMethod: "Charge to Room",
}

const TIMELINE: { label: string; time: string; done: boolean; active: boolean; icon: React.ElementType; assignee?: string }[] = [
  { label: "Order Received", time: "12:45 PM", done: true, active: false, icon: CheckCircle2 },
  { label: "Preparing in Kitchen", time: "12:48 PM", done: true, active: true, icon: ChefHat, assignee: "Chef Marcus" },
  { label: "Ready for Delivery", time: "—", done: false, active: false, icon: Package },
  { label: "On the Way", time: "—", done: false, active: false, icon: Truck },
  { label: "Delivered", time: "—", done: false, active: false, icon: CheckCircle2 },
]

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string; progress: number }> = {
  preparing: { label: "Preparing", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", progress: 40 },
  ready: { label: "Ready for Delivery", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", progress: 65 },
  delivering: { label: "On the Way", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", progress: 80 },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-50 border-green-200", progress: 100 },
}

export default function OrderDetailsPage() {
  const status = ORDER.status
  const statusInfo = STATUS_MAP[status]

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)" }}>
      <div className="max-w-[900px] mx-auto px-4 pt-6">

        {/* ── Hero status bar ───────────────────────────────────────────── */}
        <div className="bg-[var(--black-2)] rounded-[28px] overflow-hidden mb-6 shadow-lg">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[28px] font-black text-white tracking-tight">Order {ORDER.id}</h1>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-white/50">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> Placed at {ORDER.placedAt}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {ORDER.room}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[var(--brand-secondary)] text-[var(--black-2)] px-5 py-3 rounded-2xl w-fit">
                <Clock size={18} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">ETA</p>
                  <p className="text-[20px] font-black leading-tight">{ORDER.eta}</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-white/40 mb-2">
                <span>Order placed</span>
                <span>Delivered</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full transition-all duration-1000"
                  style={{ width: `${statusInfo.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chef strip */}
          <div className="border-t border-white/8 px-8 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-secondary)]/20 flex items-center justify-center">
              <ChefHat size={20} className="text-[var(--brand-secondary)]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">{ORDER.assignedTo}</p>
              <p className="text-[11px] text-white/40">Currently preparing your order</p>
            </div>
            <button className="ml-auto w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors cursor-pointer">
              <Phone size={14} />
            </button>
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Items + Bill ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Ordered Items */}
            <div className="ps-card rounded-[24px] p-7">
              <h2 className="text-[16px] font-black text-[var(--fg)] mb-6 flex items-center gap-2">
                <Utensils size={16} className="text-[var(--brand-secondary)]" /> Ordered Items
              </h2>

              <div className="space-y-5">
                {ORDER.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 pb-5 border-b border-[var(--border)] last:border-0 last:pb-0">
                    <div className="relative w-[70px] h-[70px] rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--border)] shadow-sm">
                      <Image src={item.img} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-black text-[var(--fg)]">{item.name}</p>
                          <p className="text-[12px] text-[var(--gray-3)] mt-0.5 leading-snug">{item.description}</p>
                        </div>
                        <p className="text-[15px] font-black text-[var(--fg)] flex-shrink-0">LKR {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-[11px] font-bold" style={{ background: "color-mix(in srgb, var(--gray-5) 60%, white)", borderColor: "var(--border)", color: "var(--gray-2)" }}>
                          Qty: {item.qty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="ps-card rounded-[24px] p-7">
              <h2 className="text-[16px] font-black text-[var(--fg)] mb-5 flex items-center gap-2">
                <Receipt size={16} className="text-[var(--brand-secondary)]" /> Bill Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--gray-2)]">Subtotal ({ORDER.items.reduce((a, b) => a + b.qty, 0)} items)</span>
                  <span className="font-semibold text-[var(--fg)]">LKR {ORDER.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--gray-2)]">Service Charge (10%)</span>
                  <span className="font-semibold text-[var(--fg)]">LKR {ORDER.serviceCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--gray-2)]">Tax (4%)</span>
                  <span className="font-semibold text-[var(--fg)]">LKR {ORDER.tax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-[var(--border)] my-1" />
                <div className="flex justify-between">
                  <span className="text-[16px] font-black text-[var(--fg)]">Total</span>
                  <span className="text-[18px] font-black text-[var(--black-2)]">LKR {ORDER.total.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-[11px] font-bold text-[var(--gray-4)] flex items-center gap-1.5 px-2">
                    <Receipt size={11} /> {ORDER.paymentMethod} · {ORDER.room}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/guest/my-room/message-staff?tab=staff&q=Question about my order #4029"
                className="flex items-center gap-3 p-5 bg-white rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow no-underline group">
                <div className="w-10 h-10 rounded-xl bg-[var(--black-2)] flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={18} className="text-[var(--brand-secondary)]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-[var(--fg)]">Contact Staff</p>
                  <p className="text-[11px] text-[var(--gray-3)]">About this order</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-[var(--gray-4)] group-hover:text-[var(--fg)] transition-colors" />
              </Link>

              <button className="flex items-center gap-3 p-5 bg-white rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={18} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-black text-[var(--fg)]">Report Issue</p>
                  <p className="text-[11px] text-[var(--gray-3)]">Something wrong?</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-[var(--gray-4)] group-hover:text-[var(--fg)] transition-colors" />
              </button>
            </div>
          </div>

          {/* ── Right: Timeline ─────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            <div className="ps-card rounded-[24px] p-7 sticky top-24">
              <h2 className="text-[16px] font-black text-[var(--fg)] mb-7">Order Progress</h2>

              <div className="relative">
                {/* Track line */}
                <div className="absolute left-[15px] top-3 bottom-8 w-[2px] bg-[var(--border)]" />
                {/* Filled track */}
                <div className="absolute left-[15px] top-3 w-[2px] bg-gradient-to-b from-[var(--brand-secondary)] to-[var(--brand-secondary)]/40" style={{ height: "40%" }} />

                <div className="space-y-6">
                  {TIMELINE.map((step, i) => {
                    const Icon = step.icon
                    return (
                      <div key={i} className="relative flex items-start gap-4">
                        <div className={`w-[30px] h-[30px] rounded-full z-10 flex-shrink-0 flex items-center justify-center border-2 transition-all ${step.active
                          ? "bg-[var(--brand-secondary)] border-[var(--brand-secondary)] shadow-lg shadow-amber-300/40"
                          : step.done
                            ? "bg-[var(--brand-secondary)] border-[var(--brand-secondary)]"
                            : "bg-white border-[var(--border)]"
                          }`}>
                          <Icon size={13} className={step.done || step.active ? "text-[var(--black-2)]" : "text-[var(--gray-4)]"} />
                          {step.active && <span className="absolute inset-0 rounded-full bg-[var(--brand-secondary)]/30 animate-ping" />}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`text-[13px] font-bold ${step.done || step.active ? "text-[var(--fg)]" : "text-[var(--gray-4)]"}`}>
                            {step.label}
                          </p>
                          <p className="text-[11px] text-[var(--gray-4)] mt-0.5">{step.time}</p>
                          {step.assignee && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--brand-secondary)]/10 rounded-lg text-[10px] font-black text-[var(--black-2)] uppercase tracking-wide">
                              <ChefHat size={10} /> {step.assignee}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-[var(--border)] flex flex-col gap-3">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] hover:bg-[#f8f7f5] text-[13px] font-bold text-[var(--gray-2)] rounded-xl transition-colors cursor-pointer">
                  <RefreshCw size={13} /> Refresh Status
                </button>
                <Link href="/guest/my-room"
                  className="w-full py-3 bg-[var(--black-2)] hover:bg-[var(--black-3)] text-white rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-2 no-underline">
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Rate after delivery */}
            <div className="bg-[var(--black-2)] rounded-[24px] p-6 text-white">
              <p className="text-[12px] font-black text-white/40 uppercase tracking-widest mb-3">After your meal</p>
              <h3 className="text-[16px] font-black mb-1">Enjoyed it?</h3>
              <p className="text-[12px] text-white/50 mb-4 leading-relaxed">Leave a review and help other guests discover our best dishes.</p>
              <Link href="/guest/my-room/submit-review"
                className="flex items-center gap-2 text-[var(--brand-secondary)] font-bold text-[13px] no-underline hover:gap-3 transition-all">
                <Star size={14} className="fill-[var(--brand-secondary)]" />
                Write a Review <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
