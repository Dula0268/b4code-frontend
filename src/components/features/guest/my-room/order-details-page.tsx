"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
    ChevronLeft, Clock, ChefHat, CheckCircle2, Truck, Package,
    Receipt, Phone, Star, MapPin
} from "lucide-react"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ORDER = {
    id: "#4029",
    status: "preparing" as const,
    placedAt: "12:45 PM",
    eta: "12 min",
    assignedTo: "Chef Marcus",
    deliveredBy: "Room Service – Amal",
    items: [
        { name: "Club Sandwich", qty: 1, price: "LKR 1,850", img: "/images/room/food-beverage.png" },
        { name: "Fresh Mojito", qty: 2, price: "LKR 950", img: "/images/room/pool-spa.png" },
        { name: "Caesar Salad", qty: 1, price: "LKR 1,200", img: "/images/room/food-order-hero.png" },
    ],
    subtotal: "LKR 4,950",
    serviceCharge: "LKR 495",
    total: "LKR 5,445",
    room: "Suite 402",
}

const TIMELINE = [
    { label: "Order Placed", time: "12:45 PM", done: true, active: false },
    { label: "Preparing in Kitchen", time: "12:48 PM", done: true, active: true, assignee: "Chef Marcus" },
    { label: "Ready for Delivery", time: "—", done: false, active: false },
    { label: "On the Way", time: "—", done: false, active: false },
    { label: "Delivered", time: "—", done: false, active: false },
]

export default function OrderDetailsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[var(--gray-5)]/10 pt-20 pb-16">
            <div className="max-w-[840px] mx-auto px-4 pt-4">

                {/* Back */}
                <Link href="/guest/my-room" className="inline-flex items-center gap-1 text-[var(--gray-3)] hover:text-[var(--fg)] text-[14px] font-bold mb-6 no-underline transition-colors">
                    <ChevronLeft size={16} /> Back to My Room
                </Link>

                {/* ── Header ────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[28px] md:text-[32px] font-bold text-[var(--fg)] leading-tight mb-1">
                            Order {ORDER.id}
                        </h1>
                        <p className="text-[14px] text-[var(--gray-2)]">
                            Placed at {ORDER.placedAt} · Delivering to <span className="font-bold text-[var(--fg)]">{ORDER.room}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--brand-secondary)]/10 text-[var(--secondary-active)] px-4 py-2 rounded-full font-bold text-[13px] uppercase tracking-wider w-fit">
                        <Clock size={14} />
                        ETA {ORDER.eta}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left Column: Items + Bill ────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Ordered Items */}
                        <div className="bg-[var(--white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] border border-[var(--border)] p-6 md:p-8">
                            <h2 className="text-[16px] font-bold text-[var(--fg)] mb-6">Ordered Items</h2>

                            <div className="space-y-5">
                                {ORDER.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="relative w-[60px] h-[60px] rounded-[var(--radius-lg)] overflow-hidden flex-shrink-0 border border-[var(--border)]">
                                            <Image src={item.img} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[15px] font-bold text-[var(--fg)]">{item.name}</p>
                                            <p className="text-[13px] text-[var(--gray-3)]">Qty: {item.qty}</p>
                                        </div>
                                        <p className="text-[15px] font-bold text-[var(--fg)]">{item.price}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full h-px bg-[var(--border)] my-6" />

                            {/* Bill Breakdown */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-[var(--gray-2)]">Subtotal</span>
                                    <span className="text-[var(--fg)] font-medium">{ORDER.subtotal}</span>
                                </div>
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-[var(--gray-2)]">Service Charge (10%)</span>
                                    <span className="text-[var(--fg)] font-medium">{ORDER.serviceCharge}</span>
                                </div>
                                <div className="w-full h-px bg-[var(--border)]" />
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="font-bold text-[var(--fg)]">Total</span>
                                    <span className="font-black text-[var(--brand-primary)]">{ORDER.total}</span>
                                </div>
                                <p className="text-[12px] text-[var(--gray-4)] flex items-center gap-1.5">
                                    <Receipt size={12} /> Charged to room {ORDER.room}
                                </p>
                            </div>
                        </div>

                        {/* Staff Assignment */}
                        <div className="bg-[var(--white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] border border-[var(--border)] p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--black-2)] flex items-center justify-center flex-shrink-0">
                                <ChefHat size={22} className="text-[var(--brand-secondary)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-[var(--fg)]">{ORDER.assignedTo}</p>
                                <p className="text-[13px] text-[var(--gray-3)]">Currently preparing your order</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--gray-3)] hover:text-[var(--fg)] hover:bg-[var(--gray-5)]/20 transition-colors cursor-pointer">
                                <Phone size={16} />
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Timeline ──────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--white)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] border border-[var(--border)] p-6 md:p-8 sticky top-24">
                            <h2 className="text-[16px] font-bold text-[var(--fg)] mb-8">Order Progress</h2>

                            <div className="relative pl-4">
                                {/* Track line */}
                                <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-[var(--gray-5)]"></div>

                                <div className="space-y-8">
                                    {TIMELINE.map((step, i) => (
                                        <div key={i} className="relative flex items-start gap-5">
                                            <div className={`w-3.5 h-3.5 rounded-full z-10 ring-4 ring-white flex-shrink-0 mt-0.5 ${
                                                step.active ? "bg-[var(--brand-secondary)] animate-pulse" :
                                                step.done ? "bg-[var(--state-success)]" :
                                                "bg-[var(--gray-5)]"
                                            }`}></div>
                                            <div className="flex-1">
                                                <p className={`text-[14px] font-bold ${step.done || step.active ? "text-[var(--fg)]" : "text-[var(--gray-4)]"}`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-[12px] text-[var(--gray-3)] mt-0.5">{step.time}</p>
                                                {step.assignee && (
                                                    <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] bg-[var(--gray-5)]/30 px-2.5 py-1 rounded-md text-[var(--gray-2)] font-bold uppercase">
                                                        <ChefHat size={11} /> {step.assignee}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full h-px bg-[var(--border)] my-6" />

                            <button
                                onClick={() => router.push('/guest/my-room/message-staff')}
                                className="w-full bg-[var(--black-2)] hover:bg-[var(--black-3)] text-[var(--white)] py-3.5 rounded-[var(--radius-lg)] font-bold text-[14px] transition-colors cursor-pointer shadow-[var(--shadow-soft)]"
                            >
                                Contact Staff about Order
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
