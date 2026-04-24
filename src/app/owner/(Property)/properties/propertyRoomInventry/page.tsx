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
    Edit2,
    Trash2,
    Plus,
    BarChart3,
    Lightbulb,
    Star,
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const rooms = [
    { name: "Master Suite", type: "King Suite", occupancy: "2 Adults", rate: "Rs.120,000", status: "Active" },
    { name: "Ocean Guest Room", type: "Queen Room", occupancy: "2 Adults", rate: "Rs. 100,000", status: "Active" },
    { name: "Poolside Studio", type: "Studio", occupancy: "2 Adults", rate: "Rs.90,000", status: "Maintenance" },
    { name: "Family Loft", type: "Suite", occupancy: "4 People", rate: "Rs.150,000", status: "Active" },
    { name: "Sunset Penthouse", type: "Penthouse", occupancy: "2 Adults", rate: "Rs.250,000", status: "Active" },
];

/* ───────────────────── component ───────────────────── */

export default function PropertyRoomInventoryPage() {
    const [activeTab, setActiveTab] = useState("Rooms");
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
                    <span className="text-[#953002] font-semibold">Sunset Luxury Villa</span>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pb-4 pr-1">

                    {/* ── Property Header Card ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-[14px] py-3.5 px-5 flex items-center justify-between mb-0">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-[80px] h-[64px] rounded-lg overflow-hidden shrink-0 border-2 border-[#953002]">
                                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=90&fit=crop" alt="" className="w-full h-full object-cover" />
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
                                    <span className="flex items-center gap-[3px]"><Calendar size={12} /> Rs. 350,000 / night</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2.5">
                            <button className="flex items-center gap-1.5 py-2 px-4 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer"><Eye size={14} /> View Live</button>
                            <a href="/owner/properties" className="no-underline">
                                <button className="py-2 px-5 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[#b03a02] transition-colors">Save Changes</button>
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
                                    else if (t === "Rooms") setActiveTab(t);
                                    else if (t === "Availability") window.location.href = "/owner/properties/Availability";
                                    else if (t === "Rates") window.location.href = "/owner/properties/Rate";
                                    else if (t === "Reservations") window.location.href = "/owner/properties/Reservation";
                                    else if (t === "Media") window.location.href = "/owner/properties/Media";
                                    else if (t === "Staff") window.location.href = "/owner/properties/Staff";
                                    else if (t === "Settings") window.location.href = "/owner/properties/Setting";
                                    else setActiveTab(t);
                                }}
                                className={`bg-transparent py-2.5 px-4 text-[13px] cursor-pointer transition-all duration-150 relative ${
                                    activeTab === t ? "text-[#953002] font-bold border-b-2 border-[#953002]" : "text-[#828282] font-medium border-b-2 border-transparent"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* ── Two Column Layout ── */}
                    <div className="grid grid-cols-[1fr_260px] gap-4 items-start">
                        {/* Left Column - Room Inventory */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex justify-between items-center mb-3.5">
                                    <div className="flex items-center gap-2">
                                        <Bed size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Room Inventory</span>
                                    </div>
                                    <a href="/owner/roomManagement/addRoom" className="flex items-center gap-1 py-2 px-4 bg-[#953002] text-white border-none rounded-lg text-[12px] font-semibold cursor-pointer no-underline hover:bg-[#7a2702] transition-colors">
                                        <Plus size={14} /> Add New Room
                                    </a>
                                </div>

                                {/* Table */}
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">ROOM NAME</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">TYPE</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">OCCUPANCY</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">NIGHTLY RATE</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">STATUS</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((r, i) => (
                                            <tr key={i} className="border-b border-[#f5f5f5]">
                                                <td className="text-[13px] color-[#4f4f4f] py-3 pr-2 align-middle">
                                                    <span className="font-semibold text-[#1d1d1d]">{r.name}</span>
                                                </td>
                                                <td className="text-[13px] text-[#828282] py-3 pr-2 align-middle">
                                                    <span>{r.type}</span>
                                                </td>
                                                <td className="text-[13px] color-[#4f4f4f] py-3 pr-2 align-middle">{r.occupancy}</td>
                                                <td className="text-[13px] color-[#4f4f4f] py-3 pr-2 align-middle">
                                                    <span className="font-semibold text-[#1d1d1d]">{r.rate}</span>
                                                </td>
                                                <td className="text-[13px] color-[#4f4f4f] py-3 pr-2 align-middle">
                                                    <span className={`text-[10px] font-semibold py-[3px] px-[10px] rounded-md ${r.status === "Active" ? "text-[#27ae60] bg-[#eafaf1]" : "text-[#e67e22] bg-[#fef5e7]"}`}>
                                                        {r.status}
                                                    </span>
                                                </td>
                                                <td className="text-[13px] color-[#4f4f4f] py-3 pr-2 align-middle">
                                                    <div className="flex gap-2">
                                                        <button className="bg-transparent border border-[#e8e8e8] rounded-md p-1.5 cursor-pointer flex items-center justify-center"><Edit2 size={14} color="#828282" /></button>
                                                        <button className="bg-transparent border border-[#e8e8e8] rounded-md p-1.5 cursor-pointer flex items-center justify-center"><Trash2 size={14} color="#828282" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-3">
                            {/* Quick Stats */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <BarChart3 size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Quick Stats</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                    <span className="text-[13px] text-[#4f4f4f]">Total Rooms</span>
                                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">5</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
                                    <span className="text-[13px] text-[#4f4f4f]">Active Rooms</span>
                                    <span className="text-[16px] font-extrabold text-[#27ae60]">4</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-none">
                                    <span className="text-[13px] text-[#4f4f4f]">Under Maintenance</span>
                                    <span className="text-[16px] font-extrabold text-[#e74c3c]">1</span>
                                </div>
                            </div>

                            {/* Room Tips */}
                            <div className="bg-[#fffbf5] border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <Lightbulb size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Room Tips</span>
                                </div>
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="w-[7px] h-[7px] rounded-full mt-1 shrink-0 bg-[#953002]" />
                                    <span className="text-[12px] text-[#4f4f4f] leading-snug">Add detailed room photos to increase booking conversion by up to 35%.</span>
                                </div>
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="w-[7px] h-[7px] rounded-full mt-1 shrink-0 bg-[#953002]" />
                                    <span className="text-[12px] text-[#4f4f4f] leading-snug">Ensure room amenities are kept up to date for better guest ratings.</span>
                                </div>
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="w-[7px] h-[7px] rounded-full mt-1 shrink-0 bg-[#953002]" />
                                    <span className="text-[12px] text-[#4f4f4f] leading-snug">Set dynamic pricing based on room popularity for maximum revenue.</span>
                                </div>
                                <button className="w-full py-2 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer mt-1">Read Help Documentation</button>
                            </div>

                            {/* Action History */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="text-[14px] font-bold text-[#1d1d1d] mb-2.5">Action History</div>
                                <div className="flex items-start gap-2 mb-2 pl-0.5">
                                    <div className="w-2 h-2 rounded-full mt-[3px] shrink-0 bg-[#953002]" />
                                    <div>
                                        <div className="text-[12px] font-semibold text-[#1d1d1d]">Price Updated</div>
                                        <div className="text-[10px] text-[#b0b0b0]">2 hours ago</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 mb-2 pl-0.5">
                                    <div className="w-2 h-2 rounded-full mt-[3px] shrink-0 bg-[#b0b0b0]" />
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
