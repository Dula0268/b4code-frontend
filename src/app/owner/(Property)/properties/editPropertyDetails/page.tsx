/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { propertiesApi } from "@/api/owner/properties.api";
import { imageApi } from "@/api/image/image.api";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, parseTime, formatTime } from "@/components/owner/TimePicker";
import {
    Bell, ChevronRight, Loader2, X, Plus, AlertCircle, Building2,
    CheckCircle2, Circle, Camera, MapPin, Info, ShieldAlert,
    Settings, Sparkles, Phone, Mail, BedDouble, Trash2, Save,
} from "lucide-react";

const TABS = ["General", "Rooms", "Rates", "Media", "Settings"];

const AMENITY_LIST = [
    { key: "wifi",       label: "Wifi" },
    { key: "pool",       label: "Pool" },
    { key: "parking",    label: "Parking" },
    { key: "gym",        label: "Gym" },
    { key: "kitchen",    label: "Kitchen" },
    { key: "ac",         label: "Air Conditioning" },
    { key: "smartTv",    label: "Smart TV" },
    { key: "spa",        label: "Spa" },
    { key: "restaurant", label: "Restaurant" },
    { key: "laundry",    label: "Laundry" },
];

const PROPERTY_TYPES = ["Villa", "Hotel", "Apartment", "Bungalow", "Resort", "Hostel", "Guesthouse"];

const FLAG_LIST = [
    { key: "freeCancellation",  label: "Free Cancellation",  desc: "Guests can cancel at no charge" },
    { key: "breakfastIncluded", label: "Breakfast Included",  desc: "Complimentary breakfast provided" },
    { key: "petFriendly",       label: "Pet Friendly",        desc: "Pets are welcome at this property" },
    { key: "accessibility",     label: "Accessibility",       desc: "Accessible facilities available" },
];

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

    const [activeTab, setActiveTab] = useState("General");
    const [loading, setLoading]       = useState(true);
    const [loadError, setLoadError]   = useState<string | null>(null);
    const [saving, setSaving]         = useState(false);
    const [saveError, setSaveError]   = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty] = useState<any>(null);

    const [form, setForm] = useState({
        name: "", description: "", address: "", city: "", country: "",
        contact: "", email: "", houseRules: "", propertyType: "",
    });

    const [checkIn,  setCheckIn]  = useState<TimeValue>({ hour: "2",  minute: "00", period: "PM" });
    const [checkOut, setCheckOut] = useState<TimeValue>({ hour: "11", minute: "00", period: "AM" });

    const [amenities, setAmenities] = useState<Record<string, boolean>>(
        Object.fromEntries(AMENITY_LIST.map((a) => [a.key, false]))
    );
    const [flags, setFlags] = useState<Record<string, boolean>>(
        Object.fromEntries(FLAG_LIST.map((f) => [f.key, false]))
    );

    const MAX_PHOTOS = 10;
    const [existingUrls, setExistingUrls] = useState<string[]>([]);
    const [newImages, setNewImages]       = useState<ImageEntry[]>([]);
    const [dragging, setDragging]         = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
    const toggleAmenity = (key: string) => setAmenities((p) => ({ ...p, [key]: !p[key] }));
    const toggleFlag    = (key: string) => setFlags((p) => ({ ...p, [key]: !p[key] }));

    useEffect(() => {
        if (!propertyId) { setLoadError("No property ID."); setLoading(false); return; }
        propertiesApi.getProperty(Number(propertyId), ownerId).then((data) => {
            setProperty(data);
            setForm({
                name:         data.name          ?? "",
                description:  data.description   ?? "",
                address:      data.address       ?? "",
                city:         data.city          ?? "",
                country:      data.country       ?? "",
                contact:      data.contactPhone  ?? "",
                email:        data.contactEmail  ?? "",
                houseRules:   data.houseRules    ?? data.cancellationPolicy ?? "",
                propertyType: data.propertyType  ?? "",
            });
            if (data.checkIn)  setCheckIn(parseTime(data.checkIn));
            if (data.checkOut) setCheckOut(parseTime(data.checkOut));
            if (data.photoUrls?.length) setExistingUrls(data.photoUrls.slice(0, 10));
            else if (data.image) setExistingUrls([data.image]);
            if (data.amenities?.length) {
                setAmenities((prev) => {
                    const next = { ...prev };
                    data.amenities.forEach((a: string) => {
                        const key = a.toLowerCase().replace(/[\s/]/g, "");
                        if (key in next) next[key] = true;
                        if (a in next) next[a] = true;
                    });
                    return next;
                });
            }
            setFlags({
                freeCancellation:  !!data.freeCancellation,
                breakfastIncluded: !!data.breakfastIncluded,
                petFriendly:       !!data.petFriendly,
                accessibility:     !!data.accessibility,
            });
        }).catch(() => setLoadError("Failed to load property."))
          .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, ownerId]);

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

    const removeExisting = (url: string) => setExistingUrls((prev) => prev.filter((u) => u !== url));
    const removeNew = (id: string) => {
        setNewImages((prev) => {
            const entry = prev.find((img) => img.id === id);
            if (entry) URL.revokeObjectURL(entry.localUrl);
            return prev.filter((img) => img.id !== id);
        });
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setSaveError("Property name is required."); setActiveTab("General"); return; }
        setSaveError(null);
        setSaveSuccess(false);
        setSaving(true);
        try {
            const selectedAmenities = Object.entries(amenities).filter(([, v]) => v).map(([k]) => k);
            const uploadedNewUrls   = newImages.filter((i) => i.cloudUrl).map((i) => i.cloudUrl as string);
            const allImageUrls      = [...existingUrls, ...uploadedNewUrls].slice(0, MAX_PHOTOS);
            await propertiesApi.updateProperty(Number(propertyId), ownerId, {
                name:               form.name,
                description:        form.description,
                address:            form.address,
                city:               form.city,
                country:            form.country,
                contactPhone:       form.contact,
                contactEmail:       form.email,
                checkIn:            formatTime(checkIn),
                checkOut:           formatTime(checkOut),
                houseRules:         form.houseRules,
                propertyType:       form.propertyType,
                amenities:          selectedAmenities,
                imageUrls:          allImageUrls,
                freeCancellation:   flags.freeCancellation,
                breakfastIncluded:  flags.breakfastIncluded,
                petFriendly:        flags.petFriendly,
                accessibility:      flags.accessibility,
            });
            setSaveSuccess(true);
            setTimeout(() => router.push(`/owner/properties/propertyDetails?id=${propertyId}`), 800);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSaveError((err as any)?.response?.data?.message ?? (err instanceof Error ? err.message : "Failed to save."));
        } finally {
            setSaving(false);
        }
    };

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";
    const statusLabel = property?.status?.toUpperCase() ?? "PENDING";

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            <OwnerSidebar />

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
                <div className="flex items-center gap-1.5 text-[12px] mb-1">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002]">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <a href={`/owner/properties/propertyDetails?id=${propertyId}`} className="text-[#828282] no-underline hover:text-[#953002]">{form.name || "Property"}</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">Edit Property</span>
                </div>

                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={28} color="#953002" className="animate-spin" />
                    </div>
                )}
                {loadError && !loading && (
                    <div className="flex-1 flex items-center justify-center text-[13px] text-[#e74c3c]">{loadError}</div>
                )}

                {!loading && !loadError && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Tab Bar */}
                        <div className="flex border-b border-[#e8e8e8] mb-0">
                            {TABS.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 border-b-2 ${
                                        activeTab === t
                                            ? "text-[#953002] font-bold border-[#953002]"
                                            : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f]"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto pb-4 pr-1 pt-3">
                            <div className="grid grid-cols-[1fr_260px] gap-4 items-start">

                                {/* ── Left column ── */}
                                <div className="min-w-0 flex flex-col gap-3">

                                    {/* ── General Tab ── */}
                                    {activeTab === "General" && (
                                        <>
                                            {/* General Information */}
                                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Info size={15} color="#953002" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">General Information</span>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Property Name <span className="text-[#e74c3c]">*</span></label>
                                                        <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                                                            placeholder="e.g. Ocean View Villa"
                                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Description</label>
                                                        <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                                                            rows={3} placeholder="Describe your property..."
                                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white resize-y" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Property Type</label>
                                                        <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}
                                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white">
                                                            <option value="">Select type…</option>
                                                            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MapPin size={15} color="#e74c3c" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Location</span>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Street Address</label>
                                                        <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)}
                                                            placeholder="123 Beach Road"
                                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">City</label>
                                                            <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                                                                placeholder="City"
                                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Country</label>
                                                            <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)}
                                                                placeholder="Country"
                                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Phone size={15} color="#953002" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Contact Info</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Phone</label>
                                                        <input type="text" value={form.contact} onChange={(e) => update("contact", e.target.value)}
                                                            placeholder="+94 77 000 0000"
                                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Email</label>
                                                        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                                                            placeholder="contact@example.com"
                                                            className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* ── Rooms Tab ── */}
                                    {activeTab === "Rooms" && (
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5 flex flex-col items-center justify-center gap-3 text-center min-h-[260px]">
                                            <BedDouble size={36} color="#c0a898" />
                                            <div>
                                                <div className="text-[15px] font-bold text-[#1d1d1d] mb-1">Manage Rooms</div>
                                                <p className="text-[12px] text-[#828282] m-0">Add, edit, or remove rooms for this property in the Room Inventory page.</p>
                                            </div>
                                            <a href={`/owner/properties/propertyRoomInventry?id=${propertyId}`} className="no-underline">
                                                <button className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]">
                                                    <Plus size={14} /> Go to Room Inventory
                                                </button>
                                            </a>
                                        </div>
                                    )}

                                    {/* ── Rates Tab ── */}
                                    {activeTab === "Rates" && (
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5 flex flex-col items-center justify-center gap-3 text-center min-h-[260px]">
                                            <div className="w-12 h-12 rounded-xl bg-[#fef5ef] flex items-center justify-center">
                                                <span className="text-[22px] font-black text-[#953002]">₹</span>
                                            </div>
                                            <div>
                                                <div className="text-[15px] font-bold text-[#1d1d1d] mb-1">Configure Room Rates</div>
                                                <p className="text-[12px] text-[#828282] m-0">Set nightly rates, weekend pricing, and seasonal adjustments for each room type.</p>
                                            </div>
                                            <a href={`/owner/properties/Rate?id=${propertyId}`} className="no-underline">
                                                <button className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]">
                                                    Go to Rate Management
                                                </button>
                                            </a>
                                        </div>
                                    )}

                                    {/* ── Media Tab ── */}
                                    {activeTab === "Media" && (
                                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Camera size={15} color="#953002" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Property Photos</span>
                                                </div>
                                                <span className="text-[11px] text-[#828282]">{existingUrls.length + newImages.length}/{MAX_PHOTOS}</span>
                                            </div>
                                            <p className="text-[11px] text-[#b0b0b0] mb-3">Upload up to 10 photos. The first photo is the cover image.</p>

                                            <div className="grid grid-cols-5 gap-2 mb-3">
                                                {existingUrls.map((url, i) => (
                                                    <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-[#e0e0e0]">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        {i === 0 && (
                                                            <div className="absolute bottom-0 left-0 right-0 bg-[#953002] text-white text-[8px] font-bold text-center py-0.5">COVER</div>
                                                        )}
                                                        <button type="button" onClick={() => removeExisting(url)}
                                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0">
                                                            <X size={10} color="#fff" />
                                                        </button>
                                                    </div>
                                                ))}
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
                                                            <button type="button" onClick={() => removeNew(img.id)}
                                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0">
                                                                <X size={10} color="#fff" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {(existingUrls.length + newImages.length) < MAX_PHOTOS && (
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                                        onDragLeave={() => setDragging(false)}
                                                        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files); }}
                                                        className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragging ? "border-[#953002] bg-[#fef5ef]" : "border-[#d0d0d0] bg-[#fafafa] hover:border-[#953002] hover:bg-[#fef8f4]"}`}>
                                                        <Plus size={18} color="#b0b0b0" />
                                                        <span className="text-[9px] text-[#b0b0b0] mt-1 text-center px-1">Add Photo</span>
                                                    </div>
                                                )}
                                            </div>

                                            {(existingUrls.length + newImages.length) === 0 && (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                                    onDragLeave={() => setDragging(false)}
                                                    onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files); }}
                                                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer py-8 transition-colors ${dragging ? "border-[#953002] bg-[#fef5ef]" : "border-[#d0d0d0] bg-[#fafafa] hover:border-[#953002] hover:bg-[#fef8f4]"}`}>
                                                    <Building2 size={26} color="#b0b0b0" />
                                                    <span className="text-[12px] text-[#828282] mt-1.5">Click or drag to upload photos</span>
                                                    <span className="text-[10px] text-[#b0b0b0]">PNG, JPG, WEBP up to 10MB · max 10 photos</span>
                                                </div>
                                            )}

                                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                                                onChange={(e) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ""; }} />
                                        </div>
                                    )}

                                    {/* ── Settings Tab ── */}
                                    {activeTab === "Settings" && (
                                        <>
                                            {/* Policies & Rules */}
                                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <ShieldAlert size={15} color="#e74c3c" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Policies & Rules</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-in Time</label>
                                                        <TimePicker value={checkIn} onChange={setCheckIn} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-out Time</label>
                                                        <TimePicker value={checkOut} onChange={setCheckOut} />
                                                    </div>
                                                </div>
                                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">House Rules & Regulations</label>
                                                <textarea value={form.houseRules} onChange={(e) => update("houseRules", e.target.value)}
                                                    rows={4} placeholder="No smoking, quiet hours after 10 PM..."
                                                    className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white resize-y" />
                                            </div>

                                            {/* Amenities */}
                                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CheckCircle2 size={15} color="#953002" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Amenities</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {AMENITY_LIST.map(({ key, label }) => {
                                                        const checked = amenities[key];
                                                        return (
                                                            <button key={key} type="button" onClick={() => toggleAmenity(key)}
                                                                className={`flex items-center gap-1.5 py-1.5 px-2.5 border rounded-lg text-[12px] cursor-pointer font-medium ${checked ? "border-[#953002] bg-[#fef8f4] text-[#4f4f4f]" : "border-[#e0e0e0] bg-white text-[#4f4f4f]"}`}>
                                                                {checked ? <CheckCircle2 size={13} color="#953002" /> : <Circle size={13} color="#b0b0b0" />}
                                                                {label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Property Features */}
                                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles size={15} color="#953002" />
                                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Property Features</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-8">
                                                    {FLAG_LIST.map(({ key, label, desc }) => {
                                                        const on = flags[key];
                                                        return (
                                                            <div key={key} className="flex items-center justify-between py-2.5 border-b border-[#f5f5f5] last:border-none">
                                                                <div>
                                                                    <div className="text-[13px] font-semibold text-[#1d1d1d]">{label}</div>
                                                                    <div className="text-[11px] text-[#b0b0b0]">{desc}</div>
                                                                </div>
                                                                <button type="button" onClick={() => toggleFlag(key)}
                                                                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 border-none cursor-pointer ml-4 ${on ? "bg-[#953002]" : "bg-[#e0e0e0]"}`}>
                                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Errors */}
                                    {saveError && (
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b]">
                                            <AlertCircle size={14} /> {saveError}
                                        </div>
                                    )}
                                    {saveSuccess && (
                                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#eafaf1] border border-[#27ae60] text-[12px] text-[#27ae60]">
                                            <CheckCircle2 size={14} /> Property updated successfully! Redirecting…
                                        </div>
                                    )}
                                </div>

                                {/* ── Right column ── */}
                                <div className="sticky top-0 flex flex-col gap-3">
                                    {/* Property card */}
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f0ebe5] flex items-center justify-center shrink-0">
                                                {existingUrls[0]
                                                    ? <img src={existingUrls[0]} alt="" className="w-full h-full object-cover" />
                                                    : <Building2 size={18} color="#c0a898" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[13px] font-bold text-[#1d1d1d] truncate">{form.name || "Untitled Property"}</div>
                                                <span className="text-[9px] font-bold text-white rounded px-[6px] py-[2px] tracking-widest" style={{ backgroundColor: statusColor }}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Save */}
                                        <button type="button" onClick={handleSave} disabled={saving || activeTab === "Rooms" || activeTab === "Rates"}
                                            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                            {saving ? "Saving…" : "Save Changes"}
                                        </button>
                                        <a href={`/owner/properties/propertyDetails?id=${propertyId}`} className="no-underline block mt-2">
                                            <button type="button" className="w-full py-2 px-4 bg-white text-[#4f4f4f] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#f5f5f5]">
                                                Cancel
                                            </button>
                                        </a>
                                    </div>

                                    {/* Tabs overview */}
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                        <div className="text-[13px] font-bold text-[#953002] mb-2.5">Quick Edit</div>
                                        {TABS.map((t) => (
                                            <button key={t} onClick={() => setActiveTab(t)}
                                                className={`w-full text-left py-2 px-3 text-[12px] font-medium rounded-lg mb-1 border-none cursor-pointer transition-colors ${activeTab === t ? "bg-[#fef5ef] text-[#953002] font-bold" : "bg-transparent text-[#4f4f4f] hover:bg-[#f5f5f5]"}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Quick links */}
                                    <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                        <div className="text-[13px] font-bold text-[#953002] mb-2.5">Manage</div>
                                        <a href={`/owner/properties/propertyRoomInventry?id=${propertyId}`} className="no-underline block mb-1">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer">
                                                Room Inventory
                                            </button>
                                        </a>
                                        <a href={`/owner/properties/Rate?id=${propertyId}`} className="no-underline block mb-1">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer">
                                                Room Rates
                                            </button>
                                        </a>
                                        <a href={`/owner/properties/Setting?id=${propertyId}`} className="no-underline block">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer">
                                                <Settings size={12} className="inline mr-1.5" />Property Status
                                            </button>
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </main>
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
