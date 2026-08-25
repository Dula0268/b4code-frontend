/* eslint-disable @next/next/no-img-element */
"use client";

import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { propertiesApi } from "@/api/owner/properties.api";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, parseTime, formatTime } from "@/components/owner/TimePicker";
import {
    Info, MapPin, Bell, ChevronRight, Star, Bed, Calendar,
    Eye, Building2, Loader2, CheckCircle2, Circle, Save,
    AlertCircle, ShieldAlert, Sparkles,
} from "lucide-react";

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

function PropertyDetailsContent() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("id");
    const { user } = useAuthStore();
    const ownerId = user?.userId ?? 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [property, setProperty]   = useState<any>(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const [saving, setSaving]       = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

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

    const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
    const toggleAmenity = (key: string) => setAmenities((p) => ({ ...p, [key]: !p[key] }));
    const toggleFlag    = (key: string) => setFlags((p) => ({ ...p, [key]: !p[key] }));

    useEffect(() => {
        if (!propertyId) { setError("No property ID provided."); setLoading(false); return; }
        propertiesApi.getProperty(Number(propertyId), ownerId)
            .then((data) => {
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
            })
            .catch(() => setError("Failed to load property details."))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propertyId, ownerId]);

    async function handleSave() {
        if (!form.name.trim()) { setSaveError("Property name is required."); return; }
        setSaveError(null);
        setSaveSuccess(false);
        setSaving(true);
        try {
            const selectedAmenities = Object.entries(amenities).filter(([, v]) => v).map(([k]) => k);
            const updated = await propertiesApi.updateProperty(Number(propertyId), ownerId, {
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
                freeCancellation:   flags.freeCancellation,
                breakfastIncluded:  flags.breakfastIncluded,
                petFriendly:        flags.petFriendly,
                accessibility:      flags.accessibility,
            });
            setProperty(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSaveError((err as any)?.response?.data?.message ?? (err instanceof Error ? err.message : "Failed to save."));
        } finally {
            setSaving(false);
        }
    }

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Settings"];

    const statusLabel = property?.status === "active" ? "ACTIVE"
        : property?.status === "inactive" ? "INACTIVE"
        : property?.status === "maintenance" ? "MAINTENANCE"
        : property?.status?.toUpperCase() ?? "PENDING";

    const statusColor = property?.status === "active" ? "#27ae60"
        : property?.status === "inactive" ? "#828282"
        : property?.status === "maintenance" ? "#e67e22"
        : "#b0b0b0";

    const inputCls = "w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none focus:border-[#953002] bg-white text-[#1d1d1d]";

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

                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">{property?.name ?? "Property Details"}</span>
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
                                    {property.image
                                        ? <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                                        : <Building2 size={28} color="#c0a898" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-[20px] font-extrabold m-0 text-[#1d1d1d]">{property.name}</h2>
                                        <span className="text-[9px] font-bold text-white rounded w-max px-[7px] py-[2px] tracking-widest" style={{ backgroundColor: statusColor }}>
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
                            <button className="flex items-center gap-1.5 py-2 px-4 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-gray-50">
                                <Eye size={14} /> View Live
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#e8e8e8] mb-3 mt-2">
                            {tabs.map((t) => (
                                <button key={t}
                                    onClick={() => {
                                        if (t === "Overview") return;
                                        else if (t === "Rooms") window.location.href = `/owner/properties/propertyRoomInventry?id=${property.id}`;
                                        else if (t === "Availability") window.location.href = `/owner/properties/Availability?id=${property.id}`;
                                        else if (t === "Rates") window.location.href = `/owner/properties/Rate?id=${property.id}`;
                                        else if (t === "Reservations") window.location.href = `/owner/properties/Reservation?id=${property.id}`;
                                        else if (t === "Media") window.location.href = `/owner/properties/Media?id=${property.id}`;
                                        else if (t === "Settings") window.location.href = `/owner/properties/Setting?id=${property.id}`;
                                    }}
                                    className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative border-b-2 ${
                                        t === "Overview" ? "text-[#953002] font-bold border-[#953002]" : "text-[#828282] font-medium border-transparent hover:text-[#4f4f4f]"
                                    }`}
                                >{t}</button>
                            ))}
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-[1fr_260px] gap-4 items-start">
                            {/* Left Column — editable */}
                            <div className="flex flex-col gap-3">

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
                                                placeholder="Property name" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Description</label>
                                            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                                                rows={3} placeholder="Describe your property..."
                                                className={`${inputCls} resize-y`} />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Property Type</label>
                                            <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}
                                                className={inputCls}>
                                                <option value="">Select type…</option>
                                                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
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
                                                placeholder="123 Beach Road" className={inputCls} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">City</label>
                                                <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                                                    placeholder="City" className={inputCls} />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Country</label>
                                                <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)}
                                                    placeholder="Country" className={inputCls} />
                                            </div>
                                        </div>
                                    </div>
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
                                                    className={`flex items-center gap-1.5 py-1.5 px-2.5 border rounded-lg text-[12px] cursor-pointer font-medium transition-colors ${checked ? "border-[#953002] bg-[#fef8f4] text-[#4f4f4f]" : "border-[#e0e0e0] bg-white text-[#4f4f4f]"}`}>
                                                    {checked ? <CheckCircle2 size={13} color="#953002" /> : <Circle size={13} color="#b0b0b0" />}
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Policies & Rules */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldAlert size={15} color="#e74c3c" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">House Rules & Policies</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Contact Phone</label>
                                            <input type="text" value={form.contact} onChange={(e) => update("contact", e.target.value)}
                                                placeholder="+94 77 000 0000" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Contact Email</label>
                                            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                                                placeholder="contact@example.com" className={inputCls} />
                                        </div>
                                    </div>
                                    <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">House Rules</label>
                                    <textarea value={form.houseRules} onChange={(e) => update("houseRules", e.target.value)}
                                        rows={3} placeholder="No smoking, quiet hours after 10 PM..."
                                        className={`${inputCls} resize-y`} />
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

                                {/* Status messages */}
                                {saveError && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#fdecea] border border-[#e74c3c] text-[12px] text-[#c0392b]">
                                        <AlertCircle size={14} /> {saveError}
                                    </div>
                                )}
                                {saveSuccess && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#eafaf1] border border-[#27ae60] text-[12px] text-[#27ae60]">
                                        <CheckCircle2 size={14} /> Property saved successfully!
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="sticky top-0 flex flex-col gap-3">
                                {/* Save */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                    <button type="button" onClick={handleSave} disabled={saving}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] disabled:opacity-60 transition-colors">
                                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                        {saving ? "Saving…" : "Save Changes"}
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                    <div className="text-[13px] font-bold text-[#953002] mb-2.5">Quick Stats</div>
                                    <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                        <span className="text-[12px] text-[#4f4f4f]">Rooms</span>
                                        <span className="text-[13px] font-bold text-[#953002]">{property.roomCount ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                        <span className="text-[12px] text-[#4f4f4f]">Avg. Rating</span>
                                        <span className="text-[13px] font-bold text-[#1d1d1d] flex items-center gap-1">
                                            <Star size={11} color="#ffb401" fill="#ffb401" /> {property.rating ?? "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-[12px] text-[#4f4f4f]">Total Reviews</span>
                                        <span className="text-[13px] font-bold text-[#1d1d1d]">{property.reviews ?? 0}</span>
                                    </div>
                                </div>

                                {/* Manage links */}
                                <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                    <div className="text-[13px] font-bold text-[#953002] mb-2.5">Manage</div>
                                    {[
                                        { label: "Room Inventory",  href: `/owner/properties/propertyRoomInventry?id=${propertyId}` },
                                        { label: "Room Rates",      href: `/owner/properties/Rate?id=${propertyId}` },
                                        { label: "Media / Photos",  href: `/owner/properties/Media?id=${propertyId}` },
                                        { label: "Property Status", href: `/owner/properties/Setting?id=${propertyId}` },
                                    ].map((link) => (
                                        <a key={link.label} href={link.href} className="no-underline block mb-1 last:mb-0">
                                            <button className="w-full text-left py-2 px-3 text-[12px] text-[#4f4f4f] font-medium bg-white border border-[#e8e8e8] rounded-lg hover:bg-[#f5f5f5] cursor-pointer transition-colors">
                                                {link.label}
                                            </button>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
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
