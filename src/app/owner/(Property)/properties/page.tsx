/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Search,
    ChevronDown,
    MoreVertical,
    Star,
    MapPin,
    Bell,
    LayoutDashboard,
    Building2,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Settings,
    ChevronRight,
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const properties: any[] = [];

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/owner/ownerDashboard", active: false },
    { icon: Building2, label: "Properties", href: "/owner/properties", active: true },
    { icon: DoorOpen, label: "Rooms", href: "/owner/roomManagement", active: false },
    { icon: CalendarCheck, label: "Availability", href: "/owner/availability/weeklyCalendar", active: false },
    { icon: DollarSign, label: "Rate", href: "/owner/rate", active: false },
    { icon: ClipboardList, label: "Reservations", href: "/owner/reservation", active: false },
    { icon: Settings, label: "Settings", href: "/owner/setting/accountSetting", active: false },
];

/* ───────────────────── component ───────────────────── */

/**
 * PropertiesPage Component
 *
 * Lists all properties owned by the current user with summary cards
 * showing occupancy, revenue, and status for each property.
 */
export default function PropertiesPage() {
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");
    const [locationFilter, setLocationFilter] = useState("All");
    const [propertyData, setPropertyData] = useState(properties);

    const toggleStatus = (id: number) => {
        setPropertyData((prev) =>
            prev.map((p) => (p.id === id ? { ...p, statusOn: !p.statusOn, status: !p.statusOn ? "active" : "inactive" } : p))
        );
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "active":
                return { color: "#2e7d32", bg: "transparent", label: "Active", dot: false };
            case "inactive":
                return { color: "#828282", bg: "transparent", label: "Inactive", dot: false };
            case "maintenance":
                return { color: "#e67e22", bg: "transparent", label: "Maintenance", dot: true };
            default:
                return { color: "#828282", bg: "transparent", label: status, dot: false };
        }
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
            <main className="flex-1 px-6 pb-1.5 overflow-y-auto min-w-0">
                {/* Top Bar */}
                <div className="flex justify-between items-center py-1 gap-3">
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
                        <a href="/owner/ownerDashboard/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center justify-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={20} color="#4f4f4f" />
                        </a>
                        <div className="w-[34px] h-[34px] rounded-full overflow-hidden border-2 border-[#953002]">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner"
                                alt="User"
                                className="w-8 h-8 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Page Header */}
                <div className="flex justify-between items-start mb-2.5">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1d1d1d] m-0 leading-tight">My Properties</h1>
                        <p className="text-[13px] text-[#828282] mt-1">Manage your listings, update availability, and track performance.</p>
                    </div>
                    <a href="/owner/properties/createNewProperty" className="no-underline">
                        <button className="flex items-center gap-2 py-2 px-4 bg-[#953002] text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-[#b03a02] transition-colors">
                            <Building2 size={18} color="#fff" />
                            <span>Add New Property</span>
                            <ChevronRight size={16} color="#fff" />
                        </button>
                    </a>
                </div>

                {/* Search & Filters */}
                <div className="flex justify-between items-center mb-2.5 gap-4">
                    <div className="flex items-center gap-2.5 flex-1 max-w-[480px] bg-white border border-[#e0e0e0] rounded-xl py-1.5 px-3">
                        <Search size={16} color="#b0b0b0" />
                        <input
                            type="text"
                            placeholder="Search properties by name, city, or address..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border-none bg-transparent outline-none flex-1 text-[13px] text-[#1d1d1d]"
                        />
                    </div>
                    <div className="flex gap-2.5">
                        <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-xl text-[13px] font-medium text-[#4f4f4f] cursor-pointer whitespace-nowrap">
                            Location: {locationFilter}
                            <ChevronDown size={14} color="#4f4f4f" />
                        </button>
                        <button className="flex items-center gap-1.5 py-2 px-3.5 bg-white border border-[#e0e0e0] rounded-xl text-[13px] font-medium text-[#4f4f4f] cursor-pointer whitespace-nowrap">
                            Status: {statusFilter}
                            <ChevronDown size={14} color="#4f4f4f" />
                        </button>
                    </div>
                </div>

                {/* Properties Table */}
                <div className="bg-white border border-[#e0e0e0] rounded-[14px] overflow-hidden">
                    <table className="w-full border-collapse text-[13px]">
                        <thead>
                            <tr>
                                {["IMAGE", "PROPERTY DETAILS", "RATES & RATING", "STATUS", "ACTIONS"].map((h) => (
                                    <th key={h} className="text-left py-2 px-3.5 text-[10px] font-bold tracking-wider text-[#828282] border-b border-[#e0e0e0] uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {propertyData.map((p) => {
                                const badge = statusBadge(p.status);
                                return (
                                    <tr key={p.id} className="border-b border-[#f5f5f5]">
                                        {/* Image */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0">
                                                <img
                                                    src={p.image}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                        </td>

                                        {/* Details */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="font-semibold text-[14px] text-[#1d1d1d] mb-1">
                                                {p.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-[12px] text-[#828282]">
                                                <MapPin size={12} color="#b0b0b0" />
                                                {p.address}
                                            </div>
                                        </td>

                                        {/* Rates & Rating */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="mb-1">
                                                <span className="font-bold text-[14px] text-[#1d1d1d]">{p.rate}</span>
                                                <span className="text-[12px] text-[#828282]">/night</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star size={13} color="#ffb401" fill="#ffb401" />
                                                <span className="text-[12px] font-semibold text-[#1d1d1d]">{p.rating}</span>
                                                <span className="text-[12px] text-[#828282]">({p.reviews} reviews)</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                {/* Toggle (only for active/inactive) */}
                                                {p.status !== "maintenance" ? (
                                                    <button
                                                        onClick={() => toggleStatus(p.id)}
                                                        className="w-10 h-5.5 rounded-full border-none cursor-pointer relative transition-colors duration-200 shrink-0"
                                                        style={{ background: p.statusOn ? "#953002" : "#e0e0e0" }}
                                                    >
                                                        <div
                                                            className="w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform duration-200"
                                                            style={{ transform: p.statusOn ? "translateX(16px)" : "translateX(2px)" }}
                                                        />
                                                    </button>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-[#e67e22] shrink-0" />
                                                )}
                                                <span className="text-[13px] font-medium" style={{ color: badge.color }}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="flex items-center gap-2">
                                                <a href="/owner/properties/propertyDetails" className="no-underline">
                                                    <button className="py-1.5 px-4 bg-white border border-[#e0e0e0] rounded-lg text-[13px] font-medium text-[#4f4f4f] cursor-pointer hover:bg-gray-50">View Details</button>
                                                </a>
                                                <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center justify-center hover:bg-gray-100" aria-label="More">
                                                    <MoreVertical size={16} color="#828282" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-[13px] text-[#828282]">
                        Showing <strong className="text-[#1d1d1d]">1-5</strong> of <strong className="text-[#1d1d1d]">24</strong> properties
                    </span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[13px] font-semibold cursor-pointer ${
                                    page === currentPage
                                        ? "bg-[#953002] text-white border-[#953002]"
                                        : "bg-white text-[#4f4f4f] border-[#e0e0e0]"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}