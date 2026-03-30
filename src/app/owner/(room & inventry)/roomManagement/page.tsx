"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    LayoutDashboard,
    Building2,
    BedDouble,
    Calendar,
    DollarSign,
    BookOpen,
    Settings,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Plus,
    Search,
    BedSingle,
    Users,
    Wrench,
    CheckCircle,
} from "lucide-react";

/* ───────────────────── sidebar data ───────────────────── */

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/owner/ownerDashboard" },
    { label: "Properties", icon: Building2, href: "/owner/properties" },
    { label: "Rooms", icon: BedDouble, href: "/owner/roomManagement", active: true },
    { label: "Availability", icon: Calendar, href: "/owner/availability/weeklyCalendar" },
    { label: "Pricing", icon: DollarSign, href: "/owner/rate" },
    { label: "Reservations", icon: BookOpen, href: "/owner/reservation" },
    { label: "Settings", icon: Settings, href: "/owner/setting/propertySetting" },
];

/* ───────────────────── room data ───────────────────── */

type RoomStatus = "Available" | "Occupied" | "Maintenance";

interface Room {
    id: number;
    name: string;
    type: string;
    icon: "bed" | "studio" | "family";
    iconColor: string;
    iconBg: string;
    occupancy: string;
    occupancyCount: number;
    basePrice: string;
    currency: string;
    status: RoomStatus;
}

const allRooms: Room[] = [
    {
        id: 1,
        name: "Suite 401",
        type: "Deluxe King",
        icon: "bed",
        iconColor: "#953002",
        iconBg: "#fef5ef",
        occupancy: "2 Adults",
        occupancyCount: 2,
        basePrice: "25000",
        currency: "LKR",
        status: "Available",
    },
    {
        id: 2,
        name: "Studio 205",
        type: "Single Studio",
        icon: "studio",
        iconColor: "#953002",
        iconBg: "#fef5ef",
        occupancy: "1 Adult",
        occupancyCount: 1,
        basePrice: "120.00",
        currency: "$",
        status: "Occupied",
    },
    {
        id: 3,
        name: "Suite 502",
        type: "Family Loft",
        icon: "family",
        iconColor: "#953002",
        iconBg: "#fef5ef",
        occupancy: "4 Adults",
        occupancyCount: 4,
        basePrice: "320.00",
        currency: "$",
        status: "Maintenance",
    },
    {
        id: 4,
        name: "Suite 405",
        type: "Deluxe King",
        icon: "bed",
        iconColor: "#953002",
        iconBg: "#fef5ef",
        occupancy: "2 Adults",
        occupancyCount: 2,
        basePrice: "180.00",
        currency: "$",
        status: "Available",
    },
];

const statusConfig: Record<RoomStatus, { color: string; bg: string }> = {
    Available: { color: "#27ae60", bg: "#e8f5e9" },
    Occupied: { color: "#eb5757", bg: "#fdecea" },
    Maintenance: { color: "#f2994a", bg: "#fff8e1" },
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

export default function RoomManagementPage() {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Rooms");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRooms = allRooms.filter((room) => {
        const matchesTab =
            activeTab === "All Rooms" || room.status === activeTab;
        const matchesSearch =
            searchQuery === "" ||
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.type.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const totalRooms = 45;
    const occupied = 32;
    const maintenance = 3;
    const vacant = 10;

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="px-3.5 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-2.5 py-2.5 px-3.5 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
                                    item.active
                                        ? "bg-[rgba(149,48,2,0.08)] text-[#953002] font-bold border-[#953002]"
                                        : "bg-transparent text-[#4f4f4f] font-medium border-transparent hover:bg-[#fafafa]"
                                }`}
                            >
                                <Icon size={18} className="shrink-0" />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2.5 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </button>
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner"
                                alt="User"
                                className="w-full h-full rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Page Title */}
                    <div className="mb-5">
                        <h1 className="text-[28px] font-extrabold text-[#1d1d1d] m-0 leading-tight">
                            Rooms Management
                        </h1>
                        <p className="text-[13px] text-[#828282] mt-1 m-0">
                            Efficiently manage all units and occupancy status for Mountain View Resort
                        </p>
                    </div>

                    {/* ── KPI Cards ── */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {/* Total Rooms */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 flex items-start justify-between">
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
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 flex items-start justify-between">
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
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 flex items-start justify-between">
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
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 flex items-start justify-between">
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
                    <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
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
                                                ? "text-[#953002] border-[#953002] font-bold"
                                                : "text-[#828282] border-transparent hover:text-[#4f4f4f]"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <button className="w-9 h-9 flex items-center justify-center border border-[#e0e0e0] rounded-lg bg-white cursor-pointer hover:bg-[#fafafa] transition-colors">
                                <SlidersHorizontal size={16} color="#4f4f4f" />
                            </button>
                        </div>

                        {/* Divider below tabs */}
                        <div className="h-px bg-[#e8e8e8]" />

                        {/* Table */}
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] py-3.5 px-5 text-left border-b border-[#e8e8e8] uppercase">
                                        Room Name
                                    </th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] py-3.5 px-4 text-left border-b border-[#e8e8e8] uppercase">
                                        Type
                                    </th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] py-3.5 px-4 text-left border-b border-[#e8e8e8] uppercase">
                                        Occupancy
                                    </th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] py-3.5 px-4 text-left border-b border-[#e8e8e8] uppercase">
                                        Base Price
                                    </th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] py-3.5 px-4 text-center border-b border-[#e8e8e8] uppercase">
                                        Status
                                    </th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] py-3.5 px-4 text-center border-b border-[#e8e8e8] uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map((room) => {
                                    const sConfig = statusConfig[room.status];
                                    return (
                                        <tr
                                            key={room.id}
                                            className="border-b border-[#f5f5f5] transition-colors hover:bg-[#fafafa]"
                                        >
                                            {/* Room Name */}
                                            <td className="py-4 px-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ background: room.iconBg }}
                                                    >
                                                        <RoomIcon
                                                            type={room.icon}
                                                            color={room.iconColor}
                                                        />
                                                    </div>
                                                    <span className="text-[14px] font-bold text-[#1d1d1d]">
                                                        {room.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="py-4 px-4 align-middle text-[13px] text-[#4f4f4f]">
                                                {room.type}
                                            </td>

                                            {/* Occupancy */}
                                            <td className="py-4 px-4 align-middle">
                                                <div className="flex items-center gap-2 text-[13px] text-[#4f4f4f]">
                                                    <OccupancyIcon count={room.occupancyCount} />
                                                    <span>{room.occupancy}</span>
                                                </div>
                                            </td>

                                            {/* Base Price */}
                                            <td className="py-4 px-4 align-middle">
                                                <span className="text-[14px] font-bold text-[#1d1d1d]">
                                                    {room.currency} {room.basePrice}
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
                                                    {room.status}
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
                                <span className="font-bold text-[#1d1d1d]">1</span> to{" "}
                                <span className="font-bold text-[#1d1d1d]">4</span> of{" "}
                                <span className="font-bold text-[#1d1d1d]">45</span> rooms
                            </span>
                            <div className="flex items-center gap-1">
                                <button className="w-7 h-7 flex items-center justify-center bg-transparent border border-[#e0e0e0] rounded-md cursor-pointer text-[#828282] hover:bg-[#f5f5f5] transition-colors">
                                    <ChevronLeft size={14} />
                                </button>
                                {[1, 2, 3].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center border-none cursor-pointer text-[12px] font-semibold rounded-md transition-colors ${
                                            currentPage === p
                                                ? "bg-[#953002] text-white"
                                                : "bg-transparent text-[#4f4f4f] hover:bg-[#f5f5f5]"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button className="w-7 h-7 flex items-center justify-center bg-transparent border border-[#e0e0e0] rounded-md cursor-pointer text-[#828282] hover:bg-[#f5f5f5] transition-colors">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
