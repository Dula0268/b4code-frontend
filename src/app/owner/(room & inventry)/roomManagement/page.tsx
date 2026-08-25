/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { roomsApi } from "@/api/owner/rooms.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    BedSingle,
    BedDouble,
    Users,
    Wrench,
    CheckCircle,
    SlidersHorizontal,
} from "lucide-react";

/* ───────────────────── types ───────────────────── */

type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

const statusConfig: Record<RoomStatus, { color: string; bg: string }> = {
    AVAILABLE: { color: "#27ae60", bg: "#e8f5e9" },
    OCCUPIED: { color: "#eb5757", bg: "#fdecea" },
    MAINTENANCE: { color: "#f2994a", bg: "#fff8e1" },
};

const tabs = ["All Rooms", "Available", "Occupied", "Maintenance"] as const;

/* ───────────────────── helpers ───────────────────── */

function RoomIcon({ type, color }: { type: string; color: string }) {
    if (type === "studio") return <BedSingle size={20} color={color} />;
    if (type === "family") return <Users size={20} color={color} />;
    return <BedDouble size={20} color={color} />;
}

function OccupancyIcon({ count }: { count: number }) {
    if (count === 1) {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="2.5" stroke="#828282" strokeWidth="1.2" fill="none" />
                <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#828282" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
        );
    }
    return (
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <circle cx="7" cy="5" r="2.2" stroke="#828282" strokeWidth="1.1" fill="none" />
            <circle cx="13" cy="5" r="2.2" stroke="#828282" strokeWidth="1.1" fill="none" />
            <path d="M2 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5" stroke="#828282" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <path d="M11 14c0-2.5 1-4.5 4-4.5s3 2 3 4.5" stroke="#828282" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </svg>
    );
}

/* ───────────────────── component ───────────────────── */

/**
 * RoomManagementPage Component
 *
 * Central room management dashboard listing all room types with
 * occupancy stats, pricing, amenities, and quick-action controls.
 */
export default function RoomManagementPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Rooms");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rooms, setRooms] = useState<any[]>([]);
    const [totalRooms, setTotalRooms] = useState(0);
    const [occupied, setOccupied] = useState(0);
    const [maintenance, setMaintenance] = useState(0);
    const [vacant, setVacant] = useState(0);

    const fetchRooms = async () => {
        try {
            const data = await roomsApi.listRooms(ownerId);
            setRooms(data.rooms || []);
            setTotalRooms(data.totalRooms || 0);
            setOccupied(data.occupied || 0);
            setMaintenance(data.maintenance || 0);
            setVacant(data.vacant || 0);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        }
    };

    useEffect(() => {
        fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId]);

    const handleDeleteRoom = async (id: number) => {
        if (!confirm("Delete this room? This cannot be undone.")) return;
        try {
            await roomsApi.deleteRoom(id);
            fetchRooms();
        } catch {
            alert("Failed to delete room.");
        }
    };

    const allFilteredRooms = rooms.filter((room) => {
        const matchesTab =
            activeTab === "All Rooms" || room.status === activeTab.toUpperCase();
        const matchesSearch =
            searchQuery === "" ||
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.roomType.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const pageSize = 10;
    const totalPages = Math.max(1, Math.ceil(allFilteredRooms.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const filteredRooms = allFilteredRooms.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <div className="w-full h-full flex-1 flex flex-col overflow-hidden">

                {/* Scrollable Body */}
                <div className="w-full flex-1 overflow-y-auto px-8 pt-6 pb-10">
                    {/* Page Title */}
                    <div className="mb-5 flex justify-between items-center">
                        <div>
                            <h1 className="text-[28px] font-extrabold text-[#1d1d1d] m-0 leading-tight">
                                Rooms Management
                            </h1>
                            <p className="text-[13px] text-[#828282] mt-1 m-0">
                                Efficiently manage all units and occupancy status for Mountain View Resort
                            </p>
                        </div>
                        <a href="/owner/roomManagement/addRoom" className="bg-[var(--brand-primary)] text-white px-4 py-2.5 rounded-lg font-bold text-[14px] flex items-center gap-2 hover:bg-[var(--primary-hover)] transition-colors no-underline">
                            <Plus size={18} />
                            Add New Room
                        </a>
                    </div>

                    {/* ── KPI Cards ── */}
                    <div className="w-full grid grid-cols-4 gap-4 mb-6">
                        {/* Total Rooms */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 flex items-start justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className="text-[10px] font-bold text-[#828282] tracking-[1px] mb-2 uppercase">
                                    Total Rooms
                                </div>
                                <div className="text-[32px] font-extrabold text-[#1d1d1d] leading-none">
                                    {totalRooms}
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0 mt-1">
                                <BedDouble size={20} color="#953002" />
                            </div>
                        </div>

                        {/* Occupied */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 flex items-start justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className="text-[10px] font-bold text-[#828282] tracking-[1px] mb-2 uppercase">
                                    Occupied
                                </div>
                                <div className="text-[32px] font-extrabold text-[#1d1d1d] leading-none">
                                    {occupied}
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-[#fdecea] flex items-center justify-center shrink-0 mt-1">
                                <Users size={20} color="#eb5757" />
                            </div>
                        </div>

                        {/* Maintenance */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 flex items-start justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className="text-[10px] font-bold text-[#828282] tracking-[1px] mb-2 uppercase">
                                    Maintenance
                                </div>
                                <div className="text-[32px] font-extrabold text-[#1d1d1d] leading-none">
                                    {String(maintenance).padStart(2, "0")}
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-[#fff8e1] flex items-center justify-center shrink-0 mt-1">
                                <Wrench size={20} color="#f2994a" />
                            </div>
                        </div>

                        {/* Vacant */}
                        <div className="bg-white border border-[#e8e8e8] rounded-2xl py-4 px-5 flex items-start justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <div className="text-[10px] font-bold text-[#828282] tracking-[1px] mb-2 uppercase">
                                    Vacant
                                </div>
                                <div className="text-[32px] font-extrabold text-[#1d1d1d] leading-none">
                                    {vacant}
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] flex items-center justify-center shrink-0 mt-1">
                                <CheckCircle size={20} color="#27ae60" />
                            </div>
                        </div>
                    </div>

                    {/* ── Rooms Table Card ── */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                        {/* Tabs & Filter Row */}
                        <div className="flex items-center justify-between px-5 pt-4 pb-0">
                            <div className="flex items-center gap-0">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setCurrentPage(1);
                                        }}
                                        className={`py-2.5 px-4 text-[13px] font-semibold border-b-2 bg-transparent cursor-pointer transition-all duration-150 ${
                                            activeTab === tab
                                                ? "text-[var(--brand-primary)] border-[var(--brand-primary)] font-bold"
                                                : "text-[#828282] border-transparent hover:text-[#4f4f4f]"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 border border-[#e0e0e0] rounded-lg px-3 py-1.5 bg-white">
                                    <Search size={14} color="#828282" />
                                    <input
                                        type="text"
                                        placeholder="Search rooms..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="text-[13px] text-[#4f4f4f] bg-transparent border-none outline-none w-36"
                                    />
                                </div>
                                <button className="w-9 h-9 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer hover:bg-[#fafafa] transition-colors">
                                    <SlidersHorizontal size={16} color="#4f4f4f" />
                                </button>
                            </div>
                        </div>

                        {/* Divider below tabs */}
                        <div className="h-px bg-[#e8e8e8]" />

                        {/* Table */}
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#F6F8F7]">
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-5 text-left uppercase">
                                        Room Name
                                    </th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-left uppercase">
                                        Type
                                    </th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-left uppercase">
                                        Occupancy
                                    </th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-left uppercase">
                                        Base Price
                                    </th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-center uppercase">
                                        Status
                                    </th>
                                    <th className="text-[11.5px] font-bold text-[#828282] tracking-[0.06em] py-2.5 px-4 text-center uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map((room, idx) => {
                                    const statusValue = ((room.status as string) || "AVAILABLE") as RoomStatus;
                                    const sConfig = statusConfig[statusValue] || statusConfig.AVAILABLE;
                                    const iconBg = statusValue === "OCCUPIED" ? "#fdecea" : statusValue === "MAINTENANCE" ? "#fff8e1" : "#e8f5e9";
                                    const iconColor = statusValue === "OCCUPIED" ? "#eb5757" : statusValue === "MAINTENANCE" ? "#f2994a" : "#27ae60";
                                    const roomIcon = room.roomType?.toLowerCase().includes("studio") ? "studio" : room.roomType?.toLowerCase().includes("family") ? "family" : "bed";

                                    return (
                                        <tr
                                            key={room.id}
                                            className={`border-t border-[#e0e0e0] transition-colors hover:bg-[#f5efec] ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}
                                        >
                                            {/* Room Name */}
                                            <td className="py-4 px-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ background: iconBg }}
                                                    >
                                                        <RoomIcon
                                                            type={roomIcon}
                                                            color={iconColor}
                                                        />
                                                    </div>
                                                    <span className="text-[14px] font-bold text-[#1d1d1d]">
                                                        {room.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="py-4 px-4 align-middle text-[13px] text-[#4f4f4f]">
                                                {room.roomType}
                                            </td>

                                            {/* Occupancy */}
                                            <td className="py-4 px-4 align-middle">
                                                <div className="flex items-center gap-2 text-[13px] text-[#4f4f4f]">
                                                    <OccupancyIcon count={room.maxOccupancy} />
                                                    <span>{room.maxOccupancy} Adults</span>
                                                </div>
                                            </td>

                                            {/* Base Price */}
                                            <td className="py-4 px-4 align-middle">
                                                <span className="text-[14px] font-bold text-[#1d1d1d]">
                                                    {room.currency || "LKR"} {room.baseRate}
                                                </span>
                                                <span className="text-[11px] text-[#b0b0b0] ml-1">
                                                    /night
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-4 align-middle text-center">
                                                <span
                                                    className="text-[11px] font-bold py-1 px-3.5 rounded-full inline-block tracking-wide"
                                                    style={{
                                                        color: sConfig.color,
                                                        background: sConfig.bg,
                                                    }}
                                                >
                                                    {statusValue}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 align-middle">
                                                <div className="flex justify-center gap-1.5">
                                                    <button
                                                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-md hover:bg-[#f5f5f5] transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={16} color="#828282" />
                                                    </button>
                                                    <button
                                                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-md hover:bg-[#f5f5f5] transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} color="#828282" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-md hover:bg-[#fdecea] transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} color="#828282" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredRooms.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-[14px] text-[#b0b0b0]"
                                        >
                                            No rooms found for the selected filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-between items-center py-3.5 px-5 border-t border-[#e8e8e8]">
                            <span className="text-[12px] text-[#828282]">
                                Showing{" "}
                                <span className="font-bold text-[#1d1d1d]">{allFilteredRooms.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span> to{" "}
                                <span className="font-bold text-[#1d1d1d]">{Math.min(safePage * pageSize, allFilteredRooms.length)}</span> of{" "}
                                <span className="font-bold text-[#1d1d1d]">{allFilteredRooms.length}</span> rooms
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="w-7 h-7 flex items-center justify-center bg-transparent border border-[#e0e0e0] rounded-md cursor-pointer text-[#828282] hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center border-none cursor-pointer text-[12px] font-semibold rounded-md transition-colors ${
                                            safePage === p
                                                ? "bg-[var(--brand-primary)] text-white"
                                                : "bg-transparent text-[#4f4f4f] hover:bg-[#f5f5f5]"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="w-7 h-7 flex items-center justify-center bg-transparent border border-[#e0e0e0] rounded-md cursor-pointer text-[#828282] hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
