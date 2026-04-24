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
    User,
    Home,
    BellRing,
    CreditCard,
    Puzzle,
    ChevronDown,
    Clock,
    MapPin,
    Save,
} from "lucide-react";

/* ───────────────────── mock data ───────────────────── */

const properties = [
    { name: "Downtown Luxury Loft", address: "123 Main St, Gamapha, WA", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=80&h=80&fit=crop" },
    { name: "Lakeside Cabin Retreat", address: "456 Lake Rd, Tahoe, CA", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=80&h=80&fit=crop" },
    { name: "Urban Skyline Condo", address: "789 Broad St, New York, NY", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=80&h=80&fit=crop" },
];

/* ───────────────────── component ───────────────────── */

export default function PropertySettingPage() {
    const [currency, setCurrency] = useState("LKR");
    const [timezone, setTimezone] = useState("(GMT-08:00) Pacific Time");
    const [language, setLanguage] = useState("English (US)");
    const [checkInTime, setCheckInTime] = useState("03:00 PM");
    const [checkOutTime, setCheckOutTime] = useState("11:00 AM");
    const [vatId, setVatId] = useState("");
    const [taxRate, setTaxRate] = useState("8.5");
    const [autoTax, setAutoTax] = useState(true);

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "/owner/roomManagement" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Rate", icon: <Tag size={18} />, href: "/owner/rate" },
        { label: "Reservation", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/accountSetting", active: true },
    ];

    const settingsTabs = [
        { label: "Account Settings", icon: <User size={16} />, href: "/owner/setting/accountSetting" },
        { label: "Property Settings", icon: <Home size={16} />, active: true, href: "/owner/setting/propertySetting" },
        { label: "Notification Preferences", icon: <BellRing size={16} />, href: "/owner/setting/notificationPreferences" },
        { label: "Billing & Payouts", icon: <CreditCard size={16} />, href: "/owner/setting/billing&Payout" },
        { label: "Integrations", icon: <Puzzle size={16} />, href: "/owner/setting/integration" },
    ];

    return (
        <div className="flex h-screen w-screen fixed top-0 left-0 bg-[#faf9f7] overflow-hidden font-sans">
            {/* ── Navigation Sidebar ── */}
            <nav className="w-[170px] bg-white border-r border-[#e8e8e8] py-4 flex flex-col shrink-0">
                <div className="px-4 pb-5">
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
                    <div className="flex items-center mb-1">
                        <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#4f4f4f] no-underline">Settings</a>
                        <span className="text-[#b0b0b0] mx-1">/</span>
                        <span className="text-[12px] font-semibold text-[#953002]">Property Settings</span>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1">Property Settings</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-5">Configure general defaults, location, and tax information for your properties.</p>

                    {/* Content Area */}
                    <div className="flex gap-6 items-start">
                        {/* Settings Tabs */}
                        <div className="w-[200px] shrink-0 flex flex-col gap-1">
                            {settingsTabs.map((tab) => (
                                <a
                                    key={tab.label}
                                    href={tab.href || "#"}
                                    className={`flex items-center gap-2 py-2.5 px-3.5 border-none rounded-lg text-[12px] cursor-pointer text-left transition-all duration-150 no-underline ${
                                        tab.active
                                            ? "bg-[#953002] text-white font-bold"
                                            : "bg-transparent text-[#4f4f4f] font-medium hover:bg-[#f5f5f5]"
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </a>
                            ))}
                        </div>

                        {/* Main Settings Panel */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            {/* ─── General Defaults ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">General Defaults</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Set your global standards for currency, time, and language.</p>

                                <div className="grid grid-cols-3 gap-3.5">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Currency</label>
                                        <div className="relative">
                                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full py-2.5 pr-8 pl-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                                <option>LKR</option>
                                                <option>USD</option>
                                                <option>EUR</option>
                                                <option>GBP</option>
                                            </select>
                                            <ChevronDown size={14} color="#828282" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Time Zone</label>
                                        <div className="relative">
                                            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full py-2.5 pr-8 pl-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                                <option>(GMT-08:00) Pacific Time</option>
                                                <option>(GMT-05:00) Eastern Time</option>
                                                <option>(GMT+05:30) Sri Lanka</option>
                                                <option>(GMT+00:00) UTC</option>
                                            </select>
                                            <ChevronDown size={14} color="#828282" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Language</label>
                                        <div className="relative">
                                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full py-2.5 pr-8 pl-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                                <option>English (US)</option>
                                                <option>English (UK)</option>
                                                <option>Sinhala</option>
                                                <option>Tamil</option>
                                            </select>
                                            <ChevronDown size={14} color="#828282" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Check-in / Check-out ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Check-in / Check-out</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Establish standard arrival and departure times for guests.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Check-in Time</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg bg-white">
                                            <Clock size={14} color="#953002" className="shrink-0" />
                                            <input type="text" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="flex-1 border-none outline-none text-[13px] text-[#1d1d1d] font-sans bg-transparent" />
                                            <Clock size={14} color="#828282" />
                                        </div>
                                        <span className="text-[10px] text-[#b0b0b0] mt-1">Guests can check in after this time.</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Check-out Time</label>
                                        <div className="flex items-center gap-2 py-2 px-3 border border-[#e0e0e0] rounded-lg bg-white">
                                            <Clock size={14} color="#953002" className="shrink-0" />
                                            <input type="text" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="flex-1 border-none outline-none text-[13px] text-[#1d1d1d] font-sans bg-transparent" />
                                            <Clock size={14} color="#828282" />
                                        </div>
                                        <span className="text-[10px] text-[#b0b0b0] mt-1">Guests must check out by this time.</span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Tax & Fees ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Tax & Fees</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Configure tax identification and default rates.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">VAT / Tax ID</label>
                                        <input type="text" value={vatId} onChange={(e) => setVatId(e.target.value)} placeholder="e.g. US-123456789" className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Tax Rate (%)</label>
                                        <div className="flex items-center gap-1.5">
                                            <input type="text" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-[120px] py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                            <span className="text-[14px] text-[#828282] font-semibold">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Apply Occupancy Tax Automatically</div>
                                        <div className="text-[11px] text-[#828282]">Automatically calculate and add local taxes to bookings.</div>
                                    </div>
                                    <button onClick={() => setAutoTax(!autoTax)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${autoTax ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── Reservation Restriction ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[16px] font-black text-[#1d1d1d] m-0 mb-0.5 tracking-[0.8px]">RESERVATION RESTRICTION</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Property Reservation & restriction details.</p>

                                <div className="flex flex-col gap-0 border-t border-[rgba(0,0,0,0.05)] pt-1">
                                    {properties.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-b border-[#f5f5f5] group">
                                            <a 
                                                href="/owner/setting/propertySetting/reservationRestriction/createRestriction" 
                                                className="flex items-center gap-3 flex-1 no-underline p-1.5 -ml-1.5 rounded-xl hover:bg-[#fafafa] transition-colors cursor-pointer"
                                            >
                                                <img src={p.img} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                                                <div>
                                                    <div className="text-[13px] font-bold text-[#1d1d1d] group-hover:text-[#953002] transition-colors">{p.name}</div>
                                                    <div className="text-[11px] text-[#828282] flex items-center gap-1 mt-0.5">
                                                        <MapPin size={11} color="#b0b0b0" /> {p.address}
                                                    </div>
                                                </div>
                                            </a>
                                            <a 
                                                href="/owner/setting/propertySetting/reservationRestriction/editRestriction" 
                                                className="w-8 h-8 rounded-full flex items-center justify-center border border-[#e8e8e8] bg-white cursor-pointer hover:border-[#953002] hover:text-[#953002] text-[#828282] transition-colors ml-4 shrink-0 shadow-sm"
                                                title="Edit Restriction"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 20h9"></path>
                                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                </svg>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ─── Bottom Actions ─── */}
                            <div className="flex justify-end gap-3 mt-1 pt-4">
                                <a href="/owner/ownerDashboard" className="no-underline">
                                    <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Cancel</button>
                                </a>
                                <a href="/owner/ownerDashboard" className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#b03a02] transition-colors">
                                        <Save size={14} /> Save Changes
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
