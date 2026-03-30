"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    LayoutDashboard,
    Building2,
    BedDouble,
    Calendar,
    BookOpen,
    Settings,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    XCircle,
    Trash2,
    MoreVertical,
    Download,
    Plus,
    SlidersHorizontal,
    Tag,
} from "lucide-react";

/* ───────────────────── mock data ───────────────────── */

const reservations = [
    {
        initials: "AJ",
        initialsBg: "#e8d4c8",
        initialsColor: "#953002",
        name: "Alex Johnson",
        tier: "GOLD MEMBER",
        tierColor: "#b8860b",
        property: "Grand Plaza Hotel",
        room: "Luxury Suite - Room 402",
        checkIn: "Oct 12",
        checkOut: "Oct 15",
        checkOutHighlight: false,
        payment: "Paid",
        paymentColor: "#27ae60",
        status: "CONFIRMED",
        statusBg: "#27ae60",
    },
    {
        initials: "MG",
        initialsBg: "#d4e8d4",
        initialsColor: "#2d6a2d",
        name: "John Doe",
        tier: "NEW GUEST",
        tierColor: "#2f80ed",
        property: "Seaside Villa",
        room: "Ocean View - Suite A",
        checkIn: "Oct 14",
        checkOut: "Oct 20",
        checkOutHighlight: true,
        payment: "Partial",
        paymentColor: "#f2994a",
        status: "PENDING",
        statusBg: "#f2994a",
    },
    {
        initials: "JS",
        initialsBg: "#e8e0d4",
        initialsColor: "#8b6914",
        name: "James Smith",
        tier: "REGULAR GUEST",
        tierColor: "#828282",
        property: "Mountain Lodge",
        room: "Pine Cabin - #5",
        checkIn: "Oct 15",
        checkOut: "Oct 16",
        checkOutHighlight: false,
        payment: "Unpaid",
        paymentColor: "#eb5757",
        status: "CANCELLED",
        statusBg: "#eb5757",
    },
    {
        initials: "LC",
        initialsBg: "#d4d8e8",
        initialsColor: "#2d3a6a",
        name: "Linda Chen",
        tier: "BUSINESS TRAVELER",
        tierColor: "#953002",
        property: "Grand Plaza Hotel",
        room: "Standard Room - 101",
        checkIn: "Oct 18",
        checkOut: "Oct 22",
        checkOutHighlight: false,
        payment: "Paid",
        paymentColor: "#27ae60",
        status: "CONFIRMED",
        statusBg: "#27ae60",
    },
];

/* ───────────────────── component ───────────────────── */

export default function ReservationPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "#" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Pricing", icon: <Tag size={18} />, href: "/owner/rate" },
        { label: "Reservation", icon: <BookOpen size={18} />, href: "/owner/reservation", active: true },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/propertySetting" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="px-4 pb-5">
                    <Logo width={120} height={36} />
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
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-4.5">
                        <div>
                            <h1 className="text-[28px] font-black text-[#1d1d1d] m-0 tracking-wide">RESERVATIONS</h1>
                            <div className="mt-1 text-[13px]">
                                <span className="text-[#953002] font-extrabold text-[18px]">128</span>{" "}
                                <span className="text-[#828282]">total bookings this month</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-1.5 py-2.5 px-5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer">
                                <Download size={14} /> Export CSV
                            </button>
                            <button className="flex items-center gap-1.5 py-2.5 px-5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer">
                                <Plus size={14} /> Manual Booking
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-3.5 mb-4.5">
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">CONFIRMED</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">94</span>
                                <span className="text-[12px] font-bold text-[#27ae60]">+5%</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">PENDING CONFIRMATION</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">12</span>
                                <span className="text-[9px] font-bold text-[#828282] tracking-wide">NEEDS ATTENTION</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">CHECK-INS TODAY</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">8</span>
                                <span className="text-[12px] font-bold text-[#f2994a] bg-[#fff8e1] rounded px-2.5 py-0.5">Busy</span>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                            <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1.5">CANCELLATIONS</div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-[32px] font-extrabold text-[#1d1d1d]">3</span>
                                <span className="text-[12px] font-bold text-[#eb5757]">-2%</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex justify-between items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 flex-1 max-w-[400px] bg-white border border-[#e0e0e0] rounded-lg py-2 px-3.5">
                            <Search size={16} color="#b0b0b0" />
                            <input
                                type="text"
                                placeholder="Search by guest or property..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-none outline-none text-[13px] text-[#1d1d1d] flex-1 font-sans bg-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <Building2 size={14} /> All Properties <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <Calendar size={14} /> Date Range <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-lg text-[12px] font-semibold text-[#4f4f4f] cursor-pointer">
                                Status <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center justify-center w-9 h-9 bg-white border border-[#e0e0e0] rounded-lg cursor-pointer">
                                <SlidersHorizontal size={16} color="#4f4f4f" />
                            </button>
                        </div>
                    </div>

                    {/* Reservations Table */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-wide py-3.5 px-4 text-left border-b border-[#e8e8e8]">GUEST NAME</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-wide py-3.5 px-4 text-left border-b border-[#e8e8e8]">PROPERTY / ROOM</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-wide py-3.5 px-4 text-left border-b border-[#e8e8e8]">DATES</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-wide py-3.5 px-4 text-center border-b border-[#e8e8e8]">PAYMENT</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-wide py-3.5 px-4 text-center border-b border-[#e8e8e8]">STATUS</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-wide py-3.5 px-4 text-center border-b border-[#e8e8e8]">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((r, i) => (
                                    <tr key={i} className="border-b border-[#f5f5f5] transition-colors hover:bg-[#fafafa]">
                                        {/* Guest */}
                                        <td className="py-3.5 px-4 text-[13px] color-[#4f4f4f] align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                                                    style={{ background: r.initialsBg, color: r.initialsColor }}>
                                                    {r.initials}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d]">{r.name}</div>
                                                    <div className="text-[9px] font-bold tracking-wide" style={{ color: r.tierColor }}>{r.tier}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Property */}
                                        <td className="py-3.5 px-4 text-[13px] color-[#4f4f4f] align-middle">
                                            <div className="text-[13px] font-semibold text-[#1d1d1d]">{r.property}</div>
                                            <div className="text-[11px] text-[#828282]">{r.room}</div>
                                        </td>
                                        {/* Dates */}
                                        <td className="py-3.5 px-4 text-[13px] color-[#4f4f4f] align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <div>
                                                    <div className={`text-[13px] font-bold ${r.checkOutHighlight ? 'text-[#27ae60]' : 'text-[#1d1d1d]'}`}>{r.checkIn}</div>
                                                    <div className="text-[9px] text-[#b0b0b0] font-semibold">CHECK-IN</div>
                                                </div>
                                                <span className="text-[#e0e0e0] text-[14px]">→</span>
                                                <div>
                                                    <div className={`text-[13px] font-bold ${r.checkOutHighlight ? 'text-[#27ae60]' : 'text-[#1d1d1d]'}`}>{r.checkOut}</div>
                                                    <div className="text-[9px] text-[#b0b0b0] font-semibold">CHECK-OUT</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Payment */}
                                        <td className="py-3.5 px-4 text-[13px] color-[#4f4f4f] align-middle text-center">
                                            <span className="text-[11px] font-semibold inline-flex items-center gap-1" style={{ color: r.paymentColor }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.paymentColor }} />
                                                {r.payment}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="py-3.5 px-4 text-[13px] color-[#4f4f4f] align-middle text-center">
                                            <span className="text-[10px] font-bold text-white rounded px-3 py-1 tracking-wide" style={{ background: r.statusBg }}>
                                                {r.status}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-[13px] color-[#4f4f4f] align-middle text-center">
                                            <div className="flex justify-center gap-1.5">
                                                <button className="bg-transparent border-none cursor-pointer p-1 rounded"><Eye size={15} color="#828282" /></button>
                                                {r.status === "CANCELLED" ? (
                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded"><Trash2 size={15} color="#828282" /></button>
                                                ) : (
                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded"><XCircle size={15} color="#828282" /></button>
                                                )}
                                                {r.status === "PENDING" && (
                                                    <button className="bg-transparent border-none cursor-pointer p-1 rounded"><MoreVertical size={15} color="#828282" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center py-3.5 px-4 border-t border-[#e8e8e8]">
                            <span className="text-[12px] text-[#953002]">Showing 1 to 4 of 128 results</span>
                            <div className="flex items-center gap-1">
                                <button className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#4f4f4f] rounded-md"><ChevronLeft size={14} /></button>
                                {[1, 2, 3].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center border-none cursor-pointer text-[12px] font-semibold rounded-md ${
                                            currentPage === p ? "bg-[#27ae60] text-white" : "bg-transparent text-[#4f4f4f]"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <span className="text-[12px] text-[#828282] mx-1">...</span>
                                <button
                                    onClick={() => setCurrentPage(32)}
                                    className={`w-7 h-7 flex items-center justify-center border-none cursor-pointer text-[12px] font-semibold rounded-md ${
                                        currentPage === 32 ? "bg-[#27ae60] text-white" : "bg-transparent text-[#4f4f4f]"
                                    }`}
                                >
                                    32
                                </button>
                                <button className="w-7 h-7 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#4f4f4f] rounded-md"><ChevronRight size={14} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
