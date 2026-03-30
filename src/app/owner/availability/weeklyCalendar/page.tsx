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

function getWeekDates(baseDate: Date) {
    const d = new Date(baseDate);
    const day = d.getDay();
    const sun = new Date(d);
    sun.setDate(d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(sun);
        dt.setDate(sun.getDate() + i);
        return dt;
    });
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
    "2024-11-03": { type: "booked", guest: "Johnson" },
    "2024-11-04": { type: "booked", guest: "Johnson" },
    "2024-11-05": { type: "booked", guest: "Johnson" },
    "2024-11-06": { type: "available", price: "19,000" },
    "2024-11-07": { type: "available", price: "19,000" },
    "2024-11-08": { type: "available", price: "21,000" },
    "2024-11-09": { type: "blocked" },
};

/* ───────────────────── component ───────────────────── */

export default function WeeklyCalendarPage() {
    const [baseDate, setBaseDate] = useState(new Date(2024, 10, 5)); // Nov 5, 2024
    const [selectedDates, setSelectedDates] = useState(["2024-11-03", "2024-11-04", "2024-11-05"]);
    const [newStatus, setNewStatus] = useState("available");
    const [customPrice, setCustomPrice] = useState("19,000.00");
    const [notes, setNotes] = useState("");
    const [activeProperty, setActiveProperty] = useState(1);
    const [showPanel, setShowPanel] = useState(true);

    const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
    const monthYear = `${MONTH_NAMES[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`;

    /* Navigation */
    const prevWeek = () => setBaseDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    const nextWeek = () => setBaseDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    const goToday = () => setBaseDate(new Date());

    /* Selection */
    const toggleDate = (key: string) => {
        setSelectedDates((prev) =>
            prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
        );
        if (!showPanel) setShowPanel(true);
    };

    /* Selection label */
    const selectionLabel = useMemo(() => {
        if (selectedDates.length === 0) return "";
        const sorted = [...selectedDates].sort();
        const first = new Date(sorted[0] + "T00:00:00");
        const last = new Date(sorted[sorted.length - 1] + "T00:00:00");
        return `${fmtShort(first)} - ${fmtShort(last)}`;
    }, [selectedDates]);

    const propertyIcon = (type: string, color: string) => {
        if (type === "home") return <Home size={16} color={color} />;
        if (type === "building") return <Building2 size={16} color={color} />;
        return <Mountain size={16} color={color} />;
    };

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "#" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar", active: true },
        { label: "Pricing", icon: <DollarSign size={18} />, href: "/owner/rate" },
        { label: "Reservations", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/propertySetting" },
    ];

    return (
        <div className="flex flex-row h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[180px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0 min-h-0">
                <div className="px-4 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5 overflow-y-auto">
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
            <aside className="w-[220px] bg-white border-r border-[#e8e8e8] py-6 px-4 flex flex-col shrink-0 min-h-0 overflow-y-auto">
                <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-2.5">PROPERTIES</div>
                {properties.map((p) => {
                    const isActive = p.id === activeProperty;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setActiveProperty(p.id)}
                            className={`flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-xl cursor-pointer mb-1.5 transition-all duration-150 text-left ${
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
                    <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">OCCUPANCY (NOV)</div>
                    <div className="text-[22px] font-extrabold text-[#1d1d1d]">78%</div>
                    <div className="h-1 bg-[#e8e8e8] rounded mt-2 overflow-hidden">
                        <div className="h-full bg-[#953002] rounded" style={{ width: "78%" }} />
                    </div>
                </div>
                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3 px-3.5 mb-2">
                    <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">REVENUE (MTD)</div>
                    <div className="text-[22px] font-extrabold text-[#1d1d1d]">Rs 425,000</div>
                </div>

                <button className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#b0b0b0] rounded-xl bg-transparent text-[#828282] text-[13px] font-semibold cursor-pointer mt-3 w-full">
                    <Plus size={16} />
                    <span>Add Property</span>
                </button>
            </aside>

            {/* ── Main Calendar ── */}
            <main className="flex-1 flex flex-col py-6 px-8 min-w-0 overflow-hidden">
                {/* Header */}
                <div className="mb-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[28px] font-extrabold text-[#1d1d1d] m-0 leading-tight">{monthYear}</h2>
                        <div className="flex bg-[#f0f0f0] rounded-lg p-1 gap-0.5">
                            <a href="/owner/availability/monthlyCalendar" className="py-1.5 px-4 rounded-md text-[12px] font-semibold text-[#828282] bg-transparent border-none cursor-pointer no-underline transition-all duration-150">Monthly</a>
                            <a href="/owner/availability/weeklyCalendar" className="py-1.5 px-4 rounded-md text-[12px] font-bold text-white bg-[#953002] border-none cursor-pointer no-underline transition-all duration-150">Weekly</a>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer text-[#4f4f4f]"><ChevronLeft size={18} /></button>
                        <button onClick={goToday} className="py-1.5 px-4 border border-[#e0e0e0] rounded-lg bg-white text-[12px] font-bold text-[#1d1d1d] cursor-pointer tracking-wider">TODAY</button>
                        <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer text-[#4f4f4f]"><ChevronRight size={18} /></button>
                        <div className="flex items-center gap-1.5 ml-4">
                            <span className="w-2 h-2 rounded-full bg-[#27ae60] inline-block ml-2" /> <span className="text-[10px] font-semibold text-[#828282] tracking-widest">AVAILABLE</span>
                            <span className="w-2 h-2 rounded-full bg-[#953002] inline-block ml-2" /> <span className="text-[10px] font-semibold text-[#828282] tracking-widest">BOOKED</span>
                            <span className="w-2 h-2 rounded-full bg-[#b0b0b0] inline-block ml-2" /> <span className="text-[10px] font-semibold text-[#828282] tracking-widest">BLOCKED</span>
                        </div>
                    </div>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 flex-1 border border-[#e8e8e8] rounded-2xl overflow-hidden bg-white min-h-0 min-w-0">
                    {weekDates.map((date, i) => {
                        const key = fmt(date);
                        const booking = mockBookings[key];
                        const isSelected = selectedDates.includes(key);
                        const isToday = fmt(new Date()) === key;

                        return (
                            <div
                                key={key}
                                onClick={() => toggleDate(key)}
                                className={`flex flex-col border-r border-[#e8e8e8] transition-all duration-150 min-w-0 min-h-0 cursor-pointer ${isSelected ? "border-[#953002] shadow-[0_0_0_2px_rgba(149,48,2,0.15)] z-10" : ""}`}
                            >
                                {/* Day header */}
                                <div className="py-2.5 text-center border-b border-[#e8e8e8] flex-shrink-0">
                                    <span className="text-[11px] font-bold text-[#828282] tracking-widest">{DAY_LABELS[i]}</span>
                                </div>
                                <div className={`text-[16px] font-bold px-3 py-2 flex items-center flex-shrink-0 ${isToday ? "bg-[#953002] text-white w-7 h-7 justify-center p-0 rounded-full mx-3 mt-2" : "text-[#1d1d1d]"}`}>
                                    {date.getDate()}
                                </div>

                                {/* Cell body */}
                                <div className="flex-1 px-2 pb-3 flex flex-col justify-end overflow-hidden">
                                    {booking?.type === "booked" && (
                                        <div className="bg-[#953002] rounded-md px-2 py-4 flex flex-col items-center justify-center flex-1 min-h-[180px]">
                                            <span className="text-[9px] font-bold text-[rgba(255,255,255,0.7)] tracking-widest">BOOKED</span>
                                            <span className="text-[12px] font-extrabold text-white mt-1 uppercase text-center">{booking.guest}</span>
                                        </div>
                                    )}
                                    {booking?.type === "available" && (
                                        <div className="flex flex-col items-center justify-end flex-1 pb-2">
                                            <span className="text-[16px] sm:text-[18px] font-extrabold text-[#953002] whitespace-nowrap">Rs {booking.price}</span>
                                            <span className="text-[9px] font-bold text-[#27ae60] tracking-wider mt-0.5">AVAILABLE</span>
                                        </div>
                                    )}
                                    {booking?.type === "blocked" && (
                                        <div className="flex flex-col items-center justify-center flex-1 min-h-[180px] rounded-md" style={{ background: "repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 4px, #eee 4px, #eee 8px)" }}>
                                            <span className="text-[9px] font-bold text-[#b0b0b0] tracking-widest">BLOCKED</span>
                                        </div>
                                    )}
                                    {!booking && (
                                        <div className="flex-1" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* ── Right Panel — Update Status ── */}
            {showPanel && (
                <aside className="w-[260px] bg-white border-l border-[#e8e8e8] py-6 px-5 flex-shrink-0 overflow-y-auto max-h-screen box-border">
                    <div className="flex justify-between items-center mb-5">
                        <span className="text-[18px] font-extrabold text-[#1d1d1d]">Update Status</span>
                        <button onClick={() => setShowPanel(false)} className="bg-transparent border-none cursor-pointer p-1">
                            <X size={16} color="#828282" />
                        </button>
                    </div>

                    {/* Selection */}
                    <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-2">SELECTION</div>
                    <div className="flex items-center gap-2.5 bg-[#953002] rounded-xl py-2.5 px-3.5 text-white mb-4.5">
                        <Calendar size={16} color="#953002" />
                        <div>
                            <div className="text-[13px] font-bold text-[#1d1d1d]">{selectionLabel}</div>
                            <div className="text-[11px] text-[#953002]">{selectedDates.length} nights selected</div>
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
                        <span className="text-[#828282] font-semibold text-[14px]">Rs</span>
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
                    <button className="w-full text-left bg-transparent border-none text-[#953002] text-[12px] font-medium cursor-pointer underline p-0 mt-1">
                        Block all weekends in {MONTH_NAMES[weekDates[0].getMonth()].slice(0, 3)}
                    </button>
                </aside>
            )}
        </div>
    );
}
