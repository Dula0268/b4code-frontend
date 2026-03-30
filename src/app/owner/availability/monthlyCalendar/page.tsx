"use client";

import { useState, useMemo } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    ChevronLeft,
    ChevronRight,
    Bell,
    Home,
    Building2,
    Mountain,
    Plus,
    X,
    Check,
    Calendar,
    LayoutDashboard,
    BedDouble,
    DollarSign,
    BookOpen,
    Settings,
} from "lucide-react";

/* ───────────────────── helpers ───────────────────── */

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function getMonthGrid(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthDays - i);
        cells.push({ date: d, currentMonth: false });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        cells.push({ date: d, currentMonth: true });
    }

    // Next month leading days to fill out grid
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            cells.push({ date: d, currentMonth: false });
        }
    }

    return cells;
}

function fmt(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fmtShort(date: Date) {
    return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

/* ───────────────────── mock data ───────────────────── */

const properties = [
    { id: 1, name: "Sunset Villa #402", icon: "home", active: true },
    { id: 2, name: "Urban Loft B", icon: "building" },
    { id: 3, name: "Mountain Retreat", icon: "mountain" },
];

const mockBookings: Record<string, any> = {
    // Week 1 (Oct 27 - Nov 2)
    "2024-11-01": { type: "available", price: "90,000" },
    "2024-11-02": { type: "available", price: "65,000" },
    // Week 2 (Nov 3-9)
    "2024-11-03": { type: "booked", guest: "Johnson" },
    "2024-11-04": { type: "booked", guest: "Johnson" },
    "2024-11-05": { type: "booked", guest: "Johnson" },
    "2024-11-06": { type: "available", price: "55,000" },
    "2024-11-07": { type: "available", price: "55,000" },
    "2024-11-08": { type: "available", price: "50,000" },
    "2024-11-09": { type: "available", price: "55,000" },
    // Week 3 (Nov 10-16)
    "2024-11-10": { type: "blocked", reason: "Repair" },
    "2024-11-11": { type: "blocked", reason: "Repair" },
    "2024-11-12": { type: "available", price: "50,000", hasDetails: true, dot: "green" },
    "2024-11-13": { type: "available", price: "55,000", dot: "orange" },
    "2024-11-14": { type: "available", price: "55,000", dot: "red" },
    "2024-11-15": { type: "available", price: "90,000" },
    "2024-11-16": { type: "available", price: "65,000" },
    // Week 4 (Nov 17-23)
    "2024-11-20": { type: "booked", guest: "Smith" },
    "2024-11-21": { type: "booked", guest: "Smith" },
    "2024-11-22": { type: "booked", guest: "Smith" },
    "2024-11-23": { type: "booked", guest: "Smith" },
};

/* ───────────────────── component ───────────────────── */

export default function MonthlyCalendarPage() {
    const [year, setYear] = useState(2024);
    const [month, setMonth] = useState(10); // November (0-indexed)
    const [selectedDates, setSelectedDates] = useState(["2024-11-12", "2024-11-13", "2024-11-14"]);
    const [newStatus, setNewStatus] = useState("available");
    const [customPrice, setCustomPrice] = useState("190.00");
    const [notes, setNotes] = useState("");
    const [activeProperty, setActiveProperty] = useState(1);
    const [showPanel, setShowPanel] = useState(true);

    const grid = useMemo(() => getMonthGrid(year, month), [year, month]);
    const monthLabel = `${MONTH_NAMES[month]} ${year}`;

    /* Navigation */
    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    };
    const goToday = () => {
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth());
    };

    /* Selection */
    const toggleDate = (key: string) => {
        setSelectedDates((prev) =>
            prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
        );
        if (!showPanel) setShowPanel(true);
    };

    const selectionLabel = useMemo(() => {
        if (selectedDates.length === 0) return "";
        const sorted = [...selectedDates].sort();
        const first = new Date(sorted[0] + "T00:00:00");
        const last = new Date(sorted[sorted.length - 1] + "T00:00:00");
        return `${fmtShort(first)} - ${fmtShort(last)} (${selectedDates.length} nights)`;
    }, [selectedDates]);

    const propertyIcon = (type: string, color: string) => {
        if (type === "home") return <Home size={16} color={color} />;
        if (type === "building") return <Building2 size={16} color={color} />;
        return <Mountain size={16} color={color} />;
    };

    /* Split grid into weeks */
    const weeks = [];
    for (let i = 0; i < grid.length; i += 7) {
        weeks.push(grid.slice(i, i + 7));
    }

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "#" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/monthlyCalendar", active: true },
        { label: "Pricing", icon: <DollarSign size={18} />, href: "/owner/rate" },
        { label: "Reservations", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/propertySetting" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[180px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
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

            {/* ── Properties Sidebar ── */}
            <aside className="w-[220px] bg-white border-r border-[#e8e8e8] py-6 px-4 flex flex-col shrink-0 overflow-y-auto">
                <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-2.5">PROPERTIES</div>
                {properties.map((p) => {
                    const isActive = p.id === activeProperty;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setActiveProperty(p.id)}
                            className={`flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl cursor-pointer mb-1.5 transition-all duration-150 text-left w-full ${
                                isActive ? "bg-[#953002] text-white border-none" : "bg-white text-[#1d1d1d] border border-[#e8e8e8]"
                            }`}
                        >
                            {propertyIcon(p.icon, isActive ? "#fff" : "#953002")}
                            <span className={`text-[13px] ${isActive ? "font-bold" : "font-medium"}`}>{p.name}</span>
                        </button>
                    );
                })}

                {/* Quick Stats */}
                <div className="text-[10px] font-bold text-[#828282] tracking-widest mt-7 mb-2.5">QUICK STATS</div>
                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3 px-3.5 mb-2">
                    <div className="text-[11px] font-semibold text-[#828282] mb-0.5">Occupancy (Nov)</div>
                    <div className="text-[22px] font-extrabold text-[#1d1d1d]">78%</div>
                    <div className="h-1 bg-[#e8e8e8] rounded flex mt-2 overflow-hidden">
                        <div className="h-full bg-[#953002] rounded" style={{ width: "78%" }} />
                    </div>
                </div>
                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3 px-3.5 mb-2">
                    <div className="text-[11px] font-semibold text-[#828282] mb-0.5">Revenue (MTD)</div>
                    <div className="text-[22px] font-extrabold text-[#1d1d1d]">Rs 425,000</div>
                </div>

                <button className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#b0b0b0] rounded-xl bg-transparent text-[#828282] text-[13px] font-semibold cursor-pointer mt-3">
                    <Plus size={16} />
                    <span>Add Property</span>
                </button>
            </aside>

            {/* ── Main Calendar ── */}
            <main className="flex-1 flex flex-col py-5 px-7 min-w-0 overflow-hidden">
                {/* Header */}
                <div className="mb-3.5">
                    <div className="flex items-center gap-5">
                        <h2 className="text-[26px] font-extrabold text-[#1d1d1d] m-0 leading-tight">{monthLabel}</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer text-[#4f4f4f]"><ChevronLeft size={18} /></button>
                                <button onClick={goToday} className="py-1 px-3.5 border border-[#e0e0e0] rounded-lg bg-white text-[11px] font-bold text-[#1d1d1d] cursor-pointer tracking-wider">TODAY</button>
                                <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer text-[#4f4f4f]"><ChevronRight size={18} /></button>
                            </div>
                            <div className="flex bg-[#f0f0f0] rounded-lg p-1 gap-0.5">
                                <a href="/owner/availability/monthlyCalendar" className="py-1.5 px-4 rounded-md text-[12px] font-bold text-white bg-[#953002] border-none cursor-pointer no-underline transition-all duration-150">Monthly</a>
                                <a href="/owner/availability/weeklyCalendar" className="py-1.5 px-4 rounded-md text-[12px] font-semibold text-[#828282] bg-transparent border-none cursor-pointer no-underline transition-all duration-150">Weekly</a>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-2 h-2 rounded-full bg-[#27ae60] inline-block ml-2" /> <span className="text-[10px] font-semibold text-[#828282] tracking-wider">AVAILABLE</span>
                        <span className="w-2 h-2 rounded-full bg-[#953002] inline-block ml-2" /> <span className="text-[10px] font-semibold text-[#828282] tracking-wider">BOOKED</span>
                        <span className="w-2 h-2 rounded-full bg-[#b0b0b0] inline-block ml-2" /> <span className="text-[10px] font-semibold text-[#828282] tracking-wider">BLOCKED</span>
                    </div>
                </div>

                {/* Month Grid */}
                <div className="flex-1 border border-[#e8e8e8] rounded-2xl overflow-hidden bg-white flex flex-col">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 border-b border-[#e8e8e8]">
                        {DAY_LABELS.map((d) => (
                            <div key={d} className="py-2.5 text-center text-[11px] font-bold text-[#828282] tracking-widest">{d}</div>
                        ))}
                    </div>

                    {/* Week Rows */}
                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 border-b border-[#e8e8e8] flex-1 min-h-0">
                            {week.map((cell, ci) => {
                                const key = fmt(cell.date);
                                const booking = mockBookings[key];
                                const isSelected = selectedDates.includes(key);
                                const isToday = fmt(new Date()) === key;
                                const dimmed = !cell.currentMonth;

                                return (
                                    <div
                                        key={key}
                                        onClick={() => cell.currentMonth && toggleDate(key)}
                                        className={`py-1.5 px-2 flex flex-col relative transition-all duration-100 min-h-[80px] overflow-hidden ${ci < 6 ? "border-r border-[#e8e8e8]" : ""} ${cell.currentMonth ? "cursor-pointer" : "cursor-default"}`}
                                        style={{
                                            background: isSelected ? "#fef5ef" : "#fff",
                                            boxShadow: isSelected ? "inset 0 0 0 2px #953002" : "none",
                                        }}
                                    >
                                        {/* Date number */}
                                        <div className={`text-[13px] mb-1 leading-none ${dimmed ? "text-[#ccc]" : booking?.type === "booked" ? "text-[#953002] font-extrabold" : isToday ? "text-white font-extrabold" : "text-[#1d1d1d] font-bold"} ${isToday ? "bg-[#953002] rounded-full w-6 h-6 inline-flex items-center justify-center p-0" : ""}`}>
                                            {cell.date.getDate()}
                                        </div>

                                        {/* Cell content */}
                                        {cell.currentMonth && booking && (
                                            <div className="flex-1 flex flex-col gap-1 items-start">
                                                {booking.type === "booked" && (
                                                    <div className="bg-[#953002] rounded w-full py-1 px-2.5 overflow-hidden">
                                                        <span className="text-[10px] font-bold text-white whitespace-nowrap tracking-wider">
                                                            {booking.guest === "Johnson" ? "BOOKED:" : ""} {booking.guest.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {booking.type === "available" && (
                                                    <>
                                                        <div className="inline-block bg-[#e8f5e9] text-[#27ae60] text-[10px] font-bold py-1 px-1.5 rounded whitespace-nowrap">
                                                            Rs.{booking.price}
                                                        </div>
                                                        {booking.hasDetails && (
                                                            <span className="text-[9px] text-[#828282] underline cursor-pointer">details</span>
                                                        )}
                                                        {booking.dot && (
                                                            <span className={`absolute bottom-1.5 right-2 w-2 h-2 rounded-full`} style={{ background: booking.dot === "green" ? "#27ae60" : booking.dot === "orange" ? "#f2994a" : "#eb5757" }} />
                                                        )}
                                                    </>
                                                )}
                                                {booking.type === "blocked" && (
                                                    <div className="bg-[#f5f5f5] w-full rounded py-1 px-2 border border-[#e0e0e0]">
                                                        <span className="text-[10px] font-bold text-[#b0b0b0] whitespace-nowrap tracking-wider">BLOCKED: {booking.reason?.toUpperCase()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </main>

            {/* ── Right Panel — Update Status ── */}
            {showPanel && (
                <aside className="w-[240px] bg-white border-l border-[#e8e8e8] py-6 px-4 flex-shrink-0 overflow-y-auto max-h-screen box-border">
                    <div className="flex justify-between items-center mb-5">
                        <span className="text-[16px] font-extrabold text-[#1d1d1d]">Update Status</span>
                        <button onClick={() => setShowPanel(false)} className="bg-transparent border-none cursor-pointer p-1">
                            <X size={16} color="#828282" />
                        </button>
                    </div>

                    {/* Selection */}
                    <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-2">SELECTION</div>
                    <div className="flex items-center gap-2.5 bg-[#953002] rounded-xl py-2.5 px-3.5 text-white mb-4.5">
                        <Calendar size={16} color="#fff" />
                        <div>
                            <div className="text-[12px] font-bold text-white">{selectionLabel}</div>
                        </div>
                    </div>

                    {/* New Status */}
                    <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-2">NEW STATUS</div>
                    {[
                        { key: "available", label: "Available", color: "#953002" },
                        { key: "booked", label: "Booked (Manual)", color: "#b0b0b0" },
                        { key: "blocked", label: "Blocked / OOO", color: "#b0b0b0" },
                    ].map((opt) => {
                        const sel = newStatus === opt.key;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setNewStatus(opt.key)}
                                className={`flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-xl cursor-pointer mb-1.5 text-left relative ${
                                    sel ? "border-2 border-[#953002] bg-[#fef5ef]" : "border border-[#e0e0e0] bg-white"
                                }`}
                            >
                                <span className={`w-3.5 h-3.5 flex-shrink-0 rounded-full inline-flex items-center justify-center ${sel ? "bg-[#953002]" : "border-2 border-[#b0b0b0]"}`} style={{ borderColor: !sel && opt.color ? opt.color : '' }}>
                                    {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                                </span>
                                <span className={`text-[13px] ${sel ? "font-bold text-[#1d1d1d]" : "font-medium text-[#1d1d1d]"}`}>{opt.label}</span>
                                {sel && (
                                    <span className="ml-auto w-5.5 h-5.5 rounded-full bg-[#27ae60] flex flex-shrink-0 items-center justify-center">
                                        <Check size={14} color="#fff" strokeWidth={3} />
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    {/* Custom Pricing */}
                    <div className="text-[10px] font-bold text-[#828282] tracking-widest mt-5 mb-2">CUSTOM PRICING</div>
                    <div className="flex items-center gap-1.5 border border-[#e0e0e0] rounded-lg py-2 px-3 bg-white">
                        <span className="text-[#828282] font-semibold text-[13px]">Rs</span>
                        <input
                            type="text"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="border-none outline-none text-[14px] font-semibold text-[#1d1d1d] w-full bg-transparent"
                        />
                    </div>

                    {/* Internal Notes */}
                    <div className="text-[10px] font-bold text-[#828282] tracking-widest mt-4 mb-2">INTERNAL NOTES</div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reason for blocking or guest details..."
                        className="w-full min-h-[80px] border border-[#e0e0e0] rounded-lg p-3 text-[13px] text-[#1d1d1d] resize-y outline-none box-border font-sans"
                    />

                    {/* Apply */}
                    <button className="w-full py-2.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer mt-4 hover:bg-[#a63602] transition-colors">Apply Changes</button>

                    {/* Bulk Actions */}
                    <div className="text-[10px] font-bold text-[#828282] tracking-widest mt-4.5 mb-2">BULK ACTIONS</div>
                    <button className="w-full text-left bg-transparent border-none text-[#953002] text-[12px] font-medium cursor-pointer underline p-0">
                        Block all weekends in {MONTH_NAMES[month].slice(0, 3)}
                    </button>
                </aside>
            )}
        </div>
    );
}
