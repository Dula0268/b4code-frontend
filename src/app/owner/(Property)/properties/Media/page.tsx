/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Eye,
    Edit,
    ImagePlus,
    Trash2,
    Star,
    Info,
    UploadCloud,
    MoreVertical
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const mediaData = [
    { id: 1, url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop", title: "Living Room Overview", category: "Living Area", isCover: true },
    { id: 2, url: "https://images.unsplash.com/photo-1502672260266-1c1e5250ff22?w=400&h=300&fit=crop", title: "Master Bedroom", category: "Bedroom", isCover: false },
    { id: 3, url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop", title: "Modern Kitchen", category: "Kitchen", isCover: false },
    { id: 4, url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", title: "Luxury Bathroom", category: "Bathroom", isCover: false },
    { id: 5, url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=300&fit=crop", title: "Balcony View", category: "Exterior", isCover: false },
];

/* ───────────────────── component ───────────────────── */

/**
 * MediaPage Component
 *
 * Property media gallery management for uploading, organizing,
 * and removing property photos and virtual tour assets.
 */
export default function MediaPage() {
    const [activeTab, setActiveTab] = useState("Media");
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
                    <span className="text-[#953002] font-semibold">Property Name</span>
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
                                    <h2 className="text-[20px] font-extrabold m-0 text-[#1d1d1d]">Property Name</h2>
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
                                    if (t === "Overview") window.location.href = "/owner/properties/propertyDetails";
                                    else if (t === "Rooms") window.location.href = "/owner/properties/propertyRoomInventry";
                                    else if (t === "Availability") window.location.href = "/owner/properties/Availability";
                                    else if (t === "Rates") window.location.href = "/owner/properties/Rate";
                                    else if (t === "Reservations") window.location.href = "/owner/properties/Reservation";
                                    else if (t === "Media") setActiveTab(t);
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
                    <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
                        {/* Left Column - Gallery */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <ImagePlus size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Property Gallery</span>
                                    </div>
                                    <button className="flex items-center gap-1.5 py-1.5 px-3 bg-[#953002] text-white border-none rounded-md text-[12px] font-medium cursor-pointer hover:bg-[#7a2702] transition-colors">
                                        <UploadCloud size={14} /> Upload Photos
                                    </button>
                                </div>

                                {/* Grid of Images */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="border-2 border-dashed border-[#d0d0d0] rounded-xl flex flex-col items-center justify-center p-4 bg-[#fafafa] cursor-pointer hover:bg-[#f5f5f5] transition-colors min-h-[140px]">
                                        <UploadCloud size={24} color="#828282" className="mb-2" />
                                        <span className="text-[12px] font-semibold text-[#4f4f4f]">Click or drag to upload</span>
                                        <span className="text-[10px] text-[#b0b0b0] mt-1">JPG, PNG, WebP (Max 5MB)</span>
                                    </div>

                                    {mediaData.map((item) => (
                                        <div key={item.id} className="relative group border border-[#e0e0e0] rounded-xl overflow-hidden min-h-[140px]">
                                            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                                            
                                            {item.isCover && (
                                                <div className="absolute top-2 left-2 bg-[#953002] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" /> Cover
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex justify-end gap-1">
                                                    {!item.isCover && (
                                                        <button className="p-1.5 bg-white/90 hover:bg-white rounded text-[#4f4f4f] cursor-pointer" title="Set as Cover">
                                                            <Star size={12} />
                                                        </button>
                                                    )}
                                                    <button className="p-1.5 bg-white/90 hover:bg-[#e74c3c] hover:text-white rounded text-[#e74c3c] cursor-pointer transition-colors" title="Delete">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="text-white text-[12px] font-bold truncate">{item.title}</div>
                                                    <div className="text-white/80 text-[10px]">{item.category}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Media Guidelines */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-[#fffbf5] border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Photo Guidelines</span>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <div className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0 bg-[#953002]" />
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#4f4f4f]">Resolution</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5 leading-snug">Use high-resolution photos (min. 1920x1080) in landscape orientation.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0 bg-[#953002]" />
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#4f4f4f]">Cover Photo</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5 leading-snug">This is the first photo guests see. Choose an exterior or master bedroom shot.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0 bg-[#953002]" />
                                        <div>
                                            <div className="text-[13px] font-semibold text-[#4f4f4f]">Variety</div>
                                            <div className="text-[11px] text-[#828282] mt-0.5 leading-snug">Include at least one photo of every room, including bathrooms and exterior.</div>
                                        </div>
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
