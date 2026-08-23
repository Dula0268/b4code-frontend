/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth/auth.store";
import TimePicker, { type TimeValue, parseTime } from "@/components/owner/TimePicker";
import {
    Bell,
    User,
    Home,
    BellRing,
    CreditCard,
    Puzzle,
    Mail,
    MessageSquare,
    PlusCircle,
    ChevronDown,
    Save,
    Settings,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

/**
 * AccountSettingPage Component
 *
 * Owner account settings page allowing profile edits, email/phone updates,
 * and navigation to sub-pages for password, photo, and billing changes.
 */
export default function AccountSettingPage() {
    const { user } = useAuthStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (user) {
            setFirstName(user.profile?.firstName || "");
            setLastName(user.profile?.lastName || "");
            setEmail(user.email || "");
        }
    }, [user]);
    const [currency, setCurrency] = useState("USD ($)");
    const [timezone, setTimezone] = useState("(GMT-05:00) Eastern Time");
    const [checkIn,  setCheckIn]  = useState<TimeValue>(() => parseTime("03:00 PM"));
    const [checkOut, setCheckOut] = useState<TimeValue>(() => parseTime("11:00 AM"));
    const [autoTax, setAutoTax] = useState(true);
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsAlert, setSmsAlert] = useState(false);

    const settingsTabs = [
        { label: "Account Settings", icon: <User size={16} />, active: true, href: "/owner/setting/accountSetting" },
        { label: "Property Settings", icon: <Home size={16} />, href: "/owner/setting/propertySetting" },
        { label: "Notification Preferences", icon: <BellRing size={16} />, href: "/owner/setting/notificationPreferences" },
        { label: "Billing & Payouts", icon: <CreditCard size={16} />, href: "/owner/setting/billing&Payout" },
        { label: "Integrations", icon: <Puzzle size={16} />, href: "/owner/setting/integration" },
    ];

    return (
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <div className="flex justify-end items-center py-2 px-8 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <a href="/owner/message" className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center no-underline hover:bg-[#f5f5f5] transition-colors">
                            <Bell size={18} color="#4f4f4f" />
                        </a>
                        <a href="/owner/profile" className="block w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--brand-primary)] hover:opacity-80 transition-opacity">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=owner" alt="" className="w-full h-full rounded-full" />
                        </a>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-8 pb-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center mb-1">
                        <a href="/owner/setting/accountSetting" className="text-[12px] font-semibold text-[#4f4f4f] no-underline">Settings</a>
                        <span className="text-[#b0b0b0] mx-1">/</span>
                        <span className="text-[12px] font-semibold text-[var(--brand-primary)]">Account Settings</span>
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
                                            ? "bg-[var(--brand-primary)] text-white font-bold"
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
                                        <a href="/owner/setting/accountSetting/changePhoto" className="bg-transparent border-none text-[12px] font-semibold text-[var(--brand-primary)] cursor-pointer no-underline hover:underline">Change Photo</a>
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
                                    <a href="/owner/setting/accountSetting/changePassword" className="bg-transparent border-none p-0 mt-0.5 text-[12px] font-semibold text-[var(--brand-primary)] cursor-pointer no-underline hover:underline">Change Password</a>
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
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Check-in Time</label>
                                            <TimePicker value={checkIn} onChange={setCheckIn} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[11px] font-bold text-[#4f4f4f] mb-1.5">Default Check-out Time</label>
                                            <TimePicker value={checkOut} onChange={setCheckOut} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-[#f5f5f5]">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1d1d1d]">Apply Occupancy Tax Automatically</div>
                                        <div className="text-[11px] text-[#828282]">Automatically calculate and add local taxes to bookings.</div>
                                    </div>
                                    <button onClick={() => setAutoTax(!autoTax)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${autoTax ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
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
                                    <button onClick={() => setEmailNotif(!emailNotif)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${emailNotif ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
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
                                    <button onClick={() => setSmsAlert(!smsAlert)} className={`w-[44px] h-[24px] rounded-full border-none cursor-pointer flex items-center px-[3px] transition-all duration-200 ${smsAlert ? "bg-[var(--brand-primary)] justify-end" : "bg-[#e0e0e0] justify-start"}`}>
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
                                <a href="/owner" className="no-underline">
                                    <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-[#f5f5f5] transition-colors">Cancel</button>
                                </a>
                                <a href="/owner" className="no-underline">
                                    <button className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[var(--primary-hover)] transition-colors">
                                        <Save size={14} /> Save Changes
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
    );
}
