/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "@/components/shared/branding/logo";
import { propertiesApi } from "@/api/owner/properties.api";
import { imageApi } from "@/api/image/image.api";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, parseTime, formatTime } from "@/components/owner/TimePicker";
import {
    Info,
    MapPin,
    Bell,
    ChevronRight,
    Camera,
    CheckCircle2,
    Circle,
    ArrowRight,
    FileText,
    RefreshCw,
    DollarSign,
    Globe,
    Lightbulb,
    ShieldAlert,
    Loader2,
    X,
    Plus,
    AlertCircle,
    Building2,
} from "lucide-react";

const AMENITY_LIST = [
    { key: "wifi",        label: "Wifi" },
    { key: "pool",        label: "Pool" },
    { key: "parking",     label: "Parking" },
    { key: "gym",         label: "Gym" },
    { key: "kitchen",     label: "Kitchen" },
    { key: "ac",          label: "Air Conditioning" },
    { key: "petFriendly", label: "Pet Friendly" },
    { key: "smartTv",     label: "Smart TV" },
];

const PROPERTY_TYPES = ["Villa", "Hotel", "Apartment", "Bungalow", "Resort", "Hostel", "Guesthouse"];

interface ImageEntry {
    id: string;
    localUrl: string;
    cloudUrl: string | null;
    uploading: boolean;
    error: string | null;
}

function EditPropertyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "",
        contactPhone: "",
        contactEmail: "",
        houseRules: "",
        propertyType: "",
    });

    const [checkIn,  setCheckIn]  = useState<TimeValue>({ hour: "2",  minute: "00", period: "PM" });
    const [checkOut, setCheckOut] = useState<TimeValue>({ hour: "11", minute: "00", period: "AM" });

    const [amenities, setAmenities] = useState<Record<string, boolean>>(
        Object.fromEntries(AMENITY_LIST.map((a) => [a.key, false]))
    );

    const MAX_PHOTOS = 10;
    const [existingUrls, setExistingUrls] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<ImageEntry[]>([]);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
    const toggleAmenity = (key: string) => setAmenities((p) => ({ ...p, [key]: !p[key] }));

    useEffect(() => {
        if (!propertyId) { setLoadError("No property ID."); setLoading(false); return; }
        propertiesApi.getProperty(Number(propertyId), ownerId).then((data) => {
            setForm({
                name:          data.name          ?? "",
                description:   data.description   ?? "",
                address:       data.address       ?? "",
                city:          data.city          ?? "",
                country:       data.country       ?? "",
                contactPhone:  data.contactPhone  ?? "",
                contactEmail:  data.contactEmail  ?? "",
                houseRules:    data.houseRules    ?? "",
                propertyType:  data.propertyType  ?? "",
            });
            if (data.checkIn)  setCheckIn(parseTime(data.checkIn));
            if (data.checkOut) setCheckOut(parseTime(data.checkOut));
            if (data.photoUrls?.length) {
                setExistingUrls(data.photoUrls.slice(0, 10));
            } else if (data.image) {
                setExistingUrls([data.image]);
            }
            if (data.amenities?.length) {
                setAmenities((prev) => {
                    const next = { ...prev };
                    data.amenities.forEach((a: string) => {
                        const key = a.toLowerCase().replace(/[\s/]/g, "");
                        if (key in next) next[key] = true;
                        // also try exact key match
                        if (a in next) next[a] = true;
                    });
                    return next;
                });
            }
        }).catch(() => setLoadError("Failed to load property."))
          .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, ownerId]);

    const removeExisting = (url: string) =>
        setExistingUrls((prev) => prev.filter((u) => u !== url));

    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArr = Array.from(files);
        const remaining = MAX_PHOTOS - existingUrls.length - newImages.length;
        if (remaining <= 0) return;
        fileArr.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
            .slice(0, remaining)
            .forEach((file) => {
                const id = `${Date.now()}-${Math.random()}`;
                const localUrl = URL.createObjectURL(file);
                setNewImages((prev) => [...prev, { id, localUrl, cloudUrl: null, uploading: true, error: null }]);
                imageApi.upload(file, "properties")
                    .then((res: { url: string }) =>
                        setNewImages((prev) => prev.map((img) => img.id === id ? { ...img, cloudUrl: res.url, uploading: false } : img))
                    )
                    .catch((err: Error) =>
                        setNewImages((prev) => prev.map((img) => img.id === id ? { ...img, uploading: false, error: err?.message ?? "Upload failed" } : img))
                    );
            });
    }, [existingUrls.length, newImages.length]);

    const removeNew = (id: string) => {
        setNewImages((prev) => {
            const entry = prev.find((img) => img.id === id);
            if (entry) URL.revokeObjectURL(entry.localUrl);
            return prev.filter((img) => img.id !== id);
        });
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setSaveError("Property name is required."); return; }
        setSaveError(null);
        setSaveSuccess(false);
        setSaving(true);
        try {
            const selectedAmenities = Object.entries(amenities).filter(([, v]) => v).map(([k]) => k);
            const uploadedNewUrls = newImages.filter((i) => i.cloudUrl).map((i) => i.cloudUrl as string);
            const allImageUrls = [...existingUrls, ...uploadedNewUrls].slice(0, MAX_PHOTOS);
            await propertiesApi.updateProperty(Number(propertyId), ownerId, {
                name:         form.name,
                description:  form.description,
                address:      form.address,
                city:         form.city,
                country:      form.country,
                contactPhone: form.contactPhone,
                contactEmail: form.contactEmail,
                checkIn:      formatTime(checkIn),
                checkOut:     formatTime(checkOut),
                houseRules:   form.houseRules,
                propertyType: form.propertyType,
                amenities:    selectedAmenities,
                imageUrls:    allImageUrls,
            });
            setSaveSuccess(true);
            setTimeout(() => {
                router.push(`/owner/properties/propertyDetails?id=${propertyId}`);
            }, 800);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosMsg = (err as any)?.response?.data?.message;
            setSaveError(axiosMsg || (err instanceof Error ? err.message : "Failed to save. Please try again."));
        } finally {
            setSaving(false);
        }
    };

    const detailsHref = propertyId ? `/owner/properties/propertyDetails?id=${propertyId}` : "/owner/properties";

    return (
        <div className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">

                <div className="flex items-center gap-1.5 text-[12px] mb-0.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <a href={detailsHref} className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">{form.name || "Property"}</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">Edit Property</span>
                </div>

                <h1 className="text-[22px] font-extrabold text-[#1d1d1d] m-0 mt-1">Edit Property Details</h1>
                <p className="text-[12px] text-[#828282] m-0 mt-0.5 mb-2">Keep your property information accurate to attract the right guests.</p>

                {/* Loading */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={28} color="#953002" className="animate-spin" />
                    </div>
                )}
                {loadError && !loading && (
                    <div className="flex-1 flex items-center justify-center text-[13px] text-[#e74c3c]">{loadError}</div>
                )}

                {/* Scrollable Content */}
                {!loading && !loadError && (
                    <div className="flex-1 overflow-y-auto pb-4 pr-1">
                        <div className="grid grid-cols-[1fr_240px] gap-4 items-start">
                            {/* ── Left Column ── */}
                            <div className="flex flex-col gap-3">

                                {/* Basic Information */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Info size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Basic Information</span>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Name</label>
                                    <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="Property name" />
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Description</label>
                                    <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border resize-y min-h-[70px] focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="Describe your property..." />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Type</label>
                                            <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d] appearance-none">
                                                <option value="">Select type</option>
                                                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Contact Phone</label>
                                            <input type="text" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="+94 xxx xxx xxxx" />
                                        </div>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Contact Email</label>
                                    <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="contact@example.com" />
                                </div>

                                {/* Location */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <MapPin size={16} color="#e74c3c" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Location</span>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Street Address</label>
                                    <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="123 Main St" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">City</label>
                                            <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="City" />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Country</label>
                                            <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="Country" />
                                        </div>
                                    </div>
                                </div>

                                {/* Policies */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <ShieldAlert size={16} color="#e74c3c" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Policies & Rules</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-in Time</label>
                                            <TimePicker value={checkIn} onChange={setCheckIn} />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-out Time</label>
                                            <TimePicker value={checkOut} onChange={setCheckOut} />
                                        </div>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">House Rules</label>
                                    <textarea value={form.houseRules} onChange={(e) => update("houseRules", e.target.value)} rows={2} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border resize-y min-h-[50px] focus:border-[var(--brand-primary)] bg-white text-[#1d1d1d]" placeholder="No smoking, quiet hours after 10 PM..." />
                                </div>

                                {/* Amenities */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <CheckCircle2 size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Amenities</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {AMENITY_LIST.map(({ key, label }) => {
                                            const checked = amenities[key];
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => toggleAmenity(key)}
                                                    className={`flex items-center gap-1.5 py-1.5 px-2.5 border rounded-lg text-[12px] cursor-pointer font-medium ${
                                                        checked ? "border-[var(--brand-primary)] bg-[#fef8f4] text-[#4f4f4f]" : "border-[#e0e0e0] bg-white text-[#4f4f4f]"
                                                    }`}
                                                >
                                                    {checked ? <CheckCircle2 size={14} color="#953002" /> : <Circle size={14} color="#b0b0b0" />}
                                                    <span>{label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Property Photos */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <Camera size={16} color="#953002" />
                                            <span className="text-[15px] font-bold text-[#1d1d1d]">Property Photos</span>
                                        </div>
                                        <span className="text-[11px] text-[#828282]">
                                            {existingUrls.length + newImages.length}/{MAX_PHOTOS} photos
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#b0b0b0] mb-3">
                                        Upload up to 10 photos. The first photo is the main cover image.
                                    </p>

                                    {/* Photo grid */}
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                        {/* Existing photos */}
                                        {existingUrls.map((url, i) => (
                                            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-[#e0e0e0]">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                {i === 0 && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-[var(--brand-primary)] text-white text-[8px] font-bold text-center py-0.5">
                                                        COVER
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeExisting(url)}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0"
                                                >
                                                    <X size={10} color="#fff" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New (uploading) photos */}
                                        {newImages.map((img) => (
                                            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#e0e0e0]">
                                                <img src={img.localUrl} alt="" className="w-full h-full object-cover" />
                                                {img.uploading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <Loader2 size={14} color="#fff" className="animate-spin" />
                                                    </div>
                                                )}
                                                {img.cloudUrl && (
                                                    <div className="absolute top-1 left-1 bg-[#27ae60] rounded-full p-px">
                                                        <CheckCircle2 size={10} color="#fff" />
                                                    </div>
                                                )}
                                                {img.error && (
                                                    <div className="absolute inset-0 bg-[rgba(231,76,60,0.25)] flex items-center justify-center">
                                                        <AlertCircle size={14} color="#e74c3c" />
                                                    </div>
                                                )}
                                                {!img.uploading && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNew(img.id)}
                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0"
                                                    >
                                                        <X size={10} color="#fff" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add slot */}
                                        {(existingUrls.length + newImages.length) < MAX_PHOTOS && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                                onDragLeave={() => setDragging(false)}
                                                onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files); }}
                                                className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                                    dragging ? "border-[var(--brand-primary)] bg-[#fef5ef]" : "border-[#d0d0d0] bg-[#fafafa] hover:border-[var(--brand-primary)] hover:bg-[#fef8f4]"
                                                }`}
                                            >
                                                <Plus size={18} color="#b0b0b0" />
                                                <span className="text-[9px] text-[#b0b0b0] mt-1 text-center leading-tight px-1">Add Photo</span>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ""; }}
                                    />

                                    {existingUrls.length + newImages.length === 0 && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                            onDragLeave={() => setDragging(false)}
                                            onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files); }}
                                            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer py-6 transition-colors ${
                                                dragging ? "border-[var(--brand-primary)] bg-[#fef5ef]" : "border-[#d0d0d0] bg-[#fafafa] hover:border-[var(--brand-primary)] hover:bg-[#fef8f4]"
                                            }`}
                                        >
                                            <Building2 size={26} color="#b0b0b0" />
                                            <span className="text-[12px] text-[#828282] mt-1.5">Click or drag to upload photos</span>
                                            <span className="text-[10px] text-[#b0b0b0]">PNG, JPG, WEBP up to 10MB each · max 10 photos</span>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => window.location.href = `/owner/properties/Media?id=${propertyId}`}
                                        className="flex items-center gap-1 mt-2 bg-transparent border-none text-[var(--brand-primary)] text-[11px] font-semibold cursor-pointer hover:underline p-0"
                                    >
                                        Manage All Photos in Media tab <ArrowRight size={12} />
                                    </button>
                                </div>

                                {/* Error / Success banners */}
                                {saveError && (
                                    <div className="px-4 py-2 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b] font-medium">
                                        {saveError}
                                    </div>
                                )}
                                {saveSuccess && (
                                    <div className="px-4 py-2 rounded-lg bg-[#eafaf1] border border-[#27ae60] text-[12px] text-[#27ae60] font-medium">
                                        Property updated successfully!
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-3 pt-1 pb-2">
                                    <a href={detailsHref} className="no-underline">
                                        <button type="button" className="py-2 px-5 bg-white text-[#4f4f4f] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                                            Cancel Changes
                                        </button>
                                    </a>
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleSave}
                                        className={`flex items-center gap-2 py-2 px-6 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-semibold transition-colors ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-[var(--primary-hover)]"}`}
                                    >
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>

                            {/* ── Right Column ── */}
                            <div className="flex flex-col gap-3">
                                {/* Editing Tips */}
                                <div className="bg-gradient-to-br from-[#7a2600] via-[#953002] to-[#b54e1a] rounded-xl py-3.5 px-4">
                                    <div className="flex items-center gap-1.5 mb-2.5">
                                        <Lightbulb size={16} color="#fff" />
                                        <span className="text-[14px] font-bold text-white">EDITING TIPS</span>
                                    </div>
                                    <div className="flex gap-2 mb-2.5">
                                        <FileText size={13} color="#ffd9b3" className="shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[12px] font-bold text-white">Be Descriptive</div>
                                            <div className="text-[10px] text-[#dbb99a] leading-snug mt-px">Mention unique features like neighborhood vibe or garden views.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-2.5">
                                        <RefreshCw size={13} color="#ffd9b3" className="shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[12px] font-bold text-white">Keep it Current</div>
                                            <div className="text-[10px] text-[#dbb99a] leading-snug mt-px">Always update amenities if you&apos;ve added new services.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-2.5">
                                        <DollarSign size={13} color="#ffd9b3" className="shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[12px] font-bold text-white">Competitive Pricing</div>
                                            <div className="text-[10px] text-[#dbb99a] leading-snug mt-px">Set room rates in Room Management for accurate pricing.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-2.5">
                                        <Globe size={13} color="#ffd9b3" className="shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-[12px] font-bold text-white">Multiple Languages</div>
                                            <div className="text-[10px] text-[#dbb99a] leading-snug mt-px">We automatically translate your description for global guests.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Support */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                    <p className="text-[12px] text-[#828282] m-0 mb-2 leading-relaxed">
                                        Need help optimizing your listing? Our support team is here for you.
                                    </p>
                                    <button type="button" className="w-full py-2 bg-white text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-lg text-[12px] font-bold cursor-pointer">Contact Support</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default function EditPropertyDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#faf9f7]">
                <Loader2 size={28} color="#953002" className="animate-spin" />
            </div>
        }>
            <EditPropertyContent />
        </Suspense>
    );
}
