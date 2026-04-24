"use client";

import { useState } from "react";
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

/* ───────────────────── component ───────────────────── */

export default function ReservationDetailsPage() {
    const reservation = {
        id: "#RSV-8829",
        status: "Confirmed",
        guest: {
            name: "John Doe",
            email: "john.doe@email.com",
            phone: "+1 234 567 890",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face",
        },
        property: "Sunset Bay Resort",
        roomType: "Deluxe King Suite",
        guests: "2 Adults, 1 Child",
        checkIn: { date: "Oct 12", year: "2025" },
        checkOut: { date: "Oct 15", year: "2025" },
        nights: 3,
        checkInTime: "3:00 PM",
        totalAmount: "Rs. 130,000",
        paidAmount: "Rs. 130,000",
        paymentMethod: "Visa ending in 4242",
        paymentDate: "Oct 01, 2023",
        timeline: [
            { label: "Booking Created", time: "Oct 01, 2023 • 10:45 AM", icon: "created", color: "#953002", active: true },
            { label: "Payment Confirmed", time: "Oct 01, 2023 • 10:50 AM", icon: "payment", color: "#27ae60", active: true },
            { label: "Check-in", time: "Scheduled: Oct 12", icon: "checkin", color: "#b0b0b0", active: false },
            { label: "Check-out", time: "Scheduled: Oct 15", icon: "checkout", color: "#b0b0b0", active: false },
        ],
    };

    return (
        <div className="flex flex-col h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Top Bar ── */}
            <header className="flex justify-between items-center py-2.5 px-8 bg-white border-b border-[#e8e8e8] shrink-0">
                <div className="flex items-center">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex items-center gap-3.5">
                    <a href="/owner/ownerDashboard/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                        <Bell size={18} color="#4f4f4f" />
                    </a>
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                    </div>
                </div>
            </header>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 py-6 px-12 pb-10 overflow-y-auto">
                {/* Back Link */}
                <a href="/owner/reservation" className="inline-flex items-center gap-1.5 text-[13px] color-[#953002] no-underline font-semibold mb-4 text-[#953002]">
                    <ArrowLeft size={14} /> Back to Reservations
                </a>

                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[11px] font-bold text-[#953002] tracking-[1.2px] mb-1">RESERVATION ID</div>
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

                        <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#953002] text-white border-none rounded-lg text-[14px] font-bold cursor-pointer mt-4">
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
                            {reservation.timeline.map((item, i) => (
                                <div key={i} className="flex items-start gap-3.5 relative pb-5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                                        style={{
                                            background: item.active ? item.color : "transparent",
                                            border: item.active ? "none" : `2px solid ${item.color}`,
                                        }}>
                                        {item.icon === "created" && <CalendarDays size={14} color="#fff" />}
                                        {item.icon === "payment" && <CheckCircle2 size={14} color="#fff" />}
                                        {item.icon === "checkin" && <LogIn size={14} color={item.color} />}
                                        {item.icon === "checkout" && <LogOut size={14} color={item.color} />}
                                    </div>
                                    {i < reservation.timeline.length - 1 && (
                                        <div className="absolute left-[15px] top-[36px] bottom-0 border-l-2 border-dashed"
                                            style={{ borderColor: reservation.timeline[i + 1].active ? "#e0e0e0" : "#e8e8e8" }} />
                                    )}
                                    <div className="flex-1">
                                        <div className="text-[13px]" style={{
                                            fontWeight: item.active ? 700 : 500,
                                            color: item.active ? "#1d1d1d" : "#828282",
                                        }}>
                                            {item.label}
                                        </div>
                                        <div className="text-[11px] mt-0.5" style={{ color: item.active ? "#953002" : "#b0b0b0" }}>
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

                        <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase">PROPERTY NAME</div>
                        <div className="text-[16px] font-extrabold text-[#1d1d1d] mt-1">{reservation.property}</div>

                        <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase mt-3.5">ROOM TYPE</div>
                        <div className="text-[16px] font-extrabold text-[#1d1d1d] mt-1">{reservation.roomType}</div>

                        <div className="flex items-center gap-2 mt-4">
                            <Users size={14} color="#953002" />
                            <span className="text-[13px] color-[#953002] font-medium text-[#953002]">{reservation.guests}</span>
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
                                <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase">CHECK-IN</div>
                                <div className="text-[22px] font-black text-[#1d1d1d] mt-1">{reservation.checkIn.date}</div>
                                <div className="text-[13px] font-medium text-[#828282] mt-0.5">{reservation.checkIn.year}</div>
                            </div>

                            {/* Nights Badge */}
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#953002]">
                                <span className="text-[10px] font-extrabold text-white tracking-wide">{reservation.nights}</span>
                                <span className="text-[8px] font-bold text-[#ffd9b3] tracking-wide">NIGHTS</span>
                            </div>

                            {/* Check-out */}
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase">CHECK-OUT</div>
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
                            <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase">TOTAL AMOUNT</div>
                            <div className="text-[22px] font-black text-[#1d1d1d] mt-1">{reservation.totalAmount}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase">PAID AMOUNT</div>
                            <div className="text-[22px] font-black text-[#27ae60] mt-1">{reservation.paidAmount}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[#953002] tracking-wide uppercase">PAYMENT METHOD</div>
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

                    <div className="text-[12px] color-[#27ae60] font-medium mt-2 text-[#27ae60]">
                        Fully paid on {reservation.paymentDate}
                    </div>
                </div>
            </div>
        </div>
    );
}
