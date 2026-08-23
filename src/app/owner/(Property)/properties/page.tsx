/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Search,
    ChevronDown,
    MoreVertical,
    Star,
    MapPin,
    Bell,
    Building2,
    ChevronRight,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * PropertiesPage Component
 *
 * Lists all properties owned by the current user with summary cards
 * showing occupancy, revenue, and status for each property.
 */
export default function PropertiesPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const statusFilter: string = "All";
    const locationFilter: string = "All";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [propertyData, setPropertyData] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchProperties = async () => {
        try {
            const statusParam = statusFilter === "All" ? undefined : statusFilter.toLowerCase();
            const data = await propertiesApi.listProperties(ownerId, currentPage, 10, searchText, statusParam);
            setPropertyData(data.properties);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProperties();
        }, 300);
        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId, currentPage, searchText, statusFilter, locationFilter]);

    const toggleStatus = async (id: number) => {
        try {
            await propertiesApi.toggleStatus(id, ownerId);
            // Optimistic update
            setPropertyData((prev) =>
                prev.map((p) => (p.id === id ? { ...p, statusOn: !p.statusOn, status: !p.statusOn ? "active" : "inactive" } : p))
            );
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "active":
                return { color: "#2e7d32", bg: "rgba(46,125,50,0.1)", label: "Active", dot: false };
            case "inactive":
                return { color: "#828282", bg: "rgba(130,130,130,0.1)", label: "Inactive", dot: false };
            case "maintenance":
                return { color: "#e67e22", bg: "rgba(230,126,34,0.1)", label: "Maintenance", dot: true };
            default:
                return { color: "#828282", bg: "rgba(130,130,130,0.1)", label: status, dot: false };
        }
    };

    return (
        <div className="w-full h-full flex-1 overflow-y-auto px-6 pt-4 pb-4">

                {/* Page Header */}
                <div className="w-full flex justify-between items-start mb-2.5">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#1d1d1d] m-0 leading-tight">My Properties</h1>
                        <p className="text-[13px] text-[#828282] mt-1">Manage your listings, update availability, and track performance.</p>
                    </div>
                    <a href="/owner/properties/createNewProperty" className="no-underline">
                        <button className="flex items-center gap-2 py-2 px-4 bg-[var(--brand-primary)] text-white border-none rounded-xl text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-[var(--primary-hover)] transition-colors">
                            <Building2 size={18} color="#fff" />
                            <span>Add New Property</span>
                            <ChevronRight size={16} color="#fff" />
                        </button>
                    </a>
                </div>

                {/* Search & Filters */}
                <div className="w-full flex justify-between items-center mb-2.5 gap-4">
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
                <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-[13px]">
                        <thead>
                            <tr className="bg-[#F6F8F7]">
                                {["IMAGE", "PROPERTY DETAILS", "RATES & RATING", "STATUS", "ACTIONS"].map((h) => (
                                    <th key={h} className="text-left py-2.5 px-4 text-[11.5px] font-bold tracking-[0.06em] text-[#828282] uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {propertyData.map((p, idx) => {
                                const badge = statusBadge(p.status);
                                return (
                                    <tr key={p.id} className={`border-t border-[#e0e0e0] hover:bg-[#f5efec] transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                                        {/* Image */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-[#f0ebe5]">
                                                {p.image ? (
                                                    <img
                                                        src={p.image}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Building2 size={20} color="#c0a898" />
                                                    </div>
                                                )}
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
                                                <span
                                                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                                                    style={{ color: badge.color, backgroundColor: badge.bg }}
                                                >
                                                    {badge.label}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-1.5 px-3.5 align-middle">
                                            <div className="flex items-center gap-2">
                                                <a href={`/owner/properties/propertyDetails?id=${p.id}`} className="no-underline">
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
                        Showing <strong className="text-[#1d1d1d]">{Math.min((currentPage - 1) * 10 + 1, totalItems)}-{Math.min(currentPage * 10, totalItems)}</strong> of <strong className="text-[#1d1d1d]">{totalItems}</strong> properties
                    </span>
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[13px] font-semibold cursor-pointer ${
                                    page === currentPage
                                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                                        : "bg-white text-[#4f4f4f] border-[#e0e0e0]"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }