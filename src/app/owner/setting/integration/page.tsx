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
    Hotel,
    CreditCard as StripeIcon,
    MessageSquare,
    CalendarDays,
} from "lucide-react";

/* ───────────────────── component ───────────────────── */

export default function IntegrationPage() {
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
        { label: "Billing & Payouts", icon: <CreditCard size={16} />, href: "/owner/setting/billing&Payout" },
        { label: "Integrations", icon: <Puzzle size={16} />, active: true, href: "/owner/setting/integration" },
    ];

    const recommended = [
        { name: "Stripe", desc: "Payments & Transactions", icon: <StripeIcon size={22} color="#953002" />, bg: "#e8f4f8" },
        { name: "WhatsApp", desc: "Guest Communication", icon: <MessageSquare size={22} color="#25D366" />, bg: "#e8f8ef" },
        { name: "Google Calendar", desc: "Booking & Availability Sync", icon: <CalendarDays size={22} color="#4285F4" />, bg: "#e8f0fe" },
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
                    <h1 className="text-[26px] font-black text-[#1d1d1d] m-0 mb-1 tracking-wide">INTEGRATIONS</h1>
                    <p className="text-[13px] text-[#828282] m-0 mb-6">Connect with third-party services to enhance your property management.</p>

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
                        <div className="flex-1 flex flex-col gap-7 min-w-0">
                            {/* ─── Connected Apps ─── */}
                            <div>
                                <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-3.5">Connected Apps</h3>

                                <div className="flex justify-between items-center bg-white border border-[#e8e8e8] rounded-[10px] py-4 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-[44px] h-[44px] rounded-[10px] bg-[#fef0e7] flex items-center justify-center">
                                            <Hotel size={20} color="#953002" />
                                        </div>
                                        <div>
                                            <div className="text-[14px] font-bold text-[#1d1d1d]">Booking.com</div>
                                            <div className="text-[11px] font-semibold text-[#27ae60] flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60] inline-block" />
                                                ACTIVE
                                            </div>
                                        </div>
                                    </div>
                                    <button className="py-1.5 px-4.5 bg-white text-[#953002] border border-[#953002] rounded-lg text-[12px] font-semibold cursor-pointer">Manage</button>
                                </div>
                            </div>

                            {/* ─── Recommended Integrations ─── */}
                            <div>
                                <h3 className="text-[16px] font-extrabold text-[#1d1d1d] m-0 mb-3.5">Recommended Integrations</h3>

                                <div className="grid grid-cols-3 gap-3.5">
                                    {recommended.map((r, i) => (
                                        <div key={i} className="bg-white border border-[#e8e8e8] rounded-xl p-6 text-center flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: r.bg }}>
                                                {r.icon}
                                            </div>
                                            <div className="text-[14px] font-bold text-[#1d1d1d] mt-2.5">{r.name}</div>
                                            <div className="text-[11px] text-[#828282] mb-3.5">{r.desc}</div>
                                            <button className="w-full py-2 bg-[#953002] text-white border-none rounded-lg text-[12px] font-bold cursor-pointer">Connect</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
