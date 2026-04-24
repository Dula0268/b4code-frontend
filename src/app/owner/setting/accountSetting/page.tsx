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
    Clock,
    Mail,
    MessageSquare,
    PlusCircle,
    ChevronDown,
    Save,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function AccountSettingPage() {
    const [firstName, setFirstName] = useState("kasun");
    const [lastName, setLastName] = useState("kumara");
    const [email, setEmail] = useState("kasunkumara345@gmail.com");
    const [currency, setCurrency] = useState("USD ($)");
    const [timezone, setTimezone] = useState("(GMT-05:00) Eastern Time");
    const [checkIn, setCheckIn] = useState("03:00 PM");
    const [checkOut, setCheckOut] = useState("11:00 AM");
    const [autoTax, setAutoTax] = useState(true);
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsAlert, setSmsAlert] = useState(false);

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
        { label: "Account Settings", icon: <User size={16} />, active: true, href: "/owner/setting/accountSetting" },
        { label: "Property Settings", icon: <Home size={16} />, href: "/owner/setting/propertySetting" },
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
                        <span className="text-[12px] font-semibold text-[#953002]">Account Settings</span>
                    </div>

                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1">Settings</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-5">Manage your account preferences and property configurations.</p>

                    {/* Content Area */}
                    <div className="flex gap-6 items-start">
                        {/* Settings Tabs */}
                        <div className="w-[200px] shrink-0 flex flex-col gap-1">
                            {settingsTabs.map((tab) => (
                                <a
                                    key={tab.label}
                                    href={tab.href}
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
                            {/* ─── Account Settings ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Account Settings</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Update your personal information and login credentials.</p>

                                <div className="flex gap-5 items-start">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-[90px] h-[90px] rounded-xl bg-[#f5f0ed] flex items-center justify-center overflow-hidden">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=kasun" alt="" className="w-[80px] h-[80px] rounded-[10px]" />
                                        </div>
                                        <a href="/owner/setting/accountSetting/changePhoto" className="bg-transparent border-none text-[12px] font-semibold text-[#953002] cursor-pointer no-underline hover:underline">Change Photo</a>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col">
                                                <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">First Name</label>
                                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Last Name</label>
                                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Email Address</label>
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Password</label>
                                    <a href="/owner/setting/accountSetting/changePassword" className="bg-transparent border-none p-0 mt-0.5 text-[12px] font-semibold text-[#953002] cursor-pointer no-underline hover:underline">Change Password</a>
                                </div>
                            </div>

                            {/* ─── Property Settings ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Property Settings</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Configure general defaults and tax information.</p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Currency</label>
                                        <div className="relative">
                                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full py-2.5 pr-8 pl-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                                <option>USD ($)</option>
                                                <option>LKR (Rs)</option>
                                                <option>EUR (€)</option>
                                                <option>GBP (£)</option>
                                            </select>
                                            <ChevronDown size={14} color="#828282" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-bold text-[#4f4f4f] mb-1.5">Time Zone</label>
                                        <div className="relative">
                                            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full py-2.5 pr-8 pl-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans bg-white appearance-none cursor-pointer box-border">
                                                <option>(GMT-05:00) Eastern Time</option>
                                                <option>(GMT+05:30) Sri Lanka</option>
                                                <option>(GMT+00:00) UTC</option>
                                            </select>
                                            <ChevronDown size={14} color="#828282" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3.5">
                                    <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Check-in / Check-out</label>
                                    <div className="flex gap-3 items-center">
                                        <div className="relative flex-1">
                                            <input type="text" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                            <Clock size={14} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                        <div className="relative flex-1">
                                            <input type="text" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border" />
                                            <Clock size={14} color="#828282" className="absolute right-3 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Apply Occupancy Tax Automatically</div>
                                        <div className="text-[11px] text-[#828282]">Automatically calculate and add local taxes to bookings.</div>
                                    </div>
                                    <button onClick={() => setAutoTax(!autoTax)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${autoTax ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── Notification Preferences ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Notification Preferences</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Manage how you receive alerts and updates.</p>

                                <div className="flex justify-between items-center py-3 border-b border-[#f5f5f5]">
                                    <div className="flex items-center gap-2.5">
                                        <Mail size={18} color="#828282" />
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">Email Notifications</div>
                                            <div className="text-[11px] text-[#828282]">Receive booking confirmations and monthly reports.</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setEmailNotif(!emailNotif)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${emailNotif ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-center py-3">
                                    <div className="flex items-center gap-2.5">
                                        <MessageSquare size={18} color="#828282" />
                                        <div>
                                            <div className="text-[13px] font-bold text-[#1d1d1d]">SMS Alerts</div>
                                            <div className="text-[11px] text-[#828282]">Instant alerts for check-ins and urgent issues.</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSmsAlert(!smsAlert)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${smsAlert ? "bg-[#953002] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
                                        <span className="w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                                    </button>
                                </div>
                            </div>

                            {/* ─── Integrations ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Integrations</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Connect third-party tools like channel managers and smart locks.</p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex justify-between items-center bg-[#fafafa] rounded-[10px] py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full bg-[#fef0e7] flex items-center justify-center">
                                                <Home size={16} color="#953002" />
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-bold text-[#1d1d1d]">Airbnb Sync</div>
                                                <div className="text-[10px] font-semibold text-[#27ae60]">● Connected</div>
                                            </div>
                                        </div>
                                        <button className="bg-transparent border-none cursor-pointer p-1"><Settings size={14} color="#828282" /></button>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#fafafa] rounded-[10px] py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full bg-[#fce4e4] flex items-center justify-center">
                                                <Puzzle size={16} color="#eb5757" />
                                            </div>
                                            <div>
                                                <div className="text-[13px] font-bold text-[#1d1d1d]">August Lock</div>
                                                <div className="text-[10px] font-semibold text-[#828282]">Not Connected</div>
                                            </div>
                                        </div>
                                        <button className="bg-transparent border-none cursor-pointer p-1"><PlusCircle size={14} color="#828282" /></button>
                                    </div>
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
