"use client";

import { useState } from "react";
import {
    Bell,
    LayoutDashboard,
    Building2,
    BedDouble,
    Calendar,
    DollarSign,
    BookOpen,
    Settings,
    TrendingUp,
    TrendingDown,
    Edit,
    Plus,
    CheckCircle,
    Gift,
    Clock,
    CalendarRange,
} from "lucide-react";

/* ───────────────────── mock data ───────────────────── */

const roomPrices = [
    { type: "Deluxe Suite", base: "250.00", weekend: "+15%", status: "Active" },
    { type: "Standard Double", base: "180.00", weekend: "+10%", status: "Active" },
    { type: "Single Studio", base: "120.00", weekend: "+5%", status: "Active" },
    { type: "Penthouse", base: "550.00", weekend: "+25%", status: "Draft" },
];

const discounts = [
    {
        name: "Early Bird Special",
        desc: "Book 30+ days in advance. Automatically applied.",
        pct: "-15%",
        icon: "gift",
        active: true,
    },
    {
        name: "Last Minute Deal",
        desc: "Same day bookings after 4 PM. Boost occupancy.",
        pct: "-10%",
        icon: "clock",
        active: true,
    },
];

const seasons = [
    { name: "Summer Peak", range: "Jun 15 - Aug 31", pct: "+20%", progress: 100 },
    { name: "Winter Season", range: "Nov 01 - Jan 15", pct: "-10%", progress: 85 },
];

/* ───────────────────── component ───────────────────── */

export default function RatePage() {
    const [weekendFri, setWeekendFri] = useState(true);
    const [weekendSun, setWeekendSun] = useState(false);

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "/room" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/availability/weeklyCalendar" },
        { label: "Pricing", icon: <DollarSign size={18} />, href: "/rate", active: true },
        { label: "Reservations", icon: <BookOpen size={18} />, href: "/reservations" },
        { label: "Settings", icon: <Settings size={18} />, href: "/settings" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[180px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="flex items-center gap-1.5 px-4 pb-5">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect x="2" y="4" width="6" height="20" rx="1" fill="#953002" />
                        <rect x="10" y="8" width="6" height="16" rx="1" fill="#953002" />
                        <rect x="18" y="4" width="6" height="20" rx="1" fill="#953002" />
                    </svg>
                    <span className="text-[16px] tracking-widest flex items-baseline">
                        <span className="text-[#953002] font-extrabold">P</span>
                        <span className="text-[#953002] font-bold text-[12px]">RIME</span>
                    </span>
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2.5 py-2.5 px-4 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
                                item.active
                                    ? "bg-[rgba(149,48,2,0.08)] text-[#953002] font-bold border-[#953002]"
                                    : "bg-transparent text-[#4f4f4f] font-medium border-transparent"
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center">
                            <Bell size={18} color="#4f4f4f" />
                        </button>
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-8 h-8 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* ── KPI Cards ── */}
                    <div className="grid grid-cols-3 gap-4 mb-5">
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4.5 px-5.5">
                            <div className="text-[12px] font-semibold text-[#828282] mb-1.5">Average Nightly Rate</div>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-extrabold text-[#1d1d1d]">Rs 14,500.00</span>
                                <span className="text-[12px] font-semibold text-[#27ae60] flex items-center gap-1"><TrendingUp size={12} /> 5.2%</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4.5 px-5.5">
                            <div className="text-[12px] font-semibold text-[#828282] mb-1.5">Occupancy Forecast</div>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-extrabold text-[#1d1d1d]">78%</span>
                                <span className="text-[12px] font-semibold text-[#eb5757] flex items-center gap-1"><TrendingDown size={12} /> 2.1%</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4.5 px-5.5">
                            <div className="text-[12px] font-semibold text-[#828282] mb-1.5">Active Discounts</div>
                            <div className="flex items-baseline gap-2.5">
                                <span className="text-[28px] font-extrabold text-[#1d1d1d]">4 Rules</span>
                                <span className="text-[12px] text-[#27ae60] font-semibold flex items-center gap-1">
                                    <CheckCircle size={12} /> Optimized
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Two Column Layout ── */}
                    <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4.5">
                            {/* Room Base Prices */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0">Room Base Prices</h3>
                                    <button className="flex items-center gap-1 bg-transparent border-none text-[#953002] text-[12px] font-semibold cursor-pointer">
                                        <Plus size={14} /> Add Room Type
                                    </button>
                                </div>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-left border-b border-[#e8e8e8]">ROOM TYPE</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">BASE PRICE (Rs)</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">WEEKEND %</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">STATUS</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-widest py-2.5 px-3 text-center border-b border-[#e8e8e8]">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roomPrices.map((r, i) => (
                                            <tr key={i} className="border-b border-[#f5f5f5]">
                                                <td className="py-3.5 px-3 text-[13px] text-[#4f4f4f]">
                                                    <span className="font-semibold text-[#1d1d1d]">{r.type}</span>
                                                </td>
                                                <td className="py-3.5 px-3 text-[15px] text-[#4f4f4f] text-center font-bold">
                                                    {r.base}
                                                </td>
                                                <td className="py-3.5 px-3 text-[13px] text-center font-semibold text-[#953002]">
                                                    {r.weekend}
                                                </td>
                                                <td className="py-3.5 px-3 text-[13px] text-center">
                                                    <span className={`text-[11px] font-semibold py-1 px-3 rounded-full inline-block ${
                                                        r.status === "Active" ? "text-[#27ae60] bg-[#e8f5e9]" : "text-[#828282] bg-[#f5f5f5]"
                                                    }`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-[13px] text-center">
                                                    <button className="bg-transparent border-none cursor-pointer p-1">
                                                        <Edit size={15} color="#828282" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Special Discounts */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0">Special Discounts</h3>
                                    <button className="py-2 px-4.5 bg-[#953002] text-white border-none rounded-full text-[10px] font-bold cursor-pointer tracking-wider">CREATE NEW DISCOUNT</button>
                                </div>
                                <div className="grid grid-cols-2 gap-3.5">
                                    {discounts.map((d, i) => (
                                        <div key={i} className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-4.5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#fef5ef] flex items-center justify-center shrink-0">
                                                    {d.icon === "gift" ? <Gift size={20} color="#953002" /> : <Clock size={20} color="#953002" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[14px] font-bold text-[#1d1d1d]">{d.name}</span>
                                                        <span className="text-[14px] font-bold text-[#953002]">{d.pct}</span>
                                                    </div>
                                                    <div className="text-[11px] text-[#828282] mt-1 leading-relaxed">{d.desc}</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" />
                                                    <span className="text-[10px] font-bold text-[#27ae60] tracking-wider">ACTIVE</span>
                                                </span>
                                                <button className="bg-transparent border-none text-[#828282] text-[12px] font-medium cursor-pointer">Configure</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-3.5">
                            {/* Seasonal Pricing */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                <h4 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-4">Seasonal Pricing</h4>
                                {seasons.map((sn, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[14px] font-bold text-[#1d1d1d]">{sn.name}</span>
                                            <span className={`text-[14px] font-bold ${sn.pct.startsWith("+") ? "text-[#27ae60]" : "text-[#eb5757]"}`}>{sn.pct}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <CalendarRange size={12} color="#b0b0b0" />
                                            <span className="text-[11px] text-[#828282]">{sn.range}</span>
                                        </div>
                                        <div className="h-1.5 bg-[#e8e8e8] rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-[#953002] rounded-full" style={{ width: `${sn.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-[#953002] rounded-lg bg-transparent text-[#953002] text-[13px] font-semibold cursor-pointer mt-1">
                                    <CalendarRange size={14} color="#953002" /> Add Seasonal Range
                                </button>
                            </div>

                            {/* Weekend Multipliers */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                <h4 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-4">Weekend Multipliers</h4>
                                {/* Friday & Saturday */}
                                <div className="flex justify-between items-center py-3 border-b border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">Friday & Saturday</div>
                                        <div className="text-[11px] text-[#828282]">Standard surcharge</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">15%</span>
                                        <button
                                            onClick={() => setWeekendFri(!weekendFri)}
                                            className="w-11 h-6 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200"
                                            style={{
                                                background: weekendFri ? "#953002" : "#e0e0e0",
                                                justifyContent: weekendFri ? "flex-end" : "flex-start",
                                            }}
                                        >
                                            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                                        </button>
                                    </div>
                                </div>
                                {/* Sunday Night */}
                                <div className="flex justify-between items-center py-3">
                                    <div>
                                        <div className="text-[14px] font-bold text-[#1d1d1d]">Sunday Night</div>
                                        <div className="text-[11px] text-[#828282]">Off-peak adjustment</div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">0%</span>
                                        <button
                                            onClick={() => setWeekendSun(!weekendSun)}
                                            className="w-11 h-6 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200"
                                            style={{
                                                background: weekendSun ? "#953002" : "#e0e0e0",
                                                justifyContent: weekendSun ? "flex-end" : "flex-start",
                                            }}
                                        >
                                            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
