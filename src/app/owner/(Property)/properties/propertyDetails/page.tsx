/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Info,
    MapPin,
    ChevronRight,
    ChevronDown,
    Star,
    Bed,
    Calendar,
    Eye,
    User,
    Phone,
    Edit,
    Building2,
    Loader2,
    LayoutGrid,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Image as ImageIcon,
    Users,
    Settings,
} from "lucide-react";

function PropertyDetailsContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    const [activeTab, setActiveTab] = useState("Overview");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!propertyId) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }
        propertiesApi
            .getProperty(Number(propertyId), ownerId)
            .then((data) => setProperty(data))
            .catch(() => setError("Failed to load property details."))
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const propertyNavItems = (id: number) => [
        { label: "Overview", icon: <LayoutGrid size={16} />, href: null },
        { label: "Rooms", icon: <DoorOpen size={16} />, href: `/owner/properties/propertyRoomInventry?id=${id}` },
        { label: "Availability", icon: <CalendarCheck size={16} />, href: `/owner/properties/Availability?id=${id}` },
        { label: "Rates", icon: <DollarSign size={16} />, href: `/owner/properties/Rate?id=${id}` },
        { label: "Reservations", icon: <ClipboardList size={16} />, href: `/owner/properties/Reservation?id=${id}` },
        { label: "Media", icon: <ImageIcon size={16} />, href: `/owner/properties/Media?id=${id}` },
        { label: "Staff", icon: <Users size={16} />, href: `/owner/properties/Staff?id=${id}` },
        { label: "Settings", icon: <Settings size={16} />, href: `/owner/properties/Setting?id=${id}` },
    ];

    const statusLabel = property?.status === "active" ? "ACTIVE"
        : property?.status === "inactive" ? "INACTIVE"
        : property?.status === "maintenance" ? "MAINTENANCE"
        : property?.status?.toUpperCase() ?? "PENDING";

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";

    return (
        <div className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">

                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">{property?.name ?? "Property Details"}</span>
                </div>

                {/* Loading / Error */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={28} color="#953002" className="animate-spin" />
                    </div>
                )}
                {error && !loading && (
                    <div className="flex-1 flex items-center justify-center text-[13px] text-[#e74c3c]">{error}</div>
                )}

                {/* Scrollable Content */}
                {!loading && !error && property && (
                    <div className="flex-1 overflow-y-auto pb-4 pr-1">

                        {/* ── Property Header Card ── */}
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
                            <div className="flex gap-2.5">
                                <button className="flex items-center gap-1.5 py-2 px-4 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-gray-50">
                                    <Eye size={14} /> View Live
                                </button>
                                <a href={`/owner/properties/editPropertyDetails?id=${property.id}`} className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2 px-5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)]">
                                        <Edit size={14} /> Edit Property
                                    </button>
                                </a>
                            </div>
                        </div>

                        {/* ── Nav + Content ── */}
                        <div className="flex gap-5 items-start mt-3">
                            {/* Vertical Nav */}
                            <div className="w-[190px] shrink-0 flex flex-col gap-1">
                                {propertyNavItems(property.id).map((item) => (
                                    item.href ? (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 no-underline bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </a>
                                    ) : (
                                        <button
                                            key={item.label}
                                            onClick={() => setActiveTab(item.label)}
                                            className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 ${
                                                activeTab === item.label
                                                    ? "bg-[var(--brand-primary)] text-white font-bold"
                                                    : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                            }`}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </button>
                                    )
                                ))}
                            </div>

                            {/* ── Two Column Layout ── */}
                            <div className="flex-1 grid grid-cols-[1fr_260px] gap-4 items-start min-w-0">
                            {/* Left Column */}
                            <div className="flex flex-col gap-3">
                                {/* Core Details */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <Info size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Core Details</span>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Display Name</label>
                                    <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.name}</div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Description</label>
                                    <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[70px] leading-relaxed">{property.description || "—"}</div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Type</label>
                                            <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center justify-between">
                                                <span>{property.propertyType || "—"}</span>
                                                <ChevronDown size={14} color="#b0b0b0" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Check-in / Check-out</label>
                                            <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">
                                                {property.checkIn || "—"} / {property.checkOut || "—"}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Amenities */}
                                    {property.amenities?.length > 0 && (
                                        <>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Amenities</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {property.amenities.map((a: string) => (
                                                    <span key={a} className="px-2.5 py-0.5 bg-[#fef5ef] text-[var(--brand-primary)] text-[11px] font-semibold rounded-full border border-[#f0cdb4]">
                                                        {a}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Location & Map */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <MapPin size={16} color="#e74c3c" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Location & Map</span>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Street Address</label>
                                    <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.address || "—"}</div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">City</label>
                                            <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.city || "—"}</div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Country</label>
                                            <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.country || "—"}</div>
                                        </div>
                                    </div>
                                    {/* Map Placeholder */}
                                    <div className="mt-2.5 rounded-lg overflow-hidden h-[120px] bg-[#f0ebe5]">
                                        <div className="relative w-full h-full">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#f0ebe5] to-[#e8e0d8] rounded-lg flex flex-col items-center justify-center">
                                                <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                                                    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0zm0 22c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#953002" />
                                                </svg>
                                                <div className="text-[11px] text-[#828282] mt-1.5">Map Preview</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-3">
                                {/* Quick Stats */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                    <div className="text-[14px] font-bold text-[var(--brand-primary)] mb-2.5">Quick Stats</div>
                                    <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                        <span className="text-[13px] text-[#4f4f4f]">Rooms</span>
                                        <span className="text-[14px] font-bold text-[var(--brand-primary)]">{property.roomCount ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                        <span className="text-[13px] text-[#4f4f4f]">Avg. Rating</span>
                                        <span className="text-[14px] font-bold text-[#1d1d1d] flex items-center gap-[3px]">
                                            <Star size={12} color="#ffb401" fill="#ffb401" /> {property.rating ?? "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-none">
                                        <span className="text-[13px] text-[#4f4f4f]">Total Reviews</span>
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">{property.reviews ?? 0}</span>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                    <div className="text-[14px] font-bold text-[var(--brand-primary)] mb-2.5">Contact Info</div>
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className="w-[34px] h-[34px] rounded-full bg-[#fef5ef] flex items-center justify-center">
                                            <User size={16} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">{property.contactEmail || "—"}</div>
                                            <div className="text-[11px] text-[#b0b0b0]">Property Owner</div>
                                        </div>
                                    </div>
                                    {property.contactPhone && (
                                        <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-lg text-[12px] font-semibold cursor-pointer">
                                            <Phone size={13} /> {property.contactPhone}
                                        </button>
                                    )}
                                </div>

                                {/* House Rules */}
                                {property.houseRules && (
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                        <div className="text-[14px] font-bold text-[var(--brand-primary)] mb-2.5">House Rules</div>
                                        <p className="text-[12px] text-[#4f4f4f] leading-relaxed m-0">{property.houseRules}</p>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default function PropertyDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <PropertyDetailsContent />
        </Suspense>
    );
}
