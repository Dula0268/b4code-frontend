/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState } from "react";
import {
    Bell,
    ChevronDown,
    CheckCircle2,
    X,
    User,
    CalendarDays,
    CreditCard
} from "lucide-react";

/* ───────────────────── constants ───────────────────── */

const roomTypes = [
    "King Suite",
    "Queen Suite",
    "Deluxe King",
    "Standard Room",
    "Family Loft",
    "Double Room",
];

const paymentMethods = [
    "Cash on Arrival",
    "Credit/Debit Card",
    "Bank Transfer",
    "Online Payment Gateway",
];

const paymentStatuses = [
    "Pending",
    "Partially Paid",
    "Fully Paid",
];

/* ───────────────────── component ───────────────────── */

/**
 * ManualBookingPage Component
 *
 * Step-by-step form for creating manual bookings on behalf of guests.
 * Includes guest details, room selection, date picking, and payment processing.
 */
export default function ManualBookingPage() {
    // Guest Details
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Booking Details
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState("2");
    const [children, setChildren] = useState("0");
    const [roomType, setRoomType] = useState("King Suite");

    // Pricing & Payment
    const [totalAmount, setTotalAmount] = useState("");
    const [deposit, setDeposit] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("Pending");
    const [paymentMethod, setPaymentMethod] = useState("Credit/Debit Card");

    // Additional
    const [specialRequests, setSpecialRequests] = useState("");

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            <OwnerSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* ── Top Bar ── */}
                <div className="flex justify-end items-center py-2 px-8 bg-white border-b border-[#e8e8e8] shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="User" className="w-full h-full rounded-full" />
                        </div>
                    </div>
                </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-8 font-sans">
                <div className="max-w-[820px] mx-auto pb-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-[11px] font-bold tracking-[0.8px] uppercase mb-6">
                        <a
                            href="/owner/reservation"
                            className="text-[#828282] no-underline hover:text-[#953002] transition-colors"
                        >
                            Reservations
                        </a>
                        <span className="text-[#d0d0d0]">›</span>
                        <span className="text-[#953002]">Manual Booking</span>
                    </nav>

                    {/* Header Row */}
                    <div className="mb-8">
                        <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1.5 leading-tight tracking-wide">
                            Create Manual Booking
                        </h1>
                        <p className="text-[14px] text-[#828282] m-0">
                            Register walk-in guests or manually configure an external reservation.
                        </p>
                    </div>

                    {/* ── Section 1: Guest Information ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl py-8 px-10 mb-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#f0f0f0] pb-4">
                            <div className="w-8 h-8 rounded-full bg-[#fef5ef] flex items-center justify-center shrink-0">
                                <User size={16} color="#953002" />
                            </div>
                            <h2 className="text-[18px] font-black text-[#1d1d1d] m-0">Guest Information</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-5">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">First Name *</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="e.g. John"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="e.g. Doe"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="guest@example.com"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Contact Number *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Booking Details ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl py-8 px-10 mb-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#f0f0f0] pb-4">
                            <div className="w-8 h-8 rounded-full bg-[#fef5ef] flex items-center justify-center shrink-0">
                                <CalendarDays size={16} color="#953002" />
                            </div>
                            <h2 className="text-[18px] font-black text-[#1d1d1d] m-0">Booking Details</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-5">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Check-in Date *</label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#4f4f4f] outline-none font-sans box-border focus:border-[#953002] transition-colors cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Check-out Date *</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#4f4f4f] outline-none font-sans box-border focus:border-[#953002] transition-colors cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-5">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Adults *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={adults}
                                    onChange={(e) => setAdults(e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Children</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={children}
                                    onChange={(e) => setChildren(e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Assigned Room Type</label>
                                <div className="relative">
                                    <select
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[#953002] transition-colors"
                                    >
                                        {roomTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        color="#828282"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 3: Pricing & Payment ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl py-8 px-10 mb-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-6 border-b border-[#f0f0f0] pb-4">
                            <div className="w-8 h-8 rounded-full bg-[#fef5ef] flex items-center justify-center shrink-0">
                                <CreditCard size={16} color="#953002" />
                            </div>
                            <h2 className="text-[18px] font-black text-[#1d1d1d] m-0">Pricing & Payment Context</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-5">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Total Amount ($)</label>
                                <input
                                    type="text"
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] font-bold text-[#953002] outline-none font-sans box-border focus:border-[#953002] transition-colors placeholder:text-[#c0c0c0] placeholder:font-normal"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Initial Deposit / Paid ($)</label>
                                <input
                                    type="text"
                                    value={deposit}
                                    onChange={(e) => setDeposit(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Payment Status</label>
                                <div className="relative">
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[#953002] transition-colors"
                                    >
                                        {paymentStatuses.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        color="#828282"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Payment Method</label>
                                <div className="relative">
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[#953002] transition-colors"
                                    >
                                        {paymentMethods.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        color="#828282"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 4: Special Requests ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl py-8 px-10 mb-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
                        <label className="block text-[15px] font-extrabold text-[#1d1d1d] mb-1">
                            Guest Notes & Special Requests
                        </label>
                        <p className="text-[12px] text-[#828282] mb-3">Add any additional requirements, allergies, or context regarding this reservation.</p>
                        <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            rows={3}
                            placeholder="e.g. Needs a late check-in, allergic to peanuts..."
                            className="w-full py-3 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[#953002] transition-colors resize-y placeholder:text-[#c0c0c0]"
                        />
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-[0_-2px_20px_-5px_rgba(0,0,0,0.05)] border border-[#e8e8e8]">
                        <a href="/owner/reservation" className="no-underline">
                            <button className="flex items-center gap-2 py-3 px-6 bg-transparent text-[#4f4f4f] border border-[#e0e0e0] rounded-xl text-[14px] font-bold cursor-pointer hover:bg-[#f5f5f5] hover:text-[#1d1d1d] transition-colors">
                                <X size={18} /> Cancel
                            </button>
                        </a>
                        <a href="/owner/reservation" className="no-underline">
                            <button className="flex items-center gap-2 py-3 px-10 bg-[#953002] text-white border-none rounded-xl text-[14px] font-extrabold cursor-pointer hover:bg-[#b03a02] transition-colors shadow-md">
                                <CheckCircle2 size={18} /> Create Booking
                            </button>
                        </a>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
