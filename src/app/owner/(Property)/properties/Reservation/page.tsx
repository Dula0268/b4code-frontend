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
    BookOpen,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    Search
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const reservationsData = [
    { id: "RES-001", guest: "John Doe", room: "Master Suite", dates: "Oct 15 - Oct 20, 2026", status: "Confirmed", total: "Rs. 600,000" },
    { id: "RES-002", guest: "Jane Smith", room: "Family Loft", dates: "Nov 10 - Nov 15, 2026", status: "Pending", total: "Rs. 750,000" },
    { id: "RES-003", guest: "Alice Johnson", room: "Ocean Guest Room", dates: "Dec 01 - Dec 05, 2026", status: "Cancelled", total: "Rs. 400,000" },
    { id: "RES-004", guest: "Bob Brown", room: "Master Suite", dates: "Dec 10 - Dec 12, 2026", status: "Confirmed", total: "Rs. 240,000" },
];

/* ───────────────────── component ───────────────────── */

export default function ReservationsPage() {
    const [activeTab, setActiveTab] = useState("Reservations");
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
                                    if (t === "Overview") window.location.href = "/owner/properties/propertyDetails";
                                    else if (t === "Rooms") window.location.href = "/owner/properties/propertyRoomInventry";
                                    else if (t === "Availability") window.location.href = "/owner/properties/Availability";
                                    else if (t === "Rates") window.location.href = "/owner/properties/Rate";
                                    else if (t === "Reservations") setActiveTab(t);
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
                        {/* Left Column - Reservations List */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Recent Reservations</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search size={14} color="#828282" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                                            <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1.5 border border-[#e0e0e0] rounded-md text-[12px] w-[150px] outline-none focus:border-[#953002]" />
                                        </div>
                                        <button className="flex items-center gap-1.5 py-1.5 px-3 bg-[#fafafa] text-[#4f4f4f] border border-[#e0e0e0] rounded-md text-[12px] font-medium cursor-pointer hover:bg-[#f0f0f0] transition-colors">
                                            <Filter size={14} /> Filter
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">ID</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">GUEST / ROOM</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">DATES</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">STATUS</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">TOTAL</th>
                                            <th className="w-8 border-b border-[#f0f0f0]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservationsData.map((res) => (
                                            <tr key={res.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                                                <td className="text-[12px] text-[#828282] py-3 pr-2 align-middle font-mono">{res.id}</td>
                                                <td className="py-3 pr-2 align-middle">
                                                    <div className="text-[13px] font-semibold text-[#1d1d1d]">{res.guest}</div>
                                                    <div className="text-[11px] text-[#828282]">{res.room}</div>
                                                </td>
                                                <td className="text-[13px] text-[#4f4f4f] py-3 pr-2 align-middle">
                                                    {res.dates}
                                                </td>
                                                <td className="text-[13px] py-3 pr-2 align-middle">
                                                    <span className={`text-[10px] font-bold py-[3px] px-[8px] rounded uppercase tracking-wide flex items-center gap-1 w-max ${
                                                        res.status === "Confirmed" ? "text-[#27ae60] bg-[#eafaf1]" :
                                                        res.status === "Pending" ? "text-[#f39c12] bg-[#fef5e7]" :
                                                        "text-[#c0392b] bg-[#fdedec]"
                                                    }`}>
                                                        {res.status === "Confirmed" && <CheckCircle size={10} />}
                                                        {res.status === "Pending" && <Clock size={10} />}
                                                        {res.status === "Cancelled" && <XCircle size={10} />}
                                                        {res.status}
                                                    </span>
                                                </td>
                                                <td className="text-[13px] text-[#1d1d1d] py-3 pr-2 align-middle font-semibold">
                                                    {res.total}
                                                </td>
                                                <td className="py-3 align-middle text-right">
                                                    <button className="bg-transparent border-none cursor-pointer text-[#828282] hover:text-[#1d1d1d]">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right Column - Overview Stats */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <span className="text-[14px] font-bold text-[#1d1d1d] block mb-3.5">Reservation Summary</span>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[12px] text-[#828282] uppercase font-bold tracking-wider">Upcoming Check-ins</span>
                                            <span className="text-[14px] font-extrabold text-[#1d1d1d]">3</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-[1px] bg-[#f0f0f0]" />
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[12px] text-[#828282] uppercase font-bold tracking-wider">Pending Action</span>
                                            <span className="text-[14px] font-extrabold text-[#e67e22]">1</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-[1px] bg-[#f0f0f0]" />
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[12px] text-[#828282] uppercase font-bold tracking-wider">Checking Out Today</span>
                                            <span className="text-[14px] font-extrabold text-[#1d1d1d]">0</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="w-full mt-4 py-2 bg-white text-[#953002] border border-[#953002] rounded-lg text-[12px] font-bold cursor-pointer hover:bg-[#fef4f0] transition-colors">
                                    View Calendar
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
