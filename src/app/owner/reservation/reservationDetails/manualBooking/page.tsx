/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { roomsApi } from "@/api/owner/rooms.api";
import { reservationsApi } from "@/api/owner/reservations.api";
import { useAuthStore } from "@/store/auth/auth.store";
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
    const router = useRouter();
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        roomsApi.listRooms(ownerId)
            .then((data) => {
                const list = data.rooms || [];
                setRooms(list);
                if (list.length > 0) setSelectedRoomId(String(list[0].id));
            })
            .catch(() => {});
    }, [ownerId]);

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

    // Pricing & Payment
    const [totalAmount, setTotalAmount] = useState("");
    const [deposit, setDeposit] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("Pending");
    const [paymentMethod, setPaymentMethod] = useState("Credit/Debit Card");

    // Additional
    const [specialRequests, setSpecialRequests] = useState("");

    const handleCreateBooking = async () => {
        const selectedRoom = rooms.find((r) => String(r.id) === selectedRoomId);
        if (!selectedRoom || !checkIn || !checkOut || !firstName) {
            setSubmitError("Please fill in guest name, check-in/out dates, and select a room.");
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        try {
            await reservationsApi.createManualBooking({
                propertyId: selectedRoom.propertyId,
                roomId: selectedRoom.id,
                guestName: `${firstName} ${lastName}`.trim(),
                guestEmail: email,
                checkIn,
                checkOut,
                adults: Number(adults),
                children: Number(children),
                totalAmount: totalAmount ? Number(totalAmount) : 0,
                paymentMethod,
                notes: specialRequests,
            });
            router.push("/owner/reservation");
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSubmitError((err as any)?.response?.data?.message ?? "Failed to create booking. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto px-6 py-8 font-sans">
                <div className="max-w-[820px] mx-auto pb-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-[11px] font-bold tracking-[0.8px] uppercase mb-6">
                        <a
                            href="/owner/reservation"
                            className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors"
                        >
                            Reservations
                        </a>
                        <span className="text-[#d0d0d0]">›</span>
                        <span className="text-[var(--brand-primary)]">Manual Booking</span>
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
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Last Name *</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="e.g. Doe"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors placeholder:text-[#c0c0c0]"
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
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors placeholder:text-[#c0c0c0]"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Contact Number *</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors placeholder:text-[#c0c0c0]"
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
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#4f4f4f] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Check-out Date *</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#4f4f4f] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors cursor-pointer"
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
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Children</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={children}
                                    onChange={(e) => setChildren(e.target.value)}
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Assigned Room</label>
                                <div className="relative">
                                    <select
                                        value={selectedRoomId}
                                        onChange={(e) => setSelectedRoomId(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[var(--brand-primary)] transition-colors"
                                    >
                                        {rooms.length === 0 && <option value="">No rooms available</option>}
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} — {r.roomType}
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
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] font-bold text-[var(--brand-primary)] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors placeholder:text-[#c0c0c0] placeholder:font-normal"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Initial Deposit / Paid ($)</label>
                                <input
                                    type="text"
                                    value={deposit}
                                    onChange={(e) => setDeposit(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full py-2.5 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors placeholder:text-[#c0c0c0]"
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
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[var(--brand-primary)] transition-colors"
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
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[var(--brand-primary)] transition-colors"
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
                            className="w-full py-3 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border focus:border-[var(--brand-primary)] transition-colors resize-y placeholder:text-[#c0c0c0]"
                        />
                    </div>

                    {/* ── Action Buttons ── */}
                    {submitError && (
                        <div className="mb-3 px-4 py-2 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b] font-medium">
                            {submitError}
                        </div>
                    )}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-[0_-2px_20px_-5px_rgba(0,0,0,0.05)] border border-[#e8e8e8]">
                        <a href="/owner/reservation" className="no-underline">
                            <button className="flex items-center gap-2 py-3 px-6 bg-transparent text-[#4f4f4f] border border-[#e0e0e0] rounded-xl text-[14px] font-bold cursor-pointer hover:bg-[#f5f5f5] hover:text-[#1d1d1d] transition-colors">
                                <X size={18} /> Cancel
                            </button>
                        </a>
                        <button
                            onClick={handleCreateBooking}
                            disabled={submitting}
                            className="flex items-center gap-2 py-3 px-10 bg-[var(--brand-primary)] text-white border-none rounded-xl text-[14px] font-extrabold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 size={18} /> {submitting ? "Creating…" : "Create Booking"}
                        </button>
                    </div>
                </div>
            </div>
    );
}
