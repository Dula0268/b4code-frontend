/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { propertiesApi } from "@/api/owner/properties.api";
import { roomsApi } from "@/api/owner/rooms.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Plus,
    Building2,
    DoorOpen,
} from "lucide-react";

function RoomsContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rooms, setRooms] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [physicalRooms, setPhysicalRooms] = useState<any[]>([]);
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
            roomsApi.listRooms(undefined, undefined, 1, 1000),
            roomsApi.getPhysicalRoomsByProperty(Number(propertyId)).catch(() => []),
        ])
            .then(([prop, roomData, units]) => {
                setProperty(prop);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const all: any[] = roomData?.rooms ?? [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setRooms(all.filter((r: any) => r.propertyId === Number(propertyId)));
                setPhysicalRooms(Array.isArray(units) ? units : []);
            })
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load data.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]); // ownerId used for getProperty only

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";

    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    // Compute stats from filtered rooms
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = rooms.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const occupied = rooms.filter((r: any) => r.status === "OCCUPIED" || (!r.isAvailable && r.status !== "MAINTENANCE")).length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maintenance = rooms.filter((r: any) => r.status === "MAINTENANCE").length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vacant = rooms.filter((r: any) => r.status === "AVAILABLE" && r.isAvailable).length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function roomStatusBadge(status: any) {
        if (status === "AVAILABLE") return { label: "Available", bg: "#dcfce7", color: "#15803d" };
        if (status === "MAINTENANCE") return { label: "Maintenance", bg: "#fff7ed", color: "#c2410c" };
        return { label: "Unavailable", bg: "#f3f4f6", color: "#6b7280" };
    }

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* Sidebar */}

            <OwnerSidebar />

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
                    <span className="text-[#953002] font-semibold">{property?.name ?? "Rooms"}</span>
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
                                const isActive = t === "Rooms";
                                return (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                            else if (t === "Rooms") return;
                                            else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${propertyId}`;
                                            else if (t === "Rates") window.location.href = `/owner/properties/Rate?id=${propertyId}`;
                                            else if (t === "Reservations") window.location.href = `/owner/properties/Reservation?id=${propertyId}`;
                                            else if (t === "Media") window.location.href = `/owner/properties/Media?id=${propertyId}`;
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

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { label: "Total Rooms", value: total, color: "#953002" },
                                { label: "Occupied", value: occupied, color: "#2563eb" },
                                { label: "Maintenance", value: maintenance, color: "#d97706" },
                                { label: "Vacant", value: vacant, color: "#16a34a" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white border border-[#e8e8e8] rounded-xl p-4">
                                    <div className="text-[12px] text-[#828282] mb-1">{stat.label}</div>
                                    <div className="text-[28px] font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Rooms Table */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
                                <span className="text-[15px] font-bold text-[#1d1d1d]">Room Inventory</span>
                                <a href={`/owner/roomManagement/addRoom?propertyId=${propertyId}`} className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                        <Plus size={14} /> Add Room
                                    </button>
                                </a>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Bed size={40} color="#c0a898" className="mb-3" />
                                    <p className="text-[14px] text-[#828282]">No rooms yet for this property. Add rooms to get started.</p>
                                    <a href={`/owner/roomManagement/addRoom?propertyId=${propertyId}`} className="no-underline mt-3">
                                        <button className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#b03a02]">
                                            <Plus size={14} /> Add Room
                                        </button>
                                    </a>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#faf9f7]">
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Room Name</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Type</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Occupancy</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Status</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {rooms.map((room: any, idx: number) => {
                                                const badge = roomStatusBadge(room.status);
                                                return (
                                                    <tr
                                                        key={room.id}
                                                        className={`border-t border-[#f5f5f5] ${idx % 2 === 0 ? "bg-white" : "bg-[#fdf9f7]"} hover:bg-[#fef5ef] transition-colors`}
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#f0ebe5] shrink-0 flex items-center justify-center border border-[#e8e0da]">
                                                                    {room.imageUrl ? (
                                                                        <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Bed size={16} color="#c0a898" />
                                                                    )}
                                                                </div>
                                                                <span className="text-[13px] font-semibold text-[#1d1d1d]">{room.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">{room.roomType ?? "—"}</td>
                                                        <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">
                                                            {room.maxOccupancy} Adults{room.maxChildren ? ` + ${room.maxChildren} Children` : ""}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span
                                                                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                                style={{ backgroundColor: badge.bg, color: badge.color }}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <a href={`/owner/properties/roomDetails?roomId=${room.id}&propertyId=${propertyId}`} className="no-underline">
                                                                <button className="py-1.5 px-3.5 bg-white text-[#953002] border border-[#953002] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#fef5ef] transition-colors">
                                                                    View
                                                                </button>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Physical Room Units */}
                        {physicalRooms.length > 0 && (
                            <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden mt-4">
                                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#f0f0f0]">
                                    <DoorOpen size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Physical Units</span>
                                    <span className="ml-1 text-[11px] font-bold text-[#828282] bg-[#f5f5f5] px-2 py-0.5 rounded-full">{physicalRooms.length} units</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#faf9f7]">
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Door / Unit</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Room Type</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {physicalRooms.map((unit: any, idx: number) => {
                                                const unitStatus = unit.status ?? "CLEAN";
                                                const statusStyle =
                                                    unitStatus === "CLEAN"        ? { bg: "#dcfce7", color: "#15803d", label: "Clean" } :
                                                    unitStatus === "DIRTY"        ? { bg: "#fff7ed", color: "#c2410c", label: "Dirty" } :
                                                    unitStatus === "OUT_OF_ORDER" ? { bg: "#fef2f2", color: "#b91c1c", label: "Out of Order" } :
                                                                                    { bg: "#f5f5f5", color: "#6b7280", label: unitStatus };
                                                return (
                                                    <tr
                                                        key={unit.id}
                                                        className={`border-t border-[#f5f5f5] ${idx % 2 === 0 ? "bg-white" : "bg-[#fdf9f7]"}`}
                                                    >
                                                        <td className="px-5 py-3 text-[13px] font-semibold text-[#1d1d1d]">{unit.doorNumber ?? "—"}</td>
                                                        <td className="px-5 py-3 text-[13px] text-[#4f4f4f]">{unit.roomName ?? "—"}</td>
                                                        <td className="px-5 py-3">
                                                            <span
                                                                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                                                            >
                                                                {statusStyle.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function RoomsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <RoomsContent />
        </Suspense>
    );
}