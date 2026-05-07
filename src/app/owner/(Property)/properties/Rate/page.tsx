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
    DollarSign,
    Percent,
    TrendingUp,
    Plus,
    MoreVertical
} from "lucide-react";

/* ───────────────────── data ───────────────────── */

const ratePlans = [
    { id: 1, name: "Standard Rate", room: "Master Suite", baseRate: "Rs. 120,000", conditions: "Non-refundable", status: "Active" },
    { id: 2, name: "Flexible Rate", room: "Master Suite", baseRate: "Rs. 135,000", conditions: "Free Cancellation (48h)", status: "Active" },
    { id: 3, name: "Standard Rate", room: "Ocean Guest Room", baseRate: "Rs. 100,000", conditions: "Non-refundable", status: "Active" },
    { id: 4, name: "Early Bird 15%", room: "All Rooms", baseRate: "-15% off Best Available", conditions: "Book 30+ days in advance", status: "Inactive" },
];

/* ───────────────────── component ───────────────────── */

/**
 * RatesPage Component
 *
 * Property-level rate management showing base prices, seasonal
 * adjustments, and rate plan configurations per room type.
 */
export default function RatesPage() {
    const [activeTab, setActiveTab] = useState("Rates");
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
                                    else if (t === "Rates") setActiveTab(t);
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
                        {/* Left Column - Rate Plans */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} color="#953002" />
                                        <span className="text-[15px] font-bold text-[#1d1d1d]">Active Rate Plans</span>
                                    </div>
                                    <button className="flex items-center gap-1.5 py-1.5 px-3 bg-[#953002] text-white border-none rounded-md text-[12px] font-medium cursor-pointer hover:bg-[#7a2702] transition-colors">
                                        <Plus size={14} /> Add New Plan
                                    </button>
                                </div>

                                {/* Table */}
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">PLAN NAME</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">APPLIES TO</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">RATE</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">CONDITIONS</th>
                                            <th className="text-left text-[10px] font-bold text-[#953002] tracking-wider py-2 pr-2 border-b border-[#f0f0f0]">STATUS</th>
                                            <th className="w-8 border-b border-[#f0f0f0]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ratePlans.map((plan) => (
                                            <tr key={plan.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                                                <td className="text-[13px] text-[#4f4f4f] py-3 pr-2 align-middle">
                                                    <span className="font-semibold text-[#1d1d1d]">{plan.name}</span>
                                                </td>
                                                <td className="text-[13px] text-[#828282] py-3 pr-2 align-middle">
                                                    <span>{plan.room}</span>
                                                </td>
                                                <td className="text-[13px] text-[#4f4f4f] py-3 pr-2 align-middle font-medium">
                                                    {plan.baseRate}
                                                </td>
                                                <td className="text-[13px] text-[#828282] py-3 pr-2 align-middle">
                                                    {plan.conditions}
                                                </td>
                                                <td className="text-[13px] py-3 pr-2 align-middle">
                                                    <span className={`text-[10px] font-bold py-[3px] px-[8px] rounded uppercase tracking-wide ${
                                                        plan.status === "Active" ? "text-[#27ae60] bg-[#eafaf1]" :
                                                        "text-[#7f8c8d] bg-[#f2f4f4]"
                                                    }`}>
                                                        {plan.status}
                                                    </span>
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

                        {/* Right Column - Promos & Tips */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-4 px-5">
                                <div className="flex items-center gap-1.5 mb-3.5">
                                    <Percent size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Quick Discount</span>
                                </div>
                                
                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1.5">Discount Name</label>
                                <input type="text" placeholder="e.g. Weekend Flash Sale" className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] mb-3 outline-none focus:border-[#953002]" />

                                <label className="block text-[12px] font-semibold text-[#4f4f4f] mb-1.5">Discount Percentage (%)</label>
                                <input type="number" placeholder="15" className="w-full py-2 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] bg-[#fafafa] box-border min-h-[38px] mb-4 outline-none focus:border-[#953002]" />

                                <div className="flex flex-col gap-2">
                                    <button className="w-full py-2.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#7a2702] transition-colors">
                                        Apply Discount
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#fffbf5] border border-[#e8e8e8] rounded-xl py-3.5 px-4">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <TrendingUp size={16} color="#953002" />
                                    <span className="text-[14px] font-bold text-[#1d1d1d]">Pricing Tips</span>
                                </div>
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="w-[7px] h-[7px] rounded-full mt-1.5 shrink-0 bg-[#953002]" />
                                    <span className="text-[12px] text-[#4f4f4f] leading-snug">Setting dynamic pricing for weekends can increase overall revenue by 20%.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-[7px] h-[7px] rounded-full mt-1.5 shrink-0 bg-[#953002]" />
                                    <span className="text-[12px] text-[#4f4f4f] leading-snug">Consider an &quot;Early Bird&quot; rate to secure bookings further in advance.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
