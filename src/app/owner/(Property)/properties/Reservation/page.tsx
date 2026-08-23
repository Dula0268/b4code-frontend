/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { reservationsApi } from "@/api/owner/reservations.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    BookOpen,
    Search,
} from "lucide-react";

function ReservationContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

    useEffect(() => {
        if (!propertyId) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }
        Promise.all([
            propertiesApi.getProperty(Number(propertyId), ownerId),
            reservationsApi.listReservations(ownerId),
        ])
            .then(([prop, resData]) => {
                setProperty(prop);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const all: any[] = Array.isArray(resData) ? resData : [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setReservations(all.filter((r: any) => r.propertyId === Number(propertyId)));
            })
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load reservation data.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    const filtered = reservations.filter((r) => {
        const q = search.toLowerCase();
        return !q || r.guestName?.toLowerCase().includes(q) || r.confirmationCode?.toLowerCase().includes(q);
    });

    function statusBadge(status: string) {
        if (status === "CONFIRMED") return { label: "Confirmed", bg: "#dbeafe", color: "#1d4ed8" };
        if (status === "CHECKED_IN") return { label: "Checked In", bg: "#dcfce7", color: "#15803d" };
        if (status === "COMPLETED") return { label: "Completed", bg: "#f3f4f6", color: "#6b7280" };
        if (status === "CANCELLED") return { label: "Cancelled", bg: "#fde8e8", color: "#b91c1c" };
        if (status === "PENDING") return { label: "Pending", bg: "#fff7ed", color: "#c2410c" };
        return { label: status, bg: "#f3f4f6", color: "#6b7280" };
    }

    function formatDate(d: string) {
        if (!d) return "—";
        try { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
        catch { return d; }
    }

    async function handleAction(id: number, action: "checkIn" | "checkOut" | "cancel") {
        setActionLoading((prev) => ({ ...prev, [id]: action }));
        try {
            if (action === "checkIn") await reservationsApi.checkIn(id);
            else if (action === "checkOut") await reservationsApi.checkOut(id);
            else await reservationsApi.cancel(id);

            // Optimistic update
            setReservations((prev) =>
                prev.map((r) => {
                    if (r.id !== id) return r;
                    const newStatus = action === "checkIn" ? "CHECKED_IN" : action === "checkOut" ? "COMPLETED" : "CANCELLED";
                    return { ...r, status: newStatus };
                })
            );
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((err as any)?.response?.data?.message ?? "Action failed. Please try again.");
        } finally {
            setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
        }
    }

    return (
        <div className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">{property?.name ?? "Reservations"}</span>
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

                        {/* Tabs */}
                        <div className="flex border-b border-[#e8e8e8] mb-3 mt-2">
                            {tabs.map((t) => {
                                const isActive = t === "Reservations";
                                return (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                            else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${propertyId}`;
                                            else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${propertyId}`;
                                            else if (t === "Rates") window.location.href = `/owner/properties/Rate?id=${propertyId}`;
                                            else if (t === "Reservations") return;
                                            else if (t === "Media") window.location.href = `/owner/properties/Media?id=${propertyId}`;
                                            else if (t === "Staff") window.location.href = `/owner/properties/Staff?id=${propertyId}`;
                                            else if (t === "Settings") window.location.href = `/owner/properties/Setting?id=${propertyId}`;
                                        }}
                                        className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative border-b-2 ${
                                            isActive
                                                ? "text-[var(--brand-primary)] font-bold border-[var(--brand-primary)]"
                                                : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f]"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Reservations Table */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Reservations</span>
                                </div>
                                <div className="relative">
                                    <Search size={14} color="#828282" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search guest or code..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 border border-[#e0e0e0] rounded-md text-[12px] w-[200px] outline-none focus:border-[var(--brand-primary)]"
                                    />
                                </div>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <BookOpen size={40} color="#c0a898" className="mb-3" />
                                    <p className="text-[14px] text-[#828282]">
                                        {search ? "No reservations match your search." : "No reservations for this property yet."}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#faf9f7]">
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Code</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Guest</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Room</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Check-in</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Check-out</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Guests</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Amount</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Status</th>
                                                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {filtered.map((res: any, idx: number) => {
                                                const badge = statusBadge(res.status);
                                                const isActing = actionLoading[res.id];
                                                return (
                                                    <tr
                                                        key={res.id}
                                                        className={`border-t border-[#f5f5f5] ${idx % 2 === 0 ? "bg-white" : "bg-[#fdf9f7]"} hover:bg-[#fef5ef] transition-colors`}
                                                    >
                                                        <td className="px-4 py-3 text-[12px] font-mono text-[#828282]">{res.confirmationCode ?? `#${res.id}`}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="text-[13px] font-semibold text-[#1d1d1d]">{res.guestName}</div>
                                                            <div className="text-[11px] text-[#828282]">{res.guestEmail}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-[13px] text-[#4f4f4f]">{res.roomName ?? "—"}</td>
                                                        <td className="px-4 py-3 text-[13px] text-[#4f4f4f]">{formatDate(res.checkIn)}</td>
                                                        <td className="px-4 py-3 text-[13px] text-[#4f4f4f]">{formatDate(res.checkOut)}</td>
                                                        <td className="px-4 py-3 text-[13px] text-[#4f4f4f]">
                                                            {res.adults ?? 0}A{res.children ? ` + ${res.children}C` : ""}
                                                        </td>
                                                        <td className="px-4 py-3 text-[13px] font-semibold text-[var(--brand-primary)]">
                                                            Rs. {res.totalAmount}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                                                                style={{ backgroundColor: badge.bg, color: badge.color }}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1.5">
                                                                {res.status === "CONFIRMED" && (
                                                                    <button
                                                                        onClick={() => handleAction(res.id, "checkIn")}
                                                                        disabled={!!isActing}
                                                                        className="py-1 px-2.5 bg-[#dcfce7] text-[#15803d] border border-[#86efac] rounded text-[11px] font-semibold cursor-pointer hover:bg-[#bbf7d0] disabled:opacity-50 transition-colors"
                                                                    >
                                                                        {isActing === "checkIn" ? <Loader2 size={11} className="animate-spin" /> : "Check In"}
                                                                    </button>
                                                                )}
                                                                {res.status === "CHECKED_IN" && (
                                                                    <button
                                                                        onClick={() => handleAction(res.id, "checkOut")}
                                                                        disabled={!!isActing}
                                                                        className="py-1 px-2.5 bg-[#dbeafe] text-[#1d4ed8] border border-[#93c5fd] rounded text-[11px] font-semibold cursor-pointer hover:bg-[#bfdbfe] disabled:opacity-50 transition-colors"
                                                                    >
                                                                        {isActing === "checkOut" ? <Loader2 size={11} className="animate-spin" /> : "Check Out"}
                                                                    </button>
                                                                )}
                                                                {(res.status === "CONFIRMED" || res.status === "PENDING") && (
                                                                    <button
                                                                        onClick={() => handleAction(res.id, "cancel")}
                                                                        disabled={!!isActing}
                                                                        className="py-1 px-2.5 bg-white text-[#b91c1c] border border-[#fca5a5] rounded text-[11px] font-semibold cursor-pointer hover:bg-[#fde8e8] disabled:opacity-50 transition-colors"
                                                                    >
                                                                        {isActing === "cancel" ? <Loader2 size={11} className="animate-spin" /> : "Cancel"}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
    );
}

export default function ReservationPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <ReservationContent />
        </Suspense>
    );
}
