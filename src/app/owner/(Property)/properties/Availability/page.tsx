/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { availabilityApi } from "@/api/owner/availability.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    ChevronRight,
    ChevronLeft,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    CalendarDays,
    LayoutGrid,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Image as ImageIcon,
    Users,
    Settings,
    Check,
} from "lucide-react";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function getMonthGrid(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells: { date: Date; currentMonth: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevMonthDays - i), currentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ date: new Date(year, month, i), currentMonth: true });
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) for (let i = 1; i <= remaining; i++) cells.push({ date: new Date(year, month + 1, i), currentMonth: false });
    return cells;
}

function fmtDateKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function propertyNavItems(id: string, active: string) {
    const items = [
        { label: "Overview", icon: <LayoutGrid size={16} />, href: `/owner/properties/propertyDetails?id=${id}` },
        { label: "Rooms", icon: <DoorOpen size={16} />, href: `/owner/properties/propertyRoomInventry?id=${id}` },
        { label: "Availability", icon: <CalendarCheck size={16} />, href: `/owner/properties/Availability?id=${id}` },
        { label: "Rates", icon: <DollarSign size={16} />, href: `/owner/properties/Rate?id=${id}` },
        { label: "Reservations", icon: <ClipboardList size={16} />, href: `/owner/properties/Reservation?id=${id}` },
        { label: "Media", icon: <ImageIcon size={16} />, href: `/owner/properties/Media?id=${id}` },
        { label: "Staff", icon: <Users size={16} />, href: `/owner/properties/Staff?id=${id}` },
        { label: "Settings", icon: <Settings size={16} />, href: `/owner/properties/Setting?id=${id}` },
    ];
    return items.map((item) => ({ ...item, active: item.label === active }));
}

function AvailabilityContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [calendarData, setCalendarData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Monthly calendar (per-property)
    const now = new Date();
    const [monthYear, setMonthYear] = useState(now.getFullYear());
    const [monthMonth, setMonthMonth] = useState(now.getMonth());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [monthData, setMonthData] = useState<any[]>([]);
    const [monthLoading, setMonthLoading] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [newStatus, setNewStatus] = useState("AVAILABLE");
    const [customPrice, setCustomPrice] = useState("");
    const [notes, setNotes] = useState("");
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [calendarView, setCalendarView] = useState<"weekly" | "monthly">("weekly");

    useEffect(() => {
        if (!propertyId) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }
        Promise.all([
            propertiesApi.getProperty(Number(propertyId), ownerId),
            availabilityApi.getWeeklyCalendar(Number(propertyId)),
        ])
            .then(([prop, calData]) => {
                setProperty(prop);
                setCalendarData(Array.isArray(calData) ? calData : []);
            })
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load availability data.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const fetchMonthData = () => {
        if (!propertyId) return;
        setMonthLoading(true);
        availabilityApi.getMonthlyCalendar(Number(propertyId), monthYear, monthMonth + 1)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((data: any) => {
                const list = Array.isArray(data) ? data : [];
                setMonthData(list);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSelectedRoomId((prev) => prev ?? (list[0] as any)?.roomId ?? null);
            })
            .catch(() => setMonthData([]))
            .finally(() => setMonthLoading(false));
    };

    useEffect(() => {
        fetchMonthData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, monthYear, monthMonth]);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    // Build unique dates and rooms from calendar data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dates = Array.from(new Set(calendarData.map((d: any) => d.date))).sort();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomNames = Array.from(new Set(calendarData.map((d: any) => d.roomName)));

    // Map: roomName + date -> entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cellMap: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calendarData.forEach((d: any) => {
        cellMap[`${d.roomName}__${d.date}`] = d;
    });

    // Monthly calendar — rooms + day-status map for the currently selected room
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthRooms = Array.from(
        new Map(monthData.map((d: any) => [d.roomId, { id: d.roomId, name: d.roomName }])).values()
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthCellMap: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monthData.forEach((d: any) => {
        if (d.roomId === selectedRoomId) monthCellMap[d.date] = d;
    });
    const monthGrid = getMonthGrid(monthYear, monthMonth);
    const monthWeeks: typeof monthGrid[] = [];
    for (let i = 0; i < monthGrid.length; i += 7) monthWeeks.push(monthGrid.slice(i, i + 7));

    const toggleDateSelection = (key: string) => {
        setSelectedDates((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
        setApplyError(null);
    };

    const prevMonth = () => {
        if (monthMonth === 0) { setMonthMonth(11); setMonthYear((y) => y - 1); }
        else setMonthMonth((m) => m - 1);
        setSelectedDates([]);
    };
    const nextMonth = () => {
        if (monthMonth === 11) { setMonthMonth(0); setMonthYear((y) => y + 1); }
        else setMonthMonth((m) => m + 1);
        setSelectedDates([]);
    };

    async function handleApplyChanges() {
        if (!propertyId || !selectedRoomId || selectedDates.length === 0) return;
        setApplying(true);
        setApplyError(null);
        try {
            await availabilityApi.bulkUpdate({
                propertyId: Number(propertyId),
                roomId: selectedRoomId,
                dates: selectedDates,
                newStatus,
                customPrice: customPrice ? Number(customPrice) : undefined,
                notes: notes || undefined,
            });
            setSelectedDates([]);
            setCustomPrice("");
            setNotes("");
            fetchMonthData();
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setApplyError((err as any)?.response?.data?.message ?? "Failed to update availability.");
        } finally {
            setApplying(false);
        }
    }

    function formatDate(dateStr: string) {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
        } catch {
            return dateStr;
        }
    }

    function statusPill(status: string, customPrice?: number | null) {
        let bg = "#f3f4f6", color = "#6b7280", label = status;
        if (status === "AVAILABLE") { bg = "#dcfce7"; color = "#15803d"; label = "Available"; }
        else if (status === "BOOKED") { bg = "#fde8e8"; color = "#b91c1c"; label = "Booked"; }
        else if (status === "BLOCKED") { bg = "#fff7ed"; color = "#c2410c"; label = "Blocked"; }
        else if (status === "MAINTENANCE") { bg = "#f3f4f6"; color = "#6b7280"; label = "Maintenance"; }

        return (
            <div className="flex flex-col items-center gap-0.5">
                <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: bg, color }}
                >
                    {label}
                </span>
                {customPrice != null && (
                    <span className="text-[9px] text-[var(--brand-primary)] font-semibold">Rs.{customPrice}</span>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">{property?.name ?? "Availability"}</span>
                </div>

                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={28} color="#953002" className="animate-spin" />
                    </div>
                )}
                {error && !loading && (
                    <div className="flex-1 flex items-center justify-center text-[13px] text-[#e74c3c]">{error}</div>
                )}

                {!loading && !error && property && (
                    <div className="flex-1 overflow-y-auto pb-4 pr-1">
                        {/* Property Header Card */}
                        <div className="bg-white border border-[#e8e8e8] rounded-[14px] py-3.5 px-5 flex items-center justify-between mb-0">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-[var(--brand-primary)] bg-[#f0ebe5] flex items-center justify-center">
                                    {property.image ? (
                                        <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={28} color="#c0a898" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-[20px] font-extrabold m-0 text-[#1d1d1d]">{property.name}</h2>
                                        <span
                                            className="text-[9px] font-bold text-white rounded w-max px-[7px] py-[2px] tracking-widest"
                                            style={{ backgroundColor: statusColor }}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="text-[12px] text-[#828282] mt-0.5 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {[property.address, property.city, property.country].filter(Boolean).join(", ")}
                                    </div>
                                    <div className="text-[12px] text-[#4f4f4f] mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-[3px]"><Bed size={12} /> {property.roomCount ?? 0} Rooms</span>
                                        <span className="flex items-center gap-[3px]"><Calendar size={12} /> {property.rate ?? "—"}/night</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nav + Content */}
                        <div className="flex gap-5 items-start">
                            {/* Vertical Nav */}
                            <div className="w-[190px] shrink-0 flex flex-col gap-1">
                                {propertyId && propertyNavItems(propertyId, "Availability").map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 no-underline ${
                                            item.active
                                                ? "bg-[var(--brand-primary)] text-white font-bold"
                                                : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </a>
                                ))}
                            </div>

                        <div className="flex-1 min-w-0">
                        {/* Calendar Grid */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0] flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">
                                        {calendarView === "weekly" ? "Weekly Availability Calendar" : `${MONTH_NAMES[monthMonth]} ${monthYear}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {calendarView === "monthly" && monthRooms.length > 0 && (
                                        <>
                                            <select
                                                value={selectedRoomId ?? ""}
                                                onChange={(e) => { setSelectedRoomId(Number(e.target.value)); setSelectedDates([]); }}
                                                className="py-1.5 px-2.5 border border-[#e0e0e0] rounded-lg text-[12px] text-[#1d1d1d] outline-none bg-white"
                                            >
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {monthRooms.map((r: any) => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer text-[#4f4f4f]"><ChevronLeft size={16} /></button>
                                            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer text-[#4f4f4f]"><ChevronRight size={16} /></button>
                                        </>
                                    )}
                                    {/* Weekly / Monthly slider toggle */}
                                    <div className="flex bg-[#f0f0f0] rounded-lg p-0.5 gap-0.5">
                                        <button
                                            onClick={() => setCalendarView("weekly")}
                                            className={`py-1.5 px-3.5 rounded-md text-[11px] font-bold border-none cursor-pointer transition-all duration-150 ${
                                                calendarView === "weekly" ? "bg-[var(--brand-primary)] text-white" : "bg-transparent text-[#828282]"
                                            }`}
                                        >
                                            Weekly
                                        </button>
                                        <button
                                            onClick={() => setCalendarView("monthly")}
                                            className={`py-1.5 px-3.5 rounded-md text-[11px] font-bold border-none cursor-pointer transition-all duration-150 ${
                                                calendarView === "monthly" ? "bg-[var(--brand-primary)] text-white" : "bg-transparent text-[#828282]"
                                            }`}
                                        >
                                            Monthly
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {calendarView === "weekly" && (calendarData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <CalendarDays size={40} color="#c0a898" className="mb-3" />
                                    <p className="text-[14px] text-[#828282]">No availability data configured yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-[#faf9f7]">
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider min-w-[140px]">Room</th>
                                                {dates.map((d) => (
                                                    <th key={d} className="text-center px-3 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">
                                                        {formatDate(d)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roomNames.map((roomName, idx) => (
                                                <tr
                                                    key={roomName}
                                                    className={`border-t border-[#f5f5f5] ${idx % 2 === 0 ? "bg-white" : "bg-[#fdf9f7]"}`}
                                                >
                                                    <td className="px-4 py-3 text-[13px] font-semibold text-[#1d1d1d]">{roomName}</td>
                                                    {dates.map((d) => {
                                                        const cell = cellMap[`${roomName}__${d}`];
                                                        return (
                                                            <td key={d} className="px-2 py-3 text-center">
                                                                {cell ? statusPill(cell.status, cell.customPrice) : (
                                                                    <span className="text-[10px] text-[#b0b0b0]">—</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}

                            {/* Legend */}
                            {calendarView === "weekly" && calendarData.length > 0 && (
                                <div className="flex items-center gap-4 px-5 py-3 border-t border-[#f0f0f0] bg-[#faf9f7]">
                                    <span className="text-[11px] text-[#828282] font-semibold">Legend:</span>
                                    {[
                                        { label: "Available", bg: "#dcfce7", color: "#15803d" },
                                        { label: "Booked", bg: "#fde8e8", color: "#b91c1c" },
                                        { label: "Blocked", bg: "#fff7ed", color: "#c2410c" },
                                        { label: "Maintenance", bg: "#f3f4f6", color: "#6b7280" },
                                    ].map((l) => (
                                        <span
                                            key={l.label}
                                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: l.bg, color: l.color }}
                                        >
                                            {l.label}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Monthly Calendar (per-property, click dates to update) */}
                            {calendarView === "monthly" && (monthLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 size={24} color="#953002" className="animate-spin" />
                                </div>
                            ) : monthRooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <CalendarDays size={40} color="#c0a898" className="mb-3" />
                                    <p className="text-[14px] text-[#828282]">No rooms yet — add rooms to this property to manage a monthly calendar.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-7 border-b border-[#e8e8e8]">
                                        {DAY_LABELS.map((d) => (
                                            <div key={d} className="py-2 text-center text-[10px] font-bold text-[#828282] tracking-widest">{d}</div>
                                        ))}
                                    </div>
                                    {monthWeeks.map((week, wi) => (
                                        <div key={wi} className="grid grid-cols-7 border-b border-[#e8e8e8] last:border-b-0">
                                            {week.map((cell) => {
                                                const key = fmtDateKey(cell.date);
                                                const entry = monthCellMap[key];
                                                const isSelected = selectedDates.includes(key);
                                                const isToday = fmtDateKey(new Date()) === key;
                                                return (
                                                    <div
                                                        key={key}
                                                        onClick={() => cell.currentMonth && entry?.status !== "BOOKED" && toggleDateSelection(key)}
                                                        className={`min-h-[64px] p-1.5 border-r border-[#f0f0f0] last:border-r-0 flex flex-col gap-1 ${
                                                            !cell.currentMonth ? "bg-[#fafafa]" : entry?.status === "BOOKED" ? "cursor-not-allowed" : "cursor-pointer hover:bg-[#faf5f0]"
                                                        } ${isSelected ? "bg-[#fef5ef] shadow-[inset_0_0_0_2px_#953002]" : ""}`}
                                                    >
                                                        <span className={`text-[11px] leading-none ${!cell.currentMonth ? "text-[#ccc]" : isToday ? "font-extrabold text-[var(--brand-primary)]" : "text-[#1d1d1d] font-semibold"}`}>
                                                            {cell.date.getDate()}
                                                        </span>
                                                        {cell.currentMonth && entry && (
                                                            <span
                                                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full self-start whitespace-nowrap"
                                                                style={{
                                                                    backgroundColor: entry.status === "AVAILABLE" ? "#dcfce7" : entry.status === "BOOKED" ? "#fde8e8" : entry.status === "BLOCKED" ? "#fff7ed" : "#f3f4f6",
                                                                    color: entry.status === "AVAILABLE" ? "#15803d" : entry.status === "BOOKED" ? "#b91c1c" : entry.status === "BLOCKED" ? "#c2410c" : "#6b7280",
                                                                }}
                                                            >
                                                                {entry.status === "AVAILABLE" ? "Available" : entry.status === "BOOKED" ? "Booked" : entry.status === "BLOCKED" ? "Blocked" : "Maint."}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {/* Update panel — appears once dates are selected */}
                                    {selectedDates.length > 0 && (
                                        <div className="p-4 border-t border-[#f0f0f0] bg-[#faf9f7]">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[12px] font-bold text-[#1d1d1d]">{selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected</span>
                                                <button onClick={() => setSelectedDates([])} className="text-[11px] text-[#828282] underline bg-transparent border-none cursor-pointer">Clear</button>
                                            </div>
                                            <div className="flex flex-wrap items-end gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#828282] tracking-widest mb-1">STATUS</label>
                                                    <div className="flex gap-1.5">
                                                        {["AVAILABLE", "BLOCKED", "MAINTENANCE"].map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => setNewStatus(s)}
                                                                className={`flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold cursor-pointer border ${
                                                                    newStatus === s ? "border-[var(--brand-primary)] bg-[#fef5ef] text-[var(--brand-primary)]" : "border-[#e0e0e0] bg-white text-[#4f4f4f]"
                                                                }`}
                                                            >
                                                                {newStatus === s && <Check size={12} />}
                                                                {s === "AVAILABLE" ? "Available" : s === "BLOCKED" ? "Blocked" : "Maintenance"}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-[#828282] tracking-widest mb-1">CUSTOM PRICE</label>
                                                    <input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="Optional" className="w-[110px] py-1.5 px-2.5 border border-[#e0e0e0] rounded-lg text-[12px] outline-none" />
                                                </div>
                                                <div className="flex-1 min-w-[160px]">
                                                    <label className="block text-[10px] font-bold text-[#828282] tracking-widest mb-1">NOTES</label>
                                                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional reason" className="w-full py-1.5 px-2.5 border border-[#e0e0e0] rounded-lg text-[12px] outline-none" />
                                                </div>
                                                <button
                                                    onClick={handleApplyChanges}
                                                    disabled={applying}
                                                    className="flex items-center gap-1.5 py-2 px-4 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)] disabled:opacity-60"
                                                >
                                                    {applying && <Loader2 size={13} className="animate-spin" />}
                                                    {applying ? "Applying..." : "Apply Changes"}
                                                </button>
                                            </div>
                                            {applyError && <p className="text-[11px] text-[#c0392b] mt-2">{applyError}</p>}
                                        </div>
                                    )}
                                </>
                            ))}
                        </div>
                        </div>
                        </div>
                    </div>
                )}
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
