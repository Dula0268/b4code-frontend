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
    ArrowLeft,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    ShieldCheck,
    SlidersHorizontal,
    Lightbulb,
    Minus,
    Plus,
    ExternalLink,
    Save,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function CreateRestrictionPage() {
    const [ruleCategory, setRuleCategory] = useState("Minimum Length of Stay");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minNights, setMinNights] = useState(2);
    const [maxNights, setMaxNights] = useState(30);
    const [advanceNotice, setAdvanceNotice] = useState("");
    const [advanceUnit, setAdvanceUnit] = useState("Days");

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "/owner/roomManagement" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Rate", icon: <Tag size={18} />, href: "/owner/rate" },
        { label: "Reservation", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/accountSetting", active: true },
    ];

    /* Calendar mock */
    const calDays = [
        { d: 29, dim: true }, { d: 30, dim: true },
        { d: 1 }, { d: 2 }, { d: 3 }, { d: 4, sel: "range" }, { d: 5, sel: "range" },
        { d: 6, sel: "range" }, { d: 7, sel: "range" }, { d: 8, sel: "active" }, { d: 9 },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="flex items-center gap-1.5 px-3.5 pb-5">
                    <Logo width={120} height={36} />
                </div>
                <div className="flex flex-col gap-0.5">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2.5 py-2.5 px-3.5 text-[13px] no-underline transition-all duration-150 cursor-pointer border-l-[3px] ${
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
                    {/* Back Link */}
                    <a href="/owner/setting/propertySetting/reservationRestriction" className="inline-flex items-center gap-1.5 text-[12px] text-[#4f4f4f] no-underline font-semibold mb-2">
                        <ArrowLeft size={14} /> Back to Restrictions List
                    </a>

                    <h1 className="text-[24px] font-black text-[#1d1d1d] m-0 mb-5">Create New Restriction</h1>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-[3fr_2fr] gap-5 items-start">
                        {/* ─── Left Column ─── */}
                        <div className="flex flex-col gap-4">
                            {/* Restriction Type */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#fef0e7]">
                                        <ShieldCheck size={16} color="#953002" />
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Restriction Type</h3>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0 mb-4">Choose the rule you want to apply to your property.</p>

                                <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Rule Category</label>
                                <div className="relative">
                                    <select value={ruleCategory} onChange={(e) => setRuleCategory(e.target.value)} className="w-full py-2.5 pr-9 pl-3.5 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                        <option>Minimum Length of Stay</option>
                                        <option>Maximum Length of Stay</option>
                                        <option>Closed to Arrival</option>
                                        <option>Closed to Departure</option>
                                        <option>Advance Booking Required</option>
                                    </select>
                                    <ChevronDown size={14} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Effective Dates */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#fef0e7]">
                                        <CalendarDays size={16} color="#953002" />
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Effective Dates</h3>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0 mb-4">Select the date range when this restriction will be active.</p>

                                {/* Date Inputs */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Start Date</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg bg-white">
                                            <CalendarDays size={14} color="#828282" />
                                            <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="mm/dd/yyyy" className="flex-1 border-none outline-none text-[13px] text-[#1d1d1d] font-sans bg-transparent" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">End Date</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg bg-white">
                                            <CalendarDays size={14} color="#828282" />
                                            <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="mm/dd/yyyy" className="flex-1 border-none outline-none text-[13px] text-[#1d1d1d] font-sans bg-transparent" />
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Calendar */}
                                <div className="bg-[#fafafa] rounded-xl p-4 px-4.5 mt-3.5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[14px] font-bold text-[#1d1d1d]">October 2023</span>
                                        <div className="flex gap-1.5">
                                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"><ChevronLeft size={14} color="#b0b0b0" /></button>
                                            <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center"><ChevronRight size={14} color="#b0b0b0" /></button>
                                        </div>
                                    </div>
                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((h) => (
                                            <div key={h} className="text-[11px] font-semibold text-[#828282] text-center py-1.5">{h}</div>
                                        ))}
                                    </div>
                                    {/* Day Cells */}
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {calDays.map((day, i) => (
                                            <div key={i} className="flex items-center justify-center py-0.5">
                                                <span
                                                    className="w-7.5 h-7.5 flex items-center justify-center rounded-md text-[12px] cursor-pointer transition-all duration-150"
                                                    style={{
                                                        color: day.dim ? "#d0d0d0" : day.sel === "active" ? "#fff" : day.sel === "range" ? "#fff" : "#1d1d1d",
                                                        background: day.sel === "active" ? "#953002" : day.sel === "range" ? "#e07540" : "transparent",
                                                        fontWeight: day.sel ? 700 : 500,
                                                    }}
                                                >
                                                    {day.d}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center bg-[#fef0e7]">
                                        <SlidersHorizontal size={16} color="#953002" />
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Settings</h3>
                                </div>
                                <p className="text-[12px] text-[#828282] m-0 mb-4">Define the specific parameters for this restriction.</p>

                                {/* Minimum Nights */}
                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div className="max-w-[180px]">
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Minimum Nights</div>
                                        <div className="text-[11px] text-[#828282] leading-snug">Guests must book at least this many nights.</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setMinNights(Math.max(1, minNights - 1))} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Minus size={14} /></button>
                                        <input type="text" value={minNights} onChange={(e) => setMinNights(Number(e.target.value) || 0)} className="w-[50px] py-1.5 px-2 border border-[#e0e0e0] rounded-md text-[14px] text-[#1d1d1d] text-center outline-none font-sans font-semibold" />
                                        <button onClick={() => setMinNights(minNights + 1)} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Plus size={14} /></button>
                                        <span className="text-[13px] text-[#828282] ml-1">nights</span>
                                    </div>
                                </div>

                                {/* Maximum Nights */}
                                <div className="flex justify-between items-center py-3.5 border-b border-[#f5f5f5]">
                                    <div className="max-w-[180px]">
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Maximum Nights</div>
                                        <div className="text-[11px] text-[#828282] leading-snug">Maximum allowed stay duration.</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => setMaxNights(Math.max(1, maxNights - 1))} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Minus size={14} /></button>
                                        <input type="text" value={maxNights} onChange={(e) => setMaxNights(Number(e.target.value) || 0)} className="w-[50px] py-1.5 px-2 border border-[#e0e0e0] rounded-md text-[14px] text-[#1d1d1d] text-center outline-none font-sans font-semibold" />
                                        <button onClick={() => setMaxNights(maxNights + 1)} className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-md cursor-pointer text-[#4f4f4f]"><Plus size={14} /></button>
                                        <span className="text-[13px] text-[#828282] ml-1">nights</span>
                                    </div>
                                </div>

                                {/* Advance Notice */}
                                <div className="flex justify-between items-center py-3.5">
                                    <div className="max-w-[180px]">
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Advance Notice</div>
                                        <div className="text-[11px] text-[#828282] leading-snug">How far in advance must guests book?</div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <input type="text" value={advanceNotice} onChange={(e) => setAdvanceNotice(e.target.value)} placeholder="e.g. 2" className="w-20 py-1.5 px-2 border border-[#e0e0e0] rounded-md text-[14px] text-[#1d1d1d] text-center outline-none font-sans font-semibold" />
                                        <div className="relative">
                                            <select value={advanceUnit} onChange={(e) => setAdvanceUnit(e.target.value)} className="py-1.5 pr-6 pl-2.5 border border-[#e0e0e0] rounded-md text-[12px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer">
                                                <option>Days</option>
                                                <option>Hours</option>
                                                <option>Weeks</option>
                                            </select>
                                            <ChevronDown size={12} color="#828282" className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex justify-center gap-3 mt-1 pt-2">
                                <a href="/owner/setting/propertySetting/reservationRestriction" className="no-underline">
                                    <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Cancel</button>
                                </a>
                                <a href="/owner/setting/propertySetting/reservationRestriction" className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                        <Save size={14} /> Save Restriction
                                    </button>
                                </a>
                            </div>
                        </div>

                        {/* ─── Right Column ─── */}
                        <div className="flex flex-col gap-4">
                            {/* Revenue Tips */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Lightbulb size={16} color="#953002" />
                                    <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0">Revenue Tips</h3>
                                </div>

                                <div className="mb-4">
                                    <div className="text-[13px] font-bold text-[#1d1d1d] mb-1">Why use Minimum Nights?</div>
                                    <p className="text-[12px] text-[#4f4f4f] leading-relaxed m-0">
                                        Setting a 2-3 night minimum during weekends or high season helps reduce turnover costs and maximizes revenue per booking.
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <div className="text-[13px] font-bold text-[#1d1d1d] mb-1">Managing Gaps</div>
                                    <p className="text-[12px] text-[#4f4f4f] leading-relaxed m-0">
                                        Use &quot;Maximum Nights&quot; to prevent long-term tenants if you prefer short-term vacationers, or to comply with local regulations.
                                    </p>
                                </div>

                                <div className="bg-[#fef8f4] border border-[#fce8d8] rounded-xl p-3 px-3.5 mb-3.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-[#953002]" />
                                        <span className="text-[11px] font-extrabold text-[#953002] tracking-[0.5px]">PRO TIP</span>
                                    </div>
                                    <p className="text-[11px] text-[#4f4f4f] leading-snug m-0">
                                        Last-minute gaps can be filled by removing &quot;Advance Notice&quot; restrictions 24 hours before the date.
                                    </p>
                                </div>

                                <a href="#" className="inline-flex items-center gap-1 text-[12px] text-[#4285F4] font-semibold no-underline">
                                    View Help Center Article <ExternalLink size={12} />
                                </a>
                            </div>

                            {/* Promo Image */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
                                    alt="Smart restrictions"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <p className="text-[11px] text-[#828282] m-0 mt-2.5 leading-snug">
                                    &quot;Smart restrictions can increase occupancy by up to 15%.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
