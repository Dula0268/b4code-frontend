/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { imageApi } from "@/api/image/image.api";
import { roomsApi } from "@/api/owner/rooms.api";
import {
    Bell,
    ChevronDown,
    Users,
    SmilePlus,
    ImagePlus,
    Save,
    Loader2,
    X,
    CheckCircle,
} from "lucide-react";

const ROOM_TYPES = [
    { label: "Standard Room",      value: "STANDARD_ROOM" },
    { label: "Deluxe Room",        value: "DELUXE_ROOM" },
    { label: "Superior Room",      value: "SUPERIOR_ROOM" },
    { label: "Executive Room",     value: "EXECUTIVE_ROOM" },
    { label: "Twin Room",          value: "TWIN_ROOM" },
    { label: "Family Room",        value: "FAMILY_ROOM" },
    { label: "Studio Room",        value: "STUDIO_ROOM" },
    { label: "Suite",              value: "SUITE" },
    { label: "Presidential Suite", value: "PRESIDENTIAL_SUITE" },
    { label: "Villa",              value: "VILLA" },
];

const BED_TYPES = [
    { label: "Single",   value: "SINGLE" },
    { label: "Twin",     value: "TWIN" },
    { label: "Double",   value: "DOUBLE" },
    { label: "Queen",    value: "QUEEN" },
    { label: "King",     value: "KING" },
    { label: "Sofa Bed", value: "SOFA_BED" },
    { label: "Bunk Bed", value: "BUNK_BED" },
];

function AddRoomContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId");
    const backUrl = propertyId
        ? `/owner/properties/propertyRoomInventry?id=${propertyId}`
        : "/owner/properties";

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [roomName, setRoomName]         = useState("");
    const [roomType, setRoomType]         = useState("STANDARD_ROOM");
    const [bedType, setBedType]           = useState("KING");
    const [maxAdults, setMaxAdults]       = useState("2");
    const [maxChildren, setMaxChildren]   = useState("0");
    const [inventory, setInventory]       = useState("1");
    const [nightlyRate, setNightlyRate]   = useState("");
    const [description, setDescription]  = useState("");
    const [roomStatus, setRoomStatus]     = useState<"AVAILABLE" | "MAINTENANCE">("AVAILABLE");

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl]         = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError]   = useState<string | null>(null);

    const [saving, setSaving]     = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saved, setSaved]       = useState(false);
    const [dragOver, setDragOver] = useState(false);

    async function handleFileChange(file: File) {
        if (!file.type.startsWith("image/")) {
            setUploadError("Only image files are accepted.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File size must be under 10 MB.");
            return;
        }
        setUploadError(null);
        setImagePreview(URL.createObjectURL(file));
        setImageUrl(null);
        setUploadingImage(true);
        try {
            const result = await imageApi.upload(file, "rooms");
            setImageUrl(result.url);
        } catch {
            setUploadError("Photo upload failed. You can still save without a photo.");
        } finally {
            setUploadingImage(false);
        }
    }

    async function handleSave() {
        if (!roomName.trim()) { setSaveError("Room name is required."); return; }
        if (!propertyId) { setSaveError("No property selected."); return; }
        if (!nightlyRate || isNaN(parseFloat(nightlyRate))) {
            setSaveError("Enter a valid nightly rate.");
            return;
        }

        setSaving(true);
        setSaveError(null);
        try {
            await roomsApi.createRoom({
                propertyId: Number(propertyId),
                name: roomName.trim(),
                description: description.trim() || null,
                roomType,
                bedType,
                maxOccupancy: parseInt(maxAdults) || 2,
                maxChildren: parseInt(maxChildren) || 0,
                pricePerNight: parseFloat(nightlyRate),
                inventory: parseInt(inventory) || 1,
                status: roomStatus,
                imageUrl: imageUrl ?? null,
            });
            setSaved(true);
            setTimeout(() => router.push(backUrl), 1200);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string }; }; message?: string })
                ?.response?.data?.message ?? (err as { message?: string })?.message ?? "Failed to save room.";
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    }

    if (saved) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <div className="flex flex-col items-center gap-3">
                    <CheckCircle size={48} color="#27ae60" />
                    <p className="text-[15px] font-semibold text-[#1d1d1d]">Room saved successfully!</p>
                    <p className="text-[12px] text-[#828282]">Redirecting…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
                <div className="max-w-[820px] mx-auto py-6 px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-[11px] font-bold tracking-[0.8px] uppercase mb-6">
                        <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                        <span className="text-[#d0d0d0]">›</span>
                        <a href={backUrl} className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Rooms</a>
                        <span className="text-[#d0d0d0]">›</span>
                        <span className="text-[var(--brand-primary)]">Add New Room</span>
                    </nav>

                    {/* Form Card */}
                    <div className="bg-white border border-[#e8e8e8] rounded-2xl py-8 px-10">
                        <div className="text-[24px] font-extrabold text-[#1d1d1d] leading-tight">Add New Room</div>
                        <p className="text-[13px] text-[#828282] mt-1.5 mb-8">
                            Fill in the details below to add a new room to this property.
                        </p>

                        {/* Row 1: Room Name + Type */}
                        <div className="grid grid-cols-[1.2fr_1fr] gap-6 mb-6">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Room Name *</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="e.g. Garden View Suite"
                                    className="w-full py-2.5 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border placeholder:text-[#c0c0c0] focus:border-[var(--brand-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Room Type</label>
                                <div className="relative">
                                    <select
                                        value={roomType}
                                        onChange={(e) => setRoomType(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[var(--brand-primary)] transition-colors"
                                    >
                                        {ROOM_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Bed Type + Inventory + Nightly Rate */}
                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Bed Type</label>
                                <div className="relative">
                                    <select
                                        value={bedType}
                                        onChange={(e) => setBedType(e.target.value)}
                                        className="w-full py-2.5 pr-10 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border focus:border-[var(--brand-primary)] transition-colors"
                                    >
                                        {BED_TYPES.map((b) => (
                                            <option key={b.value} value={b.value}>{b.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Inventory</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={inventory}
                                    onChange={(e) => setInventory(e.target.value)}
                                    className="w-full py-2.5 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[var(--brand-primary)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Nightly Rate *</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#828282] pointer-events-none">Rs</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={nightlyRate}
                                        onChange={(e) => setNightlyRate(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full py-2.5 pl-10 pr-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border placeholder:text-[#c0c0c0] focus:border-[var(--brand-primary)] transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Max Adults + Max Children */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Max Adults</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Users size={16} color="#828282" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={maxAdults}
                                        onChange={(e) => setMaxAdults(e.target.value)}
                                        className="w-full py-2.5 pl-10 pr-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[var(--brand-primary)] transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Max Children</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <SmilePlus size={16} color="#828282" />
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={maxChildren}
                                        onChange={(e) => setMaxChildren(e.target.value)}
                                        className="w-full py-2.5 pl-10 pr-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border focus:border-[var(--brand-primary)] transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Room Description */}
                        <div className="mb-7">
                            <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Room Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the room features, view, and unique selling points..."
                                rows={4}
                                className="w-full py-3 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white box-border resize-y leading-relaxed placeholder:text-[#c0c0c0] focus:border-[var(--brand-primary)] transition-colors"
                            />
                        </div>

                        {/* Room Status */}
                        <div className="flex items-center justify-between mb-7 py-1">
                            <div>
                                <span className="text-[13px] font-bold text-[#1d1d1d] block">Room Status</span>
                                <span className="text-[12px] text-[#b0b0b0] mt-0.5 block">Set the initial availability state of the room.</span>
                            </div>
                            <div className="flex border border-[#e0e0e0] rounded-lg overflow-hidden">
                                {(["AVAILABLE", "MAINTENANCE"] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setRoomStatus(opt)}
                                        className={`py-2 px-5 text-[13px] font-semibold border-none cursor-pointer transition-all duration-150 ${
                                            roomStatus === opt
                                                ? opt === "AVAILABLE"
                                                    ? "bg-[#e8f5e9] text-[#27ae60]"
                                                    : "bg-[#fff8e1] text-[#f2994a]"
                                                : "bg-white text-[#828282] hover:bg-[#fafafa]"
                                        }`}
                                    >
                                        {opt === "AVAILABLE" ? "Active" : "Maintenance"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Room Photo */}
                        <div className="mb-8">
                            <label className="block text-[13px] font-bold text-[#1d1d1d] mb-2">Room Photo</label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileChange(f);
                                }}
                            />

                            {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-[#e0d8d0] w-full h-[200px]">
                                    <img src={imagePreview} alt="Room preview" className="w-full h-full object-cover" />
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 size={28} color="white" className="animate-spin" />
                                        </div>
                                    )}
                                    {!uploadingImage && imageUrl && (
                                        <div className="absolute top-2 right-2 bg-[#27ae60] rounded-full p-1">
                                            <CheckCircle size={16} color="white" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(null); setImageUrl(null); setUploadError(null); }}
                                        className="absolute top-2 left-2 bg-white/80 rounded-full p-1 border-none cursor-pointer hover:bg-white transition-colors"
                                    >
                                        <X size={14} color="#4f4f4f" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 bg-white/90 rounded-lg py-1.5 px-3 text-[12px] font-semibold text-[#4f4f4f] border-none cursor-pointer hover:bg-white transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        const f = e.dataTransfer.files?.[0];
                                        if (f) handleFileChange(f);
                                    }}
                                    className={`flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                        dragOver ? "border-[var(--brand-primary)] bg-[#fef5ef]" : "border-[#e0d8d0] bg-[#fef9f5] hover:border-[#d4a88c]"
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#fceede] flex items-center justify-center mb-3">
                                        <ImagePlus size={22} color="#d4915c" />
                                    </div>
                                    <span className="text-[13px] font-semibold text-[#1d1d1d]">Click to upload or drag and drop</span>
                                    <span className="text-[11px] text-[#b0b0b0] mt-1">PNG, JPG, WEBP up to 10MB</span>
                                </div>
                            )}

                            {uploadError && (
                                <p className="text-[12px] text-[#e74c3c] mt-2">{uploadError}</p>
                            )}
                        </div>

                        <div className="h-px bg-[#e8e8e8] mb-5" />

                        {saveError && (
                            <p className="text-[13px] text-[#e74c3c] mb-4 text-right">{saveError}</p>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end items-center gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(backUrl)}
                                disabled={saving}
                                className="py-2.5 px-7 bg-white text-[#4f4f4f] border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || uploadingImage}
                                className="flex items-center gap-2 py-2.5 px-7 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#a63602] transition-colors disabled:opacity-60"
                            >
                                {saving ? (
                                    <><Loader2 size={15} className="animate-spin" /> Saving…</>
                                ) : (
                                    <><Save size={15} /> Save Room</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default function AddRoomPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <AddRoomContent />
        </Suspense>
    );
}
