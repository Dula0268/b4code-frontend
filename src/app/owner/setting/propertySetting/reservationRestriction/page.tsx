/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
    Bell,
        Search,
    SlidersHorizontal,
    CalendarDays,
    Eye,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    Clock,
    Ban,
    Hourglass,
    TrendingUp,
    XCircle,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * ReservationRestrictionPage Component
 *
 * Lists all active reservation restriction rules (min stay, max stay,
 * closed-to-arrival, etc.) and provides create/edit/delete actions.
 */
export default function ReservationRestrictionPage() {
    const [search, setSearch] = useState("");



    const restrictions = [
        {
            icon: <Clock size={16} color="#4285F4" />,
            iconBg: "#e8f0fe",
            type: "Minimum Stay",
            sub: "Global Policy",
            dateRange: "01 Oct 2023 - 31 Dec 2023",
            rooms: "All Rooms",
            roomBg: "#fef0e7",
            roomColor: "#953002",
            value: "3 Nights",
            active: true,
        },
        {
            icon: <Ban size={16} color="#e74c3c" />,
            iconBg: "#fde8e8",
            type: "Blackout Dates",
            sub: "Holiday Closure",
            dateRange: "24 Dec 2023 - 26 Dec 2023",
            rooms: "Penthouse Suite",
            roomBg: "#fef0e7",
            roomColor: "#953002",
            value: "No Check-in",
            active: false,
        },
        {
            icon: <Hourglass size={16} color="#f2994a" />,
            iconBg: "#fef0e7",
            type: "Lead Time",
            sub: "Standard Policy",
            dateRange: "Permanent",
            permanent: true,
            rooms: "Standard Double, +2",
            roomBg: "#fef0e7",
            roomColor: "#953002",
            value: "Min. 2 Days",
            active: true,
        },
        {
            icon: <TrendingUp size={16} color="#27ae60" />,
            iconBg: "#e8f8ef",
            type: "Seasonal Rate",
            sub: "Summer Peak",
            dateRange: "01 Jun 2024 - 31 Aug 2024",
            rooms: "Deluxe Suites",
            roomBg: "#fef0e7",
            roomColor: "#953002",
            value: "Min. 5 Nights",
            active: true,
        },
        {
            icon: <XCircle size={16} color="#828282" />,
            iconBg: "#f5f5f5",
            type: "Closed to Arrival",
            sub: "Maintenance",
            dateRange: "10 Nov 2023 - 15 Nov 2023",
            rooms: "Ground Floor",
            roomBg: "#fef0e7",
            roomColor: "#953002",
            value: "Strict",
            active: false,
        },
    ];

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-1 gap-1 text-[12px] font-semibold">
                        <a href="/owner/setting/propertySetting" className="text-[#4f4f4f] no-underline">Properties Setting</a>
                        <span className="text-[#b0b0b0]">/</span>
                        <span className="text-[#4f4f4f]">The Grand Hotel</span>
                        <span className="text-[#b0b0b0]">/</span>
                        <span className="text-[var(--brand-primary)]">Booking Restrictions</span>
                    </div>

                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-1">Booking Restrictions</h1>
                            <p className="text-[13px] text-[#828282] m-0">Manage minimum stays, blackout dates, and lead times for your property.</p>
                        </div>
                        <a href="/owner/setting/propertySetting/reservationRestriction/createRestriction" className="flex items-center gap-1.5 py-2.5 px-5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer no-underline">
                            <Plus size={14} /> Add Restriction
                        </a>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex items-center gap-3.5 mb-4 bg-white border border-[#e8e8e8] rounded-xl p-3 px-4">
                        <div className="flex items-center gap-2 flex-1 bg-[#fafafa] border border-[#e8e8e8] rounded-lg p-2 px-3">
                            <Search size={14} color="#b0b0b0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by rule name or room type..."
                                className="flex-1 border-none outline-none text-[12px] text-[#1d1d1d] font-sans bg-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1 py-1.5 px-3 bg-white border border-[#e0e0e0] rounded-md text-[11px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <SlidersHorizontal size={13} /> Type <ChevronDown size={12} />
                            </button>
                            <button className="flex items-center gap-1 py-1.5 px-3 bg-white border border-[#e0e0e0] rounded-md text-[11px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <CalendarDays size={13} /> Date Range <ChevronDown size={12} />
                            </button>
                            <button className="flex items-center gap-1 py-1.5 px-3 bg-white border border-[#e0e0e0] rounded-md text-[11px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <Eye size={13} /> Status <ChevronDown size={12} />
                            </button>
                        </div>
                        <button className="bg-transparent border-none text-[var(--brand-primary)] text-[11px] font-semibold cursor-pointer whitespace-nowrap">Clear all filters</button>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">RESTRICTION TYPE</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">DATE RANGE</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">IMPACTED ROOMS</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">VALUE</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">STATUS</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restrictions.map((r, i) => (
                                    <tr key={i} className="border-b border-[#f5f5f5]">
                                        <td className="p-3.5 px-4 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: r.iconBg }}>
                                                    {r.icon}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d]">{r.type}</div>
                                                    <div className="text-[11px] text-[#828282]">{r.sub}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                {r.permanent ? (
                                                    <span className="text-[12px] text-[#4f4f4f]">∞ Permanent</span>
                                                ) : (
                                                    <>
                                                        <CalendarDays size={12} color="#b0b0b0" />
                                                        <span className="text-[12px] text-[#4f4f4f]">{r.dateRange}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <span className="text-[11px] font-semibold rounded px-2.5 py-1" style={{ color: r.roomColor, backgroundColor: r.roomBg }}>
                                                {r.rooms}
                                            </span>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle text-[13px] font-bold text-[#1d1d1d]">{r.value}</td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <div className={`w-10 h-5.5 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200 ${r.active ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <button className="bg-transparent border-none cursor-pointer p-1 flex items-center"><MoreVertical size={16} color="#828282" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center p-3 px-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#828282]">
                            Rows per page:
                            <span className="border border-[#e0e0e0] rounded px-2 py-0.5 text-[#1d1d1d] font-semibold">10</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[12px] text-[#828282]">
                            <span>1-5 of 12</span>
                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"><ChevronLeft size={14} color="#b0b0b0" /></button>
                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"><ChevronRight size={14} color="#1d1d1d" /></button>
                        </div>
                    </div>
                </div>
            </main>
    );
}
