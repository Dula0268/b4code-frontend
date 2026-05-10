/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Logo from "@/components/shared/branding/logo";
import {
    Bell,
    LayoutDashboard,
    Building2,
    BedDouble,
    Calendar,
    Settings,
    Info,
    Monitor,
    Shield,
    ChevronDown,
    CheckCircle,
    Trash2,
    Save,
    Tag,
    BookOpen,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function EditRatePage() {
    const [planName, setPlanName] = useState("Early Bird Special");
    const [description, setDescription] = useState(
        "Special discounted rate for guests booking at least 30 days in advance. Non-refundable and no meals included."
    );
    const [baseRateType, setBaseRateType] = useState("Percentage of Standard");
    const [valueAdj, setValueAdj] = useState("-15");
    const [cancelPolicy, setCancelPolicy] = useState("Strict (Non-refundable)");
    const [mealPlan, setMealPlan] = useState("Room Only");
    const [liveOnChannels, setLiveOnChannels] = useState(true);

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "/owner/roomManagement" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Rate", icon: <Tag size={18} />, href: "/owner/rate", active: true },
        { label: "Reservations", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/propertySetting" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[160px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="px-3.5 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2.5 py-2.5 px-3.5 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-4 ${item.active
                                ? "bg-[rgba(149,48,2,0.08)] text-[#953002] font-bold border-[#953002]"
                                : "bg-transparent text-[#4f4f4f] font-medium border-transparent"
                                }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>
            </nav>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="flex justify-between items-center py-2.5 px-8 bg-white border-b border-[#e8e8e8] shrink-0">
                    <div />
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <div className="flex items-center gap-2">
                            <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                            <span className="text-[13px] font-semibold text-[#1d1d1d]">Admin User</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto py-6 px-10 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 mb-3 text-[13px]">
                        <a href="/owner/rate" className="text-[#953002] font-semibold no-underline">Rate</a>
                        <span className="text-[#b0b0b0]">›</span>
                        <span className="text-[#828282]">Edit Rate Plan</span>
                    </div>

                    {/* Page Title */}
                    <h1 className="text-[26px] font-extrabold text-[#1d1d1d] m-0 mb-1">Edit Rate Plan: Early Bird Special</h1>
                    <div className="text-[12px] text-[#828282] mb-6">
                        <span className="text-[#b0b0b0]">⟳</span> Last updated 2 days ago by Admin
                    </div>

                    {/* Two Column */}
                    <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4.5">
                            {/* General Information */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6.5">
                                <div className="flex items-center gap-2 mb-4.5">
                                    <Info size={18} color="#953002" />
                                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">General Information</span>
                                </div>

                                <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Rate Plan Name</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    className="w-full py-2.5 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border"
                                />

                                <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5 mt-4">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-[80px] py-2.5 px-3.5 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border resize-y leading-relaxed"
                                />
                            </div>

                            {/* Pricing Logic */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6.5">
                                <div className="flex items-center gap-2 mb-4.5">
                                    <Monitor size={18} color="#953002" />
                                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">Pricing Logic</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Base Rate Type</label>
                                        <div className="relative">
                                            <select
                                                value={baseRateType}
                                                onChange={(e) => setBaseRateType(e.target.value)}
                                                className="w-full py-2.5 pr-9 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border"
                                            >
                                                <option>Percentage of Standard</option>
                                                <option>Fixed Amount</option>
                                                <option>Dynamic</option>
                                            </select>
                                            <ChevronDown size={16} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Value Adjustment (%)</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                value={valueAdj}
                                                onChange={(e) => setValueAdj(e.target.value)}
                                                className="w-full py-2.5 px-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans box-border"
                                            />
                                            <span className="text-[14px] text-[#828282] font-semibold">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Policies & Services */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5.5 px-6.5">
                                <div className="flex items-center gap-2 mb-4.5">
                                    <Shield size={18} color="#953002" />
                                    <span className="text-[16px] font-extrabold text-[#1d1d1d]">Policies & Services</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Cancellation Policy</label>
                                        <div className="relative">
                                            <select
                                                value={cancelPolicy}
                                                onChange={(e) => setCancelPolicy(e.target.value)}
                                                className="w-full py-2.5 pr-9 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border"
                                            >
                                                <option>Strict (Non-refundable)</option>
                                                <option>Moderate (48h free cancel)</option>
                                                <option>Flexible (24h free cancel)</option>
                                            </select>
                                            <ChevronDown size={16} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Meal Plan</label>
                                        <div className="relative">
                                            <select
                                                value={mealPlan}
                                                onChange={(e) => setMealPlan(e.target.value)}
                                                className="w-full py-2.5 pr-9 pl-3.5 border border-[#e0e0e0] rounded-lg text-[14px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border"
                                            >
                                                <option>Room Only</option>
                                                <option>Bed & Breakfast</option>
                                                <option>Half Board</option>
                                                <option>Full Board</option>
                                            </select>
                                            <ChevronDown size={16} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-3.5">
                            {/* Plan Summary Preview */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                <div className="text-[10px] font-bold text-[#828282] tracking-wider mb-4">PLAN SUMMARY PREVIEW</div>
                                <div className="text-center mb-4">
                                    <div className="text-[12px] text-[#828282] mb-1">Projected Price</div>
                                    <div className="text-[36px] font-extrabold text-[#1d1d1d]">Rs 8,500.00</div>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="text-[13px] text-[#b0b0b0] line-through">Rs 10,000.00</span>
                                        <span className="text-[11px] font-bold text-white bg-[#27ae60] rounded px-2 py-0.5">-15% Applied</span>
                                    </div>
                                </div>

                                <div className="border-t border-[#f0f0f0] mb-3.5" />

                                <div className="flex items-start gap-2.5 mb-3">
                                    <div className="shrink-0 mt-0.5">
                                        <CheckCircle size={14} color="#b0b0b0" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Meal Plan Excluded</div>
                                        <div className="text-[11px] text-[#828282]">Room only reservation</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 mb-3">
                                    <div className="shrink-0 mt-0.5">
                                        <CheckCircle size={14} color="#953002" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Cancellation Policy</div>
                                        <div className="text-[11px] text-[#828282]">Strict: Non-refundable rate</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 mb-3">
                                    <div className="shrink-0 mt-0.5">
                                        <CheckCircle size={14} color="#953002" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Base Calculation</div>
                                        <div className="text-[11px] text-[#828282]">Linked to Standard Rack Rate</div>
                                    </div>
                                </div>

                                <div className="bg-[#fef5ef] rounded-lg py-3 px-3.5 mt-2">
                                    <p className="text-[12px] text-[#953002] italic m-0 leading-relaxed">
                                        &quot;Perfect for attracting early-season travelers while maintaining margin.&quot;
                                    </p>
                                </div>
                            </div>

                            {/* Availability Status */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl py-5 px-5">
                                <h4 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-3">Availability Status</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-[13px] text-[#4f4f4f]">Live on channels</span>
                                    <button
                                        onClick={() => setLiveOnChannels(!liveOnChannels)}
                                        className={`w-11 h-6 rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${liveOnChannels ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"
                                            }`}
                                    >
                                        <span className="w-4.5 h-4.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-between items-center mt-7 pt-5 border-t border-[#e8e8e8]">
                        <button className="flex items-center gap-1.5 bg-transparent border-none text-[#eb5757] text-[13px] font-semibold cursor-pointer">
                            <Trash2 size={14} color="#eb5757" /> Delete Rate Plan
                        </button>
                        <div className="flex gap-3">
                            <a href="/owner/rate" className="py-2.5 px-7 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer no-underline inline-flex items-center">Cancel</a>
                            <button className="flex items-center gap-2 py-2.5 px-6 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer">
                                Update Rate Plan <Save size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
