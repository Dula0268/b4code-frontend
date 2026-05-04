/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Info,
    MapPin,
    Bell,
    ChevronRight,
    ChevronDown,
    Star,
    Bed,
    Calendar,
    Eye,
    User,
    Phone,
    Edit,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function PropertyDetailsPage() {
    const [activeTab, setActiveTab] = useState("Overview");

    const property = {
        name: "Downtown Luxury Loft",
        description:
            "Experience breathtaking coastal views in this ultra-modern architectural masterpiece. Located in the heart of Malibu, this villa offers premium amenities, infinity pool, and private beach access for an unforgettable stay.",
        type: "Villa",
        yearBuilt: "2022",
        address: "123 Coastal Way",
        city: "Malibu",
        postalCode: "90265",
    };

    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];

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

                <div className="flex items-center gap-1.5 text-[12px] mb-1.5">
                    <a href="/owner/properties" className="text-[#828282] no-underline hover:text-[#953002] transition-colors">Properties</a>
                    <ChevronRight size={14} color="#b0b0b0" />
                    <span className="text-[#953002] font-semibold">Downtown Luxury Loft</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-4 pr-1">

                    {/* ── Property Header Card ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-[14px] py-3.5 px-5 flex items-center justify-between mb-0">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-[#953002]">
                                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=90&fit=crop" alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-[20px] font-extrabold m-0 text-[#1d1d1d]">Downtown Luxury Loft</h2>
                                    <span className="text-[9px] font-bold text-white bg-[#27ae60] rounded w-max px-[7px] py-[2px] tracking-widest">ACTIVE</span>
                                </div>
                                <div className="text-[12px] text-[#828282] mt-0.5 flex items-center gap-1">
                                    <MapPin size={12} /> 123 Coastal Way, Malibu, CA 90265
                                </div>
                                <div className="text-[12px] text-[#4f4f4f] mt-1 flex items-center gap-3">
                                    <span className="flex items-center gap-[3px]"><Bed size={12} /> 5 Rooms</span>
                                    <span className="flex items-center gap-[3px]"><Calendar size={12} /> Rs. 350,000/night</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2.5">
                            <button className="flex items-center gap-1.5 py-2 px-4 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-gray-50"><Eye size={14} /> View Live</button>
                            <a href="/owner/properties/editPropertyDetails" className="no-underline">
                                <button className="flex items-center gap-1.5 py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02]"><Edit size={14} /> Edit Property</button>
                            </a>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex border-b border-[#e8e8e8] mb-3 mt-2">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    if (t === "Overview") setActiveTab(t);
                                    else if (t === "Rooms") window.location.href = "/owner/properties/propertyRoomInventry";
                                    else if (t === "Availability") window.location.href = "/owner/properties/Availability";
                                    else if (t === "Rates") window.location.href = "/owner/properties/Rate";
                                    else if (t === "Reservations") window.location.href = "/owner/properties/Reservation";
                                    else if (t === "Media") window.location.href = "/owner/properties/Media";
                                    else if (t === "Staff") window.location.href = "/owner/properties/Staff";
                                    else if (t === "Settings") window.location.href = "/owner/properties/Setting";
                                    else setActiveTab(t);
                                }}
                                className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative ${
                                    activeTab === t ? "text-[#953002] font-bold border-b-2 border-[#953002]" : "text-[#828282] font-medium border-b-2 border-transparent hover:text-[#4f4f4f]"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* ── Two Column Layout ── */}
                    <div className="grid grid-cols-[1fr_260px] gap-4 items-start">
                        {/* Left Column */}
                        <div className="flex flex-col gap-3">
                            {/* Core Details */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <Info size={16} color="#953002" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Core Details</span>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Display Name</label>
                                <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.name}</div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Description</label>
                                <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[70px] leading-relaxed">{property.description}</div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Property Type</label>
                                        <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center justify-between">
                                            <span>{property.type}</span>
                                            <ChevronDown size={14} color="#b0b0b0" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Year Built</label>
                                        <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.yearBuilt}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Map */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <MapPin size={16} color="#e74c3c" />
                                    <span className="text-[15px] font-bold text-[#1d1d1d]">Location & Map</span>
                                </div>
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Street Address</label>
                                <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.address}</div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">City</label>
                                        <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.city}</div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1 mt-2">Postal Code</label>
                                        <div className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] flex items-center">{property.postalCode}</div>
                                    </div>
                                </div>
                                {/* Map Placeholder */}
                                <div className="mt-2.5 rounded-lg overflow-hidden h-[120px] bg-[#f0ebe5]">
                                    <div className="relative w-full h-full">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#f0ebe5] to-[#e8e0d8] rounded-lg flex flex-col items-center justify-center">
                                            <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                                                <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0zm0 22c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#953002" />
                                            </svg>
                                            <div className="text-[11px] text-[#828282] mt-1.5">Map Preview</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-3">
                            {/* Quick Stats */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="text-[14px] font-bold text-[#953002] mb-2.5">Quick Stats</div>
                                <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                    <span className="text-[13px] text-[#4f4f4f]">Occupancy Rate</span>
                                    <span className="text-[14px] font-bold text-[#953002]">84%</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                    <span className="text-[13px] text-[#4f4f4f]">Avg. Rating</span>
                                    <span className="text-[14px] font-bold text-[#1d1d1d] flex items-center gap-[3px]">
                                        <Star size={12} color="#ffb401" fill="#ffb401" /> 4.9
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-none">
                                    <span className="text-[13px] text-[#4f4f4f]">Total Reviews</span>
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">128</span>
                                </div>
                            </div>

                            {/* Manager Info */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="text-[14px] font-bold text-[#953002] mb-2.5">Manager Info</div>
                                <div className="flex items-center gap-2.5 mb-2.5">
                                    <div className="w-[34px] h-[34px] rounded-full bg-[#fef5ef] flex items-center justify-center">
                                        <User size={16} color="#953002" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Marcus Sterling</div>
                                        <div className="text-[11px] text-[#b0b0b0]">Property Owner</div>
                                    </div>
                                </div>
                                <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-[#953002] border border-[#953002] rounded-lg text-[12px] font-semibold cursor-pointer">
                                    <Phone size={13} /> Contact Manager
                                </button>
                            </div>

                            {/* Action History */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="text-[14px] font-bold text-[#953002] mb-2.5">Action History</div>
                                <div className="flex items-start gap-2 mb-2 pl-0.5">
                                    <div className="w-2 h-2 rounded-full mt-1 shrink-0 bg-[#e74c3c]" />
                                    <div>
                                        <div className="text-[12px] font-semibold text-[#1d1d1d]">Price Updated</div>
                                        <div className="text-[10px] text-[#b0b0b0]">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 mb-2 pl-0.5">
                                    <div className="w-2 h-2 rounded-full mt-1 shrink-0 bg-[#ffb401]" />
                                    <div>
                                        <div className="text-[12px] font-semibold text-[#1d1d1d]">New Media Added</div>
                                        <div className="text-[10px] text-[#b0b0b0]">Yesterday, 10:45 AM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
