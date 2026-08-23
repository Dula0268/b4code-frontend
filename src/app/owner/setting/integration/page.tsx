/* eslint-disable @next/next/no-img-element */
"use client";
import {
    Bell,
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

/**
 * IntegrationPage Component
 *
 * Displays available third-party integrations (OTAs, payment gateways,
 * channel managers) with connect/disconnect controls for each service.
 */
export default function IntegrationPage() {


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
                                            ? "bg-[var(--brand-primary)] text-white font-bold"
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
                                    <button className="py-1.5 px-4.5 bg-white text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-lg text-[12px] font-semibold cursor-pointer">Manage</button>
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
                                            <button className="w-full py-2 bg-[var(--brand-primary)] text-white border-none rounded-lg text-[12px] font-bold cursor-pointer">Connect</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
    );
}
