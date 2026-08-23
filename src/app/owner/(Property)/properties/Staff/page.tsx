/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import api from "@/lib/axios";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    Users,
    Plus,
    CheckCircle2,
    XCircle,
    Mail,
} from "lucide-react";

function StaffContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pendingStaff, setPendingStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<number, string>>({});

    useEffect(() => {
        if (!propertyId) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }
        Promise.all([
            propertiesApi.getProperty(Number(propertyId), ownerId),
            api.get("/owner/staff/pending"),
        ])
            .then(([prop, staffRes]) => {
                setProperty(prop);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const all: any[] = Array.isArray(staffRes.data) ? staffRes.data : [];
                setPendingStaff(all);
            })
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load staff data.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    async function handleAction(id: number, action: "approve" | "reject") {
        setActionLoading((prev) => ({ ...prev, [id]: action }));
        try {
            await api.patch(`/owner/staff/${id}/${action}`);
            // Remove optimistically
            setPendingStaff((prev) => prev.filter((s) => s.id !== id));
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((err as any)?.response?.data?.message ?? "Action failed. Please try again.");
        } finally {
            setActionLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });
        }
    }

    function formatDate(d: string) {
        if (!d) return "—";
        try { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
        catch { return d; }
    }

    return (
        <div className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">{property?.name ?? "Staff"}</span>
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
                                const isActive = t === "Staff";
                                return (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                            else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${propertyId}`;
                                            else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${propertyId}`;
                                            else if (t === "Rates") window.location.href = `/owner/properties/Rate?id=${propertyId}`;
                                            else if (t === "Reservations") window.location.href = `/owner/properties/Reservation?id=${propertyId}`;
                                            else if (t === "Media") window.location.href = `/owner/properties/Media?id=${propertyId}`;
                                            else if (t === "Staff") return;
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

                        {/* Staff Panel */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
                                <div className="flex items-center gap-2">
                                    <Users size={16} color="#953002" />
                                    <div>
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Pending Staff Requests</span>
                                        <p className="text-[11px] text-[#828282] m-0">Approve or reject staff access requests for your properties.</p>
                                    </div>
                                </div>
                                <a href="/owner/properties/Staff/addStaff" className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2 px-4 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors">
                                        <Plus size={14} /> Add Staff
                                    </button>
                                </a>
                            </div>

                            {pendingStaff.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Users size={40} color="#c0a898" className="mb-3" />
                                    <p className="text-[14px] text-[#828282]">No pending staff requests for your properties.</p>
                                    <a href="/owner/properties/Staff/addStaff" className="no-underline mt-3">
                                        <button className="flex items-center gap-1.5 py-2 px-5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)]">
                                            <Plus size={14} /> Add Staff
                                        </button>
                                    </a>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#f5f5f5]">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {pendingStaff.map((staff: any) => {
                                        const isActing = actionLoading[staff.id];
                                        return (
                                            <div key={staff.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#fef5ef] transition-colors">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-full bg-[#fef5ef] border border-[#f0cdb4] flex items-center justify-center shrink-0">
                                                        <img
                                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name ?? staff.userId}`}
                                                            alt={staff.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-[14px] font-bold text-[#1d1d1d]">{staff.name ?? "Unknown"}</div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Mail size={11} color="#828282" />
                                                            <span className="text-[12px] text-[#828282]">{staff.email ?? "—"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[11px] font-semibold text-[var(--brand-primary)] bg-[#fef5ef] px-2 py-0.5 rounded-full border border-[#f0cdb4]">
                                                                {staff.role ?? "Staff"}
                                                            </span>
                                                            {staff.propertyName && (
                                                                <span className="text-[11px] text-[#4f4f4f]">
                                                                    {staff.propertyName}
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] text-[#b0b0b0]">
                                                                Requested {formatDate(staff.requestedAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleAction(staff.id, "approve")}
                                                        disabled={!!isActing}
                                                        className="flex items-center gap-1.5 py-1.5 px-3.5 bg-[#dcfce7] text-[#15803d] border border-[#86efac] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#bbf7d0] disabled:opacity-50 transition-colors"
                                                    >
                                                        {isActing === "approve"
                                                            ? <Loader2 size={13} className="animate-spin" />
                                                            : <><CheckCircle2 size={13} /> Approve</>
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(staff.id, "reject")}
                                                        disabled={!!isActing}
                                                        className="flex items-center gap-1.5 py-1.5 px-3.5 bg-white text-[#b91c1c] border border-[#fca5a5] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#fde8e8] disabled:opacity-50 transition-colors"
                                                    >
                                                        {isActing === "reject"
                                                            ? <Loader2 size={13} className="animate-spin" />
                                                            : <><XCircle size={13} /> Reject</>
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
    );
}

export default function StaffPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <StaffContent />
        </Suspense>
    );
}
