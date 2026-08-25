/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { reservationsApi } from "@/api/owner/reservations.api";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    ArrowLeft,
    User,
    Mail,
    Phone,
    MessageSquare,
    PhoneCall,
    Building2,
    CalendarDays,
    CreditCard,
    CheckCircle2,
    Clock,
    LogIn,
    LogOut,
    Users,
} from "lucide-react";

/* ───────────────────── helpers ───────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTimeline(status: string): any[] {
    const isCheckedIn = ["CHECKED_IN", "CHECKED_OUT"].includes(status);
    const isCheckedOut = status === "CHECKED_OUT";
    const isConfirmed = status !== "PENDING";
    return [
        { label: "Booking Created", time: "—", icon: "created", bgClass: "bg-[var(--brand-primary)]", iconColor: "#fff", active: true },
        { label: "Payment Confirmed", time: "—", icon: "payment", bgClass: isConfirmed ? "bg-[#27ae60]" : "bg-transparent", borderClass: isConfirmed ? "" : "border-2 border-[#b0b0b0]", iconColor: isConfirmed ? "#fff" : "#b0b0b0", active: isConfirmed },
        { label: "Check-in", time: "—", icon: "checkin", bgClass: isCheckedIn ? "bg-[var(--brand-primary)]" : "bg-transparent", borderClass: isCheckedIn ? "" : "border-2 border-[#b0b0b0]", iconColor: isCheckedIn ? "#fff" : "#b0b0b0", active: isCheckedIn },
        { label: "Check-out", time: "—", icon: "checkout", bgClass: isCheckedOut ? "bg-[var(--brand-primary)]" : "bg-transparent", borderClass: isCheckedOut ? "" : "border-2 border-[#b0b0b0]", iconColor: isCheckedOut ? "#fff" : "#b0b0b0", active: isCheckedOut },
    ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReservation(data: any) {
    const checkInDate = data.checkIn ? new Date(data.checkIn as string) : null;
    const checkOutDate = data.checkOut ? new Date(data.checkOut as string) : null;
    const nights = checkInDate && checkOutDate
        ? Math.max(0, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
    const fmtDate = (d: Date | null) => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
    const fmtYear = (d: Date | null) => d ? d.getFullYear().toString() : "—";
    const price = Number(data.totalPrice || 0);
    return {
        id: `#RSV-${data.id}`,
        status: data.status || "Confirmed",
        guest: {
            name: data.guestName || "—",
            email: data.guestEmail || "—",
            phone: "—",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.guestName || "G")}&background=953002&color=fff&size=160`,
        },
        property: data.propertyName || "—",
        roomType: data.roomName || "—",
        guests: "—",
        checkIn: { date: fmtDate(checkInDate), year: fmtYear(checkInDate) },
        checkOut: { date: fmtDate(checkOutDate), year: fmtYear(checkOutDate) },
        nights,
        checkInTime: "—",
        totalAmount: `Rs. ${price.toLocaleString()}`,
        paidAmount: data.paymentStatus === "PAID" ? `Rs. ${price.toLocaleString()}` : "Pending",
        paymentMethod: "—",
        paymentDate: "—",
        timeline: buildTimeline(data.status || "CONFIRMED"),
    };
}

/* ───────────────────── component ───────────────────── */

function ReservationDetailsContent() {
    const searchParams = useSearchParams();
    const id = Number(searchParams.get("id") || 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) { setLoading(false); return; }
        reservationsApi.getReservation(id)
            .then((data) => setReservation(mapReservation(data)))
            .catch(() => setReservation(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <div className="animate-spin h-8 w-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <p className="text-[#828282] font-medium">Reservation not found.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 py-6 px-12 pb-10 overflow-y-auto">
                {/* Back Link */}
                <a href="/owner/reservation" className="inline-flex items-center gap-1.5 text-[13px] no-underline font-semibold mb-4 text-[var(--brand-primary)]">
                    <ArrowLeft size={14} /> Back to Reservations
                </a>

                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[11px] font-bold text-[var(--brand-primary)] tracking-[1.2px] mb-1">RESERVATION ID</div>
                        <h1 className="text-[32px] font-black text-[#1d1d1d] m-0">{reservation.id}</h1>
                    </div>
                    <span className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-[#f0faf4] border border-[#c8e6d0] rounded-full text-[13px] font-bold text-[#1d1d1d]">
                        <CheckCircle2 size={14} color="#27ae60" /> Confirmed
                    </span>
                </div>

                {/* ── Guest Info + Timeline Row ── */}
                <div className="grid grid-cols-[3fr_2fr] gap-4 mb-4">
                    {/* Guest Information */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={18} color="#953002" />
                            <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Guest Information</h3>
                        </div>

                        <div className="mb-3">
                            <img src={reservation.guest.avatar} alt={reservation.guest.name} className="w-[100px] h-[100px] rounded-lg object-cover" />
                        </div>

                        <div className="text-[20px] font-extrabold text-[#1d1d1d] mb-3">{reservation.guest.name}</div>

                        <div className="flex items-center gap-2 mb-2">
                            <Mail size={14} color="#828282" />
                            <span className="text-[13px] color-[#4f4f4f] font-medium text-[#4f4f4f]">{reservation.guest.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Phone size={14} color="#828282" />
                            <span className="text-[13px] color-[#4f4f4f] font-medium text-[#4f4f4f]">{reservation.guest.phone}</span>
                        </div>

                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[14px] font-bold cursor-pointer mt-4">
                            <MessageSquare size={16} /> Message
                        </button>
                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[14px] font-bold cursor-pointer mt-2">
                            <PhoneCall size={16} /> Call Guest
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={18} color="#953002" />
                            <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Timeline</h3>
                        </div>

                        <div className="flex flex-col gap-0">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {reservation.timeline.map((item: any, i: number) => (
                                <div key={i} className="flex items-start gap-3.5 relative pb-5">
                                    {/* Timeline dot */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${item.bgClass} ${item.borderClass ?? ""}`}>
                                        {item.icon === "created" && <CalendarDays size={14} color={item.iconColor} />}
                                        {item.icon === "payment" && <CheckCircle2 size={14} color={item.iconColor} />}
                                        {item.icon === "checkin" && <LogIn size={14} color={item.iconColor} />}
                                        {item.icon === "checkout" && <LogOut size={14} color={item.iconColor} />}
                                    </div>
                                    {/* Connector line */}
                                    {i < reservation.timeline.length - 1 && (
                                        <div className={`absolute left-[15px] top-[36px] bottom-0 border-l-2 border-dashed ${
                                            reservation.timeline[i + 1].active ? "border-[#e0e0e0]" : "border-[#e8e8e8]"
                                        }`} />
                                    )}
                                    {/* Label & time */}
                                    <div className="flex-1">
                                        <div className={`text-[13px] ${
                                            item.active ? "font-bold text-[#1d1d1d]" : "font-medium text-[#828282]"
                                        }`}>
                                            {item.label}
                                        </div>
                                        <div className={`text-[11px] mt-0.5 ${
                                            item.active ? "text-[var(--brand-primary)]" : "text-[#b0b0b0]"
                                        }`}>
                                            {item.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Property & Room + Stay Dates Row ── */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Property & Room */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={18} color="#953002" />
                            <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Property & Room</h3>
                        </div>

                        <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase">PROPERTY NAME</div>
                        <div className="text-[16px] font-extrabold text-[#1d1d1d] mt-1">{reservation.property}</div>

                        <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase mt-3.5">ROOM TYPE</div>
                        <div className="text-[16px] font-extrabold text-[#1d1d1d] mt-1">{reservation.roomType}</div>

                        <div className="flex items-center gap-2 mt-4">
                            <Users size={14} color="#953002" />
                            <span className="text-[13px] font-medium text-[var(--brand-primary)]">{reservation.guests}</span>
                        </div>
                    </div>

                    {/* Stay Dates */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDays size={18} color="#953002" />
                            <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Stay Dates</h3>
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            {/* Check-in */}
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase">CHECK-IN</div>
                                <div className="text-[22px] font-black text-[#1d1d1d] mt-1">{reservation.checkIn.date}</div>
                                <div className="text-[13px] font-medium text-[#828282] mt-0.5">{reservation.checkIn.year}</div>
                            </div>

                            {/* Nights Badge */}
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[var(--brand-primary)]">
                                <span className="text-[10px] font-extrabold text-white tracking-wide">{reservation.nights}</span>
                                <span className="text-[8px] font-bold text-[#ffd9b3] tracking-wide">NIGHTS</span>
                            </div>

                            {/* Check-out */}
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase">CHECK-OUT</div>
                                <div className="text-[22px] font-black text-[#1d1d1d] mt-1">{reservation.checkOut.date}</div>
                                <div className="text-[13px] font-medium text-[#828282] mt-0.5">{reservation.checkOut.year}</div>
                            </div>
                        </div>

                        <div className="text-[12px] color-[#828282] text-center mt-4 pt-3 border-t border-[#f0f0f0] text-[#828282]">
                            Check-in time: {reservation.checkInTime}
                        </div>
                    </div>
                </div>

                {/* ── Payment Summary ── */}
                <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard size={18} color="#953002" />
                        <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Payment Summary</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-5 mb-4">
                        <div>
                            <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase">TOTAL AMOUNT</div>
                            <div className="text-[22px] font-black text-[#1d1d1d] mt-1">{reservation.totalAmount}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase">PAID AMOUNT</div>
                            <div className="text-[22px] font-black text-[#27ae60] mt-1">{reservation.paidAmount}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[var(--brand-primary)] tracking-wide uppercase">PAYMENT METHOD</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <CreditCard size={14} color="#953002" />
                                <span className="text-[14px] font-semibold text-[#1d1d1d]">{reservation.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#f0f0f0] rounded-[3px] overflow-hidden">
                        <div className="h-full w-full bg-[#27ae60] rounded-[3px]" />
                    </div>

                    <div className="text-[12px] font-medium mt-2 text-[#27ae60]">
                        Fully paid on {reservation.paymentDate}
                    </div>
                </div>
            </div>
    );
}

export default function ReservationDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <div className="animate-spin h-8 w-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full" />
            </div>
        }>
            <ReservationDetailsContent />
        </Suspense>
    );
}
