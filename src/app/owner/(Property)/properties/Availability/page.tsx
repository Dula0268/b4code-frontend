/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { propertiesApi } from "@/api/owner/properties.api";
import { availabilityApi } from "@/api/owner/availability.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    X,
    Check,
} from "lucide-react";

/* ── helpers ── */
const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_LABELS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
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

/** Returns grid of dates for a full month view (6 rows × 7 cols, padded with nulls) */
function getMonthGrid(year: number, month: number): (Date | null)[] {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay(); // day-of-week of 1st
    const grid: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) grid.push(null);
    for (let d = 1; d <= last.getDate(); d++) grid.push(new Date(year, month, d));
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
}

type DayBooking = { type: string; price?: string; guest?: string; };
type CalendarView = "weekly" | "monthly";

function AvailabilityContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    const [loadingProperty, setLoadingProperty] = useState(true);
    const [propertyError, setPropertyError] = useState<string | null>(null);

    // Calendar state
    const [calendarView, setCalendarView] = useState<CalendarView>("weekly");
    const [baseDate, setBaseDate] = useState(new Date());
    const [bookings, setBookings] = useState<Record<string, DayBooking>>({});
    const [calendarLoading, setCalendarLoading] = useState(false);

    // Selection / update panel
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [newStatus, setNewStatus] = useState("available");
    const [customPrice, setCustomPrice] = useState("");
    const [notes, setNotes] = useState("");

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Settings"];

    useEffect(() => {
        if (!propertyId) {
            setPropertyError("No property ID provided.");
            setLoadingProperty(false);
            return;
        }
        propertiesApi.getProperty(Number(propertyId), ownerId)
            .then((prop) => setProperty(prop))
            .catch((err) => setPropertyError(err?.response?.data?.message ?? err?.message ?? "Failed to load property."))
            .finally(() => setLoadingProperty(false));
    }, [propertyId, ownerId]);

    useEffect(() => {
        if (!propertyId) return;
        setCalendarLoading(true);
        availabilityApi.getWeeklyCalendar(Number(propertyId), fmt(baseDate))
            .then((data) => {
                const map: Record<string, DayBooking> = {};
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (data?.days || []).forEach((day: any) => {
                    const key = typeof day.date === "string" ? day.date : fmt(new Date(day.date));
                    const status = (day.status || "").toUpperCase();
                    if (status === "BOOKED") map[key] = { type: "booked", guest: day.guestName || "" };
                    else if (status === "BLOCKED") map[key] = { type: "blocked" };
                    else map[key] = { type: "available", price: day.price ? String(day.price) : "" };
                });
                setBookings(map);
            })
            .catch(() => setBookings({}))
            .finally(() => setCalendarLoading(false));
    }, [propertyId, baseDate]);

    // Weekly derived
    const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

    // Monthly derived
    const monthYear_monthly = `${MONTH_NAMES[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
    const monthGrid = useMemo(() => getMonthGrid(baseDate.getFullYear(), baseDate.getMonth()), [baseDate]);

    // Weekly header title
    const monthYear_weekly = `${MONTH_NAMES[weekDates[0].getMonth()]} ${weekDates[0].getFullYear()}`;

    // Navigation
    const prev = () => {
        if (calendarView === "weekly") {
            setBaseDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
        } else {
            setBaseDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        }
    };
    const next = () => {
        if (calendarView === "weekly") {
            setBaseDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
        } else {
            setBaseDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        }
    };
    const goToday = () => setBaseDate(new Date());

    const toggleDate = (key: string) => {
        setSelectedDates((prev) =>
            prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
        );
        setShowPanel(true);
    };

    const selectionLabel = useMemo(() => {
        if (selectedDates.length === 0) return "";
        const sorted = [...selectedDates].sort();
        const first = new Date(sorted[0] + "T00:00:00");
        const last = new Date(sorted[sorted.length - 1] + "T00:00:00");
        return `${fmtShort(first)} – ${fmtShort(last)}`;
    }, [selectedDates]);

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    const todayKey = fmt(new Date());

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            <OwnerSidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2 px-6 bg-white border-b border-[#e8e8e8] shrink-0">
                    <div className="flex items-center gap-3">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col overflow-hidden px-6 pt-2 pb-3">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-[12px] mb-2 shrink-0">
                        <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                        <ChevronRight size={13} color="#b0b0b0" />
                        <span className="text-[#953002] font-semibold">{property?.name ?? "Availability"}</span>
                    </div>

                    {loadingProperty && (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 size={28} color="#953002" className="animate-spin" />
                        </div>
                    )}
                    {propertyError && !loadingProperty && (
                        <div className="flex-1 flex items-center justify-center text-[13px] text-[#e74c3c]">{propertyError}</div>
                    )}

                    {!loadingProperty && !propertyError && property && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Property Header Card */}
                            <div className="bg-white border border-[#e8e8e8] rounded-[12px] py-2.5 px-4 flex items-center mb-0 shrink-0">
                                <div className="w-[56px] h-[44px] rounded-lg overflow-hidden shrink-0 border border-[#e8e8e8] bg-[#f0ebe5] flex items-center justify-center mr-3">
                                    {property.image ? (
                                        <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={20} color="#c0a898" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[15px] font-extrabold m-0 text-[#1d1d1d] truncate">{property.name}</h2>
                                        <span className="text-[9px] font-bold text-white rounded px-[6px] py-[2px] tracking-widest shrink-0" style={{ backgroundColor: statusColor }}>{statusLabel}</span>
                                    </div>
                                    <div className="text-[11px] text-[#828282] flex items-center gap-3 mt-0.5">
                                        <span className="flex items-center gap-1"><MapPin size={11} />{[property.address, property.city, property.country].filter(Boolean).join(", ")}</span>
                                        <span className="flex items-center gap-1"><Bed size={11} />{property.roomCount ?? 0} Rooms</span>
                                        <span className="flex items-center gap-1"><Calendar size={11} />{property.rate ?? "—"}/night</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-[#e8e8e8] mb-2 mt-1.5 shrink-0">
                                {tabs.map((t) => {
                                    const isActive = t === "Availability";
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                                else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${propertyId}`;
                                                else if (t === "Availability") return;
                                                else if (t === "Rates") window.location.href = `/owner/properties/Rate?id=${propertyId}`;
                                                else if (t === "Reservations") window.location.href = `/owner/properties/Reservation?id=${propertyId}`;
                                                else if (t === "Media") window.location.href = `/owner/properties/Media?id=${propertyId}`;
                                                else if (t === "Settings") window.location.href = `/owner/properties/Setting?id=${propertyId}`;
                                            }}
                                            className={`bg-transparent py-2 px-3.5 text-[12px] cursor-pointer transition-all duration-150 border-b-2 whitespace-nowrap ${
                                                isActive
                                                    ? "text-[#953002] font-bold border-[#953002]"
                                                    : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f]"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Calendar Area */}
                            <div className="flex-1 flex gap-3 overflow-hidden min-h-0">
                                {/* Calendar Panel */}
                                <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                                    {/* Calendar Toolbar */}
                                    <div className="flex items-center justify-between mb-2 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <button onClick={prev} className="w-7 h-7 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer hover:bg-[#f5f5f5]">
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button onClick={goToday} className="h-7 px-3 border border-[#e0e0e0] rounded-lg bg-white text-[11px] font-bold text-[#1d1d1d] cursor-pointer tracking-wider hover:bg-[#f5f5f5]">
                                                TODAY
                                            </button>
                                            <button onClick={next} className="w-7 h-7 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer hover:bg-[#f5f5f5]">
                                                <ChevronRight size={16} />
                                            </button>
                                            <span className="text-[18px] font-extrabold text-[#1d1d1d] ml-1">
                                                {calendarView === "weekly" ? monthYear_weekly : monthYear_monthly}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Legend */}
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#27ae60] inline-block" />
                                                <span className="text-[10px] font-semibold text-[#828282]">AVAILABLE</span>
                                                <span className="w-2 h-2 rounded-full bg-[#953002] inline-block ml-1" />
                                                <span className="text-[10px] font-semibold text-[#828282]">BOOKED</span>
                                                <span className="w-2 h-2 rounded-full bg-[#b0b0b0] inline-block ml-1" />
                                                <span className="text-[10px] font-semibold text-[#828282]">BLOCKED</span>
                                            </div>
                                            {/* Weekly / Monthly toggle */}
                                            <div className="flex bg-[#f0f0f0] rounded-lg p-0.5">
                                                <button
                                                    onClick={() => setCalendarView("weekly")}
                                                    className={`py-1 px-3.5 rounded-md text-[12px] font-semibold cursor-pointer border-none transition-all duration-150 ${
                                                        calendarView === "weekly"
                                                            ? "bg-[#953002] text-white shadow-sm"
                                                            : "bg-transparent text-[#4f4f4f] hover:bg-white"
                                                    }`}
                                                >
                                                    Weekly
                                                </button>
                                                <button
                                                    onClick={() => setCalendarView("monthly")}
                                                    className={`py-1 px-3.5 rounded-md text-[12px] font-semibold cursor-pointer border-none transition-all duration-150 ${
                                                        calendarView === "monthly"
                                                            ? "bg-[#953002] text-white shadow-sm"
                                                            : "bg-transparent text-[#4f4f4f] hover:bg-white"
                                                    }`}
                                                >
                                                    Monthly
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calendar Grid */}
                                    {calendarLoading ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <Loader2 size={24} color="#953002" className="animate-spin" />
                                        </div>
                                    ) : calendarView === "weekly" ? (
                                        /* ── Weekly View ── */
                                        <div className="flex-1 border border-[#e8e8e8] rounded-xl overflow-hidden bg-white min-h-0 flex flex-col">
                                            {/* Day header row */}
                                            <div className="grid grid-cols-7 border-b border-[#e8e8e8] shrink-0">
                                                {weekDates.map((date, i) => {
                                                    const isToday = fmt(date) === todayKey;
                                                    return (
                                                        <div key={i} className="text-center py-2 border-r border-[#e8e8e8] last:border-r-0">
                                                            <div className="text-[10px] font-bold text-[#828282] tracking-widest">{DAY_LABELS[i]}</div>
                                                            <div className={`text-[15px] font-extrabold mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                                                                isToday ? "bg-[#953002] text-white" : "text-[#1d1d1d]"
                                                            }`}>
                                                                {date.getDate()}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {/* Booking cells row */}
                                            <div className="grid grid-cols-7 flex-1 min-h-0">
                                                {weekDates.map((date) => {
                                                    const key = fmt(date);
                                                    const booking = bookings[key];
                                                    const isSelected = selectedDates.includes(key);
                                                    return (
                                                        <div
                                                            key={key}
                                                            onClick={() => toggleDate(key)}
                                                            className={`border-r border-[#e8e8e8] last:border-r-0 cursor-pointer flex flex-col p-2 transition-all duration-100 hover:bg-[#faf8f6] ${
                                                                isSelected ? "ring-2 ring-inset ring-[#953002] bg-[#fef5ef]" : ""
                                                            }`}
                                                        >
                                                            {booking?.type === "booked" && (
                                                                <div className="flex-1 bg-[#953002] rounded-lg flex flex-col items-center justify-center gap-1 p-2">
                                                                    <span className="text-[9px] font-bold text-[rgba(255,255,255,0.7)] tracking-widest">BOOKED</span>
                                                                    <span className="text-[11px] font-extrabold text-white text-center leading-tight">{booking.guest}</span>
                                                                </div>
                                                            )}
                                                            {booking?.type === "available" && (
                                                                <div className="flex-1 flex flex-col items-center justify-center gap-1">
                                                                    {booking.price && (
                                                                        <span className="text-[13px] font-extrabold text-[#953002]">Rs {booking.price}</span>
                                                                    )}
                                                                    <span className="text-[9px] font-bold text-[#27ae60] tracking-wider">AVAILABLE</span>
                                                                </div>
                                                            )}
                                                            {booking?.type === "blocked" && (
                                                                <div
                                                                    className="flex-1 rounded-lg flex items-center justify-center"
                                                                    style={{ background: "repeating-linear-gradient(45deg,#f5f5f5,#f5f5f5 4px,#eee 4px,#eee 8px)" }}
                                                                >
                                                                    <span className="text-[9px] font-bold text-[#b0b0b0] tracking-widest">BLOCKED</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Monthly View ── */
                                        <div className="flex-1 border border-[#e8e8e8] rounded-xl overflow-hidden bg-white min-h-0 flex flex-col">
                                            {/* Day-of-week header */}
                                            <div className="grid grid-cols-7 border-b border-[#e8e8e8] shrink-0">
                                                {DAY_LABELS_SHORT.map((d) => (
                                                    <div key={d} className="text-center py-2 text-[10px] font-bold text-[#828282] tracking-widest border-r border-[#e8e8e8] last:border-r-0">
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Month grid */}
                                            <div
                                                className="flex-1 grid grid-cols-7 min-h-0"
                                                style={{ gridTemplateRows: `repeat(${monthGrid.length / 7}, 1fr)` }}
                                            >
                                                {monthGrid.map((date, idx) => {
                                                    if (!date) {
                                                        return (
                                                            <div key={`empty-${idx}`} className="border-r border-b border-[#f0f0f0] last:border-r-0 bg-[#fafafa]" />
                                                        );
                                                    }
                                                    const key = fmt(date);
                                                    const booking = bookings[key];
                                                    const isSelected = selectedDates.includes(key);
                                                    const isToday = key === todayKey;
                                                    const isCurrentMonth = date.getMonth() === baseDate.getMonth();

                                                    let dotColor = "";
                                                    if (booking?.type === "booked") dotColor = "#953002";
                                                    else if (booking?.type === "available") dotColor = "#27ae60";
                                                    else if (booking?.type === "blocked") dotColor = "#b0b0b0";

                                                    return (
                                                        <div
                                                            key={key}
                                                            onClick={() => toggleDate(key)}
                                                            className={`border-r border-b border-[#f0f0f0] last:border-r-0 cursor-pointer flex flex-col p-1.5 transition-all duration-100 hover:bg-[#faf8f6] ${
                                                                isSelected ? "bg-[#fef5ef] ring-2 ring-inset ring-[#953002]" : ""
                                                            } ${!isCurrentMonth ? "opacity-30" : ""}`}
                                                        >
                                                            <div className={`text-[12px] font-bold self-start leading-none inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                                                isToday ? "bg-[#953002] text-white" : "text-[#1d1d1d]"
                                                            }`}>
                                                                {date.getDate()}
                                                            </div>
                                                            {booking?.type === "booked" && (
                                                                <div className="mt-1 flex-1 bg-[#953002] rounded text-[9px] font-bold text-white flex items-center justify-center px-1 min-h-[18px]">
                                                                    {booking.guest ? booking.guest.split(" ")[0] : "BOOKED"}
                                                                </div>
                                                            )}
                                                            {booking?.type === "available" && booking.price && (
                                                                <div className="mt-1 flex-1 bg-[#e8f5e9] rounded text-[9px] font-bold text-[#27ae60] flex items-center justify-center px-1 min-h-[18px]">
                                                                    Rs {booking.price}
                                                                </div>
                                                            )}
                                                            {booking?.type === "blocked" && (
                                                                <div
                                                                    className="mt-1 flex-1 rounded min-h-[18px]"
                                                                    style={{ background: "repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0 2px,#e8e8e8 2px,#e8e8e8 4px)" }}
                                                                />
                                                            )}
                                                            {dotColor && !booking && (
                                                                <span className="w-1.5 h-1.5 rounded-full mt-auto self-center" style={{ backgroundColor: dotColor }} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Update Panel */}
                                {showPanel && (
                                    <aside className="w-[220px] bg-white border border-[#e8e8e8] rounded-xl py-4 px-3.5 shrink-0 overflow-y-auto flex flex-col">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[14px] font-extrabold text-[#1d1d1d]">Update Status</span>
                                            <button onClick={() => { setShowPanel(false); setSelectedDates([]); }} className="bg-transparent border-none cursor-pointer p-1 rounded hover:bg-[#f5f5f5]">
                                                <X size={14} color="#828282" />
                                            </button>
                                        </div>

                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">SELECTION</div>
                                        <div className="flex items-center gap-2 bg-[#fef5ef] border border-[#953002] rounded-lg py-2 px-2.5 mb-3">
                                            <Calendar size={12} color="#953002" />
                                            <div>
                                                <div className="text-[11px] font-bold text-[#953002]">{selectionLabel || "—"}</div>
                                                <div className="text-[10px] text-[#c44103]">{selectedDates.length} night{selectedDates.length !== 1 ? "s" : ""}</div>
                                            </div>
                                        </div>

                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">NEW STATUS</div>
                                        {[
                                            { key: "available", label: "Available" },
                                            { key: "booked", label: "Booked (Manual)" },
                                            { key: "blocked", label: "Blocked / OOO" },
                                        ].map((opt) => {
                                            const sel = newStatus === opt.key;
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => setNewStatus(opt.key)}
                                                    className={`flex items-center gap-2 w-full py-2 px-2.5 rounded-lg cursor-pointer mb-1.5 text-left ${
                                                        sel ? "border-2 border-[#953002] bg-[#fef5ef]" : "border border-[#e0e0e0] bg-white"
                                                    }`}
                                                >
                                                    <span className={`w-3 h-3 shrink-0 rounded-full inline-flex items-center justify-center ${sel ? "bg-[#953002]" : "border-2 border-[#c0c0c0]"}`}>
                                                        {sel && <Check size={7} color="#fff" strokeWidth={3} />}
                                                    </span>
                                                    <span className={`text-[11px] ${sel ? "font-bold text-[#1d1d1d]" : "font-medium text-[#4f4f4f]"}`}>{opt.label}</span>
                                                </button>
                                            );
                                        })}

                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mt-3 mb-1">CUSTOM PRICING</div>
                                        <div className="flex items-center gap-1.5 border border-[#e0e0e0] rounded-lg py-1.5 px-2.5 bg-white mb-3">
                                            <span className="text-[#828282] font-semibold text-[12px]">Rs</span>
                                            <input
                                                type="text"
                                                value={customPrice}
                                                onChange={(e) => setCustomPrice(e.target.value)}
                                                placeholder="0"
                                                className="border-none outline-none text-[12px] font-semibold text-[#1d1d1d] w-full bg-transparent"
                                            />
                                        </div>

                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mb-1">NOTES</div>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Reason or guest details..."
                                            className="w-full min-h-[60px] border border-[#e0e0e0] rounded-lg p-2 text-[11px] text-[#1d1d1d] resize-none outline-none box-border font-sans mb-3"
                                        />

                                        <button className="w-full py-2 bg-[#953002] text-white border-none rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#a63602] transition-colors mb-2">
                                            Apply Changes
                                        </button>

                                        <div className="text-[9px] font-bold text-[#828282] tracking-widest mt-1 mb-1">BULK ACTIONS</div>
                                        <button className="w-full text-left bg-transparent border-none text-[#953002] text-[11px] font-medium cursor-pointer underline p-0">
                                            Block all weekends in {MONTH_NAMES[baseDate.getMonth()].slice(0, 3)}
                                        </button>
                                    </aside>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function AvailabilityPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <AvailabilityContent />
        </Suspense>
    );
}