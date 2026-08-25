/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { roomsApi } from "@/api/owner/rooms.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    Bell,
    ChevronRight,
    Loader2,
    Building2,
    Bed,
    Users,
    Baby,
    Package,
    Tag,
    Info,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Wrench,
    Edit,
} from "lucide-react";

function statusBadge(status: string) {
    switch ((status || "").toUpperCase()) {
        case "AVAILABLE": return { label: "Available", bg: "#dcfce7", color: "#15803d" };
        case "OCCUPIED":  return { label: "Occupied",  bg: "#fde8e8", color: "#b91c1c" };
        case "MAINTENANCE": return { label: "Maintenance", bg: "#fff7ed", color: "#c2410c" };
        default: return { label: status || "Unknown", bg: "#f3f4f6", color: "#6b7280" };
    }
}

function statusIcon(status: string) {
    switch ((status || "").toUpperCase()) {
        case "AVAILABLE": return <CheckCircle size={14} color="#15803d" />;
        case "OCCUPIED":  return <AlertCircle size={14} color="#b91c1c" />;
        case "MAINTENANCE": return <Wrench size={14} color="#c2410c" />;
        default: return null;
    }
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number | null | undefined }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[#f5f5f5] last:border-b-0">
            <div className="w-8 h-8 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0 mt-0.5">
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-bold text-[#828282] tracking-widest">{label}</div>
                <div className="text-[14px] font-semibold text-[#1d1d1d] mt-0.5">{value ?? "—"}</div>
            </div>
        </div>
    );
}

function RoomDetailsContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");
    const propertyId = searchParams.get("propertyId");
    const { user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!roomId) { setError("No room ID provided."); setLoading(false); return; }
        roomsApi.getRoom(Number(roomId))
            .then((data) => setRoom(data))
            .catch((err: { response?: { data?: { message?: string } }; message?: string }) =>
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load room."))
            .finally(() => setLoading(false));
    }, [roomId]);

    const badge = room ? statusBadge(room.status) : null;
    const backHref = propertyId
        ? `/owner/properties/propertyRoomInventry?id=${propertyId}`
        : "/owner/properties";

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            <OwnerSidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2 px-6 bg-white border-b border-[#e8e8e8] shrink-0">
                    <div className="flex items-center gap-3">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-3 pb-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-[12px] mb-4">
                        <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                        <ChevronRight size={13} color="#b0b0b0" />
                        {propertyId && (
                            <>
                                <a href={`/owner/properties/propertyRoomInventry?id=${propertyId}`} className="text-[#828282] no-underline hover:text-[#953002] transition-colors">
                                    {room?.propertyName ?? "Property"}
                                </a>
                                <ChevronRight size={13} color="#b0b0b0" />
                            </>
                        )}
                        <span className="text-[#953002] font-semibold">{room?.name ?? "Room Details"}</span>
                    </div>

                    {/* Back button */}
                    <a href={backHref} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#828282] no-underline hover:text-[#953002] transition-colors mb-4">
                        <ArrowLeft size={14} />
                        Back to Rooms
                    </a>

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} color="#953002" className="animate-spin" />
                        </div>
                    )}
                    {error && !loading && (
                        <div className="flex items-center justify-center py-20 text-[13px] text-[#e74c3c]">{error}</div>
                    )}

                    {!loading && !error && room && (
                        <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
                            {/* Left — main details */}
                            <div className="flex flex-col gap-4">
                                {/* Room Header Card */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                                    {/* Room image */}
                                    <div className="w-full h-[220px] bg-[#f0ebe5] flex items-center justify-center overflow-hidden relative">
                                        {room.imageUrl ? (
                                            <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-[#c0a898]">
                                                <Building2 size={48} color="#c0a898" />
                                                <span className="text-[12px] font-medium">No image uploaded</span>
                                            </div>
                                        )}
                                        {/* Status badge overlay */}
                                        {badge && (
                                            <div
                                                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm"
                                                style={{ backgroundColor: badge.bg, color: badge.color }}
                                            >
                                                {statusIcon(room.status)}
                                                {badge.label}
                                            </div>
                                        )}
                                    </div>

                                    {/* Room title row */}
                                    <div className="px-6 py-4 flex items-start justify-between border-b border-[#f5f5f5]">
                                        <div>
                                            <h1 className="text-[22px] font-extrabold text-[#1d1d1d] m-0 leading-tight">{room.name}</h1>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[12px] text-[#828282] font-medium">{room.roomType?.replace(/_/g, " ") ?? "—"}</span>
                                                {room.bedType && (
                                                    <>
                                                        <span className="text-[#d0d0d0]">·</span>
                                                        <span className="text-[12px] text-[#828282] font-medium">{room.bedType.replace(/_/g, " ")}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={`/owner/roomManagement/addRoom?roomId=${room.id}&propertyId=${room.propertyId}&edit=true`}
                                            className="no-underline"
                                        >
                                            <button className="flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                                <Edit size={13} /> Edit Room
                                            </button>
                                        </a>
                                    </div>

                                    {/* Description */}
                                    {room.description && (
                                        <div className="px-6 py-4 border-b border-[#f5f5f5]">
                                            <div className="text-[10px] font-bold text-[#828282] tracking-widest mb-2">DESCRIPTION</div>
                                            <p className="text-[13px] text-[#4f4f4f] leading-relaxed m-0">{room.description}</p>
                                        </div>
                                    )}

                                    {/* Details grid */}
                                    <div className="px-6 py-2">
                                        <DetailRow
                                            icon={<Bed size={15} color="#953002" />}
                                            label="ROOM TYPE"
                                            value={room.roomType?.replace(/_/g, " ")}
                                        />
                                        <DetailRow
                                            icon={<Bed size={15} color="#953002" />}
                                            label="BED TYPE"
                                            value={room.bedType?.replace(/_/g, " ")}
                                        />
                                        <DetailRow
                                            icon={<Users size={15} color="#953002" />}
                                            label="MAX ADULTS"
                                            value={room.maxOccupancy}
                                        />
                                        <DetailRow
                                            icon={<Baby size={15} color="#953002" />}
                                            label="MAX CHILDREN"
                                            value={room.maxChildren ?? 0}
                                        />
                                        <DetailRow
                                            icon={<Package size={15} color="#953002" />}
                                            label="INVENTORY (UNITS)"
                                            value={room.inventory ?? 1}
                                        />
                                        <DetailRow
                                            icon={<Tag size={15} color="#953002" />}
                                            label="BASE RATE"
                                            value={`${room.currency ?? "LKR"} ${room.baseRate}/night`}
                                        />
                                        <DetailRow
                                            icon={<Info size={15} color="#953002" />}
                                            label="AVAILABILITY"
                                            value={room.isAvailable ? "Available for booking" : "Not available"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right — status management */}
                            <div className="flex flex-col gap-4">
                                {/* Property Info */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                    <h4 className="text-[14px] font-extrabold text-[#1d1d1d] m-0 mb-3">Property</h4>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-lg bg-[#f0ebe5] flex items-center justify-center shrink-0">
                                            <Building2 size={18} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">{room.propertyName ?? "—"}</div>
                                            {propertyId && (
                                                <a href={`/owner/properties/propertyDetails?id=${propertyId}`} className="text-[11px] text-[#953002] no-underline hover:underline">
                                                    View property →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                    <h4 className="text-[14px] font-extrabold text-[#1d1d1d] m-0 mb-3">Quick Links</h4>
                                    <div className="flex flex-col gap-2">
                                        {propertyId && (
                                            <>
                                                <a href={`/owner/properties/propertyRoomInventry?id=${propertyId}`} className="text-[12px] font-semibold text-[#953002] no-underline hover:underline flex items-center gap-1.5">
                                                    <ArrowLeft size={12} /> All Rooms
                                                </a>
                                                <a href={`/owner/properties/Availability?id=${propertyId}`} className="text-[12px] font-semibold text-[#953002] no-underline hover:underline">
                                                    → Availability Calendar
                                                </a>
                                                <a href={`/owner/properties/Rate?id=${propertyId}`} className="text-[12px] font-semibold text-[#953002] no-underline hover:underline">
                                                    → Rate Management
                                                </a>
                                                <a href={`/owner/properties/Reservation?id=${propertyId}`} className="text-[12px] font-semibold text-[#953002] no-underline hover:underline">
                                                    → Reservations
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function RoomDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <RoomDetailsContent />
        </Suspense>
    );
}
