/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Info,
    MapPin,
    Star,
    Image as ImageIcon,
    ShieldAlert,
    Clock,
    Plus,
    Bell,
    ChevronRight,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * CreateNewPropertyPage Component
 *
 * Multi-step form for registering a new property, including
 * basic info, location, amenities, photos, and pricing setup.
 */
export default function CreateNewPropertyPage() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        city: "",
        contact: "",
        email: "",
        checkIn: "02:00 PM",
        checkOut: "11:00 AM",
        rules: "",
    });

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

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ───── Sidebar (minimal) ───── */}
            <aside className="w-[160px] bg-white border-r border-[#e0e0e0] py-3 shrink-0 flex flex-col">
                <div className="px-3.5">
                    <Logo width={120} height={36} />
                </div>
            </aside>

            {/* ───── Main Content ───── */}
            <main className="flex-1 flex flex-col px-10 min-w-0 overflow-hidden">
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

                <div className="flex items-center gap-1.5 text-[12px] mb-1">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">Add New property</span>
                </div>

                {/* Page Header */}
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
                        </div>
                        <div className="border-2 border-dashed border-[#e0e0e0] rounded-xl p-5 flex flex-col items-center gap-1 cursor-pointer bg-[#fefcfa]">
                            <div className="w-10 h-10 rounded-full bg-[#fef5ef] flex items-center justify-center mb-1">
                                <ImageIcon size={24} color="#953002" />
                            </div>
                            <div className="font-semibold text-[13px] text-[#1d1d1d]">Click or drag images here</div>
                            <div className="text-[11px] text-[#b0b0b0]">PNG, JPG up to 10MB each (max 10 photos)</div>
                        </div>
                        <div className="flex gap-2.5 mt-2.5">
                            <div className="w-16 h-12 rounded-md overflow-hidden border-2 border-[#953002]">
                                <img
                                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=80&h=60&fit=crop"
                                    alt=""
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>
                            <div className="w-16 h-12 rounded-md border-2 border-dashed border-[#e0e0e0] flex items-center justify-center cursor-pointer bg-[#fafafa]">
                                <Plus size={18} color="#b0b0b0" />
                            </div>
                        </div>
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
                                <div className="flex items-center justify-between border border-[#e0e0e0] rounded-lg py-2 px-3 mt-1 bg-white">
                                    <input type="text" value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} className="w-full text-[13px] text-[#1d1d1d] outline-none bg-white border-none p-0 m-0" />
                                    <Clock size={14} color="#b0b0b0" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1">Check-out Time</label>
                                <div className="flex items-center justify-between border border-[#e0e0e0] rounded-lg py-2 px-3 mt-1 bg-white">
                                    <input type="text" value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} className="w-full text-[13px] text-[#1d1d1d] outline-none bg-white border-none p-0 m-0" />
                                    <Clock size={14} color="#b0b0b0" />
                                </div>
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

                    {/* ── Action Buttons ── */}
                    <div className="flex gap-3 pt-2 pb-3">
                        <a href="/owner/properties" className="no-underline">
                            <button className="py-2.5 px-7 bg-[#953002] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">Save Property Listing</button>
                        </a>
                        <a href="/owner/properties" className="no-underline">
                            <button className="py-2.5 px-7 bg-[#e8e8e8] text-[#4f4f4f] border-none rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#d0d0d0] transition-colors">Cancel</button>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
