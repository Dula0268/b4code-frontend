/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { imageApi } from "@/api/image/image.api";
import { useAuthStore } from "@/store/auth/auth.store";
import {
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Loader2,
    Building2,
    UploadCloud,
    ImagePlus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    LayoutGrid,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Image as ImageIcon,
    Users,
    Settings,
} from "lucide-react";

function propertyNavItems(id: string, active: string) {
    const items = [
        { label: "Overview", icon: <LayoutGrid size={16} />, href: `/owner/properties/propertyDetails?id=${id}` },
        { label: "Rooms", icon: <DoorOpen size={16} />, href: `/owner/properties/propertyRoomInventry?id=${id}` },
        { label: "Availability", icon: <CalendarCheck size={16} />, href: `/owner/properties/Availability?id=${id}` },
        { label: "Rates", icon: <DollarSign size={16} />, href: `/owner/properties/Rate?id=${id}` },
        { label: "Reservations", icon: <ClipboardList size={16} />, href: `/owner/properties/Reservation?id=${id}` },
        { label: "Media", icon: <ImageIcon size={16} />, href: `/owner/properties/Media?id=${id}` },
        { label: "Staff", icon: <Users size={16} />, href: `/owner/properties/Staff?id=${id}` },
        { label: "Settings", icon: <Settings size={16} />, href: `/owner/properties/Setting?id=${id}` },
    ];
    return items.map((item) => ({ ...item, active: item.label === active }));
}

function MediaContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!propertyId) {
            setError("No property ID provided.");
            setLoading(false);
            return;
        }
        propertiesApi
            .getProperty(Number(propertyId), ownerId)
            .then((prop) => setProperty(prop))
            .catch((err) => {
                setError(err?.response?.data?.message ?? err?.message ?? "Failed to load property.");
            })
            .finally(() => setLoading(false));
    }, [propertyId, ownerId]);

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    async function handleFile(file: File) {
        if (!file.type.startsWith("image/")) {
            setUploadError("Please select an image file (JPG, PNG, WebP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be under 5MB.");
            return;
        }
        setUploading(true);
        setUploadError(null);
        setUploadSuccess(false);
        try {
            const result = await imageApi.upload(file, "properties");
            const uploadedUrl: string = result?.url ?? result;
            await propertiesApi.updateProperty(Number(propertyId), ownerId, { imageUrl: uploadedUrl });
            setProperty((prev: any) => ({ ...prev, image: uploadedUrl }));
            setUploadSuccess(true);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUploadError((err as any)?.response?.data?.message ?? "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset so same file can be re-selected
        e.target.value = "";
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    function removeImage() {
        setUploadSuccess(false);
        setUploadError(null);
        propertiesApi
            .updateProperty(Number(propertyId), ownerId, { imageUrl: "" })
            .then(() => setProperty((prev: any) => ({ ...prev, image: null })))
            .catch(() => setUploadError("Failed to remove image."));
    }

    return (
        <div className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">{property?.name ?? "Media"}</span>
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

                        {/* Nav + Content */}
                        <div className="flex gap-5 items-start">
                            {/* Vertical Nav */}
                            <div className="w-[190px] shrink-0 flex flex-col gap-1">
                                {propertyId && propertyNavItems(propertyId, "Media").map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 no-underline ${
                                            item.active
                                                ? "bg-[var(--brand-primary)] text-white font-bold"
                                                : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </a>
                                ))}
                            </div>

                        {/* Two column layout */}
                        <div className="flex-1 grid grid-cols-[1fr_280px] gap-4 items-start min-w-0">
                            {/* Left: Gallery */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
                                    <ImagePlus size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Property Image</span>
                                </div>

                                <div className="p-5">
                                    {/* Success / Error messages */}
                                    {uploadSuccess && (
                                        <div className="flex items-center gap-2 mb-4 p-3 bg-[#dcfce7] border border-[#86efac] rounded-lg text-[13px] text-[#15803d]">
                                            <CheckCircle2 size={16} />
                                            Image uploaded and saved successfully.
                                        </div>
                                    )}
                                    {uploadError && (
                                        <div className="flex items-center gap-2 mb-4 p-3 bg-[#fde8e8] border border-[#fca5a5] rounded-lg text-[13px] text-[#b91c1c]">
                                            <AlertCircle size={16} />
                                            {uploadError}
                                        </div>
                                    )}

                                    {/* Upload zone */}
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={onDrop}
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-colors mb-5 min-h-[160px] ${
                                            isDragging
                                                ? "border-[var(--brand-primary)] bg-[#fef5ef]"
                                                : "border-[#d0d0d0] bg-[#fafafa] hover:bg-[#f5f5f5] hover:border-[var(--brand-primary)]"
                                        } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 size={32} color="#953002" className="animate-spin mb-2" />
                                                <span className="text-[13px] font-semibold text-[var(--brand-primary)]">Uploading…</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={32} color="#828282" className="mb-2" />
                                                <span className="text-[13px] font-semibold text-[#4f4f4f]">Click or drag to upload</span>
                                                <span className="text-[11px] text-[#b0b0b0] mt-1">JPG, PNG, WebP — max 5 MB</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={onFileChange}
                                    />

                                    {/* Current image */}
                                    {property.image ? (
                                        <div className="relative group border border-[#e0e0e0] rounded-xl overflow-hidden" style={{ maxWidth: 400 }}>
                                            <img
                                                src={property.image}
                                                alt={property.name}
                                                className="w-full object-cover"
                                                style={{ maxHeight: 280 }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white text-[12px] font-bold flex-1">Current property image</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                        className="p-1.5 bg-white/90 hover:bg-[#e74c3c] hover:text-white rounded text-[#e74c3c] cursor-pointer transition-colors"
                                                        title="Remove image"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-[#e0e0e0] rounded-xl bg-[#faf9f7]">
                                            <Building2 size={36} color="#c0a898" className="mb-2" />
                                            <span className="text-[13px] text-[#828282]">No image uploaded yet.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Guidelines */}
                            <div className="bg-[#fffbf5] border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Photo Guidelines</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { title: "Resolution", body: "Use high-resolution photos (min. 1920×1080) in landscape orientation." },
                                        { title: "Main Image", body: "This is the first photo guests see. Choose an exterior or master bedroom shot." },
                                        { title: "File Size", body: "Keep files under 5 MB. Compress large images before uploading." },
                                        { title: "Format", body: "JPG, PNG, and WebP formats are supported." },
                                    ].map((tip) => (
                                        <div key={tip.title} className="flex items-start gap-2">
                                            <div className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0 bg-[var(--brand-primary)]" />
                                            <div>
                                                <div className="text-[13px] font-semibold text-[#4f4f4f]">{tip.title}</div>
                                                <div className="text-[11px] text-[#828282] mt-0.5 leading-snug">{tip.body}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default function MediaPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <MediaContent />
        </Suspense>
    );
}
