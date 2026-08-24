/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import { propertiesApi } from "@/api/owner/properties.api";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import {
    Search,
    SlidersHorizontal,
    CalendarDays,
    Eye,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Trash2,
    Pencil,
    Clock,
    Ban,
    Hourglass,
    TrendingUp,
    XCircle,
} from "lucide-react";

const TYPE_ICON: Record<string, { icon: React.ReactNode; bg: string }> = {
    MIN_STAY: { icon: <Clock size={16} color="#4285F4" />, bg: "#e8f0fe" },
    MAX_STAY: { icon: <Hourglass size={16} color="#f2994a" />, bg: "#fff3e0" },
    BLACKOUT: { icon: <Ban size={16} color="#e74c3c" />, bg: "#fde8e8" },
    CLOSED_TO_ARRIVAL: { icon: <XCircle size={16} color="#953002" />, bg: "#fef0e7" },
    ADVANCE_NOTICE: { icon: <TrendingUp size={16} color="#27ae60" />, bg: "#e8f8ef" },
};
const defaultTypeIcon = { icon: <Clock size={16} color="#828282" />, bg: "#f5f5f5" };

/* ───────────────────── component ───────────────────── */

/**
 * ReservationRestrictionPage Component
 *
 * Lists all active reservation restriction rules (min stay, max stay,
 * closed-to-arrival, etc.) and provides create/edit/delete actions.
 */
export default function ReservationRestrictionPage() {
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [search, setSearch] = useState("");
    const [propertyId, setPropertyId] = useState<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [restrictions, setRestrictions] = useState<any[]>([]);

    const loadRestrictions = () => {
        propertiesApi.listProperties(ownerId, 1, 100)
            .then(async (list: any[]) => {
                if (!list.length) return;
                setPropertyId(list[0].id);
                const data = await ownerSettingsApi.getRestrictions(list[0].id);
                setRestrictions(data || []);
            })
            .catch(() => {});
    };

    useEffect(() => {
        loadRestrictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId]);

    const handleToggleActive = async (r: any) => {
        try {
            await ownerSettingsApi.updateRestriction(r.id, { ...r, isActive: !r.isActive });
            loadRestrictions();
        } catch {
            alert("Failed to update restriction status.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this restriction? This cannot be undone.")) return;
        try {
            await ownerSettingsApi.deleteRestriction(id);
            loadRestrictions();
        } catch {
            alert("Failed to delete restriction.");
        }
    };

    const filteredRestrictions = restrictions.filter((r) =>
        !search || r.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-1 gap-1 text-[12px] font-semibold">
                        <a href="/owner/setting/propertySetting" className="text-[#4f4f4f] no-underline">Properties Setting</a>
                        <span className="text-[#b0b0b0]">/</span>
                        <span className="text-[var(--brand-primary)]">Booking Restrictions</span>
                    </div>

                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-1">Booking Restrictions</h1>
                            <p className="text-[13px] text-[#828282] m-0">Manage minimum stays, blackout dates, and lead times for your property.</p>
                        </div>
                        <a href="/owner/setting/propertySetting/reservationRestriction/createRestriction" className="flex items-center gap-1.5 py-2.5 px-5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer no-underline">
                            <Plus size={14} /> Add Restriction
                        </a>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex items-center gap-3.5 mb-4 bg-white border border-[#e8e8e8] rounded-xl p-3 px-4">
                        <div className="flex items-center gap-2 flex-1 bg-[#fafafa] border border-[#e8e8e8] rounded-lg p-2 px-3">
                            <Search size={14} color="#b0b0b0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by rule name or room type..."
                                className="flex-1 border-none outline-none text-[12px] text-[#1d1d1d] font-sans bg-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1 py-1.5 px-3 bg-white border border-[#e0e0e0] rounded-md text-[11px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <SlidersHorizontal size={13} /> Type <ChevronDown size={12} />
                            </button>
                            <button className="flex items-center gap-1 py-1.5 px-3 bg-white border border-[#e0e0e0] rounded-md text-[11px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <CalendarDays size={13} /> Date Range <ChevronDown size={12} />
                            </button>
                            <button className="flex items-center gap-1 py-1.5 px-3 bg-white border border-[#e0e0e0] rounded-md text-[11px] font-semibold text-[#4f4f4f] cursor-pointer">
                                <Eye size={13} /> Status <ChevronDown size={12} />
                            </button>
                        </div>
                        <button className="bg-transparent border-none text-[var(--brand-primary)] text-[11px] font-semibold cursor-pointer whitespace-nowrap">Clear all filters</button>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">RESTRICTION TYPE</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">DATE RANGE</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">IMPACTED ROOMS</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">VALUE</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">STATUS</th>
                                    <th className="text-[10px] font-bold text-[#828282] tracking-[0.8px] p-3 px-4 text-left border-b border-[#f0f0f0] bg-[#fafafa]">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRestrictions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-[13px] text-[#828282]">
                                            No restrictions yet. Click &quot;Add Restriction&quot; to create one.
                                        </td>
                                    </tr>
                                )}
                                {filteredRestrictions.map((r) => {
                                    const iconInfo = TYPE_ICON[r.type] || defaultTypeIcon;
                                    return (
                                    <tr key={r.id} className="border-b border-[#f5f5f5]">
                                        <td className="p-3.5 px-4 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconInfo.bg }}>
                                                    {iconInfo.icon}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d]">{r.name}</div>
                                                    <div className="text-[11px] text-[#828282]">{r.type?.replace(/_/g, " ")}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                {!r.startDate && !r.endDate ? (
                                                    <span className="text-[12px] text-[#4f4f4f]">∞ Permanent</span>
                                                ) : (
                                                    <>
                                                        <CalendarDays size={12} color="#b0b0b0" />
                                                        <span className="text-[12px] text-[#4f4f4f]">{r.startDate} — {r.endDate}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle text-[12px] text-[#828282]">
                                            {r.reason || "—"}
                                        </td>
                                        <td className="p-3.5 px-4 align-middle text-[13px] font-bold text-[#1d1d1d]">{r.type?.replace(/_/g, " ")}</td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <button
                                                onClick={() => handleToggleActive(r)}
                                                className={`w-10 h-5.5 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200 ${r.isActive ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"}`}
                                            >
                                                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                            </button>
                                        </td>
                                        <td className="p-3.5 px-4 align-middle">
                                            <div className="flex items-center gap-1">
                                                <a
                                                    href={`/owner/setting/propertySetting/reservationRestriction/editRestriction?id=${r.id}`}
                                                    className="bg-transparent border-none cursor-pointer p-1 flex items-center text-[#828282] hover:text-[var(--brand-primary)]"
                                                >
                                                    <Pencil size={16} />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="bg-transparent border-none cursor-pointer p-1 flex items-center text-[#828282] hover:text-[#e74c3c]"
                                                >
                                                    <Trash2 size={16} />
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
                    <div className="flex justify-end items-center p-3 px-4">
                        <span className="text-[12px] text-[#828282]">{filteredRestrictions.length} restriction{filteredRestrictions.length === 1 ? "" : "s"}</span>
                    </div>
                </div>
            </main>
    );
}
