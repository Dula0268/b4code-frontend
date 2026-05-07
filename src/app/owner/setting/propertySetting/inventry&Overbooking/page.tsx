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
    Tag,
    BookOpen,
    Settings,
    Home,
    Shield,
    Zap,
    AlertTriangle,
    MinusCircle,
    Info,
    Save,
    Grid3X3,
    TrendingUp,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * InventoryOverbookingPage Component
 *
 * Configuration page for managing room inventory counts and
 * overbooking thresholds to maximize occupancy safely.
 */
export default function InventoryOverbookingPage() {
    const [autoClose, setAutoClose] = useState(true);
    const [thresholdLimit, setThresholdLimit] = useState("2");

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "/owner/roomManagement" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Rate", icon: <Tag size={18} />, href: "/owner/rate" },
        { label: "Reservation", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/accountSetting", active: true },
    ];

    /* 14-Day Outlook bar data */
    const outlookBars = [
        { h: 55, color: "#4285F4" }, { h: 40, color: "#4285F4" }, { h: 65, color: "#953002" },
        { h: 50, color: "#953002" }, { h: 70, color: "#4285F4" }, { h: 35, color: "#4285F4" },
        { h: 60, color: "#953002" }, { h: 45, color: "#953002" }, { h: 75, color: "#4285F4" },
        { h: 55, color: "#4285F4" }, { h: 40, color: "#953002" }, { h: 50, color: "#953002" },
        { h: 65, color: "#4285F4" }, { h: 45, color: "#4285F4" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="flex items-center gap-1.5 px-4 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2.5 py-2.5 px-4 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
                                item.active
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
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/ownerDashboard/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#953002]">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-2 gap-0 text-[12px] font-semibold">
                        <Home size={14} color="#4f4f4f" />
                        <span className="text-[#b0b0b0] mx-1">/</span>
                        <a href="/owner/setting/propertySetting" className="text-[#4f4f4f] no-underline">Property Settings</a>
                        <span className="text-[#b0b0b0] mx-1">/</span>
                        <span className="text-[#953002] font-semibold">Inventory & Overbooking</span>
                    </div>

                    <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-1">Inventory Strategy</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-5 max-w-[520px]">Manage your property capacity rules to optimize revenue while protecting against overbooking risks.</p>

                    {/* ─── KPI Cards ─── */}
                    <div className="grid grid-cols-3 gap-3.5 mb-4.5">
                        {/* Total Inventory */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl p-4.5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1">TOTAL INVENTORY</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[32px] font-black text-[#1d1d1d]">45</span>
                                        <span className="text-[13px] text-[#828282] font-medium">units</span>
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#eef2ff]">
                                    <Grid3X3 size={20} color="#4285F4" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[12px] border-t border-[#f5f5f5] pt-2.5">
                                <span className="text-[#828282]">Occupancy Rate</span>
                                <span className="text-[#27ae60] font-bold">78%</span>
                            </div>
                        </div>

                        {/* Safety Buffer */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl p-4.5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1">SAFETY BUFFER</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[32px] font-black text-[#1d1d1d]">5</span>
                                        <span className="text-[13px] text-[#828282] font-medium">units held</span>
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#e8f0fe]">
                                    <Shield size={20} color="#4285F4" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[12px] border-t border-[#f5f5f5] pt-2.5">
                                <span className="text-[#828282]">Protection Level</span>
                                <span className="text-[#4285F4] font-bold">High</span>
                            </div>
                        </div>

                        {/* Available to Sell */}
                        <div className="bg-white border border-[#e8e8e8] rounded-xl p-4.5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] font-bold text-[#828282] tracking-[0.8px] mb-1">AVAILABLE TO SELL</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[32px] font-black text-[#1d1d1d]">8</span>
                                        <span className="text-[13px] text-[#828282] font-medium">units live</span>
                                    </div>
                                </div>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#e8f4f8]">
                                    <TrendingUp size={20} color="#4285F4" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[12px] border-t border-[#f5f5f5] pt-2.5">
                                <span className="text-[#828282]">Channel Sync</span>
                                <span className="text-[#27ae60] font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60]" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Two Column Layout ─── */}
                    <div className="grid grid-cols-[3fr_2fr] gap-4">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4">
                            {/* Safety Margin Buffer */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 px-5.5">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <Shield size={18} color="#953002" />
                                        <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Safety Margin Buffer</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#27ae60] bg-[#e8f8ef] rounded px-2.5 py-1">Active</span>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0">Hold back a percentage of inventory to prevent accidental double-bookings across channels.</p>

                                <div className="bg-[#fafafa] rounded-xl p-3.5 px-4 mt-3.5">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[13px] font-semibold text-[#1d1d1d]">Buffer Percentage</span>
                                        <span className="text-[14px] font-extrabold text-[#4285F4]">12%</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-1.5 bg-[#e8e8e8] rounded-full">
                                        <div className="h-1.5 bg-gradient-to-r from-[#4285F4] to-[#7ab8f5] rounded-full w-[60%]" />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[10px] text-[#b0b0b0]">
                                        <span>0% (Aggressive)</span>
                                        <span>10% (Standard)</span>
                                        <span>20% (Conservative)</span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 mt-3.5 bg-[#fef8f4] border border-[#fce8d8] rounded-xl p-3 px-3.5">
                                    <Info size={16} color="#953002" className="mt-0.5 shrink-0" />
                                    <span className="text-[12px] text-[#4f4f4f] leading-snug">
                                        With a 12% buffer on 45 rooms, approximately <strong>5 rooms</strong> will be withheld from OTAs during high demand periods.
                                    </span>
                                </div>
                            </div>

                            {/* Auto-Close Automation */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 px-5.5">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <Settings size={18} color="#953002" />
                                        <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Auto-Close Automation</h3>
                                    </div>
                                    <button onClick={() => setAutoClose(!autoClose)} className={`w-11 h-6 rounded-full border-none cursor-pointer flex items-center px-1 transition-all duration-200 shrink-0 ${autoClose ? "bg-[#4285F4] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                        <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                                    </button>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0">Automatically stop new bookings when inventory reaches a critical threshold.</p>

                                <div className="flex gap-4 mt-4">
                                    <div className="flex-1">
                                        <div className="text-[13px] font-bold text-[#1d1d1d] mb-1">Threshold Limit</div>
                                        <div className="flex items-center gap-1.5 text-[12px] text-[#828282]">
                                            Close bookings when inventory drops to
                                            <input
                                                type="text"
                                                value={thresholdLimit}
                                                onChange={(e) => setThresholdLimit(e.target.value)}
                                                className="w-10 px-2 py-1 border border-[#e0e0e0] rounded-md text-[13px] text-[#1d1d1d] text-center outline-none font-sans"
                                            />
                                            units.
                                        </div>
                                    </div>
                                    <div className="bg-[#fffaf5] border border-[#fce8d8] rounded-xl p-3 px-3.5 flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Zap size={14} color="#f2994a" />
                                            <span className="text-[13px] font-bold text-[#1d1d1d]">Emergency Stop</span>
                                        </div>
                                        <span className="text-[11px] text-[#828282] leading-tight block">
                                            This overrides all channel manager settings immediately to prevent overbooking.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-4">
                            {/* 14-Day Outlook */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 px-5.5">
                                <div className="text-[12px] font-extrabold text-[#1d1d1d] tracking-[1px] m-0">14-DAY OUTLOOK</div>
                                <div className="flex gap-1 items-end py-2.5 mt-2 h-[80px]">
                                    {outlookBars.map((bar, i) => (
                                        <div key={i} className="flex flex-col items-center flex-1">
                                            <div className="h-full flex items-end w-full">
                                                <div style={{ height: `${bar.h}%`, backgroundColor: bar.color }} className="w-3.5 mx-auto rounded-t-sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[9px] font-bold text-[#b0b0b0] tracking-[0.5px]">TODAY</span>
                                    <span className="text-[9px] font-bold text-[#b0b0b0] tracking-[0.5px]">+7 DAYS</span>
                                    <span className="text-[9px] font-bold text-[#b0b0b0] tracking-[0.5px]">+14 DAYS</span>
                                </div>
                            </div>

                            {/* Critical Alerts */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 px-5.5">
                                <div className="flex justify-between items-center mb-3.5">
                                    <div className="text-[12px] font-extrabold text-[#1d1d1d] tracking-[1px] m-0">CRITICAL ALERTS</div>
                                    <span className="text-[10px] font-bold text-[#e74c3c] bg-[#fde8e8] rounded px-2.5 py-1">2 Active</span>
                                </div>

                                <div className="flex gap-2.5 py-2.5 border-b border-[#f5f5f5]">
                                    <AlertTriangle size={16} color="#e74c3c" className="mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Inventory Critical</div>
                                        <div className="text-[11px] text-[#828282]">Oct 24, 2023 - Only 1 unit remaining.</div>
                                        <a href="#" className="text-[11px] text-[#4285F4] font-semibold no-underline mt-0.5 inline-block">View Date</a>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 py-2.5 border-b border-[#f5f5f5]">
                                    <MinusCircle size={16} color="#e74c3c" className="mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Buffer Limit Reached</div>
                                        <div className="text-[11px] text-[#828282]">Nov 02, 2023 - Sales paused by buffer.</div>
                                        <a href="#" className="text-[11px] text-[#4285F4] font-semibold no-underline mt-0.5 inline-block">Adjust Buffer</a>
                                    </div>
                                </div>

                                <div className="text-center mt-3">
                                    <a href="#" className="text-[12px] text-[#4f4f4f] font-semibold no-underline">View All Notifications</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Bottom Actions ─── */}
                    <div className="flex justify-end gap-3 mt-4.5 pt-4">
                        <a href="/owner/setting/propertySetting" className="no-underline">
                            <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Discard Changes</button>
                        </a>
                        <a href="/owner/setting/propertySetting" className="no-underline">
                            <button className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                <Save size={14} /> Save Configuration
                            </button>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
