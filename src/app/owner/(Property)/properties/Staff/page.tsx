/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell as BellIcon,
    ChevronRight,
    MapPin,
    Bed,
    Calendar,
    Eye,
    Edit,
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    MoreVertical
} from "lucide-react";

/* ───────────────────── Mock Data ───────────────────── */
const staffData = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Property Manager",
        email: "sarah.j@example.com",
        phone: "+1 (555) 123-4567",
        status: "Active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Maintenance Supervisor",
        email: "m.chen@example.com",
        phone: "+1 (555) 987-6543",
        status: "Active",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        role: "Housekeeping Lead",
        email: "elena.r@example.com",
        phone: "+1 (555) 456-7890",
        status: "Inactive",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
    }
];

/* ───────────────────── Component ───────────────────── */
/**
 * PropertyStaffPage Component
 *
 * Displays a list of staff members assigned to a property, with role filters,
 * search functionality, and links to individual profile views.
 */
export default function PropertyStaffPage() {
    const [activeTab, setActiveTab] = useState("Staff");
    const tabs = ["Overview", "Rooms", "Availability", "Rates", "Reservations", "Media", "Staff", "Settings"];
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStaff = staffData.filter(staff => 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        staff.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <BellIcon size={18} color="#4f4f4f" />
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
                                    else if (t === "Media") window.location.href = "/owner/properties/Media";
                                    else if (t === "Staff") setActiveTab(t);
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

                    {/* ── Main Layout ── */}
                    <div className="bg-white border border-[#e8e8e8] rounded-[10px] flex flex-col h-[calc(100vh-230px)]">
                        {/* Section Header */}
                        <div className="flex justify-between items-center py-4 px-5 border-b border-[#f0f0f0] shrink-0">
                            <div>
                                <h3 className="text-[16px] font-bold text-[#1d1d1d] m-0 mb-1">Property Staff</h3>
                                <p className="text-[12px] text-[#828282] m-0">Manage the staff assigned to this property and their roles.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search staff..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 border border-[#e0e0e0] rounded-md text-[13px] outline-none focus:border-[#953002] w-[200px]"
                                    />
                                    <Search size={14} color="#828282" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                                </div>
                                <button className="flex items-center justify-center bg-white border border-[#e0e0e0] w-8 h-8 rounded-md hover:bg-[#f5f5f5] cursor-pointer text-[#4f4f4f]">
                                    <Filter size={14} />
                                </button>
                                <button 
                                    onClick={() => window.location.href = "/owner/properties/Staff/addStaff"}
                                    className="flex items-center gap-1.5 py-1.5 px-3 bg-[#953002] text-white border-none rounded-md text-[12px] font-semibold cursor-pointer hover:bg-[#7a2702] transition-colors"
                                >
                                    <Plus size={14} /> Add Staff
                                </button>
                            </div>
                        </div>

                        {/* Staff Grid/List Area */}
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                                {filteredStaff.map((staff) => (
                                    <div key={staff.id} className="border border-[#e8e8e8] rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f5f5f5]">
                                                    <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="text-[14px] font-bold text-[#1d1d1d]">{staff.name}</div>
                                                    <div className="text-[11px] font-semibold text-[#828282] mt-0.5">{staff.role}</div>
                                                </div>
                                            </div>
                                            <button className="bg-transparent border-none text-[#828282] hover:text-[#1d1d1d] cursor-pointer p-1">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-2 mt-4 text-[12px] text-[#4f4f4f]">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} color="#828282" />
                                                <span>{staff.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} color="#828282" />
                                                <span>{staff.phone}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[#f5f5f5] flex justify-between items-center">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                                staff.status === "Active" ? "bg-[#e8f8ef] text-[#27ae60]" : "bg-[#f5f5f5] text-[#828282]"
                                            }`}>
                                                {staff.status}
                                            </span>
                                            <button 
                                                onClick={() => window.location.href = "/owner/properties/Staff/viewProfile"}
                                                className="text-[11px] font-semibold text-[#953002] bg-transparent border-none cursor-pointer hover:underline"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredStaff.length === 0 && (
                                    <div className="col-span-full py-10 text-center text-[#828282] text-[13px] border-2 border-dashed border-[#e0e0e0] rounded-xl flex flex-col items-center justify-center gap-2">
                                        <Search size={24} color="#b0b0b0" />
                                        <div>No staff members found matching your search.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}