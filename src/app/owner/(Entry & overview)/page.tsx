/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/api/owner/dashboard.api";
import Logo from "@/components/shared/branding/logo";
import {
    Search,
    Bell,
    LayoutDashboard,
    Building2,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Settings,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    FileText,
    AlertTriangle,
    TrendingUp,
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true, href: "/owner" },
    { icon: Building2, label: "Properties", active: false, href: "/owner/properties" },
    { icon: DoorOpen, label: "Rooms", active: false, href: "/owner/roomManagement" },
    { icon: CalendarCheck, label: "Availability", active: false, href: "/owner/availability/weeklyCalendar" },
    { icon: DollarSign, label: "Rate", active: false, href: "/owner/rate" },
    { icon: ClipboardList, label: "Reservations", active: false, href: "/owner/reservation" },
    { icon: Settings, label: "Settings", active: false, href: "/owner/setting/propertySetting" },
];

const metricCards = [
    { label: "TOTAL PROPERTIES", value: "12", change: "+2%", changeColor: "#2e7d32", bg: "white", textColor: "#1d1d1d", highlight: false },
    { label: "TOTAL ROOMS", value: "48", change: "0%", changeColor: "#828282", bg: "white", textColor: "#1d1d1d", highlight: false },
    { label: "ACTIVE RESV.", value: "32", change: "+15%", changeColor: "#2e7d32", bg: "white", textColor: "#1d1d1d", highlight: false },
    { label: "TODAY CHECK-INS", value: "5", change: "High", changeColor: "#e67e22", bg: "white", textColor: "#1d1d1d", highlight: false },
    { label: "TODAY CHECK-OUTS", value: "3", change: "-5%", changeColor: "#e74c3c", bg: "white", textColor: "#1d1d1d", highlight: false },
    { label: "TOTAL REVENUE", value: "3M", change: "+12%", changeColor: "#ffffff", bg: "#953002", textColor: "#ffffff", highlight: true },
];

const reservations = [
    {
        initials: "AM",
        initialsColor: "#8B6914",
        name: "Alice Morris",
        property: "Ocean Breeze Resort",
        room: "Suite 204",
        dates: "10 OCT - 14 OCT",
        nights: "4 Nights",
        status: "CHECKED IN",
        statusColor: "#2e7d32",
        statusBg: "#e8f5e9",
    },
    {
        initials: "RK",
        initialsColor: "#953002",
        name: "Robert King",
        property: "Mountain Villa",
        room: "Deluxe 05",
        dates: "12 OCT - 15 OCT",
        nights: "3 Nights",
        status: "CONFIRMED",
        statusColor: "#953002",
        statusBg: "#fef5ef",
    },
    {
        initials: "SL",
        initialsColor: "#2e7d32",
        name: "Sarah Lee",
        property: "City Center Inn",
        room: "Room 412",
        dates: "13 OCT - 14 OCT",
        nights: "1 Night",
        status: "PENDING",
        statusColor: "#e74c3c",
        statusBg: "#fdecea",
    },
    {
        initials: "JD",
        initialsColor: "#1565c0",
        name: "James Dean",
        property: "Ocean Breeze Resort",
        room: "Suite 101",
        dates: "05 OCT - 09 OCT",
        nights: "4 Nights",
        status: "CHECKED OUT",
        statusColor: "#828282",
        statusBg: "#f5f5f5",
    },
];

/* ───────────────────── calendar helpers ───────────────────── */

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { day: number; currentMonth: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, currentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        days.push({ day: d, currentMonth: true });
    }
    // Next month leading days
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
        for (let d = 1; d <= remaining; d++) {
            days.push({ day: d, currentMonth: false });
        }
    }

    return days;
}

/* Peak / highlight days */
const peakDays = [1, 2, 3];
const highlightDay = 2;

/* ───────────────────── component ───────────────────── */

/**
 * OwnerDashboardPage Component
 *
 * Main entry point for property owners. Displays KPI metrics, recent activity,
 * occupancy charts, and quick-action shortcuts for managing properties.
 */
export default function OwnerDashboardPage() {
    const [calMonth, setCalMonth] = useState(9); // October (0-indexed)
    const [calYear, setCalYear] = useState(2023);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                // Hardcoded ownerId=1 for testing integration
                const data = await dashboardApi.getDashboard(1, calYear, calMonth);
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [calYear, calMonth]);

    const calendarDays = getCalendarDays(calYear, calMonth);
    const currentPeakDays = dashboardData?.availabilityPreview?.peakDays || peakDays;
    
    const currentMetricCards = dashboardData ? [
        { ...metricCards[0], value: dashboardData.totalProperties.value, change: dashboardData.totalProperties.change },
        { ...metricCards[1], value: dashboardData.totalRooms.value, change: dashboardData.totalRooms.change },
        { ...metricCards[2], value: dashboardData.activeReservations.value, change: dashboardData.activeReservations.change },
        { ...metricCards[3], value: dashboardData.todayCheckIns.value, change: dashboardData.todayCheckIns.change },
        { ...metricCards[4], value: dashboardData.todayCheckOuts.value, change: dashboardData.todayCheckOuts.change },
        { ...metricCards[5], value: dashboardData.totalRevenue.value, change: dashboardData.totalRevenue.change }
    ] : metricCards;

    const currentReservations = dashboardData?.recentReservations || reservations;

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
        else setCalMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
        else setCalMonth((m) => m + 1);
    };

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden">
            {/* ───── Sidebar ───── */}
            <aside className="w-[160px] bg-white border-r border-[#e0e0e0] flex flex-col py-3 shrink-0">
                <div className="px-3.5 mb-5">
                    <Logo width={120} height={36} />
                </div>
                <nav className="flex flex-col gap-0.5">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-2.5 py-2 px-3.5 text-[13px] font-medium no-underline border-l-[3px] transition-all duration-150 ${
                                    item.active
                                        ? "text-[#953002] bg-[#fef5ef] border-[#953002] font-semibold"
                                        : "text-[#4f4f4f] border-transparent"
                                }`}
                            >
                                <Icon size={18} className="shrink-0" />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>
            </aside>

            {/* ───── Main Content ───── */}
            <main className="flex-1 px-6 pb-4 overflow-y-auto min-w-0">
                {/* Top Bar */}
                <div className="flex justify-between items-center py-2 gap-3">
                    <div />
                    <div className="flex items-center gap-3.5">
                        <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-lg py-1.5 px-3">
                            <Search size={14} color="#b0b0b0" />
                            <input
                                type="text"
                                placeholder="Search properties..."
                                className="border-none bg-transparent outline-none text-[13px] text-[#1d1d1d] w-[160px]"
                            />
                        </div>
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center justify-center hover:bg-[#f5f5f5] transition-colors" aria-label="Notifications">
                            <Bell size={20} color="#4f4f4f" />
                        </a>
                        <div className="w-[34px] h-[34px] rounded-full overflow-hidden border-2 border-[#953002]">
                            <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="User" className="w-full h-full rounded-full" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* ───── Metric Cards ───── */}
                <div className="grid grid-cols-6 gap-3 mb-4">
                    {currentMetricCards.map((card) => (
                        <div
                            key={card.label}
                            className={`rounded-xl border px-4 py-3 flex flex-col gap-1 ${
                                card.highlight
                                    ? "border-[#953002]"
                                    : "border-[#e0e0e0]"
                            }`}
                            style={{ background: card.bg }}
                        >
                            <span
                                className="text-[9px] font-bold tracking-wider uppercase"
                                style={{ color: card.highlight ? "rgba(255,255,255,0.8)" : "#828282" }}
                            >
                                {card.label}
                            </span>
                            <div className="flex items-end justify-between">
                                <span
                                    className="text-[28px] font-extrabold leading-none"
                                    style={{ color: card.textColor }}
                                >
                                    {card.value}
                                </span>
                                <span
                                    className="text-[11px] font-semibold mb-1"
                                    style={{ color: card.highlight ? "rgba(255,255,255,0.9)" : card.changeColor }}
                                >
                                    {card.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ───── Middle Section: Calendar + Reservations ───── */}
                <div className="grid grid-cols-[minmax(280px,1fr)_minmax(400px,1.6fr)] gap-4 mb-4">
                    {/* Availability Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[15px] font-bold text-[#1d1d1d] m-0">Availability Preview</h2>
                            <div className="flex gap-1">
                                <button
                                    onClick={prevMonth}
                                    className="w-7 h-7 rounded-md bg-white border border-[#e0e0e0] flex items-center justify-center cursor-pointer"
                                >
                                    <ChevronLeft size={14} color="#4f4f4f" />
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="w-7 h-7 rounded-md bg-white border border-[#e0e0e0] flex items-center justify-center cursor-pointer"
                                >
                                    <ChevronRight size={14} color="#4f4f4f" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e0e0e0] rounded-xl p-4">
                            {/* Month Header */}
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[14px] font-bold text-[#1d1d1d]">
                                    {MONTH_NAMES[calMonth]} {calYear}
                                </span>
                                <span className="text-[12px] font-medium text-[#828282]">85% Occupancy</span>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
                                    <div key={d} className="text-center text-[10px] font-semibold text-[#b0b0b0] py-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((d, i) => {
                                    const isPeak = d.currentMonth && currentPeakDays.includes(d.day);
                                    const isHighlight = d.currentMonth && d.day === highlightDay;
                                    return (
                                        <div
                                            key={i}
                                            className={`text-center py-1.5 text-[12px] rounded-full font-medium ${
                                                !d.currentMonth
                                                    ? "text-[#d0d0d0]"
                                                    : isHighlight
                                                    ? "bg-[#953002] text-white font-bold"
                                                    : isPeak
                                                    ? "bg-[#2e7d32] text-white font-bold"
                                                    : "text-[#1d1d1d]"
                                            }`}
                                        >
                                            {d.day}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Key Highlights */}
                            <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
                                <h4 className="text-[10px] font-bold tracking-wider uppercase text-[#828282] mb-2">
                                    KEY HIGHLIGHTS
                                </h4>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[12px] text-[#4f4f4f]">
                                        <div className="w-2 h-2 rounded-full bg-[#e74c3c] shrink-0" />
                                        Peak booking: Oct 2nd - 4th
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-[#4f4f4f]">
                                        <div className="w-2 h-2 rounded-full bg-[#e67e22] shrink-0" />
                                        Maintenance: Oct 5th - 6th
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reservations */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[15px] font-bold text-[#1d1d1d] m-0">Recent Reservations</h2>
                            <button className="bg-transparent border-none text-[13px] font-semibold text-[#953002] cursor-pointer">
                                View All
                            </button>
                        </div>
                        <div className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden">
                            <table className="w-full border-collapse text-[12px]">
                                <thead>
                                    <tr>
                                        {["GUEST NAME", "PROPERTY", "ROOM", "DATES", "STATUS", "ACTION"].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left py-2.5 px-3 text-[9px] font-bold tracking-wider text-[#828282] border-b border-[#e0e0e0] uppercase"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {currentReservations.map((r: any) => (
                                        <tr key={r.name} className="border-b border-[#f5f5f5]">
                                            {/* Guest */}
                                            <td className="py-2.5 px-3 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                        style={{ background: r.initialsColor }}
                                                    >
                                                        {r.initials}
                                                    </div>
                                                    <span className="font-semibold text-[13px] text-[#1d1d1d]">{r.name}</span>
                                                </div>
                                            </td>
                                            {/* Property */}
                                            <td className="py-2.5 px-3 align-middle text-[12px] text-[#4f4f4f]">
                                                {r.property}
                                            </td>
                                            {/* Room */}
                                            <td className="py-2.5 px-3 align-middle text-[12px] text-[#4f4f4f]">
                                                {r.room}
                                            </td>
                                            {/* Dates */}
                                            <td className="py-2.5 px-3 align-middle">
                                                <div className="text-[12px] font-medium text-[#1d1d1d]">{r.dates}</div>
                                                <div className="text-[10px] text-[#b0b0b0]">{r.nights}</div>
                                            </td>
                                            {/* Status */}
                                            <td className="py-2.5 px-3 align-middle">
                                                <span
                                                    className="text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide"
                                                    style={{ color: r.statusColor, background: r.statusBg }}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>
                                            {/* Action */}
                                            <td className="py-2.5 px-3 align-middle">
                                                <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center justify-center">
                                                    <MoreVertical size={16} color="#828282" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ───── Bottom Alert Cards ───── */}
                <div className="grid grid-cols-3 gap-4">
                    {/* New Reviews */}
                    <div className="bg-white border border-[#e0e0e0] rounded-xl px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0">
                            <FileText size={20} color="#953002" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282] block">
                                NEW REVIEWS
                            </span>
                            <span className="text-[18px] font-extrabold text-[#1d1d1d]">{dashboardData?.newReviews?.value || "12 Unread"}</span>
                        </div>
                    </div>

                    {/* Maintenance Alerts */}
                    <div className="bg-white border border-[#e0e0e0] rounded-xl px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#fdecea] flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} color="#e74c3c" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282] block">
                                MAINT. ALERTS
                            </span>
                            <span className="text-[18px] font-extrabold text-[#1d1d1d]">{dashboardData?.maintenanceAlerts?.value || "2 Urgent"}</span>
                        </div>
                    </div>

                    {/* Growth */}
                    <div className="bg-white border border-[#e0e0e0] rounded-xl px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#e8f5e9] flex items-center justify-center shrink-0">
                            <TrendingUp size={20} color="#2e7d32" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282] block">
                                GROWTH
                            </span>
                            <span className="text-[18px] font-extrabold text-[#2e7d32]">{dashboardData?.growth?.value || "+14.2%"}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
