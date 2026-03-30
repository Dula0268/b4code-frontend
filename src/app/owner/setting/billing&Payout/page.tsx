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
    Landmark,
    Plus,
    Save,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function BillingPayoutPage() {
    const [taxId, setTaxId] = useState("98-7654321");

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/owner/ownerDashboard" },
        { label: "Properties", icon: <Building2 size={18} />, href: "/owner/properties" },
        { label: "Rooms", icon: <BedDouble size={18} />, href: "#" },
        { label: "Availability", icon: <Calendar size={18} />, href: "/owner/availability/weeklyCalendar" },
        { label: "Pricing", icon: <Tag size={18} />, href: "/owner/rate" },
        { label: "Reservation", icon: <BookOpen size={18} />, href: "/owner/reservation" },
        { label: "Settings", icon: <Settings size={18} />, href: "/owner/setting/accountSetting", active: true },
    ];

    const settingsTabs = [
        { label: "Account Settings", icon: <User size={16} />, href: "/owner/setting/accountSetting" },
        { label: "Property Settings", icon: <Home size={16} />, href: "/owner/setting/propertySetting" },
        { label: "Notification Preferences", icon: <BellRing size={16} />, href: "/owner/setting/notificationPreferences" },
        { label: "Billing & Payouts", icon: <CreditCard size={16} />, active: true, href: "/owner/setting/billing&Payout" },
        { label: "Integrations", icon: <Puzzle size={16} />, href: "/owner/setting/integration" },
    ];

    const payouts = [
        { date: "Oct 24, 2023", amount: "Rs 1,450.00", method: "Bank Transfer", status: "Completed" },
        { date: "Oct 17, 2023", amount: "Rs 890.00", method: "Bank Transfer", status: "Completed" },
        { date: "Oct 10, 2023", amount: "Rs 2,100.50", method: "Bank Transfer", status: "Completed" },
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
                        <button className="bg-transparent border-none cursor-pointer p-1 rounded-md flex items-center">
                            <Bell size={18} color="#4f4f4f" />
                        </button>
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
                        <span className="text-[12px] font-semibold text-[#953002]">Billing & Payouts</span>
                    </div>

                    {/* Page Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1 tracking-wide">BILLING & PAYOUTS</h1>
                            <p className="text-[13px] text-[#828282] m-0">Manage your payment methods and bank details for earnings.</p>
                        </div>
                        <button className="flex items-center gap-1.5 py-2.5 px-5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer">
                            <Plus size={14} /> Add Payout Method
                        </button>
                    </div>

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

                        {/* Main Panel */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            {/* ─── Payout Method ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Payout Method</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Primary method where your earnings will be deposited.</p>

                                <div className="flex justify-between items-center bg-[#fafafa] border border-[#e8e8e8] rounded-[10px] py-4 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[44px] h-[44px] rounded-[10px] bg-[#fef0e7] flex items-center justify-center">
                                            <Landmark size={20} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[14px] font-bold text-[#1d1d1d]">Bank of Ceylon</div>
                                            <div className="text-[12px] text-[#828282] font-mono">Checking Account •••• 1234</div>
                                            <span className="inline-block mt-1 text-[10px] font-bold text-[#27ae60] bg-[#e8f8ef] rounded px-2 py-0.5">Primary</span>
                                        </div>
                                    </div>
                                    <button className="py-1.5 px-4.5 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[12px] font-semibold cursor-pointer">Edit</button>
                                </div>
                            </div>

                            {/* ─── Tax Information ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Tax Information</h3>
                                <p className="text-[12px] text-[#828282] m-0 mb-4.5">Required for compliance and tax reporting.</p>

                                <div>
                                    <label className="block text-[12px] font-bold text-[#1d1d1d] mb-1.5">Tax ID Number</label>
                                    <input
                                        type="text"
                                        value={taxId}
                                        onChange={(e) => setTaxId(e.target.value)}
                                        className="w-[320px] py-2.5 px-3 border border-[#e0e0e0] rounded-lg text-[13px] text-[#1d1d1d] outline-none font-sans box-border"
                                    />
                                    <span className="block text-[11px] text-[#b0b0b0] mt-1.5">Enter your business EIN or personal Social Security Number.</span>
                                </div>
                            </div>

                            {/* ─── Payout History ─── */}
                            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5.5 px-6.5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-[18px] font-extrabold text-[#1d1d1d] m-0 mb-0.5">Payout History</h3>
                                        <p className="text-[12px] text-[#828282] m-0">Your recent transactions and earnings transfers.</p>
                                    </div>
                                    <button className="bg-transparent border-none text-[12px] font-semibold text-[#953002] cursor-pointer p-0">View All</button>
                                </div>

                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-wide py-2.5 px-2 text-left border-b border-[#f0f0f0]">DATE</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-wide py-2.5 px-2 text-left border-b border-[#f0f0f0]">AMOUNT</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-wide py-2.5 px-2 text-left border-b border-[#f0f0f0]">METHOD</th>
                                            <th className="text-[10px] font-bold text-[#828282] tracking-wide py-2.5 px-2 text-left border-b border-[#f0f0f0]">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.map((p, i) => (
                                            <tr key={i} className="border-b border-[#f5f5f5]">
                                                <td className="text-[13px] text-[#4f4f4f] py-3 px-2">{p.date}</td>
                                                <td className="text-[13px] text-[#1d1d1d] font-bold py-3 px-2">{p.amount}</td>
                                                <td className="text-[13px] text-[#828282] py-3 px-2">{p.method}</td>
                                                <td className="text-[13px] py-3 px-2">
                                                    <span className="text-[11px] font-semibold text-[#27ae60] bg-[#e8f8ef] rounded px-2.5 py-0.5">{p.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ─── Bottom Actions ─── */}
                            <div className="flex justify-end gap-3 mt-1 pt-4">
                                <button className="py-2.5 px-6 bg-white text-[#1d1d1d] border border-[#e0e0e0] rounded-lg text-[13px] font-semibold cursor-pointer">Cancel</button>
                                <button className="flex items-center gap-1.5 py-2.5 px-5.5 bg-[#953002] text-white border-none rounded-lg text-[13px] font-bold cursor-pointer">
                                    <Save size={14} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
