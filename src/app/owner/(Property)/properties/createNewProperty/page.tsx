/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { imageApi } from "@/api/image/image.api";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, formatTime } from "@/components/owner/TimePicker";
import {
    Info,
    MapPin,
    Star,
    Image as ImageIcon,
    ShieldAlert,
    Plus,
    Bell,
    ChevronRight,
    X,
    Loader2,
    AlertCircle,
} from "lucide-react";

interface ImageEntry {
    id: string;
    localUrl: string;
    cloudUrl: string | null;
    uploading: boolean;
    error: string | null;
}

export default function CreateNewPropertyPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        city: "",
        contact: "",
        email: "",
        rules: "",
    });

    const [checkIn,  setCheckIn]  = useState<TimeValue>({ hour: "2",  minute: "00", period: "PM" });
    const [checkOut, setCheckOut] = useState<TimeValue>({ hour: "11", minute: "00", period: "AM" });

    const [amenities, setAmenities] = useState<Record<string, boolean>>({
        wifi: false,
        pool: false,
        parking: false,
        gym: false,
        kitchen: false,
        ac: false,
        petFriendly: false,
        smartTv: false,
    });

    const [images, setImages] = useState<ImageEntry[]>([]);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleAmenity = (key: string) =>
        setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));

    const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

    const amenityList = [
        { key: "wifi", label: "Wifi" },
        { key: "pool", label: "Pool" },
        { key: "parking", label: "Parking" },
        { key: "gym", label: "Gym" },
        { key: "kitchen", label: "Kitchen" },
        { key: "ac", label: "Air Conditioning" },
        { key: "petFriendly", label: "Pet Friendly" },
        { key: "smartTv", label: "Smart TV" },
    ];

    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArr = Array.from(files);
        const remaining = 10 - images.length;
        if (remaining <= 0) return;

        const toAdd = fileArr
            .filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
            .slice(0, remaining);

        toAdd.forEach((file) => {
            const id = `${Date.now()}-${Math.random()}`;
            const localUrl = URL.createObjectURL(file);

            // Add optimistic entry immediately so preview shows at once
            setImages((prev) => [
                ...prev,
                { id, localUrl, cloudUrl: null, uploading: true, error: null },
            ]);

            imageApi
                .upload(file, "properties")
                .then((res: { url: string }) => {
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === id
                                ? { ...img, cloudUrl: res.url, uploading: false }
                                : img
                        )
                    );
                })
                .catch((err: Error) => {
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === id
                                ? { ...img, uploading: false, error: err?.message ?? "Upload failed" }
                                : img
                        )
                    );
                });
        });
    }, [images.length]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) processFiles(e.target.files);
        e.target.value = "";
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
        },
        [processFiles]
    );

    const removeImage = (id: string) => {
        setImages((prev) => {
            const entry = prev.find((img) => img.id === id);
            if (entry) URL.revokeObjectURL(entry.localUrl);
            return prev.filter((img) => img.id !== id);
        });
    };

    return (
        <div className="flex-1 flex flex-col px-10 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 text-[12px] mb-1">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">Add New property</span>
                </div>

                <h1 className="text-[22px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Add New Property</h1>
                <p className="text-[12px] text-[#828282] m-0 mb-2.5">List your property on our platform. Provide accurate details to attract more guests.</p>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto pb-4 pr-1 w-full">

                    {/* ── General Information ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Info size={16} color="#953002" />
                            <span className="text-[15px] font-bold text-[#1d1d1d]">General Information</span>
                        </div>
                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Azure Beachfront Villa"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border"
                        />
                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Description</label>
                        <textarea
                            placeholder="Highlight the unique features of your property..."
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                            rows={3}
                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border resize-y min-h-[70px]"
                        />
                    </div>

                    {/* ── Location & Contact ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={16} color="#e74c3c" />
                            <span className="text-[15px] font-bold text-[#1d1d1d]">Location & Contact</span>
                        </div>
                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Street Address</label>
                        <input type="text" placeholder="123 Ocean Drive" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border" />
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="flex-1">
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">City</label>
                                <input type="text" placeholder="Miami" value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Contact Number</label>
                                <input type="text" placeholder="+1 (555) 000-0000" value={form.contact} onChange={(e) => update("contact", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border" />
                            </div>
                        </div>
                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Email Address</label>
                        <input type="email" placeholder="owner@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border" />
                    </div>

                    {/* ── Amenities ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={16} color="#ffb401" fill="#ffb401" />
                            <span className="text-[15px] font-bold text-[#1d1d1d]">Amenities</span>
                        </div>
                        <div className="grid grid-cols-4 gap-y-2 gap-x-3">
                            {amenityList.map((a) => (
                                <label key={a.key} className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={amenities[a.key]}
                                        onChange={() => toggleAmenity(a.key)}
                                        className="w-4 h-4 accent-[#953002] cursor-pointer"
                                    />
                                    <span className="text-[13px] text-[#4f4f4f]">{a.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Property Media ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                            <ImageIcon size={16} color="#953002" />
                            <span className="text-[15px] font-bold text-[#1d1d1d]">Property Media</span>
                            <span className="ml-auto text-[11px] text-[#b0b0b0]">{images.length}/10 photos</span>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileInput}
                        />

                        {/* Drop Zone */}
                        <div
                            onClick={() => images.length < 10 && fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-1 transition-colors ${
                                images.length >= 10
                                    ? "cursor-not-allowed border-[#e0e0e0] bg-[#f5f5f5]"
                                    : dragging
                                    ? "cursor-copy border-[var(--brand-primary)] bg-[#fef5ef]"
                                    : "cursor-pointer border-[#e0e0e0] bg-[#fefcfa] hover:border-[var(--brand-primary)] hover:bg-[#fef5ef]"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${dragging ? "bg-[var(--brand-primary)]" : "bg-[#fef5ef]"}`}>
                                <ImageIcon size={24} color={dragging ? "#fff" : "#953002"} />
                            </div>
                            <div className="font-semibold text-[13px] text-[#1d1d1d]">
                                {dragging ? "Drop images here" : "Click or drag images here"}
                            </div>
                            <div className="text-[11px] text-[#b0b0b0]">PNG, JPG up to 10MB each (max 10 photos)</div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 mt-3">
                                {images.map((img) => (
                                    <div key={img.id} className="relative w-16 h-12 rounded-md overflow-hidden border-2 border-[#e0e0e0] group">
                                        <img
                                            src={img.localUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Uploading overlay */}
                                        {img.uploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Loader2 size={16} color="#fff" className="animate-spin" />
                                            </div>
                                        )}
                                        {/* Error overlay */}
                                        {img.error && (
                                            <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center" title={img.error}>
                                                <AlertCircle size={16} color="#fff" />
                                            </div>
                                        )}
                                        {/* Uploaded — show green border */}
                                        {img.cloudUrl && !img.uploading && (
                                            <div className="absolute inset-0 border-2 border-[#2e7d32] rounded-md pointer-events-none" />
                                        )}
                                        {/* Remove button */}
                                        {!img.uploading && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0"
                                            >
                                                <X size={10} color="#fff" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Add more slot */}
                                {images.length < 10 && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-16 h-12 rounded-md border-2 border-dashed border-[#e0e0e0] flex items-center justify-center cursor-pointer bg-[#fafafa] hover:border-[var(--brand-primary)] hover:bg-[#fef5ef] transition-colors"
                                    >
                                        <Plus size={18} color="#b0b0b0" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Policies & Rules ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert size={16} color="#e74c3c" />
                            <span className="text-[15px] font-bold text-[#1d1d1d]">Policies & Rules</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="flex-1">
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-in Time</label>
                                <TimePicker value={checkIn} onChange={setCheckIn} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-out Time</label>
                                <TimePicker value={checkOut} onChange={setCheckOut} />
                            </div>
                        </div>
                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Rules & Regulations</label>
                        <textarea
                            placeholder="No smoking inside, quiet hours after 10 PM..."
                            value={form.rules}
                            onChange={(e) => update("rules", e.target.value)}
                            rows={2}
                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border resize-y min-h-[50px]"
                        />
                    </div>

                    {/* ── Error Banner ── */}
                    {saveError && (
                        <div className="mb-2 px-4 py-2 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b] font-medium">
                            {saveError}
                        </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="flex gap-3 pt-2 pb-3">
                        <button
                            disabled={saving}
                            onClick={async () => {
                                if (!form.name.trim()) {
                                    setSaveError("Property name is required.");
                                    return;
                                }
                                setSaveError(null);
                                setSaving(true);
                                try {
                                    const selectedAmenities = Object.entries(amenities)
                                        .filter(([, v]) => v)
                                        .map(([k]) => k);

                                    const firstImageUrl = images.find((i) => i.cloudUrl)?.cloudUrl;

                                    await propertiesApi.createProperty(user?.userId ?? 1, {
                                        name:         form.name,
                                        description:  form.description,
                                        address:      form.address,
                                        city:         form.city,
                                        contactPhone: form.contact,
                                        contactEmail: form.email,
                                        checkIn:      formatTime(checkIn),
                                        checkOut:     formatTime(checkOut),
                                        houseRules:   form.rules,
                                        amenities:    selectedAmenities,
                                        imageUrl:     firstImageUrl,
                                    });
                                    router.push("/owner/properties");
                                } catch (err: unknown) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const axiosMsg = (err as any)?.response?.data?.message;
                                    const msg = axiosMsg || (err instanceof Error ? err.message : "Failed to save property. Please try again.");
                                    setSaveError(msg);
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            className={`flex items-center gap-2 py-2.5 px-7 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-semibold transition-colors ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-[var(--primary-hover)]"}`}
                        >
                            {saving && <Loader2 size={14} className="animate-spin" />}
                            {saving ? "Saving..." : "Save Property Listing"}
                        </button>
                        <a href="/owner/properties" className="no-underline">
                            <button className="py-2.5 px-7 bg-[#e8e8e8] text-[#4f4f4f] border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#d0d0d0] transition-colors">Cancel</button>
                        </a>
                    </div>
                </div>
        </div>
    );
}
