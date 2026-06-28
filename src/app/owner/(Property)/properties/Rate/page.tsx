/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { ratesApi } from "@/api/owner/rates.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    DollarSign,
    Percent,
    Plus,
} from "lucide-react";

function RateContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ratePlans, setRatePlans] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [discounts, setDiscounts] = useState<any[]>([]);
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
            ratesApi.getRateOverview(Number(propertyId)),
        ])
            .then(([prop, rateData]) => {
                setProperty(prop);
                setRatePlans(rateData?.ratePlans ?? []);
                setDiscounts(rateData?.discounts ?? []);
            })
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load rate data.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    function formatDateRange(start: string, end: string) {
        if (!start && !end) return "—";
        if (!start) return `Until ${end}`;
        if (!end) return `From ${start}`;
        return `${start} – ${end}`;
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
                    <span className="text-[#953002] font-semibold">{property?.name ?? "Rates"}</span>
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
                                const isActive = t === "Rates";
                                return (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            if (t === "Overview") window.location.href = `/owner/properties/propertyDetails?id=${propertyId}`;
                                            else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${propertyId}`;
                                            else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${propertyId}`;
                                            else if (t === "Rates") return;
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

                        {/* Rate Plans Section */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden mb-4">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Rate Plans</span>
                                </div>
                                <button className="flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                    <Plus size={14} /> Add Rate Plan
                                </button>
                            </div>

                            {ratePlans.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <DollarSign size={36} color="#c0a898" className="mb-3" />
                                    <p className="text-[14px] text-[#828282]">No rate plans configured yet.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#faf9f7]">
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Name</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Type</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Base Price</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Min Nights</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Date Range</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {ratePlans.map((plan: any, idx: number) => (
                                                <tr
                                                    key={plan.id}
                                                    className={`border-t border-[#f5f5f5] ${idx % 2 === 0 ? "bg-white" : "bg-[#fdf9f7]"} hover:bg-[#fef5ef] transition-colors`}
                                                >
                                                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1d1d1d]">{plan.name}</td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">{plan.type ?? "—"}</td>
                                                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#953002]">Rs. {plan.basePrice}</td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">{plan.minNights ?? "—"}</td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">{formatDateRange(plan.startDate, plan.endDate)}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span
                                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                                                plan.isActive
                                                                    ? "bg-[#dcfce7] text-[#15803d]"
                                                                    : "bg-[#f3f4f6] text-[#6b7280]"
                                                            }`}
                                                        >
                                                            {plan.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Discounts Section */}
                        {discounts.length > 0 && (
                            <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
                                    <Percent size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Discounts</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#faf9f7]">
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Name</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Type</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Value</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Date Range</th>
                                                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#828282] uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {discounts.map((disc: any, idx: number) => (
                                                <tr
                                                    key={disc.id}
                                                    className={`border-t border-[#f5f5f5] ${idx % 2 === 0 ? "bg-white" : "bg-[#fdf9f7]"} hover:bg-[#fef5ef] transition-colors`}
                                                >
                                                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#1d1d1d]">{disc.name}</td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">{disc.discountType ?? "—"}</td>
                                                    <td className="px-5 py-3.5 text-[13px] font-semibold text-[#953002]">{disc.discountValue}%</td>
                                                    <td className="px-5 py-3.5 text-[13px] text-[#4f4f4f]">{formatDateRange(disc.startDate, disc.endDate)}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span
                                                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                                                disc.isActive
                                                                    ? "bg-[#dcfce7] text-[#15803d]"
                                                                    : "bg-[#f3f4f6] text-[#6b7280]"
                                                            }`}
                                                        >
                                                            {disc.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
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

export default function RatePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <RateContent />
        </Suspense>
    );
}
