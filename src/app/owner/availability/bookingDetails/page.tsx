/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    Calendar,
    Home,
    MapPin,
    CreditCard,
    User,
    Mail,
    Phone,
    Globe,
    Clock,
    Edit,
    XCircle,
    MessageSquare,
    FileText,
    Shield,
    Headphones,
    CheckCircle,
    BookOpen,
    AlignLeft,
    ChevronRight,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * BookingDetailsPage Component
 *
 * Displays the complete details of an individual booking, including
 * guest information, property details, payment status, and action controls.
 */
export default function BookingDetailsPage() {
    const [notes, setNotes] = useState("");

    const booking = {
        id: "#8821",
        channel: "Direct Channel",
        guestFirst: "Marshall",
        guestLast: "Johnson",
        status: "CONFIRMED",
        paymentStatus: "PAID",
        checkIn: "Nov 3, 2024",
        checkOut: "Nov 6, 2024",
        nights: 3,
        property: "Sunset Villa #402",
        room: "Deluxe Ocean View Suite",
        location: "Malibu, California",
        nightRate: "Rs 17,000.00",
        subtotal: "Rs 51,000.00",
        taxFees: "Rs 6,000.00",
        total: "Rs 57,000.00",
        guest: {
            email: "m.johnson@email.com",
            phone: "+1 (555) 012-3456",
            language: "English (US)",
            since: "March 12, 2022",
        },
        timeline: [
            { label: "Payment received", time: "Oct 24, 2024 at 09:12 AM", icon: "check", color: "#27ae60" },
            { label: "Booking confirmed", time: "Oct 24, 2024 at 09:10 AM", icon: "book", color: "#2f80ed" },
            { label: "Reservation created", time: "Oct 24, 2024 at 08:45 AM", icon: "clock", color: "#b0b0b0" },
        ],
    };

    return (
        <div className="flex flex-col h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Top Bar ── */}
            <header className="flex justify-between items-center py-2.5 px-8 bg-white border-b border-[#e8e8e8] flex-shrink-0">
                <div className="flex items-center">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex items-center gap-3.5">
                    <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                        <Bell size={18} color="#4f4f4f" />
                    </a>
                    <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                </div>
            </header>

            {/* ── Main Content ── */}
            <div className="flex-1 py-5 px-12 pb-10 overflow-y-auto">
                {/* Breadcrumb */}
                <div className="text-[13px] mb-4 text-[#828282]">
                    <span className="cursor-pointer hover:underline">Calendar</span>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 mb-2">
                    <span className="text-[10px] font-bold text-white bg-[#27ae60] rounded p-1 px-2.5 tracking-wider">PAID</span>
                </div>

                {/* Guest Name */}
                <h1 className="text-[32px] font-extrabold text-[#1d1d1d] my-1 leading-tight">{booking.guestLast}, {booking.guestFirst}</h1>
                <div className="text-[13px] text-[#828282] mb-6">
                    Booking ID: <strong className="text-[#1d1d1d]">{booking.id}</strong>
                    <span className="mx-2 text-[#e0e0e0]">|</span>
                    Booked via {booking.channel}
                </div>

                {/* ── Two Column Layout ── */}
                <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
                    {/* Left Column */}
                    <div className="flex flex-col gap-4.5">
                        {/* Info Cards Row */}
                        <div className="grid grid-cols-3 gap-3.5">
                            {/* Stay Overview */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                                <div className="flex items-center gap-1.5 mb-3.5">
                                    <Calendar size={14} color="#953002" />
                                    <span className="text-[10px] font-bold text-[#828282] tracking-widest">STAY OVERVIEW</span>
                                </div>
                                <div className="flex gap-5 mb-2.5">
                                    <div>
                                        <div className="text-[9px] font-bold text-[#828282] tracking-wider mb-0.5">CHECK-IN</div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d] leading-snug">
                                            {booking.checkIn.split(",")[0].split(" ").slice(0, 1)}{" "}
                                            <span className="text-[22px] font-extrabold">{booking.checkIn.split(" ")[1].replace(",", "")},</span>
                                        </div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">2024</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-[#828282] tracking-wider mb-0.5">CHECK-OUT</div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d] leading-snug">
                                            {booking.checkOut.split(",")[0].split(" ").slice(0, 1)}{" "}
                                            <span className="text-[22px] font-extrabold">{booking.checkOut.split(" ")[1].replace(",", "")},</span>
                                        </div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">2024</div>
                                    </div>
                                </div>
                                <div className="text-[12px] text-[#4f4f4f] mt-1.5 pt-2 border-t border-[#f0f0f0]">
                                    Total Duration: <strong className="text-[#1d1d1d]">{booking.nights} Nights</strong>
                                </div>
                            </div>

                            {/* Property & Room */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                                <div className="flex items-center gap-1.5 mb-3.5">
                                    <Home size={14} color="#953002" />
                                    <span className="text-[10px] font-bold text-[#828282] tracking-widest">PROPERTY & ROOM</span>
                                </div>
                                <div className="text-[16px] font-extrabold text-[#953002] mb-1">{booking.property}</div>
                                <div className="text-[13px] text-[#4f4f4f] mb-1.5">{booking.room}</div>
                                <div className="flex items-center gap-1 text-[12px] text-[#b0b0b0]">
                                    <MapPin size={12} color="#b0b0b0" />
                                    <span>{booking.location}</span>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                                <div className="flex items-center gap-1.5 mb-3.5">
                                    <CreditCard size={14} color="#953002" />
                                    <span className="text-[10px] font-bold text-[#828282] tracking-widest">PAYMENT SUMMARY</span>
                                </div>
                                <div className="flex justify-between text-[12px] text-[#4f4f4f] mb-1.5">
                                    <span>{booking.nights} nights x {booking.nightRate}</span>
                                    <span className="font-bold text-[#1d1d1d]">{booking.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-[12px] text-[#4f4f4f] mb-1.5">
                                    <span>Taxes & Fees</span>
                                    <span className="font-bold text-[#1d1d1d]">{booking.taxFees}</span>
                                </div>
                                <div className="border-t border-[#e8e8e8] my-2" />
                                <div className="flex justify-between items-center text-[13px] font-bold text-[#1d1d1d]">
                                    <span>Total Amount</span>
                                    <span className="text-[18px] font-extrabold">{booking.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Guest Details */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4.5 px-5.5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <User size={18} color="#953002" />
                                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">Guest Details</span>
                                </div>
                                <button className="bg-transparent border-none text-[#953002] text-[11px] font-bold cursor-pointer tracking-wider hover:underline">
                                    VIEW FULL PROFILE
                                </button>
                            </div>
                            <div className="flex gap-5 items-center">
                                <div className="flex-shrink-0">
                                    <img
                                        src="https://api.dicebear.com/7.x/initials/svg?seed=MJ&backgroundColor=e8a040&textColor=ffffff"
                                        alt="MJ"
                                        className="w-15 h-15 rounded-full"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-y-3.5 gap-x-8 flex-1">
                                    <div>
                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">EMAIL ADDRESS</div>
                                        <div className="text-[13px] text-[#1d1d1d] font-medium flex items-center gap-1.5">
                                            <Mail size={13} color="#828282" /> {booking.guest.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">PHONE NUMBER</div>
                                        <div className="text-[13px] text-[#1d1d1d] font-medium flex items-center gap-1.5">
                                            <Phone size={13} color="#828282" /> {booking.guest.phone}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">LANGUAGE</div>
                                        <div className="text-[13px] text-[#1d1d1d] font-medium flex items-center gap-1.5">{booking.guest.language}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">GUEST SINCE</div>
                                        <div className="text-[13px] text-[#1d1d1d] font-medium flex items-center gap-1.5">{booking.guest.since}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Internal Notes */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4.5 px-5.5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <AlignLeft size={18} color="#953002" />
                                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">Internal Notes</span>
                                </div>
                                <span className="text-[12px] text-[#b0b0b0] italic">Only visible to your team</span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add private notes about guest preferences, special requests, or maintenance needs during this stay..."
                                className="w-full min-h-[100px] border border-[#e0e0e0] rounded-lg py-3.5 px-4 text-[13px] text-[#1d1d1d] resize-y outline-none box-border font-sans leading-relaxed block"
                            />
                            <div className="flex justify-end mt-2.5">
                                <button className="py-2 px-5.5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-3">
                        {/* Message Guest */}
                        <button className="flex items-center justify-center gap-2 py-3.5 bg-[#953002] text-white border-none rounded-xl text-[14px] font-bold cursor-pointer w-full hover:bg-[#a63602] transition-colors">
                            <MessageSquare size={16} /> Message Guest
                        </button>

                        {/* Edit / Cancel */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <button className="flex items-center justify-center gap-1.5 py-2.5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-xl text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                <Edit size={14} /> Edit
                            </button>
                            <button className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-[#e0e0e0] rounded-xl text-[13px] font-semibold cursor-pointer hover:bg-[#fef2f2] transition-colors">
                                <XCircle size={14} color="#eb5757" /> <span className="text-[#eb5757]">Cancel</span>
                            </button>
                        </div>

                        {/* Booking Timeline */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} color="#953002" />
                                <span className="text-[16px] font-extrabold text-[#1d1d1d]">Booking Timeline</span>
                            </div>
                            {booking.timeline.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 mb-3.5">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                                        {item.icon === "check" && <CheckCircle size={14} color="#fff" />}
                                        {item.icon === "book" && <BookOpen size={14} color="#fff" />}
                                        {item.icon === "clock" && <Clock size={14} color="#fff" />}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">{item.label}</div>
                                        <div className="text-[11px] text-[#b0b0b0] mt-0.5">{item.time}</div>
                                    </div>
                                </div>
                            ))}
                            <button className="bg-transparent border-none text-[#953002] text-[11px] font-bold cursor-pointer tracking-wider mt-1 p-0 hover:underline">
                                VIEW FULL HISTORY LOG
                            </button>
                        </div>

                        {/* Support & Resources */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                            <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-3.5">SUPPORT & RESOURCES</div>
                            <div className="flex items-center gap-2.5 text-[13px] text-[#1d1d1d] font-medium mb-3 cursor-pointer hover:text-[#953002] transition-colors">
                                <FileText size={14} color="#828282" /> Rental Agreement
                            </div>
                            <div className="flex items-center gap-2.5 text-[13px] text-[#1d1d1d] font-medium mb-3 cursor-pointer hover:text-[#953002] transition-colors">
                                <Shield size={14} color="#828282" /> Cancellation Policy
                            </div>
                            <div className="flex items-center gap-2.5 text-[13px] text-[#1d1d1d] font-medium mb-3 cursor-pointer hover:text-[#953002] transition-colors">
                                <Headphones size={14} color="#828282" /> Contact Support
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
