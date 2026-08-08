/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { imageApi } from "@/api/image/image.api";
import { propertiesApi } from "@/api/owner/properties.api";
import { roomsApi } from "@/api/owner/rooms.api";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, formatTime } from "@/components/owner/TimePicker";
import {
    Info,
    MapPin,
    Star,
    Tag,
    Image as ImageIcon,
    ShieldAlert,
    Plus,
    Bell,
    ChevronRight,
    ChevronDown,
    X,
    Loader2,
    AlertCircle,
    Building2,
    BedDouble,
    Sparkles,
    Trash2,
    Users,
    Settings,
} from "lucide-react";

interface ImageEntry {
    id: string;
    localUrl: string;
    cloudUrl: string | null;
    uploading: boolean;
    error: string | null;
}

interface DraftRoom {
    draftId: string;
    name: string;
    type: string;
    bedType: string;
    maxAdults: number;
    maxChildren: number;
    inventory: number;
    pricePerNight: number;
    description: string;
}

const TABS = ["General", "Rooms", "Rates", "Media", "Settings"];
const LOCKED_TABS = new Set<string>([]);

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

const PROPERTY_TYPES = [
    "Hotel", "Villa", "Apartment", "Resort", "Guesthouse",
    "Hostel", "Boutique Hotel", "Motel", "Lodge", "Cottage",
];

const AMENITY_LIST = [
    { key: "wifi",           label: "WiFi" },
    { key: "pool",           label: "Pool" },
    { key: "parking",        label: "Parking" },
    { key: "gym",            label: "Gym" },
    { key: "kitchen",        label: "Kitchen" },
    { key: "ac",             label: "Air Conditioning" },
    { key: "smartTv",        label: "Smart TV" },
    { key: "spa",            label: "Spa" },
    { key: "beachAccess",    label: "Beach Access" },
    { key: "restaurant",     label: "Restaurant/Bar" },
    { key: "concierge",      label: "Concierge" },
    { key: "laundry",        label: "Laundry" },
];

const FLAG_LIST = [
    { key: "freeCancellation",  label: "Free Cancellation",  desc: "Guests can cancel at no charge" },
    { key: "breakfastIncluded", label: "Breakfast Included",  desc: "Complimentary breakfast provided" },
    { key: "petFriendly",       label: "Pet Friendly",        desc: "Pets are welcome at this property" },
    { key: "accessibility",     label: "Accessibility",       desc: "Accessible facilities available" },
];

const LOCKED_TAB_INFO: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
    Rates: {
        icon: <Star size={32} color="#953002" />,
        title: "Pricing & Rates",
        description: "Set seasonal pricing, weekend rates and special offers once the property has been saved.",
    },
    Staff: {
        icon: <Users size={32} color="#953002" />,
        title: "Staff Management",
        description: "Add staff members and assign access permissions after creating the property.",
    },
};

export default function CreateNewPropertyPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab]   = useState("General");
    const [saving, setSaving]         = useState(false);
    const [saveError, setSaveError]   = useState<string | null>(null);

    // ── Overview form ──────────────────────────────────────────────────
    const [form, setForm] = useState({
        name: "", description: "", propertyType: "",
        address: "", city: "", country: "", contact: "", email: "",
    });
    const [checkIn,  setCheckIn]  = useState<TimeValue>({ hour: "2",  minute: "00", period: "PM" });
    const [checkOut, setCheckOut] = useState<TimeValue>({ hour: "11", minute: "00", period: "AM" });
    const [amenities, setAmenities] = useState<Record<string, boolean>>(
        Object.fromEntries(AMENITY_LIST.map((a) => [a.key, false]))
    );
    const [flags, setFlags] = useState<Record<string, boolean>>(
        Object.fromEntries(FLAG_LIST.map((f) => [f.key, false]))
    );
    const [rules, setRules]                         = useState("");
    const [showTypeDropdown, setShowTypeDropdown]   = useState(false);

    // ── Rooms tab ──────────────────────────────────────────────────────
    const [draftRooms, setDraftRooms]       = useState<DraftRoom[]>([]);
    const [showRoomForm, setShowRoomForm]   = useState(false);
    const [roomForm, setRoomForm]           = useState({
        name: "", type: "STANDARD_ROOM", bedType: "KING",
        maxAdults: "2", maxChildren: "0", inventory: "1",
        pricePerNight: "", description: "",
    });
    const [roomFormError, setRoomFormError] = useState<string | null>(null);

    // ── Staff tab ──────────────────────────────────────────────────────

    // ── Media tab ──────────────────────────────────────────────────────
    const [images, setImages]   = useState<ImageEntry[]>([]);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
    const toggleAmenity = (key: string) => setAmenities((p) => ({ ...p, [key]: !p[key] }));
    const toggleFlag    = (key: string) => setFlags((p)    => ({ ...p, [key]: !p[key] }));

    // ── Image handling ─────────────────────────────────────────────────
    const processFiles = useCallback((files: FileList | File[]) => {
        const remaining = 10 - images.length;
        if (remaining <= 0) return;
        Array.from(files)
            .filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
            .slice(0, remaining)
            .forEach((file) => {
                const id = `${Date.now()}-${Math.random()}`;
                setImages((prev) => [...prev, { id, localUrl: URL.createObjectURL(file), cloudUrl: null, uploading: true, error: null }]);
                imageApi.upload(file, "properties")
                    .then((res: { url: string }) => setImages((prev) => prev.map((img) => img.id === id ? { ...img, cloudUrl: res.url, uploading: false } : img)))
                    .catch((err: Error) => setImages((prev) => prev.map((img) => img.id === id ? { ...img, uploading: false, error: err?.message ?? "Upload failed" } : img)));
            });
    }, [images.length]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) processFiles(e.target.files);
        e.target.value = "";
    };
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
    }, [processFiles]);
    const removeImage = (id: string) => {
        setImages((prev) => {
            const entry = prev.find((img) => img.id === id);
            if (entry) URL.revokeObjectURL(entry.localUrl);
            return prev.filter((img) => img.id !== id);
        });
    };

    // ── Add draft room ─────────────────────────────────────────────────
    function addDraftRoom() {
        if (!roomForm.name.trim()) { setRoomFormError("Room name is required."); return; }
        setRoomFormError(null);
        setDraftRooms((prev) => [...prev, {
            draftId: `${Date.now()}-${Math.random()}`,
            name: roomForm.name,
            type: roomForm.type,
            bedType: roomForm.bedType,
            maxAdults: parseInt(roomForm.maxAdults) || 2,
            maxChildren: parseInt(roomForm.maxChildren) || 0,
            inventory: parseInt(roomForm.inventory) || 1,
            pricePerNight: 0,
            description: roomForm.description,
        }]);
        setRoomForm({ name: "", type: "STANDARD_ROOM", bedType: "KING", maxAdults: "2", maxChildren: "0", inventory: "1", pricePerNight: "", description: "" });
        setShowRoomForm(false);
    }

    // ── Main save ──────────────────────────────────────────────────────
    async function handleSave() {
        if (!form.name.trim()) { setSaveError("Property name is required."); setActiveTab("General"); return; }
        setSaveError(null);
        setSaving(true);
        try {
            const selectedAmenities = Object.entries(amenities).filter(([, v]) => v).map(([k]) => k);
            const uploadedUrls      = images.filter((i) => i.cloudUrl).map((i) => i.cloudUrl as string);

            const created = await propertiesApi.createProperty(user?.userId ?? 1, {
                name:               form.name,
                description:        form.description,
                propertyType:       form.propertyType,
                address:            form.address,
                city:               form.city,
                country:            form.country,
                contactPhone:       form.contact,
                contactEmail:       form.email,
                checkIn:            formatTime(checkIn),
                checkOut:           formatTime(checkOut),
                houseRules:         rules,
                amenities:          selectedAmenities,
                imageUrl:           uploadedUrls[0] ?? undefined,
                imageUrls:          uploadedUrls.length > 0 ? uploadedUrls : undefined,
                freeCancellation:   flags.freeCancellation,
                breakfastIncluded:  flags.breakfastIncluded,
                petFriendly:        flags.petFriendly,
                accessibility:      flags.accessibility,
            });

            const propertyId = created?.id;
            if (propertyId && draftRooms.length > 0) {
                await Promise.all(draftRooms.map((room) =>
                    roomsApi.createRoom({
                        propertyId,
                        name:           room.name,
                        roomType:       room.type,
                        bedType:        room.bedType,
                        maxAdults:      room.maxAdults,
                        maxChildren:    room.maxChildren,
                        inventory:      room.inventory,
                        pricePerNight:  room.pricePerNight,
                        description:    room.description,
                        status:         "AVAILABLE",
                    })
                ));
            }

            router.push("/owner/properties");
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosMsg = (err as any)?.response?.data?.message;
            setSaveError(axiosMsg || (err instanceof Error ? err.message : "Failed to save property. Please try again."));
        } finally {
            setSaving(false);
        }
    }

    const firstUploadedImage = images.find((i) => i.cloudUrl)?.cloudUrl ?? null;

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Sidebar ── */}

            <OwnerSidebar />

            {/* ── Main ── */}
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
                    <span className="text-[#953002] font-semibold">Add New Property</span>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pb-6 pr-1">

                    {/* ── Property Header Card ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-[14px] py-3.5 px-5 flex items-center justify-between mb-0">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-dashed border-[#953002] bg-[#fef5ef] flex items-center justify-center">
                                {firstUploadedImage ? (
                                    <img src={firstUploadedImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={28} color="#c0a898" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => update("name", e.target.value)}
                                        placeholder="Enter Property Name"
                                        className="text-[20px] font-extrabold text-[#1d1d1d] bg-transparent border-none outline-none placeholder-[#c0c0c0] min-w-0 flex-1"
                                    />
                                    <span className="text-[9px] font-bold text-white bg-[#b0b0b0] rounded px-[7px] py-[2px] tracking-widest shrink-0">DRAFT</span>
                                </div>
                                <div className="text-[12px] text-[#828282] mt-0.5 truncate">
                                    {[form.address, form.city, form.country].filter(Boolean).join(", ") || "Address · City · Country"}
                                </div>
                                <div className="text-[12px] text-[#4f4f4f] mt-1 flex items-center gap-3">
                                    <span>{draftRooms.length} {draftRooms.length === 1 ? "Room" : "Rooms"} added</span>
                                    {form.propertyType && <span>· {form.propertyType}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2.5 shrink-0 ml-4">
                            <a href="/owner/properties" className="no-underline">
                                <button className="flex items-center gap-1.5 py-2 px-4 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-gray-50">
                                    Cancel
                                </button>
                            </a>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-bold ${saving ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-[#b03a02]"}`}
                            >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                                {saving ? "Creating..." : "Create Property"}
                            </button>
                        </div>
                    </div>

                    {/* Error banner */}
                    {saveError && (
                        <div className="mt-2 px-4 py-2 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b] font-medium flex items-center gap-2">
                            <AlertCircle size={14} />{saveError}
                        </div>
                    )}

                    {/* ── Tabs ── */}
                    <div className="flex border-b border-[#e8e8e8] mt-2 mb-3">
                        {TABS.map((t) => {
                            const locked = LOCKED_TABS.has(t);
                            return (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`bg-transparent py-2.5 px-4 text-[13px] transition-all duration-150 border-b-2 flex items-center gap-1 ${
                                        activeTab === t
                                            ? "text-[#953002] font-bold border-[#953002] cursor-pointer"
                                            : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f] cursor-pointer"
                                    }`}
                                >
                                    {t}
                                    {t === "Rooms" && draftRooms.length > 0 && (
                                        <span className="ml-0.5 bg-[#953002] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                            {draftRooms.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Tab content + persistent Setup Progress ── */}
                    <div className="grid grid-cols-[1fr_260px] gap-4 items-start">
                    <div className="min-w-0">

                    {/* ── Info placeholder for tabs that need an existing property ── */}
                    {LOCKED_TABS.has(activeTab) && (
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-14 flex flex-col items-center gap-3 text-center px-8">
                            {LOCKED_TAB_INFO[activeTab]?.icon}
                            <div className="text-[16px] font-bold text-[#1d1d1d] mt-1">{LOCKED_TAB_INFO[activeTab]?.title}</div>
                            <div className="text-[13px] text-[#828282] max-w-[420px] leading-relaxed">{LOCKED_TAB_INFO[activeTab]?.description}</div>
                        </div>
                    )}

                    {/* ── General Tab ── */}
                    {activeTab === "General" && (
                        <div className="flex flex-col gap-3">
                                {/* General Info */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">General Information</span>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">
                                        Property Display Name <span className="text-[#e74c3c]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Azure Beachfront Villa"
                                        value={form.name}
                                        onChange={(e) => update("name", e.target.value)}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border"
                                    />
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Description</label>
                                    <textarea
                                        placeholder="Highlight the unique features of your property..."
                                        value={form.description}
                                        onChange={(e) => update("description", e.target.value)}
                                        rows={3}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none bg-white box-border resize-y min-h-[70px]"
                                    />
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Property Type</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTypeDropdown((p) => !p)}
                                                    className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-left bg-white outline-none flex items-center justify-between cursor-pointer"
                                                >
                                                    <span className={form.propertyType ? "text-[#1d1d1d]" : "text-[#b0b0b0]"}>
                                                        {form.propertyType || "Select type"}
                                                    </span>
                                                    <ChevronDown size={14} color="#b0b0b0" />
                                                </button>
                                                {showTypeDropdown && (
                                                    <div className="absolute top-full left-0 right-0 z-10 bg-white border border-[#e0e0e0] rounded-lg shadow-lg mt-0.5 overflow-hidden">
                                                        {PROPERTY_TYPES.map((t) => (
                                                            <button
                                                                key={t} type="button"
                                                                onClick={() => { update("propertyType", t); setShowTypeDropdown(false); }}
                                                                className="w-full text-left px-3 py-2 text-[13px] text-[#1d1d1d] hover:bg-[#fef5ef] cursor-pointer border-none bg-transparent"
                                                            >{t}</button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-in Time</label>
                                                <TimePicker value={checkIn} onChange={setCheckIn} />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-out Time</label>
                                                <TimePicker value={checkOut} onChange={setCheckOut} />
                                            </div>
                                        </div>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1.5 mt-3">Amenities</label>
                                    <div className="grid grid-cols-4 gap-y-2.5 gap-x-3">
                                        {AMENITY_LIST.map((a) => (
                                            <label key={a.key} className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={amenities[a.key] || false}
                                                    onChange={() => toggleAmenity(a.key)}
                                                    className="w-4 h-4 accent-[#953002] cursor-pointer"
                                                />
                                                <span className="text-[13px] text-[#4f4f4f]">{a.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin size={16} color="#e74c3c" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Location & Map</span>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Street Address</label>
                                    <input
                                        type="text" placeholder="123 Ocean Drive"
                                        value={form.address} onChange={(e) => update("address", e.target.value)}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white box-border"
                                    />
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">City</label>
                                            <input
                                                type="text" placeholder="Colombo"
                                                value={form.city} onChange={(e) => update("city", e.target.value)}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white box-border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Country</label>
                                            <input
                                                type="text" placeholder="Sri Lanka"
                                                value={form.country} onChange={(e) => update("country", e.target.value)}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white box-border"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 rounded-lg overflow-hidden h-[110px] bg-gradient-to-br from-[#f0ebe5] to-[#e8e0d8] flex flex-col items-center justify-center gap-1">
                                        <MapPin size={28} color="#953002" />
                                        <div className="text-[11px] text-[#828282]">Map preview — enter address above</div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Contact Info</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Phone</label>
                                            <input
                                                type="text" placeholder="+94 77 000 0000"
                                                value={form.contact} onChange={(e) => update("contact", e.target.value)}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white box-border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Email</label>
                                            <input
                                                type="email" placeholder="owner@example.com"
                                                value={form.email} onChange={(e) => update("email", e.target.value)}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white box-border"
                                            />
                                        </div>
                                    </div>
                                </div>

                        </div>
                    )}

                    {/* ── Rooms Tab ── */}
                    {activeTab === "Rooms" && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Add Rooms</span>
                                    <span className="ml-2 text-[12px] text-[#828282]">Rooms will be saved together with the property</span>
                                </div>
                                {!showRoomForm && (
                                    <button
                                        onClick={() => { setShowRoomForm(true); setRoomFormError(null); }}
                                        className="flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]"
                                    >
                                        <Plus size={14} /> Add Room
                                    </button>
                                )}
                            </div>

                            {/* Room form */}
                            {showRoomForm && (
                                <div className="bg-white border-2 border-dashed border-[#953002] rounded-xl py-4 px-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">New Room Details</span>
                                        <button
                                            onClick={() => { setShowRoomForm(false); setRoomFormError(null); }}
                                            className="bg-transparent border-none cursor-pointer p-1 hover:bg-[#f5f5f5] rounded"
                                        >
                                            <X size={16} color="#828282" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Room Name <span className="text-[#e74c3c]">*</span></label>
                                            <input
                                                type="text" placeholder="e.g. Deluxe Ocean View"
                                                value={roomForm.name}
                                                onChange={(e) => setRoomForm((p) => ({ ...p, name: e.target.value }))}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Room Type</label>
                                            <select
                                                value={roomForm.type}
                                                onChange={(e) => setRoomForm((p) => ({ ...p, type: e.target.value }))}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white"
                                            >
                                                {ROOM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Bed Type</label>
                                            <select
                                                value={roomForm.bedType}
                                                onChange={(e) => setRoomForm((p) => ({ ...p, bedType: e.target.value }))}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white"
                                            >
                                                {BED_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Inventory (no. of rooms)</label>
                                            <input
                                                type="number" min="1"
                                                value={roomForm.inventory}
                                                onChange={(e) => setRoomForm((p) => ({ ...p, inventory: e.target.value }))}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Max Adults</label>
                                            <input
                                                type="number" min="1"
                                                value={roomForm.maxAdults}
                                                onChange={(e) => setRoomForm((p) => ({ ...p, maxAdults: e.target.value }))}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Max Children</label>
                                            <input
                                                type="number" min="0"
                                                value={roomForm.maxChildren}
                                                onChange={(e) => setRoomForm((p) => ({ ...p, maxChildren: e.target.value }))}
                                                className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white"
                                            />
                                        </div>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Description</label>
                                    <textarea
                                        placeholder="Brief description of this room..."
                                        value={roomForm.description}
                                        onChange={(e) => setRoomForm((p) => ({ ...p, description: e.target.value }))}
                                        rows={2}
                                        className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white resize-y min-h-[50px]"
                                    />
                                    {roomFormError && (
                                        <div className="mt-2 text-[12px] text-[#e74c3c] flex items-center gap-1.5">
                                            <AlertCircle size={13} /> {roomFormError}
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={addDraftRoom}
                                            className="flex items-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]"
                                        >
                                            <Plus size={13} /> Add to List
                                        </button>
                                        <button
                                            onClick={() => { setShowRoomForm(false); setRoomFormError(null); }}
                                            className="py-2 px-4 bg-[#f5f5f5] text-[#4f4f4f] border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#e0e0e0]"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {draftRooms.length === 0 && !showRoomForm && (
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-12 flex flex-col items-center gap-2">
                                    <BedDouble size={38} color="#e0e0e0" />
                                    <div className="text-[13px] text-[#b0b0b0]">No rooms added yet</div>
                                    <button
                                        onClick={() => { setShowRoomForm(true); setRoomFormError(null); }}
                                        className="mt-1 text-[12px] text-[#953002] font-semibold border-none bg-transparent cursor-pointer underline"
                                    >
                                        Add your first room →
                                    </button>
                                </div>
                            )}

                            {/* Draft rooms list */}
                            {draftRooms.map((room) => (
                                <div key={room.draftId} className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-lg bg-[#fef5ef] flex items-center justify-center shrink-0">
                                            <BedDouble size={20} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">{room.name}</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5">
                                                {ROOM_TYPES.find((r) => r.value === room.type)?.label}
                                                {" · "}{BED_TYPES.find((b) => b.value === room.bedType)?.label} Bed
                                                {" · "}{room.maxAdults} Adults
                                                {" · "}{room.inventory} {room.inventory === 1 ? "unit" : "units"}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDraftRooms((prev) => prev.filter((r) => r.draftId !== room.draftId))}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#fdecea] border-none cursor-pointer hover:bg-[#f8d7da]"
                                    >
                                        <Trash2 size={14} color="#e74c3c" />
                                    </button>
                                </div>
                            ))}

                            {draftRooms.length > 0 && (
                                <div className="bg-[#fef5ef] border border-[#f0cdb4] rounded-xl py-3 px-4 text-[12px] text-[#953002]">
                                    <strong>{draftRooms.length}</strong> room{draftRooms.length > 1 ? "s" : ""} will be created when you click <strong>Create Property</strong>.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Rates Tab ── */}
                    {activeTab === "Rates" && (
                        <div className="flex flex-col gap-4">
                            {/* Room Base Rates */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
                                    <Tag size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Room Base Rates</span>
                                    <span className="ml-auto text-[11px] text-[#828282]">Set the nightly rate for each room</span>
                                </div>

                                {draftRooms.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-14 gap-2 text-center">
                                        <BedDouble size={36} color="#e0e0e0" />
                                        <div className="text-[13px] text-[#b0b0b0]">No rooms added yet</div>
                                        <button
                                            onClick={() => setActiveTab("Rooms")}
                                            className="mt-1 text-[12px] text-[#953002] font-semibold border-none bg-transparent cursor-pointer underline"
                                        >
                                            Go to Rooms tab to add rooms →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#f5f5f5]">
                                        {/* Header row */}
                                        <div className="grid grid-cols-[2fr_1fr_1fr_160px] gap-4 px-5 py-2.5 bg-[#fafafa]">
                                            <span className="text-[10px] font-bold text-[#828282] tracking-widest">ROOM NAME</span>
                                            <span className="text-[10px] font-bold text-[#828282] tracking-widest">TYPE</span>
                                            <span className="text-[10px] font-bold text-[#828282] tracking-widest">BED</span>
                                            <span className="text-[10px] font-bold text-[#828282] tracking-widest">BASE RATE / NIGHT</span>
                                        </div>
                                        {draftRooms.map((room) => (
                                            <div key={room.draftId} className="grid grid-cols-[2fr_1fr_1fr_160px] gap-4 px-5 py-3.5 items-center hover:bg-[#fef9f7] transition-colors">
                                                <div>
                                                    <div className="text-[13px] font-semibold text-[#1d1d1d]">{room.name}</div>
                                                    <div className="text-[11px] text-[#b0b0b0] mt-0.5">{room.inventory} unit{room.inventory > 1 ? "s" : ""} · {room.maxAdults} adults</div>
                                                </div>
                                                <span className="text-[12px] text-[#4f4f4f]">{ROOM_TYPES.find((t) => t.value === room.type)?.label ?? room.type}</span>
                                                <span className="text-[12px] text-[#4f4f4f]">{BED_TYPES.find((b) => b.value === room.bedType)?.label ?? room.bedType}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[12px] text-[#828282] font-medium shrink-0">LKR</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={room.pricePerNight}
                                                        onChange={(e) => setDraftRooms((prev) => prev.map((r) =>
                                                            r.draftId === room.draftId
                                                                ? { ...r, pricePerNight: parseFloat(e.target.value) || 0 }
                                                                : r
                                                        ))}
                                                        className="w-full py-1.5 px-2.5 border border-[#e0e0e0] rounded-lg text-[13px] font-semibold text-[#1d1d1d] outline-none bg-white focus:border-[#953002] transition-colors"
                                                    />
                                                    <span className="text-[11px] text-[#b0b0b0] shrink-0">/night</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Weekend Multiplier */}
                            {draftRooms.length > 0 && (
                                <div className="bg-white border border-[#e8e8e8] rounded-xl px-5 py-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star size={15} color="#953002" />
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">Weekend Pricing</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#1d1d1d]">Weekend Rate Multiplier</div>
                                            <div className="text-[11px] text-[#b0b0b0] mt-0.5">Applies to Friday & Saturday nights</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number" min="1" max="5" step="0.1"
                                                defaultValue="1.2"
                                                className="w-20 py-1.5 px-2.5 border border-[#e0e0e0] rounded-lg text-[13px] font-semibold text-[#1d1d1d] outline-none bg-white focus:border-[#953002] transition-colors text-center"
                                            />
                                            <span className="text-[12px] text-[#828282]">× base rate</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Advanced rates note */}
                            <div className="bg-[#fef5ef] border border-[#f0cdb4] rounded-xl py-3 px-4 text-[12px] text-[#953002]">
                                Special discounts and seasonal pricing will be available in the <strong>Rate</strong> tab after creating the property.
                            </div>
                        </div>
                    )}

                    {/* ── Media Tab ── */}
                    {activeTab === "Media" && (
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <ImageIcon size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Property Photos</span>
                                </div>
                                <span className="text-[11px] text-[#b0b0b0]">{images.length}/10 photos</span>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
                            <div
                                onClick={() => images.length < 10 && fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-1.5 transition-colors ${
                                    images.length >= 10
                                        ? "cursor-not-allowed border-[#e0e0e0] bg-[#f5f5f5]"
                                        : dragging
                                        ? "cursor-copy border-[#953002] bg-[#fef5ef]"
                                        : "cursor-pointer border-[#e0e0e0] bg-[#fefcfa] hover:border-[#953002] hover:bg-[#fef5ef]"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${dragging ? "bg-[#953002]" : "bg-[#fef5ef]"}`}>
                                    <ImageIcon size={26} color={dragging ? "#fff" : "#953002"} />
                                </div>
                                <div className="font-semibold text-[13px] text-[#1d1d1d]">
                                    {dragging ? "Drop images here" : "Click or drag images here"}
                                </div>
                                <div className="text-[11px] text-[#b0b0b0]">PNG, JPG up to 10MB each · max 10 photos</div>
                            </div>
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {images.map((img, idx) => (
                                        <div key={img.id} className="relative w-[120px] h-[90px] rounded-lg overflow-hidden border-2 border-[#e0e0e0] group">
                                            <img src={img.localUrl} alt="" className="w-full h-full object-cover" />
                                            {idx === 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white bg-[#953002]/80 py-0.5">Cover</div>
                                            )}
                                            {img.uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 size={18} color="#fff" className="animate-spin" />
                                                </div>
                                            )}
                                            {img.error && (
                                                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center" title={img.error}>
                                                    <AlertCircle size={18} color="#fff" />
                                                </div>
                                            )}
                                            {img.cloudUrl && !img.uploading && (
                                                <div className="absolute inset-0 border-2 border-[#2e7d32] rounded-lg pointer-events-none" />
                                            )}
                                            {!img.uploading && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer p-0"
                                                >
                                                    <X size={11} color="#fff" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {images.length < 10 && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-[120px] h-[90px] rounded-lg border-2 border-dashed border-[#e0e0e0] flex items-center justify-center cursor-pointer bg-[#fafafa] hover:border-[#953002] hover:bg-[#fef5ef] transition-colors"
                                        >
                                            <Plus size={22} color="#b0b0b0" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}


                    {/* ── Settings Tab ── */}
                    {activeTab === "Settings" && (
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldAlert size={16} color="#e74c3c" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Policies & Rules</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-3">
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
                                <textarea
                                    placeholder="No smoking inside, quiet hours after 10 PM, no parties..."
                                    value={rules}
                                    onChange={(e) => setRules(e.target.value)}
                                    rows={4}
                                    className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none bg-white resize-y min-h-[90px]"
                                />
                            </div>
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Settings size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Property Features</span>
                                </div>
                                {FLAG_LIST.map(({ key, label, desc }) => {
                                    const on = flags[key];
                                    return (
                                        <div key={key} className="flex items-center justify-between py-2.5 border-b border-[#f5f5f5] last:border-none">
                                            <div>
                                                <div className="text-[13px] font-semibold text-[#1d1d1d]">{label}</div>
                                                <div className="text-[11px] text-[#b0b0b0]">{desc}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleFlag(key)}
                                                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 border-none cursor-pointer ${on ? "bg-[#953002]" : "bg-[#e0e0e0]"}`}
                                            >
                                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    </div>{/* end left column */}

                    {/* Right column — Setup Progress, always visible on every tab */}
                    <div className="sticky top-0">
                        <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                            <div className="text-[14px] font-bold text-[#953002] mb-2.5">Setup Progress</div>
                            {[
                                { label: "Property Name", done: !!form.name.trim() },
                                { label: "Location",      done: !!(form.address || form.city) },
                                { label: "Contact",       done: !!(form.contact || form.email) },
                                { label: "Amenities",     done: Object.values(amenities).some(Boolean) },
                                { label: "Rooms",         done: draftRooms.length > 0 },
                                { label: "Rates",         done: draftRooms.some((r) => r.pricePerNight > 0) },
                                { label: "Photos",        done: images.some((i) => i.cloudUrl) },
                                { label: "Policies",      done: !!rules.trim() },
                            ].map(({ label, done }) => (
                                <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#f5f5f5] last:border-none">
                                    <span className="text-[12px] text-[#4f4f4f]">{label}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${done ? "bg-[#eafaf1] text-[#27ae60]" : "bg-[#f5f5f5] text-[#b0b0b0]"}`}>
                                        {done ? "✓ Done" : "Pending"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    </div>{/* end grid */}

                </div>
            </main>
        </div>
    );
}
