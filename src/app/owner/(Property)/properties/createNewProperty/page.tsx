/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { imageApi } from "@/api/image/image.api";
import { propertiesApi } from "@/api/owner/properties.api";
import { roomsApi } from "@/api/owner/rooms.api";
import { ratesApi } from "@/api/owner/rates.api";
import { availabilityApi } from "@/api/owner/availability.api";
import { ownerSettingsApi } from "@/api/owner/settings.api";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, formatTime } from "@/components/owner/TimePicker";
import {
    Info,
    MapPin,
    Star,
    Image as ImageIcon,
    ShieldAlert,
    Plus,
    ChevronRight,
    X,
    Loader2,
    AlertCircle,
    LayoutGrid,
    DoorOpen,
    CalendarCheck,
    DollarSign,
    ClipboardList,
    Users,
    Settings,
    Trash2,
    Lock,
} from "lucide-react";

interface ImageEntry {
    id: string;
    localUrl: string;
    cloudUrl: string | null;
    uploading: boolean;
    error: string | null;
}

interface RoomDraft {
    id: string;
    name: string;
    roomType: string;
    bedType: string;
    maxOccupancy: string;
    maxChildren: string;
    pricePerNight: string;
    inventory: string;
}

interface DiscountDraft {
    id: string;
    name: string;
    percentage: string;
    startDate: string;
    endDate: string;
}

interface BlockDraft {
    id: string;
    roomId: string; // references RoomDraft.id, or "ALL" for every room
    startDate: string;
    endDate: string;
    reason: string;
}

interface RestrictionDraft {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
}

const ROOM_CATEGORIES = ["STANDARD_ROOM", "DELUXE_ROOM", "SUPERIOR_ROOM", "EXECUTIVE_ROOM", "TWIN_ROOM", "FAMILY_ROOM", "STUDIO_ROOM", "SUITE", "PRESIDENTIAL_SUITE", "VILLA"];
const BED_TYPES = ["SINGLE", "TWIN", "DOUBLE", "QUEEN", "KING", "SOFA_BED", "BUNK_BED"];
const RESTRICTION_TYPES: Record<string, string> = {
    "Minimum Length of Stay": "MIN_STAY",
    "Maximum Length of Stay": "MAX_STAY",
    "Closed to Arrival": "CLOSED_TO_ARRIVAL",
    "Advance Booking Required": "ADVANCE_NOTICE",
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function expandDateRange(start: string, end: string): string[] {
    if (!start || !end) return [];
    const dates: string[] = [];
    const cur = new Date(start);
    const last = new Date(end);
    while (cur <= last) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}

const NAV_STEPS = [
    { key: "overview", label: "Overview", icon: <LayoutGrid size={16} />, disabled: false, note: undefined as string | undefined },
    { key: "rooms", label: "Rooms", icon: <DoorOpen size={16} />, disabled: false, note: undefined as string | undefined },
    { key: "availability", label: "Availability", icon: <CalendarCheck size={16} />, disabled: false, note: undefined as string | undefined },
    { key: "rates", label: "Rates", icon: <DollarSign size={16} />, disabled: false, note: undefined as string | undefined },
    { key: "reservations", label: "Reservations", icon: <ClipboardList size={16} />, disabled: true, note: "Available after the property is created" as string | undefined },
    { key: "media", label: "Media", icon: <ImageIcon size={16} />, disabled: false, note: undefined as string | undefined },
    { key: "staff", label: "Staff", icon: <Users size={16} />, disabled: true, note: "Staff invitations aren't supported yet" as string | undefined },
    { key: "settings", label: "Settings", icon: <Settings size={16} />, disabled: false, note: undefined as string | undefined },
] as const;

type StepKey = typeof NAV_STEPS[number]["key"];

export default function CreateNewPropertyPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;
    const [saving, setSaving] = useState(false);
    const createdPropertyIdRef = useRef<number | null>(null);
    const roomIdMapRef = useRef<Record<string, number>>({});
    const [saveError, setSaveError] = useState<string | null>(null);
    const [step, setStep] = useState<StepKey>("overview");

    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        city: "",
        contact: "",
        email: "",
        rules: "",
    });

    const [checkIn, setCheckIn] = useState<TimeValue>({ hour: "2", minute: "00", period: "PM" });
    const [checkOut, setCheckOut] = useState<TimeValue>({ hour: "11", minute: "00", period: "AM" });

    const [amenities, setAmenities] = useState<Record<string, boolean>>({
        wifi: false, pool: false, parking: false, gym: false,
        kitchen: false, ac: false, petFriendly: false, smartTv: false,
    });

    const [images, setImages] = useState<ImageEntry[]>([]);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard step drafts
    const [roomDrafts, setRoomDrafts] = useState<RoomDraft[]>([]);
    const [discountDrafts, setDiscountDrafts] = useState<DiscountDraft[]>([]);
    const [blockDrafts, setBlockDrafts] = useState<BlockDraft[]>([]);
    const [restrictionDrafts, setRestrictionDrafts] = useState<RestrictionDraft[]>([]);

    // Settings step
    const [currency, setCurrency] = useState("LKR");
    const [taxRate, setTaxRate] = useState("");
    const [vatId, setVatId] = useState("");

    const toggleAmenity = (key: string) => setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
    const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

    const amenityList = [
        { key: "wifi", label: "Wifi" }, { key: "pool", label: "Pool" },
        { key: "parking", label: "Parking" }, { key: "gym", label: "Gym" },
        { key: "kitchen", label: "Kitchen" }, { key: "ac", label: "Air Conditioning" },
        { key: "petFriendly", label: "Pet Friendly" }, { key: "smartTv", label: "Smart TV" },
    ];

    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArr = Array.from(files);
        const remaining = 10 - images.length;
        if (remaining <= 0) return;
        const toAdd = fileArr.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024).slice(0, remaining);
        toAdd.forEach((file) => {
            const id = uid();
            const localUrl = URL.createObjectURL(file);
            setImages((prev) => [...prev, { id, localUrl, cloudUrl: null, uploading: true, error: null }]);
            imageApi.upload(file, "properties")
                .then((res: { url: string }) => {
                    setImages((prev) => prev.map((img) => img.id === id ? { ...img, cloudUrl: res.url, uploading: false } : img));
                })
                .catch((err: Error) => {
                    setImages((prev) => prev.map((img) => img.id === id ? { ...img, uploading: false, error: err?.message ?? "Upload failed" } : img));
                });
        });
    }, [images.length]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) processFiles(e.target.files);
        e.target.value = "";
    };
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
    }, [processFiles]);
    const removeImage = (id: string) => {
        setImages((prev) => {
            const entry = prev.find((img) => img.id === id);
            if (entry) URL.revokeObjectURL(entry.localUrl);
            return prev.filter((img) => img.id !== id);
        });
    };

    // Room entry form (one room at a time) — filled in, then "Add Room" confirms it into roomDrafts
    const emptyRoomEntry = (): RoomDraft => ({
        id: uid(), name: "", roomType: "STANDARD_ROOM", bedType: "KING",
        maxOccupancy: "2", maxChildren: "0", pricePerNight: "", inventory: "1",
    });
    const [roomEntry, setRoomEntry] = useState<RoomDraft>(emptyRoomEntry());
    const [roomEntryError, setRoomEntryError] = useState<string | null>(null);
    const updateRoomEntry = (key: keyof RoomDraft, val: string) => setRoomEntry((prev) => ({ ...prev, [key]: val }));
    const confirmAddRoom = () => {
        if (!roomEntry.name.trim()) { setRoomEntryError("Room name is required."); return; }
        if (!roomEntry.pricePerNight || isNaN(parseFloat(roomEntry.pricePerNight))) { setRoomEntryError("Enter a valid price per night."); return; }
        setRoomEntryError(null);
        setRoomDrafts((prev) => [...prev, roomEntry]);
        setRoomEntry(emptyRoomEntry());
    };
    const removeRoomDraft = (id: string) => setRoomDrafts((prev) => prev.filter((r) => r.id !== id));

    // Discount draft helpers
    const addDiscountDraft = () => setDiscountDrafts((prev) => [...prev, { id: uid(), name: "", percentage: "", startDate: "", endDate: "" }]);
    const updateDiscountDraft = (id: string, key: keyof DiscountDraft, val: string) =>
        setDiscountDrafts((prev) => prev.map((d) => d.id === id ? { ...d, [key]: val } : d));
    const removeDiscountDraft = (id: string) => setDiscountDrafts((prev) => prev.filter((d) => d.id !== id));

    // Block draft helpers
    const addBlockDraft = () => setBlockDrafts((prev) => [...prev, { id: uid(), roomId: roomDrafts[0]?.id ?? "ALL", startDate: "", endDate: "", reason: "" }]);
    const addBlockDraftForRoom = (roomId: string) => setBlockDrafts((prev) => [...prev, { id: uid(), roomId, startDate: "", endDate: "", reason: "" }]);
    const updateBlockDraft = (id: string, key: keyof BlockDraft, val: string) =>
        setBlockDrafts((prev) => prev.map((b) => b.id === id ? { ...b, [key]: val } : b));
    const removeBlockDraft = (id: string) => setBlockDrafts((prev) => prev.filter((b) => b.id !== id));

    // Restriction draft helpers
    const addRestrictionDraft = () => setRestrictionDrafts((prev) => [...prev, { id: uid(), name: "Minimum Length of Stay", type: "MIN_STAY", startDate: "", endDate: "", reason: "" }]);
    const updateRestrictionDraft = (id: string, key: keyof RestrictionDraft, val: string) =>
        setRestrictionDrafts((prev) => prev.map((r) => {
            if (r.id !== id) return r;
            const next = { ...r, [key]: val };
            if (key === "name") next.type = RESTRICTION_TYPES[val] || "OTHER";
            return next;
        }));
    const removeRestrictionDraft = (id: string) => setRestrictionDrafts((prev) => prev.filter((r) => r.id !== id));

    const handleCreateProperty = async () => {
        if (!form.name.trim()) {
            setSaveError("Property name is required.");
            setStep("overview");
            return;
        }
        setSaveError(null);
        setSaving(true);
        try {
            let propertyId = createdPropertyIdRef.current;
            if (!propertyId) {
                const selectedAmenities = Object.entries(amenities).filter(([, v]) => v).map(([k]) => k);
                const firstImageUrl = images.find((i) => i.cloudUrl)?.cloudUrl;

                const property = await propertiesApi.createProperty(ownerId, {
                    name: form.name,
                    description: form.description,
                    address: form.address,
                    city: form.city,
                    contactPhone: form.contact,
                    contactEmail: form.email,
                    checkIn: formatTime(checkIn),
                    checkOut: formatTime(checkOut),
                    houseRules: form.rules,
                    amenities: selectedAmenities,
                    imageUrl: firstImageUrl,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                propertyId = (property as any)?.id;
                if (!propertyId) throw new Error("Property was created but no ID was returned.");
                createdPropertyIdRef.current = propertyId;
            }

            // Rooms — keep a map from this wizard's local draft id to the real backend room id,
            // so later steps (Availability) can target a specific room. Reuse rooms already
            // created on a prior failed attempt instead of creating duplicates on retry.
            const roomIdMap: Record<string, number> = roomIdMapRef.current;
            for (const r of roomDrafts) {
                if (!r.name.trim() || !r.pricePerNight) continue;
                if (roomIdMap[r.id]) continue;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const created: any = await roomsApi.createRoom({
                    propertyId,
                    name: r.name.trim(),
                    roomCategory: r.roomType,
                    bedType: r.bedType,
                    maxOccupancy: parseInt(r.maxOccupancy) || 2,
                    maxChildren: parseInt(r.maxChildren) || 0,
                    pricePerNight: parseFloat(r.pricePerNight),
                    inventory: parseInt(r.inventory) || 1,
                    status: "AVAILABLE",
                });
                if (created?.id) roomIdMap[r.id] = created.id;
            }
            const createdRoomIds = Object.values(roomIdMap);

            // Rate discounts
            for (const d of discountDrafts) {
                if (!d.name.trim() || !d.percentage) continue;
                await ratesApi.createDiscount({
                    propertyId,
                    name: d.name.trim(),
                    type: "PERCENTAGE",
                    percentage: Number(d.percentage),
                    startDate: d.startDate || null,
                    endDate: d.endDate || null,
                    isActive: true,
                });
            }

            // Availability blocks — targets the specific room picked in the wizard,
            // or every created room when "All Rooms" was selected.
            for (const b of blockDrafts) {
                const dates = expandDateRange(b.startDate, b.endDate);
                if (!dates.length || createdRoomIds.length === 0) continue;

                if (b.roomId === "ALL") {
                    await availabilityApi.bulkUpdate({
                        propertyId,
                        dates,
                        newStatus: "blocked",
                        notes: b.reason || undefined,
                    });
                } else {
                    const targetRoomId = roomIdMap[b.roomId];
                    if (!targetRoomId) continue; // that room draft was never actually created
                    await availabilityApi.bulkUpdate({
                        propertyId,
                        roomId: targetRoomId,
                        dates,
                        newStatus: "blocked",
                        notes: b.reason || undefined,
                    });
                }
            }

            // Reservation restrictions (both dates are required by the backend — skip incomplete rows)
            for (const r of restrictionDrafts) {
                if (!r.name.trim() || !r.startDate || !r.endDate) continue;
                await ownerSettingsApi.createRestriction({
                    propertyId,
                    name: r.name,
                    type: r.type,
                    startDate: r.startDate,
                    endDate: r.endDate,
                    reason: r.reason,
                    isActive: true,
                });
            }

            // Property-level settings (currency/tax defaults for this property)
            if (currency || taxRate || vatId) {
                await propertiesApi.updateProperty(propertyId, ownerId, {
                    currency: currency || undefined,
                    taxRate: taxRate ? Number(taxRate) : undefined,
                    vatId: vatId || undefined,
                });
            }

            router.push(`/owner/properties`);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosMsg = (err as any)?.response?.data?.message;
            const msg = axiosMsg || (err instanceof Error ? err.message : "Failed to save property. Please try again.");
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border";

    return (
        <div className="flex-1 flex flex-col px-10 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 text-[12px] mb-1">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[var(--brand-primary)] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[var(--brand-primary)] font-semibold">Add New property</span>
                </div>

                <h1 className="text-[22px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Add New Property</h1>
                <p className="text-[12px] text-[#828282] m-0 mb-2.5">List your property on our platform. Provide accurate details to attract more guests. Nothing is saved until you click &quot;Create Property&quot;.</p>

                <div className="flex-1 overflow-y-auto pb-4 pr-1 w-full">
                    <div className="flex gap-5 items-start">
                        {/* Vertical Nav */}
                        <div className="w-[190px] shrink-0 flex flex-col gap-1">
                            {NAV_STEPS.map((item) => (
                                <button
                                    key={item.key}
                                    disabled={item.disabled}
                                    title={item.disabled ? item.note : undefined}
                                    onClick={() => !item.disabled && setStep(item.key)}
                                    className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] text-left transition-all duration-150 ${
                                        item.disabled
                                            ? "bg-transparent text-[#c0c0c0] font-medium cursor-not-allowed"
                                            : step === item.key
                                            ? "bg-[var(--brand-primary)] text-white font-bold cursor-pointer"
                                            : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5] cursor-pointer"
                                    }`}
                                >
                                    {item.disabled ? <Lock size={14} /> : item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 min-w-0">
                        {/* ═══════════ OVERVIEW STEP ═══════════ */}
                        {step === "overview" && (
                        <>
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">General Information</span>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Name</label>
                                <input type="text" placeholder="e.g. Azure Beachfront Villa" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Description</label>
                                <textarea placeholder="Highlight the unique features of your property..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={`${inputCls} resize-y min-h-[70px]`} />
                            </div>

                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin size={16} color="#e74c3c" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Location & Contact</span>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Street Address</label>
                                <input type="text" placeholder="123 Ocean Drive" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">City</label>
                                        <input type="text" placeholder="Miami" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Contact Number</label>
                                        <input type="text" placeholder="+1 (555) 000-0000" value={form.contact} onChange={(e) => update("contact", e.target.value)} className={inputCls} />
                                    </div>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Email Address</label>
                                <input type="email" placeholder="owner@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
                            </div>

                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star size={16} color="#ffb401" fill="#ffb401" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Amenities</span>
                                </div>
                                <div className="grid grid-cols-4 gap-y-2 gap-x-3">
                                    {amenityList.map((a) => (
                                        <label key={a.key} className="flex items-center gap-1.5 cursor-pointer">
                                            <input type="checkbox" checked={amenities[a.key]} onChange={() => toggleAmenity(a.key)} className="w-4 h-4 accent-[#953002] cursor-pointer" />
                                            <span className="text-[13px] text-[#4f4f4f]">{a.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

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
                                <textarea placeholder="No smoking inside, quiet hours after 10 PM..." value={form.rules} onChange={(e) => update("rules", e.target.value)} rows={2} className={`${inputCls} resize-y min-h-[50px]`} />
                            </div>
                        </>
                        )}

                        {/* ═══════════ ROOMS STEP ═══════════ */}
                        {step === "rooms" && (
                        <>
                            {/* Entry form for the room currently being defined */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <DoorOpen size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Add a Room</span>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Room Name</label>
                                <input type="text" placeholder="e.g. Deluxe King" value={roomEntry.name} onChange={(e) => updateRoomEntry("name", e.target.value)} className={inputCls} />
                                <div className="grid grid-cols-4 gap-2.5 mt-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Category</label>
                                        <select value={roomEntry.roomType} onChange={(e) => updateRoomEntry("roomType", e.target.value)} className={inputCls}>
                                            {ROOM_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Bed Type</label>
                                        <select value={roomEntry.bedType} onChange={(e) => updateRoomEntry("bedType", e.target.value)} className={inputCls}>
                                            {BED_TYPES.map((b) => <option key={b} value={b}>{b.replace(/_/g, " ")}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Max Occupancy</label>
                                        <input type="number" min="1" value={roomEntry.maxOccupancy} onChange={(e) => updateRoomEntry("maxOccupancy", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Price/Night</label>
                                        <input type="number" min="0" placeholder="0.00" value={roomEntry.pricePerNight} onChange={(e) => updateRoomEntry("pricePerNight", e.target.value)} className={inputCls} />
                                    </div>
                                </div>
                                {roomEntryError && (
                                    <div className="text-[12px] text-[#c0392b] font-medium mt-2">{roomEntryError}</div>
                                )}
                                <button onClick={confirmAddRoom} className="flex items-center gap-1.5 py-2 px-4 mt-3 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)]">
                                    <Plus size={14} /> Add This Room
                                </button>
                            </div>

                            {/* Confirmed rooms list */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Rooms Added ({roomDrafts.length})</span>
                                </div>
                                {roomDrafts.length === 0 && (
                                    <p className="text-[13px] text-[#828282] py-4 text-center">No rooms added yet. Fill in the form above and click &quot;Add This Room&quot;.</p>
                                )}
                                {roomDrafts.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between border border-[#e8e8e8] rounded-lg p-3 mb-2">
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">{r.name}</div>
                                            <div className="text-[11px] text-[#828282]">{r.roomType.replace(/_/g, " ")} · {r.bedType.replace(/_/g, " ")} bed · Sleeps {r.maxOccupancy} · {r.pricePerNight}/night</div>
                                        </div>
                                        <button onClick={() => removeRoomDraft(r.id)} className="shrink-0 bg-transparent border-none cursor-pointer p-1.5 text-[#e74c3c] hover:bg-[#fdecea] rounded"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </>
                        )}

                        {/* ═══════════ AVAILABILITY STEP ═══════════ */}
                        {step === "availability" && (
                        <>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                            <div className="flex items-center gap-2 mb-3">
                                <CalendarCheck size={16} color="#953002" />
                                <span className="text-[15px] font-bold text-[#1d1d1d]">Rooms Added ({roomDrafts.length})</span>
                            </div>
                            {roomDrafts.length === 0 ? (
                                <p className="text-[13px] text-[#828282] py-4 text-center">Add rooms in the <button onClick={() => setStep("rooms")} className="bg-transparent border-none p-0 text-[var(--brand-primary)] font-semibold cursor-pointer underline">Rooms</button> step first, then come back here to block specific dates per room.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {roomDrafts.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between border border-[#e8e8e8] rounded-lg p-3">
                                            <div>
                                                <div className="text-[14px] font-bold text-[#1d1d1d]">{r.name}</div>
                                                <div className="text-[12px] text-[#828282]">{r.roomType} · {r.bedType} bed · Sleeps {r.maxOccupancy}</div>
                                            </div>
                                            <button
                                                onClick={() => addBlockDraftForRoom(r.id)}
                                                className="flex items-center gap-1.5 py-1.5 px-3 border-none rounded-lg text-[12px] font-semibold bg-[var(--brand-primary)] text-white cursor-pointer hover:bg-[var(--primary-hover)]"
                                            >
                                                <Plus size={14} /> Block Dates
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Blocked Dates</span>
                                </div>
                                <button
                                    onClick={addBlockDraft}
                                    disabled={roomDrafts.length === 0}
                                    className={`flex items-center gap-1.5 py-1.5 px-3 border-none rounded-lg text-[12px] font-semibold ${roomDrafts.length === 0 ? "bg-[#e8e8e8] text-[#b0b0b0] cursor-not-allowed" : "bg-[var(--brand-primary)] text-white cursor-pointer hover:bg-[var(--primary-hover)]"}`}
                                >
                                    <Plus size={14} /> Add Blocked Range
                                </button>
                            </div>
                            <p className="text-[12px] text-[#828282] mb-3">Optional — block specific date ranges (e.g. for maintenance) for one room, or all rooms, once this property is created.</p>
                            {roomDrafts.length > 0 && blockDrafts.length === 0 && (
                                <p className="text-[13px] text-[#828282] py-4 text-center">No blocked dates yet. Use &quot;Block Dates&quot; above on a specific room, or &quot;Add Blocked Range&quot; here.</p>
                            )}
                            {blockDrafts.map((b) => (
                                <div key={b.id} className="border border-[#e8e8e8] rounded-lg p-3.5 mb-2.5 grid grid-cols-[1.2fr_1fr_1fr_1.3fr_auto] gap-2.5 items-end">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Room</label>
                                        <select value={b.roomId} onChange={(e) => updateBlockDraft(b.id, "roomId", e.target.value)} className={inputCls}>
                                            <option value="ALL">All Rooms</option>
                                            {roomDrafts.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Start Date</label>
                                        <input type="date" value={b.startDate} onChange={(e) => updateBlockDraft(b.id, "startDate", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">End Date</label>
                                        <input type="date" value={b.endDate} onChange={(e) => updateBlockDraft(b.id, "endDate", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Reason</label>
                                        <input type="text" placeholder="e.g. Maintenance" value={b.reason} onChange={(e) => updateBlockDraft(b.id, "reason", e.target.value)} className={inputCls} />
                                    </div>
                                    <button onClick={() => removeBlockDraft(b.id)} className="bg-transparent border-none cursor-pointer p-1.5 text-[#e74c3c] hover:bg-[#fdecea] rounded"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        </>
                        )}

                        {/* ═══════════ RATES STEP ═══════════ */}
                        {step === "rates" && (
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Discounts & Promotions</span>
                                </div>
                                <button onClick={addDiscountDraft} className="flex items-center gap-1.5 py-1.5 px-3 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)]">
                                    <Plus size={14} /> Add Discount
                                </button>
                            </div>
                            <p className="text-[12px] text-[#828282] mb-3">Room base prices are set per room in the Rooms step. Add optional promotional discounts here.</p>
                            {discountDrafts.length === 0 && (
                                <p className="text-[13px] text-[#828282] py-4 text-center">No discounts added yet.</p>
                            )}
                            {discountDrafts.map((d) => (
                                <div key={d.id} className="border border-[#e8e8e8] rounded-lg p-3.5 mb-2.5 grid grid-cols-[1.5fr_0.8fr_1fr_1fr_auto] gap-2.5 items-end">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Promo Name</label>
                                        <input type="text" placeholder="e.g. Early Bird" value={d.name} onChange={(e) => updateDiscountDraft(d.id, "name", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">%</label>
                                        <input type="number" min="0" max="100" value={d.percentage} onChange={(e) => updateDiscountDraft(d.id, "percentage", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Start</label>
                                        <input type="date" value={d.startDate} onChange={(e) => updateDiscountDraft(d.id, "startDate", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">End</label>
                                        <input type="date" value={d.endDate} onChange={(e) => updateDiscountDraft(d.id, "endDate", e.target.value)} className={inputCls} />
                                    </div>
                                    <button onClick={() => removeDiscountDraft(d.id)} className="bg-transparent border-none cursor-pointer p-1.5 text-[#e74c3c] hover:bg-[#fdecea] rounded"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        )}

                        {/* ═══════════ MEDIA STEP ═══════════ */}
                        {step === "media" && (
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                            <div className="flex items-center gap-2 mb-3">
                                <ImageIcon size={16} color="#953002" />
                                <span className="text-[15px] font-bold text-[#1d1d1d]">Property Media</span>
                                <span className="ml-auto text-[11px] text-[#b0b0b0]">{images.length}/10 photos</span>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
                            <div
                                onClick={() => images.length < 10 && fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-1 transition-colors ${
                                    images.length >= 10 ? "cursor-not-allowed border-[#e0e0e0] bg-[#f5f5f5]"
                                        : dragging ? "cursor-copy border-[var(--brand-primary)] bg-[#fef5ef]"
                                        : "cursor-pointer border-[#e0e0e0] bg-[#fefcfa] hover:border-[var(--brand-primary)] hover:bg-[#fef5ef]"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${dragging ? "bg-[var(--brand-primary)]" : "bg-[#fef5ef]"}`}>
                                    <ImageIcon size={24} color={dragging ? "#fff" : "#953002"} />
                                </div>
                                <div className="font-semibold text-[13px] text-[#1d1d1d]">{dragging ? "Drop images here" : "Click or drag images here"}</div>
                                <div className="text-[11px] text-[#b0b0b0]">PNG, JPG up to 10MB each (max 10 photos)</div>
                            </div>
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-2.5 mt-3">
                                    {images.map((img) => (
                                        <div key={img.id} className="relative w-16 h-12 rounded-md overflow-hidden border-2 border-[#e0e0e0] group">
                                            <img src={img.localUrl} alt="" className="w-full h-full object-cover" />
                                            {img.uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 size={16} color="#fff" className="animate-spin" />
                                                </div>
                                            )}
                                            {img.error && (
                                                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center" title={img.error}>
                                                    <AlertCircle size={16} color="#fff" />
                                                </div>
                                            )}
                                            {img.cloudUrl && !img.uploading && (
                                                <div className="absolute inset-0 border-2 border-[#2e7d32] rounded-md pointer-events-none" />
                                            )}
                                            {!img.uploading && (
                                                <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0">
                                                    <X size={10} color="#fff" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {images.length < 10 && (
                                        <div onClick={() => fileInputRef.current?.click()} className="w-16 h-12 rounded-md border-2 border-dashed border-[#e0e0e0] flex items-center justify-center cursor-pointer bg-[#fafafa] hover:border-[var(--brand-primary)] hover:bg-[#fef5ef] transition-colors">
                                            <Plus size={18} color="#b0b0b0" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="text-[11px] text-[#b0b0b0] mt-2">Note: the first photo becomes the property&apos;s cover image. Photos upload immediately; they&apos;ll be attached once you create the property.</p>
                        </div>
                        )}

                        {/* ═══════════ SETTINGS STEP ═══════════ */}
                        {step === "settings" && (
                        <>
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <Settings size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Pricing Defaults</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Currency</label>
                                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                                            <option>LKR</option><option>USD</option><option>EUR</option><option>GBP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Tax Rate (%)</label>
                                        <input type="number" min="0" placeholder="8.5" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">VAT ID</label>
                                        <input type="text" placeholder="Optional" value={vatId} onChange={(e) => setVatId(e.target.value)} className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5 mb-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Reservation Restrictions</span>
                                    </div>
                                    <button onClick={addRestrictionDraft} className="flex items-center gap-1.5 py-1.5 px-3 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--primary-hover)]">
                                        <Plus size={14} /> Add Restriction
                                    </button>
                                </div>
                                {restrictionDrafts.length === 0 && (
                                    <p className="text-[13px] text-[#828282] py-4 text-center">No restrictions added yet.</p>
                                )}
                                {restrictionDrafts.map((r) => (
                                    <div key={r.id} className="border border-[#e8e8e8] rounded-lg p-3.5 mb-2.5 grid grid-cols-[1.5fr_1fr_1fr_auto] gap-2.5 items-end">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Rule</label>
                                            <select value={r.name} onChange={(e) => updateRestrictionDraft(r.id, "name", e.target.value)} className={inputCls}>
                                                {Object.keys(RESTRICTION_TYPES).map((k) => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">Start *</label>
                                            <input type="date" value={r.startDate} onChange={(e) => updateRestrictionDraft(r.id, "startDate", e.target.value)} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#4f4f4f] mb-1">End *</label>
                                            <input type="date" value={r.endDate} onChange={(e) => updateRestrictionDraft(r.id, "endDate", e.target.value)} className={inputCls} />
                                        </div>
                                        <button onClick={() => removeRestrictionDraft(r.id)} className="bg-transparent border-none cursor-pointer p-1.5 text-[#e74c3c] hover:bg-[#fdecea] rounded"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                {restrictionDrafts.some((r) => !r.startDate || !r.endDate) && (
                                    <p className="text-[12px] text-[#c0392b] font-medium mt-1">Restrictions with a missing Start or End date will be skipped when the property is created.</p>
                                )}
                            </div>
                        </>
                        )}

                        {/* ── Error Banner ── */}
                        {saveError && (
                            <div className="mb-2 px-4 py-2 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b] font-medium">
                                {saveError}
                            </div>
                        )}

                        {/* ── Action Buttons ── */}
                        {step === "settings" ? (
                            <div className="flex gap-3 pt-2 pb-3">
                                <button
                                    disabled={saving}
                                    onClick={handleCreateProperty}
                                    className={`flex items-center gap-2 py-2.5 px-7 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-semibold transition-colors ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-[var(--primary-hover)]"}`}
                                >
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? "Creating..." : "Create Property"}
                                </button>
                                <a href="/owner/properties" className="no-underline">
                                    <button className="py-2.5 px-7 bg-[#e8e8e8] text-[#4f4f4f] border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#d0d0d0] transition-colors">Cancel</button>
                                </a>
                            </div>
                        ) : (
                            <div className="flex gap-3 pt-2 pb-3">
                                <a href="/owner/properties" className="no-underline">
                                    <button className="py-2.5 px-7 bg-[#e8e8e8] text-[#4f4f4f] border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#d0d0d0] transition-colors">Cancel</button>
                                </a>
                                <p className="text-[12px] text-[#b0b0b0] flex items-center m-0">Fill in the remaining steps, then go to <button onClick={() => setStep("settings")} className="bg-transparent border-none p-0 text-[var(--brand-primary)] font-semibold cursor-pointer underline">Settings</button> to create the property.</p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
        </div>
    );
}
