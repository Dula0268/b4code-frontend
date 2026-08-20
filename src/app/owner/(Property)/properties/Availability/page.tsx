/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { availabilityApi } from "@/api/owner/availability.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    CalendarDays,
} from "lucide-react";

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
                    <span className="text-[9px] text-[#953002] font-semibold">Rs.{customPrice}</span>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-[160px] bg-white border-r border-[#e0e0e0] py-3 shrink-0 flex flex-col">
                <div className="px-3.5">
                    <Logo width={120} height={36} />
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center py-1.5">
                    <div />
                    <div className="flex items-center gap-3">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">{property?.name ?? "Availability"}</span>
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
                                <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-[#953002] bg-[#f0ebe5] flex items-center justify-center">
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

                        {/* Tabs */}
                        <div className="flex border-b border-[#e8e8e8] mb-3 mt-2">
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
                                            else if (t === "Staff") window.location.href = `/owner/properties/Staff?id=${propertyId}`;
                                            else if (t === "Settings") window.location.href = `/owner/properties/Setting?id=${propertyId}`;
                                        }}
                                        className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative border-b-2 ${
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

                        {/* Calendar Grid */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
                                <CalendarDays size={16} color="#953002" />
                                <span className="text-[15px] font-bold text-[#1d1d1d]">Weekly Availability Calendar</span>
                            </div>

                            {calendarData.length === 0 ? (
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
                            )}

                            {/* Legend */}
                            {calendarData.length > 0 && (
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
                        </div>
                    </div>
                )}
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
