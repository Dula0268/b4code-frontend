/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Info,
    MapPin,
    Bell,
    ChevronRight,
    Camera,
    Bed,
    Bath,
    Users,
    CheckCircle2,
    Circle,
    ArrowRight,
    FileText,
    RefreshCw,
    DollarSign,
    Globe,
    Lightbulb,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function EditPropertyDetailsPage() {
    const [form, setForm] = useState<Record<string, string>>({
        name: "Lakeside Cabin Retreat - Luxury Coastal Retreat",
        description:
            "A stunning villa overlooking the azure waters of the Mediterranean. Features private pool access, modern amenities, and breathtaking sunset views from the terrace.",
        address: "124 Blue Horizon Way, Amalfi Coast, Italy",
        bedrooms: "4",
        bathrooms: "3",
        guestCapacity: "8",
        baseRate: "120,000",
    });

    const [amenities, setAmenities] = useState<Record<string, boolean>>({
        "Wi-Fi": true,
        Pool: true,
        Kitchen: true,
        "A/C": true,
        Gym: false,
        Parking: true,
        "Pet Friendly": false,
        TV: true,
    });

    const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
    const toggleAmenity = (a: string) => setAmenities((p) => ({ ...p, [a]: !p[a] }));



    const photos = [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=160&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=160&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=160&fit=crop",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=200&h=160&fit=crop",
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Sidebar ── */}
            <aside className="w-[160px] bg-white border-r border-[#e0e0e0] py-3 shrink-0 flex flex-col">
                <div className="px-3.5">
                    <Logo width={120} height={36} />
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col px-9 min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-between items-center py-1.5">
                    <div />
                    <div className="flex items-center gap-3">
                        <a href="/owner/ownerDashboard/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <div className="w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-[#953002]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] mb-0.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <a href="/owner/properties/propertyDetails" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Downtown Luxury Loft</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">Edit property details</span>
                </div>

                {/* Page Title */}
                <h1 className="text-[22px] font-extrabold text-[#1d1d1d] m-0 mt-1">Edit Property Details</h1>
                <p className="text-[12px] text-[#828282] m-0 mt-0.5 mb-2">Keep your property information accurate to attract the right guests.</p>

                {/* Scrollable Content */}
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
                                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[#953002] bg-white text-[#1d1d1d]" placeholder="Enter property name" />
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Description</label>
                                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border resize-y min-h-[70px] focus:border-[#953002] bg-white text-[#1d1d1d]" placeholder="Enter description" />
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Address</label>
                                <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border focus:border-[#953002] bg-white text-[#1d1d1d]" placeholder="Enter address" />
                            </div>

                            {/* Property Photos */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex justify-between items-center mb-2.5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Camera size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Property Photos</span>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = "/owner/properties/Media"}
                                        className="flex items-center gap-1 bg-transparent border-none text-[#953002] text-[12px] font-semibold cursor-pointer hover:underline"
                                    >
                                        Manage All Photos <ArrowRight size={13} />
                                    </button>
                                </div>
                                <div className="flex gap-2.5 overflow-x-auto">
                                    {/* Add Photo */}
                                    <div className="w-[100px] h-[100px] rounded-lg border-2 border-dashed border-[#d0d0d0] flex flex-col items-center justify-center shrink-0 cursor-pointer bg-[#fafafa]">
                                        <Camera size={22} color="#b0b0b0" />
                                        <span className="text-[11px] color-[#b0b0b0] mt-1 text-[#b0b0b0]">Add Photo</span>
                                    </div>
                                    {/* Photo thumbnails */}
                                    {photos.map((src, i) => (
                                        <div key={i} className="w-[100px] h-[100px] rounded-lg overflow-hidden shrink-0 relative">
                                            <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                                            {i === 0 && (
                                                <div className="absolute bottom-1.5 left-1.5 bg-[rgba(0,0,0,0.6)] text-white text-[9px] font-semibold py-0.5 px-1.5 rounded-md">Main</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Property Details */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Bed size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Property Details</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Bedrooms</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-white focus-within:border-[#953002]">
                                            <Bed size={14} color="#828282" />
                                            <input type="text" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className="w-full border-none outline-none bg-transparent" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Bathrooms</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-white focus-within:border-[#953002]">
                                            <Bath size={14} color="#828282" />
                                            <input type="text" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className="w-full border-none outline-none bg-transparent" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Guest Capacity</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-white focus-within:border-[#953002]">
                                            <Users size={14} color="#828282" />
                                            <input type="text" value={form.guestCapacity} onChange={(e) => update("guestCapacity", e.target.value)} className="w-full border-none outline-none bg-transparent" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <CheckCircle2 size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Amenities</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.entries(amenities).map(([name, checked]) => (
                                        <button key={name}  className={`flex items-center gap-1.5 py-1.5 px-2.5 border rounded-lg text-[12px] cursor-pointer font-medium ${checked ? "border-[#953002] bg-[#fef8f4] text-[#4f4f4f]" : "border-[#e0e0e0] bg-white text-[#4f4f4f]"}`}>
                                            {checked ? <CheckCircle2 size={14} color="#953002" /> : <Circle size={14} color="#b0b0b0" />}
                                            <span>{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing & Availability */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <DollarSign size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Pricing & Availability</span>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Base Nightly Rate ($)</label>
                                <div className="relative max-w-[240px]">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-[#828282]">Rs</span>
                                    <input type="text" value={form.baseRate} onChange={(e) => update("baseRate", e.target.value)} className="w-full py-2 px-3 pl-7 border border-[#e0e0e0] rounded-lg text-[13px] outline-none box-border max-w-[240px] focus:border-[#953002] bg-white text-[#1d1d1d]" placeholder="Enter rate" />
                                </div>
                            </div>

                            {/* Bottom Buttons */}
                            <div className="flex justify-center gap-3 pt-2 pb-1">
                                <a href="/owner/properties" className="no-underline">
                                    <button className="py-2 px-5 bg-white text-[#4f4f4f] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Cancel Changes</button>
                                </a>
                                <a href="/owner/properties" className="no-underline">
                                    <button className="py-2 px-6 bg-[#953002] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">Save Changes</button>
                                </a>
                            </div>
                        </div>

                        {/* ── Right Column ── */}
                        <div className="flex flex-col gap-3">
                            {/* Listing Score */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="text-[13px] font-bold text-[#1d1d1d] mb-1.5">Listing Score</div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-[28px] font-extrabold text-[#953002]">85%</span>
                                    <span className="text-[11px] color-[#27ae60] font-semibold text-[#27ae60]">Strong</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#f0f0f0] rounded-sm mt-1.5 overflow-hidden">
                                    <div className="h-full bg-[#953002] rounded-sm" style={{ width: "85%" }} />
                                </div>
                                <p className="text-[11px] text-[#828282] m-0 mt-1.5 leading-relaxed">
                                    Add more detailed description to reach 100% and improve search ranking.
                                </p>
                            </div>

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
                                        <div className="text-[10px] text-[#dbb99a] leading-snug mt-px">Check nearby properties to ensure your base rate is attractive.</div>
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
                                <button className="w-full py-2 bg-white text-[#953002] border border-[#953002] rounded-lg text-[12px] font-bold cursor-pointer">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
